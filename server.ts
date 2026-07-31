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
- telegramResponse (string): A helpful, polite, Telegram-formatted response (you can use emojis like 🧞‍♂️, ✅, 🔌). Keep it descriptive and concise.
- wordpressAction (object):
  - type (string): "CREATE_POST" | "ACTIVATE_PLUGIN" | "DEACTIVATE_PLUGIN" | "WOOCOMMERCE_ORDER" | "SITE_HEALTH" | "ELEMENTOR_EDIT" | "MEDIA_UPLOAD" | "UNKNOWN"
  - title (string): A short label for the resource (e.g. the post title, plugin name, order ID, etc.)
  - status (string): "success" | "warning" | "error"
  - details (string): A concise summary of the database/site change.

Example inputs and outputs:
Input: "Activate Yoast SEO plugin"
Output:
{
  "telegramResponse": "🧞‍♂️ I have successfully activated the **Yoast SEO** plugin on your site! Site SEO features are now live. Let me know if you want me to write an SEO-optimized post.",
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

  // ===== Flutterwave Checkout =====
  app.post("/api/create-checkout", async (req, res) => {
    try {
      const { email, plan_name, price, plan_id } = req.body;
      if (!email || !plan_name || !price || !plan_id) {
        return res.status(400).json({ error: "Missing required fields: email, plan_name, price, plan_id" });
      }

      const flwSecretKey = process.env.FLW_SECRET_KEY;
      if (!flwSecretKey) {
        console.error("FLW_SECRET_KEY not set in environment");
        return res.status(500).json({ error: "Payment provider not configured" });
      }

      const tx_ref = `godseye-${plan_id}-${Date.now()}`;
      const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, ""));
      const redirect_url = "https://godseye.digitalhustlerx.com/start?success=true";

      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref,
          amount: numericPrice,
          currency: "USD",
          redirect_url,
          customer: { email },
          customizations: {
            title: "GodsEye",
            description: `${plan_name} Plan — $${numericPrice}/month`,
          },
          meta: {
            plan_id,
            plan_name,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        console.error("[Flutterwave] Payment link creation failed:", data);
        return res.status(500).json({ error: data.message || "Failed to create payment link" });
      }

      res.json({
        checkout_url: data.data.link,
        tx_ref,
        plan_id,
      });
    } catch (error: any) {
      console.error("[Flutterwave] Error:", error);
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
