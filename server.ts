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

// GOD-10 (GOD-6B): paid-state write-back for waitlist -> paid conversion.
// Idempotent column migration - SQLite has no "ADD COLUMN IF NOT EXISTS", so
// guard each add by checking PRAGMA table_info first.
const WLC = db.prepare("PRAGMA table_info(waitlist)").all() as Array<{ name: string }>;
const wlCols = new Set(WLC.map((c) => c.name));
const wlMigrate: Array<[string, string]> = [
  ["paid_at", "TEXT"],
  ["plan", "TEXT"],
  ["credits_remaining", "INTEGER"],
  ["conversions_source", "TEXT"],
];
for (const [col, type] of wlMigrate) {
  if (!wlCols.has(col)) {
    db.exec(`ALTER TABLE waitlist ADD COLUMN ${col} ${type}`);
  }
}
db.exec(`CREATE INDEX IF NOT EXISTS waitlist_paid_idx ON waitlist (paid_at) WHERE paid_at IS NOT NULL;`);

// ===== GOD-9 (GOD-8 referral design handoff): referral loop =====
// referrers: one opaque referral token per email.
// referral_events: attribution ledger keyed by (invitee_email, stage) so an
// invitee email is credited to only ONE inviter per stage (email de-dup +
// first-touch: whichever CTA path the invitee later takes, the inviter of the
// earliest recorded event owns the credit for that stage).
db.exec(`
CREATE TABLE IF NOT EXISTS referrers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS referral_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inviter_id INTEGER NOT NULL,
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('signup','paid','activated')),
  credited_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'credited',
  source TEXT,
  UNIQUE (invitee_email, stage)
);
CREATE INDEX IF NOT EXISTS referral_events_inviter_idx ON referral_events (inviter_id);
CREATE INDEX IF NOT EXISTS referral_events_stage_idx ON referral_events (stage);
`);

// ---- Referral loop helpers (GOD-9) ----
// Disposable/temporary email roots (bare domain after @) + known subdomain patterns.
// Matches `user@mailinator.com`, `user@sub.mailinator.com`, and `mailinator.com` directly.
const DISPOSABLE_RE = /(^|[.@])(10minutemail|guerrillamail|mailinator|yopmail|tempmail|trashmail|sharklasers|throwaway|temp-mail|maildrop|mailnesia|spamgourmet|mail\.tm|mailinator2|getnada)\./i;

function normalizeRefEmail(raw: string): string {
  const email = String(raw || "").trim().toLowerCase();
  const at = email.indexOf("@");
  if (at === -1) return email;
  const local = email.slice(0, at).replace(/\./g, "");
  const domain = email.slice(at + 1);
  return domain === "gmail.com" || domain === "googlemail.com" ? `${local}@gmail.com` : email;
}

function makeRefToken(email: string): string {
  // Opaque, unguessable, URL-safe — not sequential, not derived from the email in a
  // reversible way.
  const salt = crypto.randomBytes(12).toString("hex");
  return "godseye-uv" + crypto.createHash("sha256").update(email + salt).digest("hex").slice(0, 24);
}

function getOrCreateReferrer(email: string): { id: number; email: string; token: string } {
  const normalized = normalizeRefEmail(email);
  const existing = db.prepare("SELECT * FROM referrers WHERE email = ?").get(normalized) as any;
  if (existing) return existing;
  const token = makeRefToken(normalized);
  db.prepare("INSERT INTO referrers (email, token) VALUES (?, ?)").run(normalized, token);
  return db.prepare("SELECT * FROM referrers WHERE email = ?").get(normalized) as any;
}

// Record an attribution event, honoring de-dup (one inviter per (invitee,stage)),
// self-referral guard, and (for signup) disposable-domain filter.
function recordReferralEvent(opts: {
  inviter: { id: number; email: string } | null;
  inviteeEmail: string;
  stage: "signup" | "paid" | "activated";
  source?: string;
  allowDisposable?: boolean;
}): { created: boolean; ignored?: string } {
  const normalized = normalizeRefEmail(opts.inviteeEmail);
  if (!opts.inviter) return { created: false, ignored: "no_referrer" };
  // Self-referral guard: a user cannot refer themselves (matched on normalized alias).
  if (normalizeRefEmail(opts.inviter.email) === normalized) {
    return { created: false, ignored: "self_referral" };
  }
  // Disposable-domain filter on intake (signup). Paid/activated stages are gated by an
  // actual charge later, so a dead temp account cannot earn the referrer anything.
  if (opts.stage === "signup" && !opts.allowDisposable && DISPOSABLE_RE.test(normalized)) {
    return { created: false, ignored: "disposable_domain" };
  }
  try {
    const existing = db
      .prepare("SELECT id FROM referral_events WHERE invitee_email = ? AND stage = ?")
      .get(normalized, opts.stage) as any;
    if (existing) return { created: false, ignored: "already_attributed" };
    db.prepare(
      `INSERT INTO referral_events (inviter_id, inviter_email, invitee_email, stage, credited_at, status, source)
       VALUES (?, ?, ?, ?, datetime('now'), 'credited', ?)`
    ).run(opts.inviter.id, opts.inviter.email, normalized, opts.stage, opts.source || null);
    return { created: true };
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) return { created: false, ignored: "already_attributed" };
    throw e;
  }
}

// Reward ladder from GOD-8 §3. Computed from the referral_events ledger.
function rewardLadderFor(inviterId: number) {
  const paidCount = (db.prepare(
    "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id = ? AND stage = 'paid' AND status='credited'"
  ).get(inviterId) as { c: number }).c;
  const signupCount = (db.prepare(
    "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id = ? AND stage = 'signup'"
  ).get(inviterId) as { c: number }).c;
  return {
    waiting: signupCount - paidCount, // signed up but not yet paid
    paid_count: paidCount,
    rewards_unlocked: {
      waitlist_priority: { unlocked: true, detail: "waitlist priority +1 per invitee" },
      one_free_month: { unlocked: paidCount >= 1, detail: "1 month of payer's plan free, caps Pro" },
      god_mode_trial_14d: { unlocked: paidCount >= 3, detail: "14-day God Mode trial (once)" },
      lifetime_minus_20: { unlocked: paidCount >= 5, detail: "lifetime -20% on own plan (once)" },
    },
  };
}

// GOD-9: reward ledger + billing integration. Earned rewards (free month, God
// Mode trial, lifetime -20%) are recorded here and surfaced on the NEXT
// invoice as a `referral_discount` line (not a manual coupon), per GOD-8 §3
// and §5. Milestone rewards (God Mode trial + lifetime discount) apply at most
// once per customer; the free-month reward is per paid invite.
db.exec(`
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  kind TEXT NOT NULL,                    -- free_month | god_mode_trial_14d | lifetime_minus_20
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | applied | used
  source_invitee_email TEXT,
  milestone INTEGER,
  credited_at TEXT DEFAULT (datetime('now')),
  applied_at TEXT,
  UNIQUE (user_email, kind, milestone)
);
CREATE INDEX IF NOT EXISTS rewards_user_idx ON rewards (user_email);
`);

// Friendly label + discount equivalent for each reward kind (GOD-8 §3).
const REWARD_DEFS: Record<string, { label: string; discountUsd?: number; pct?: number }> = {
  free_month: { label: "1 month of your plan free", discountUsd: 29 },          // caps at Pro ($29)
  god_mode_trial_14d: { label: "14-day God Mode trial", discountUsd: 99 },      // the $99 tier, once
  lifetime_minus_20: { label: "Lifetime -20% on your plan", pct: 0.2 },         // once
};

// Sync the rewards ledger from the referral_events ladder. Called on every
// account/referral read so new earned rewards appear without a manual step.
// Idempotent: UNIQUE(user_email, kind, milestone) prevents double-crediting, and
// milestone caps mean each rung fires exactly once (GOD-8 §3, §6).
function syncRewardsLedger(inviterEmail: string): void {
  const norm = normalizeRefEmail(inviterEmail);
  const referrer = db.prepare("SELECT * FROM referrers WHERE email = ?").get(norm) as any;
  if (!referrer) return;
  const paidCount = (db.prepare(
    "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id=? AND stage='paid' AND status='credited'"
  ).get(referrer.id) as { c: number }).c;

  const grant = (kind: string, milestone: number | null, source: string | null, desc: string) => {
    try {
      db.prepare(
        `INSERT OR IGNORE INTO rewards (user_email, kind, description, status, source_invitee_email, milestone)
         VALUES (?, ?, ?, 'pending', ?, ?)`
      ).run(norm, kind, desc, source, milestone);
    } catch (e: any) {
      if (!e.message?.includes("UNIQUE")) throw e;
    }
  };

  // Free month: one per paid invitee (caps at Pro). Deterministic invitee list.
  const invitees = db.prepare(
    `SELECT invitee_email FROM referral_events WHERE inviter_id=? AND stage='paid' AND status='credited' ORDER BY id`
  ).all(referrer.id) as Array<{ invitee_email: string }>;
  invitees.forEach((iv, i) =>
    grant("free_month", i + 1, iv.invitee_email, `1 free month from ${iv.invitee_email} (caps at Pro)`));

  // Milestones: once each (GOD-8 §3 hard cap).
  if (paidCount >= 3) grant("god_mode_trial_14d", 3, null, "14-day God Mode trial (once)");
  if (paidCount >= 5) grant("lifetime_minus_20", 5, null, "Lifetime -20% on your own plan (once)");
}

// Compute the pending discount that applies to this user's NEXT invoice as the
// `referral_discount` line item (GOD-8 §5 billing-engine flag). Free months fill
// first (up to the cap), then a one-off God Mode trial / lifetime %, whichever
// the ladder has earned. Returns the line + any named rewards not yet used.
function pendingReferralDiscount(userEmail: string): {
  referral_discount: number;      // USD-equivalent off the next invoice
  line_label: string | null;
  rewards: Array<{ kind: string; label: string; status: string }>;
} {
  const norm = normalizeRefEmail(userEmail);
  const rows = db.prepare(
    "SELECT * FROM rewards WHERE user_email=? ORDER BY id"
  ).all(norm) as Array<{ kind: string; status: string; description: string }>;
  const rewards = rows.map((r) => ({
    kind: r.kind,
    label: r.description || REWARD_DEFS[r.kind]?.label || r.kind,
    status: r.status,
  }));

  const pending = rows.filter((r) => r.status === "pending");
  const freeMonths = pending.filter((r) => r.kind === "free_month");
  const trial = pending.find((r) => r.kind === "god_mode_trial_14d");
  const lifetime = pending.find((r) => r.kind === "lifetime_minus_20");

  // Order: a single next invoice can carry one discount line. Prefer the
  // lifetime % if unlocked (permanent), else the highest free value (God Mode
  // trial over one free month), else any free month.
  let line_label: string | null = null;
  let referral_discount = 0;
  if (lifetime) {
    // Lifetime % is applied continuously; report 20% of Pro ($29) as the notice.
    line_label = REWARD_DEFS[lifetime.kind].label;
    referral_discount = 29 * (REWARD_DEFS[lifetime.kind].pct || 0);
  } else if (trial) {
    line_label = REWARD_DEFS[trial.kind].label;
    referral_discount = REWARD_DEFS[trial.kind].discountUsd || 0;
  } else if (freeMonths.length) {
    line_label = REWARD_DEFS[freeMonths[0].kind].label;
    referral_discount = REWARD_DEFS[freeMonths[0].kind].discountUsd || 0;
  }
  return { referral_discount, line_label, rewards };
}

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

// Purchases get a first-touch referrer token captured at checkout creation so
// the webhook can attribute the 'paid' stage to the inviter who referred them.
// (Runs AFTER the purchases table exists so a fresh DB boots cleanly.)
const PCH = db.prepare("PRAGMA table_info(purchases)").all() as Array<{ name: string }>;
if (!PCH.some((c) => c.name === "referrer_token")) {
  db.exec("ALTER TABLE purchases ADD COLUMN referrer_token TEXT");
}

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
    const { email, referredBy, ref } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const referralCode = Buffer.from(email).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
    const emailLower = String(email).toLowerCase().trim();

    // GOD-9: resolve the inviter from the referral link token (first-touch attribution).
    // Any of ref / referredBy may carry the inviter's token or code.
    let inviter: { id: number; email: string } | null = null;
    const refToken = ref || referredBy || null;
    if (refToken) {
      // First try the opaque referral token, then fall back to the legacy
      // waitlist.referral_code (so links shared before GOD-9 still attribute).
      const byToken = db.prepare("SELECT id, email FROM referrers WHERE token = ?").get(refToken) as any;
      const byCode = db.prepare(
        "SELECT r.id, r.email FROM referrers r JOIN waitlist w ON r.email = w.email WHERE w.referral_code = ?"
      ).get(refToken) as any;
      inviter = byToken || byCode || null;
    }

    try {
      // GOD-14: persist the resolved first-touch inviter's canonical token onto
      // the waitlist row so downstream stages (activated) can re-resolve the
      // inviter even when the client only sent a `ref` token and no `referredBy`.
      // Fall back to the raw referredBy voice only when the token didn't resolve.
      const persistedReferrer =
        (inviter && getOrCreateReferrer(inviter.email).token) ||
        referredBy ||
        null;
      const stmt = db.prepare("INSERT INTO waitlist (email, referred_by, referral_code) VALUES (?, ?, ?)");
      stmt.run(emailLower, persistedReferrer, referralCode);
    } catch (err: any) {
      if (err.message?.includes("UNIQUE")) {
        // Already on the list — still resolve/return the user's own referral token.
        const self = getOrCreateReferrer(emailLower);
        // GOD-14: backfill first-touch attribution onto an existing row that was
        // created before referral storage (or joined via a non-ref path), so the
        // activation hook can still resolve the inviter.
        if (inviter) {
          const row = db.prepare("SELECT referred_by FROM waitlist WHERE email = ?").get(emailLower) as any;
          if (row && !row.referred_by) {
            db.prepare("UPDATE waitlist SET referred_by = ? WHERE email = ?")
              .run(getOrCreateReferrer(inviter.email).token, emailLower);
          }
        }
        return res.json({ message: "Already on the waitlist!", referral_code: referralCode, referral_token: self.token });
      }
      return res.status(500).json({ error: "Could not register. Try again." });
    }

    // GOD-9 signup attribution (de-dup + self-referral + disposable-domain guards).
    const refRec = recordReferralEvent({
      inviter,
      inviteeEmail: emailLower,
      stage: "signup",
      source: "waitlist",
    });
    if (!refRec.created && refRec.ignored) {
      console.log(`[GOD-9] signup attribution ignored for ${emailLower}: ${refRec.ignored}`);
    }

    // GOD-9: the new user immediately gets their own referral token to share.
    const self = getOrCreateReferrer(emailLower);
    res.json({ message: "You're on the list!", referral_code: referralCode, referral_token: self.token });
  });

  // GOD-9: return this user's opaque referral token (create lazily on first read).
  app.get("/api/referral", (req, res) => {
    const email = ((req.query.email as string) || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    const self = getOrCreateReferrer(email);
    res.json({ email, referral_token: self.token });
  });

  // GOD-9: funnel stats for a referrer (invites sent, signup, paid, referred revenue,
  // reward ladder). Feeds the Growth dashboard.
  app.get("/api/referral/stats", (req, res) => {
    const email = ((req.query.email as string) || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "email required" });
    const self = db.prepare("SELECT * FROM referrers WHERE email = ?").get(normalizeRefEmail(email)) as any;
    if (!self) return res.json({ email, invites_sent: 0, signature: null, referred_revenue: 0 });
    const signups = (db.prepare(
      "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id = ? AND stage='signup'"
    ).get(self.id) as { c: number }).c;
    const paid = (db.prepare(
      "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id = ? AND stage='paid' AND status='credited'"
    ).get(self.id) as { c: number }).c;
    const activated = (db.prepare(
      "SELECT COUNT(*) as c FROM referral_events WHERE inviter_id = ? AND stage='activated' AND status='credited'"
    ).get(self.id) as { c: number }).c;
    // Referred revenue = sum of confirmed paid purchases by invitees who came through
    // this referrer's link (matched on the invitee email in the paid ledger).
    const referredRevenue = (db.prepare(
      `SELECT COALESCE(SUM(p.amount_usd),0) as s FROM purchases p
       JOIN referral_events e ON lower(e.invitee_email) = lower(p.email)
       WHERE e.inviter_id = ? AND e.stage='paid' AND p.status='paid'`
    ).get(self.id) as { s: number }).s;
    // GOD-9: rewards ledger + pending referral_discount for this referrer.
    syncRewardsLedger(self.email);
    const disc = pendingReferralDiscount(self.email);
    res.json({
      email,
      referral_token: self.token,
      invites_sent: signups,
      funnel: { invite_to_signup: signups, signup_to_paid: paid, signup_to_activated: activated },
      invite_to_signup: signups,
      signup_to_paid: { signups, paid, rate: signups > 0 ? paid / signups : 0 },
      referred_revenue: referredRevenue,
      rewards: rewardLadderFor(self.id),
      rewards_ledger: disc.rewards,
      referral_discount: disc.referral_discount,
    });
  });

  // GOD-9: attribution at ACTIVATION (first real action). Called by the product
  // when a referred user completes their first real action. Resolves the inviter
  // from the inviter's referral token (or from the activate token passed at
  // signup), then creds the 'activated' stage — first-touch, de-duped, and gated
  // so only a previously-signup-attributed invitee counts.
  app.post("/api/referral/activate", (req, res) => {
    const { email, ref } = req.body || {};
    const inviteeEmail = String(email || "").trim().toLowerCase();
    if (!inviteeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
      return res.status(400).json({ error: "A valid invitee email is required" });
    }
    // Prefer re-reading the referral token off the waitlist row (first-touch),
    // else fall back to the caller-supplied ref token.
    let inviter: { id: number; email: string } | null = null;
    const wl = db.prepare("SELECT referred_by FROM waitlist WHERE email = ?").get(inviteeEmail) as any;
    const token = (ref as string) || wl?.referred_by || null;
    if (token) {
      const byToken = db.prepare("SELECT id, email FROM referrers WHERE token = ?").get(token) as any;
      if (byToken) inviter = byToken;
    }
    const rec = recordReferralEvent({ inviter, inviteeEmail, stage: "activated", source: "first-action" });
    res.json({ ok: rec.created, ignored: rec.ignored || null });
  });

  app.get("/api/waitlist", (req, res) => {
    const email = ((req.query.email as string) || "").trim().toLowerCase();
    const row = db.prepare("SELECT COUNT(*) as count FROM waitlist").get() as { count: number };

    // Position: optional ?email= -> give 1-based rank + total for the GOD-6
    // email sequence ("you're #N of 500"). Ordered by signup order (id asc).
    if (email) {
      const me = db.prepare("SELECT id, created_at FROM waitlist WHERE email = ?").get(email) as any;
      if (!me) {
        return res.status(404).json({ count: row.count, email, position: null, message: "Email not on waitlist" });
      }
      const before = db.prepare(
        "SELECT COUNT(*) as c FROM waitlist WHERE id < ? OR (id = ? AND created_at < ?)"
      ).get(me.id, me.id, me.created_at) as { c: number };
      return res.json({ count: row.count, email, position: before.c + 1, position_of: row.count });
    }

    res.json({ count: row.count });
  });

  // GOD-10 (GOD-6B): conversion write-back. Called by the payment path when a
  // customer completes a pay-before-download purchase. Marks the waitlist row
  // matching the email as paid (paid_at, plan, credits_remaining, source).
  // This is the conversion event that feeds GOD-6 waitlist->paid metrics.
  app.post("/api/waitlist/convert", (req, res) => {
    const { email, plan, conversions_source } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const emailLower = String(email).toLowerCase().trim();
    const existing = db.prepare("SELECT id FROM waitlist WHERE email = ?").get(emailLower) as any;
    if (!existing) {
      return res.status(404).json({ error: "Email not on waitlist" });
    }
    const creditsMap: Record<string, number> = { pro: 500, business: 2000, custom: 10000, starter: 500 };
    const credits = creditsMap[plan] ?? 500; // seed 500 at launch per GOD-10
    db.prepare(
      `UPDATE waitlist SET paid_at = datetime('now'), plan = ?, credits_remaining = ?, conversions_source = ? WHERE id = ?`
    ).run(plan || null, credits, conversions_source || null, existing.id);
    const updated = db.prepare("SELECT * FROM waitlist WHERE id = ?").get(existing.id);
    res.json({ ok: true, converted: updated });
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
    // GOD-9: refresh the rewards ledger from the live referral ladder, then
    // surface any pending referral_discount as a line on the next invoice.
    syncRewardsLedger(user.email);
    const discount = pendingReferralDiscount(user.email);
    res.json({
      user,
      subscription: {
        plan: user.plan,
        plan_id: user.plan_id,
        credits_remaining: user.credits_remaining,
        referral_discount: discount.referral_discount,
        referral_discount_label: discount.line_label,
        rewards: discount.rewards,
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
      // GOD-9: capture the referral link token (first-touch) onto the purchase so the
      // webhook can credit the inviter when the invitee actually pays.
      let referrerToken: string | null = null;
      const refToken = (req.body && req.body.ref) || (req.query && (req.query.ref as string));
      if (refToken) {
        const r = db.prepare("SELECT id, email FROM referrers WHERE token = ?").get(refToken) as any;
        if (r) referrerToken = String(refToken);
      }
      db.prepare(
        `INSERT INTO purchases (email, plan_id, plan_name, amount_usd, tx_ref, status, download_token, download_token_expires, referrer_token)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      ).run(String(email).toLowerCase().trim(), plan_id, label, numericPrice, tx_ref, tokenInfo.token, tokenInfo.expires, referrerToken);

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

          // GOD-10 (GOD-6B): write the conversion back to the waitlist row matching
          // the purchaser's email. This is the event that feeds GOD-6
          // waitlist->paid metrics. Updates (never creates) a waitlist row so the
          // row's paid_at/plan is stamped for the email sequence.
          const wlEmail = String(email || purchase.email).toLowerCase().trim();
          if (wlEmail) {
            // Map FLW plan_id -> GOD-10 waitlist plan value (pro | business | custom).
            const wlPlan = planId === "godmode" ? "custom" : planId; // starter/pro -> starter|pro, godmode -> custom
            const wlCredits = creditsMap[planId] ?? 500;             // seed 500 at launch per GOD-10
            const wlRow = db.prepare("SELECT id FROM waitlist WHERE email = ?").get(wlEmail) as any;
            if (wlRow) {
              db.prepare(
                `UPDATE waitlist SET paid_at = datetime('now'), plan = ?, credits_remaining = ?, conversions_source = ? WHERE id = ?`
              ).run(wlPlan, wlCredits, "pay-before-download", wlRow.id);
              console.log(`[GOD-10] waitlist converted: ${wlEmail} -> plan=${wlPlan} credits=${wlCredits}`);
            } else {
              console.log(`[GOD-10] purchase ${wlEmail} has no waitlist row (conversion tracked in purchases only)`);
            }
          }

          // GOD-9: attribute the 'paid' stage to the inviter whose referral token was
          // captured at checkout. This is what unlocks the referrer's reward ladder
          // (paid count drives free month / God Mode trial / lifetime discount) and
          // feeds the referred-revenue number on the dashboard. Gated on an actual
          // confirmed charge (this is already inside the successful webhook branch).
          const purchaseRef = purchase.referrer_token;
          if (purchaseRef) {
            const inviter = db.prepare("SELECT id, email FROM referrers WHERE token = ?").get(purchaseRef) as any;
            const paidRec = recordReferralEvent({
              inviter,
              inviteeEmail: String(email || purchase.email),
              stage: "paid",
              source: "pay-before-download",
            });
            const payerEmail = String(email || purchase.email).toLowerCase().trim();
            if (paidRec.created) {
              console.log(`[GOD-9] paid referral credited: ${payerEmail} paid via ${inviter ? inviter.email : purchaseRef}`);
            } else if (paidRec.ignored) {
              console.log(`[GOD-9] paid attribution ignored for ${payerEmail}: ${paidRec.ignored}`);
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
