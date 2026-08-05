import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import fs from "fs";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendMail } from "./src/lib/mailer.js";

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

// ===== Account / Auth (local-first, dependency-free) =====
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT '',
  plan TEXT DEFAULT 'free',
  plan_id TEXT DEFAULT 'free',
  credits_remaining REAL DEFAULT 50,
  credits_monthly REAL DEFAULT 50,
  telegram_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

// ===== Plugin purchases (pay-before-download: email + zip) =====
// One row per checkout intent. On a verified Flutterwave `charge.success`
// webhook the row flips to `paid` and a one-time `download_token` is issued so
// the customer can pull the plugin zip. The token is also mailed to them.
db.exec(`
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  tx_ref TEXT UNIQUE NOT NULL,
  flw_txn_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  download_token TEXT,
  download_token_expires TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// Password hashing with Node's built-in scrypt (salt:hash)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(test), Buffer.from(hash));
}
// Session lifetime: 30 days
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expires);
  return token;
}
function userFromRequest(req: any): { id: number; email: string; name: string; plan: string; plan_id: string; credits_remaining: number } | null {
  const token = req.headers?.cookie?.match(/(?:^|;\s*)godseye_session=([^;]+)/)?.[1];
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.email, u.name, u.plan, u.plan_id, u.credits_remaining
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as any;
  return row || null;
}
function clearSession(token: string | undefined) {
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}
function setSessionCookie(res: any, token: string) {
  res.setHeader("Set-Cookie", `godseye_session=${token}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);
}


async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = Number(process.env.PORT) || 3000;

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

  // ===== Auth =====
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const emailLower = String(email).toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(emailLower);
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists. Try logging in." });
    }
    const hash = hashPassword(password);
    const info = db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
      .run(emailLower, hash, (name || "").trim());
    const token = createSession(Number(info.lastInsertRowid));
    setSessionCookie(res, token);
    res.json({ user: { id: Number(info.lastInsertRowid), email: emailLower, name: (name || "").trim(), plan: "free", plan_id: "free", credits_remaining: 50 } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const emailLower = String(email).toLowerCase().trim();
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(emailLower) as any;
    if (!row || !verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    const token = createSession(row.id);
    setSessionCookie(res, token);
    res.json({ user: { id: row.id, email: row.email, name: row.name, plan: row.plan, plan_id: row.plan_id, credits_remaining: row.credits_remaining } });
  });

  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers?.cookie?.match(/(?:^|;\s*)godseye_session=([^;]+)/)?.[1];
    clearSession(token);
    res.setHeader("Set-Cookie", "godseye_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
    res.json({ ok: true });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = userFromRequest(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    res.json({ user });
  });

  // ===== Account (subscription + usage) =====
  app.get("/api/account", (req, res) => {
    const user = userFromRequest(req);
    if (!user) return res.status(401).json({ error: "Not logged in" });
    res.json({
      user,
      subscription: {
        plan: user.plan,
        plan_id: user.plan_id,
        credits_remaining: user.credits_remaining,
      },
      next_step: user.plan === "free" ? "subscribe" : "active",
    });
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

  // ===== Plugin Pay-Before-Download: Flutterwave (email + zip) =====
  // Lightweight "no heavy checkout" capture: customer gives an email + picks a
  // plan, gets a Flutterwave payment link, and after a verified `charge.success`
  // webhook receives the plugin zip via email AND a tokenized download link.
  const FLW_BASE = "https://api.flutterwave.com/v3";
  // CEO-approved pricing (from the roadmap purchase path).
  const PLAN_PRICES: Record<string, { price: number; label: string }> = {
    starter: { price: 9, label: "Starter" },
    pro: { price: 29, label: "Pro" },
    godmode: { price: 99, label: "God Mode" },
    topup: { price: 10, label: "Wallet Top-Up" },
    "pack-starter": { price: 9, label: "Starter Pack" },
    "pack-pro": { price: 29, label: "Pro Pack" },
  };
  const DOWNLOAD_DIR = path.join(process.cwd(), "dist");
  const PLUGIN_ZIP = "godseye-plugin.zip";

  function newDownloadToken(): { token: string; expires: string } {
    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    return { token, expires };
  }

  // Create a Flutterwave hosted payment link and record the purchase intent.
  app.post("/api/create-checkout", async (req, res) => {
    try {
      let { email, plan_name, plan_id, price } = req.body;
      if (!plan_id) {
        return res.status(400).json({ error: "Missing required fields: email, plan_id" });
      }
      if (!email) {
        const user = userFromRequest(req);
        if (user) email = user.email;
      }
      if (!email) {
        return res.status(400).json({ error: "An email is required (or log in to auto-fill it)" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "A valid email is required" });
      }

      const flwKey = process.env.FLW_SECRET_KEY;
      if (!flwKey) {
        console.error("FLW_SECRET_KEY not set in environment");
        return res.status(500).json({ error: "Payment provider not configured" });
      }

      const planDef = PLAN_PRICES[plan_id];
      const numericPrice = Number(price) || (planDef ? planDef.price : 0);
      const label = plan_name || (planDef ? planDef.label : plan_id);

      const tx_ref = `godseye-${plan_id}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      const redirect_url = `${process.env.APP_URL || "https://godseye.digitalhustlerx.com"}/start?success=true&plan=${plan_id}&tx_ref=${tx_ref}`;

      const response = await fetch(`${FLW_BASE}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref,
          amount: numericPrice,
          currency: "USD",
          redirect_url,
          customer: { email: String(email).toLowerCase().trim() },
          customizations: {
            title: "GodsEye",
            description: `${label} Plan — $${numericPrice}/mo`,
          },
          meta: { plan_id, plan_name: label, tx_ref },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "success" || !data.data?.link) {
        console.error("[Flutterwave] Payment link creation failed:", data);
        return res.status(500).json({ error: (data && (data.message || data.detail)) || "Failed to create payment link" });
      }

      // Record intent now; flip to paid only when the webhook verifies payment.
      const tokenInfo = newDownloadToken();
      db.prepare(
        `INSERT INTO purchases (email, plan_id, plan_name, amount_usd, tx_ref, status, download_token, download_token_expires)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
      ).run(String(email).toLowerCase().trim(), plan_id, label, numericPrice, tx_ref, tokenInfo.token, tokenInfo.expires);

      const checkoutUrl = data.data.link; // may include ?tx_ref already; encode ours too
      const sep = checkoutUrl.includes("?") ? "&" : "?";
      res.json({ checkout_url: `${checkoutUrl}${sep}tx_ref=${tx_ref}`, checkout_id: tx_ref, tx_ref, plan_id, amount: numericPrice });
    } catch (error: any) {
      console.error("[Flutterwave] Error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout" });
    }
  });

  // Webhook — verify signature, then flip purchase to paid, issue the download
  // token, email the download link, and (for logged-in users) activate the plan.
  app.post("/api/flw-webhook", (req, res) => {
    const secretHash = process.env.FLW_WEBHOOK_HASH;
    const receivedHash = req.headers?.["verif-hash"] || "";
    if (secretHash && secretHash !== receivedHash) {
      console.error("[Flutterwave] Webhook signature mismatch");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body || {};
    const data = event.data || {};
    const eventStatus = data.status || "";

    // We only act on confirmed successful charges.
    if (eventStatus === "successful") {
      const txRef = data.tx_ref;
      const flwId = data.id ? String(data.id) : undefined;
      const email = data.customer?.email || data.email;
      const meta = data.meta || {};

      if (txRef) {
        const purchase = db.prepare("SELECT * FROM purchases WHERE tx_ref = ?").get(txRef) as any;
        if (purchase && purchase.status !== "paid") {
          const tokenInfo = purchase.download_token
            ? { token: purchase.download_token, expires: purchase.download_token_expires }
            : newDownloadToken();
          db.prepare(
            `UPDATE purchases SET status='paid', flw_txn_id=?, download_token=?, download_token_expires=?, paid_at=datetime('now') WHERE tx_ref=?`
          ).run(flwId || null, tokenInfo.token, tokenInfo.expires, txRef);

          // Activate plan for existing users (credits per plan).
          const creditsMap: Record<string, number> = { starter: 500, pro: 2000, godmode: 10000 };
          const planId = purchase.plan_id || meta.plan_id;
          const credits = creditsMap[planId];
          if (email && credits) {
            const user = db.prepare("SELECT id FROM users WHERE email=?").get(String(email).toLowerCase().trim());
            if (user) {
              db.prepare("UPDATE users SET plan=?, plan_id=?, credits_remaining=COALESCE(?, credits_remaining) WHERE id=?")
                .run(planId, planId, credits, (user as any).id);
            }
          }

          // Email the download link (pay-before-download delivery).
          const showEmail = String(email || purchase.email).toLowerCase().trim();
          const downloadUrl = `${process.env.APP_URL || "https://godseye.digitalhustlerx.com"}/api/plugin-download?token=${tokenInfo.token}`;
          const text =
            `Hi,\n\n` +
            `Thanks for buying the GodsEye ${purchase.plan_name} plan. Your payment is confirmed.\n\n` +
            `Download your plugin here (the link works for 7 days):\n${downloadUrl}\n\n` +
            `How to install: in WordPress go to Plugins > Add New > Upload Plugin, pick the downloaded\n` +
            `godseye-plugin.zip, then activate it. Next, message @GodseyeXBot and send /connect with your\n` +
            `site URL, WordPress username, and an Application Password.\n\n` +
            `— GodsEye`;
          const html =
            `<p>Hi,</p>` +
            `<p>Thanks for buying the GodsEye <strong>${purchase.plan_name}</strong> plan. Your payment is confirmed.</p>` +
            `<p><a style="background:#C4A484;color:#000;padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:bold" href="${downloadUrl}">Download plugin (.zip)</a></p>` +
            `<p style="font-size:12px;color:#777">Link expires in 7 days.</p>` +
            `<p style="font-size:13px">Install: WordPress → Plugins → Add New → Upload Plugin → install & activate. Then message @GodseyeXBot and send <code>/connect</code> with your site URL, WordPress username, and an Application Password.</p>` +
            `<p>— GodsEye</p>`;
          sendMail({
            to: showEmail,
            subject: `Your GodsEye plugin download — ${purchase.plan_name}`,
            text,
            html,
          }).then((r) => console.log(`[Flutterwave] download email to ${showEmail}:`, r.ok ? `ok${r.size ? ` (${r.size}B)` : ""}` : r.error));

          console.log(`[Flutterwave] Payment confirmed & download ready for ${showEmail} (tx_ref=${txRef})`);
        }
      }
    }

    res.json({ received: true });
  });

  // Tokenized download — serves the plugin zip for a paid purchase.
  app.get("/api/plugin-download", (req, res) => {
    const token = req.query.token as string | undefined;
    if (!token) return res.status(400).json({ error: "Missing download token" });
    const row = db.prepare(
      "SELECT * FROM purchases WHERE download_token=? AND status='paid' AND download_token_expires > datetime('now')"
    ).get(token) as any;
    if (!row) return res.status(403).json({ error: "Invalid or expired download link" });

    const zipPath = path.join(DOWNLOAD_DIR, PLUGIN_ZIP);
    if (!fs.existsSync(zipPath)) {
      return res.status(500).json({ error: "Plugin file not available yet" });
    }
    res.download(zipPath, PLUGIN_ZIP, (err) => {
      if (err && !res.headersSent) res.status(500).end();
    });
  });

  // Purchase status — the success page polls this after Flutterwave redirect.
  app.get("/api/purchase/status", (req, res) => {
    const txRef = req.query.tx_ref as string | undefined;
    if (!txRef) return res.status(400).json({ error: "Missing tx_ref" });
    const row = db.prepare("SELECT email, plan_name, amount_usd, tx_ref, status, download_token FROM purchases WHERE tx_ref=?").get(txRef) as any;
    if (!row) return res.status(404).json({ error: "Purchase not found" });
    res.json({
      tx_ref: row.tx_ref,
      plan_name: row.plan_name,
      amount_usd: row.amount_usd,
      status: row.status,
      download_token: row.status === "paid" ? row.download_token : undefined,
    });
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
