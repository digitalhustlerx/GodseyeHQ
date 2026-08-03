import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Initialize SQLite for waitlist
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "godseye.db"));
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  referral_code TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Live Playground API
  app.post("/api/playground/generate", async (req, res) => {
    try {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      const systemInstruction = `You are the backend agent for GodsEye, an AI-powered Telegram assistant for WordPress.
Given a user command, simulate how GodsEye would execute it and respond via Telegram.
Also, output the precise action to be visually represented on a mock WordPress dashboard.

You MUST respond ONLY with a JSON object containing:
- telegramResponse (string): A helpful, polite, Telegram-formatted response (you can use emojis like ✅, ⚙️, 🔌). Keep it descriptive and concise.
- wordpressAction (object):
  - type (string): "CREATE_POST" | "ACTIVATE_PLUGIN" | "DEACTIVATE_PLUGIN" | "WOOCOMMERCE_ORDER" | "SITE_HEALTH" | "ELEMENTOR_EDIT" | "MEDIA_UPLOAD" | "UNKNOWN"
  - title (string): A short label for the resource (e.g. the post title, plugin name, order ID, etc.)
  - status (string): "success" | "warning" | "error"
  - details (string): A concise summary of the database/site change.

Example inputs and outputs:
Input: "Activate Yoast SEO plugin"
Output:
{
  "telegramResponse": "✅ I have successfully activated the **Yoast SEO** plugin on your site! Site SEO features are now live. Let me know if you want me to write an SEO-optimized post.",
  "wordpressAction": {
    "type": "ACTIVATE_PLUGIN",
    "title": "Yoast SEO",
    "status": "success",
    "details": "Plugin activated successfully. Version 21.0. Active on 1 site."
  }
}

Do not include any markdown formatting like \`\`\`json outside the JSON. Return raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `User command: "${command}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate simulation" });
    }
  });

  // ===== Waitlist API (SQLite) =====
  app.post("/api/waitlist", (req, res) => {
    const { email, referredBy } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const referralCode = Buffer.from(email).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();

    try {
      const stmt = db.prepare("INSERT INTO waitlist (email, referred_by, referral_code) VALUES (?, ?, ?)");
      stmt.run(email.toLowerCase(), referredBy || null, referralCode);
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        return res.json({ message: "Already on the waitlist!", referral_code: referralCode });
      }
      return res.status(500).json({ error: "Could not register. Try again." });
    }

    res.json({ message: "You're on the list!", referral_code: referralCode });
  });

  app.get("/api/waitlist", (req, res) => {
    const row = db.prepare("SELECT COUNT(*) as count FROM waitlist").get() as { count: number };
    res.json({ count: row.count });
  });

  // Mock balance check API
  app.get("/api/balance/:telegramId", (req, res) => {
    const { telegramId } = req.params;
    if (!telegramId || isNaN(Number(telegramId))) {
      return res.status(400).json({ error: "Invalid Telegram ID" });
    }
    
    // Exact list of simulated signed-up Telegram accounts in database
    const registeredUsers: Record<string, { balance: number; total: number }> = {
      "1234567": { balance: 150, total: 500 },
      "5829104": { balance: 420, total: 1000 },
      "9876543": { balance: 25, total: 250 },
      "2026719": { balance: 500, total: 500 }
    };

    const user = registeredUsers[telegramId];
    if (user) {
      res.json({ balance: user.balance, total: user.total, status: "registered" });
    } else {
      res.status(404).json({ error: "User not found in GodsEye database. Please activate your account by talking to our Telegram Bot first." });
    }
  });

  // ===== Polar Checkout (PRIMARY payment) =====
  // Maps plan/product id -> Polar PRODUCT id (from polar-config.json, verified live/public).
  // Polar's /checkouts/custom/ takes `products: [<product_id>]` and picks the default price.
  const POLAR_PRODUCT_IDS: Record<string, string> = {
    starter: "bc746111-be41-4f7e-8e75-ed3d7eb1e7e3",
    pro: "a31bba8d-5ef6-4033-93c4-24acdb46a30f",
    godmode: "b13480b8-f4ae-4051-aa1c-36ac31303ce7",
    topup: "873e9805-d7ea-4f1d-a344-832896cf0ac9",
    "pack-starter": "28aef4c4-4cf3-4128-8d61-8212c9057afd",
    "pack-pro": "a758d371-2b37-4f12-9c10-4a9402995b0e",
  };
  app.post("/api/create-checkout", async (req, res) => {
    try {
      const { email, plan_name, plan_id } = req.body;
      if (!email || !plan_id) {
        return res.status(400).json({ error: "Missing required fields: email, plan_id" });
      }

      const polarKey = process.env.POLAR_ACCESS_TOKEN;
      if (!polarKey) {
        console.error("POLAR_ACCESS_TOKEN not set in environment");
        return res.status(500).json({ error: "Payment provider not configured" });
      }

      const productId = POLAR_PRODUCT_IDS[plan_id];
      if (!productId) {
        console.error("Unknown plan_id:", plan_id);
        return res.status(400).json({ error: `Unknown plan: ${plan_id}` });
      }

      // Prepare a Polar checkout (creates the hosted checkout page — no card is charged here)
      const response = await fetch("https://api.polar.sh/api/v1/checkouts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${polarKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: "https://godseye.digitalhustlerx.com/success",
          customer_email: email,
          metadata: { plan_id, plan_name: plan_name || plan_id },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Polar] Checkout creation failed:", data);
        return res.status(500).json({ error: data.detail || "Failed to create Polar checkout" });
      }

      res.json({
        checkout_url: data.url,
        checkout_id: data.id,
        plan_id,
      });
    } catch (error: any) {
      console.error("[Polar] Error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout" });
    }
  });

  // Polar webhook placeholder — receives payment confirmation
  app.post("/api/polar-webhook", (req, res) => {
    const event = req.body;
    console.log("[Polar Webhook] Received event:", event?.type || "unknown");
    // TODO: verify webhook signature, write to Supabase payments table,
    // trigger referral credit allocation, update founder status
    res.json({ received: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
