// GOD-15 (GOD-6): Waitlist -> Paid drip scheduler.
//
// Lightweight, local-first drip engine that reuses the plain-SMTP sendMail in
// src/lib/mailer.ts to send the 6-email waitlist -> paid sequence on the mapped
// delays. No external provider, no cron daemon: an in-process interval in
// server.ts flushes due jobs.
//
// Copy is FINAL (owned by Growth, see email-sequence doc on GOD-6). This module
// supplies the transport mechanism only; when the drip is toggled live, the
// CEO-approved copy already in place ships. Pricing / offer copy is out of scope
// here (GOD-6 sign-off).
//
// Launch-shift model:
//   - E1..E4 anchor to the recipient's signup_at: +0min, +1d, +4d, +7d.
//   - E5 (LAUNCH claim) and E6 (+3d post-launch) anchor to a configured
//     `drip.launch_at`. Until the CEO/Growth sets launch_at, E5/E6 rows stay
//     `pending` with send_at NULL; the worker skips them and a backfill step
//     stamps their send_at the moment launch_at is configured. This makes the
//     whole mechanism "ready to flip" without a fixed launch date.
//   - A global `drip.enabled` gate (default OFF) means nothing is sent until
//     Growth toggles it live. Idempotent by (email, email_key) UNIQUE so a
//     restart never double-sends.

import { sendMail, type MailOptions } from "./mailer.js";

export type DripKey = "e1" | "e2" | "e3" | "e4" | "e5" | "e6";

// Anchoring: E1..E4 are relative to signup_at (minutes). E5/E6 are launch-relative.
const RELATIVE_DELAY_MIN: Partial<Record<DripKey, number>> = {
  e1: 0,
  e2: 24 * 60,
  e3: 4 * 24 * 60,
  e4: 7 * 24 * 60,
};
const LAUNCH_OFFSET_DAYS: Partial<Record<DripKey, number>> = {
  e5: 0,
  e6: 3,
};

export const DRIP_KEYS: DripKey[] = ["e1", "e2", "e3", "e4", "e5", "e6"];

// ---- Config (drip_config KV in SQLite; survives restart) ----
export interface DripConfig {
  enabled: string;            // "0" | "1"  — master gate, default OFF
  launch_at: string;          // ISO or "" — when E5 fires (launch)
  early_bird_deadline: string;// ISO or "" — {early_bird_deadline} placeholder
  purchase_link: string;      // base CTA for E5 {purchase_link}
}

export const DRIP_DEFAULTS: DripConfig = {
  enabled: "0",
  launch_at: "",
  early_bird_deadline: "",
  purchase_link: "",
};

// ---- Placeholders used across the copy ----
// {first_name} (braced once), plus double-braced per the GOD-6 copy:
// {{waitlist_position}}, {{purchase_link}}, {{early_bird_deadline}}.
export interface DripRecipientCtx {
  first_name: string;
  waitlist_position: number | null;
  purchase_link: string;
  early_bird_deadline: string;
}

// In-memory copy of config, refreshed on read and before each worker tick.
// Keep the DB as source of truth; this mirrors so the worker reads it fast.
let CFG_MIRROR: DripConfig = { ...DRIP_DEFAULTS };

// ---------- db accessor abstraction so drip.ts is DB-agnostic -------------
// The server passes a thin adapter so we keep a single better-sqlite3 handle
// (server owns it for WAL + the rest of the app). All SQL lives here.
export interface DripDb {
  prepare(sql: string): {
    run(...args: unknown[]): { lastInsertRowid?: number | bigint; changes: number };
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown[];
  };
}

let _db: DripDb | null = null;
export function initDrip(db: DripDb): void {
  _db = db;
  ensureSchema();
  refreshConfig();
}

export function ensureSchema(): void {
  const db = _db as DripDb;
  // drip_jobs: one row per (email, email_key). status lifecycle:
  //   pending -> sent | skipped_paid | cancelled
  // send_at NULL means "not yet schedulable" (used for launch-anchored E5/E6
  // before launch_at is configured). send_at values always stored as ISO in UTC.
  db.prepare(
    `CREATE TABLE IF NOT EXISTS drip_jobs (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT NOT NULL,
       waitlist_id INTEGER,
       email_key TEXT NOT NULL,
       subject TEXT NOT NULL,
       send_at TEXT,                     -- ISO UTC; NULL = awaiting launch anchor
       status TEXT NOT NULL DEFAULT 'pending',
       attempts INTEGER NOT NULL DEFAULT 0,
       last_error TEXT,
       sent_at TEXT,
       created_at TEXT DEFAULT (datetime('now')),
       UNIQUE (email, email_key)
     )`
  ).run();
  db.prepare(
    `CREATE INDEX IF NOT EXISTS drip_jobs_due_idx
       ON drip_jobs (status, send_at) WHERE status = 'pending' AND send_at IS NOT NULL`
  ).run();

  // drip_config: runtime knobs (enabled gate, launch anchor). KV store.
  db.prepare(
    `CREATE TABLE IF NOT EXISTS drip_config (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL
     )`
  ).run();

  // Seed defaults so the keys always exist.
  for (const [k, v] of Object.entries(DRIP_DEFAULTS)) {
    db.prepare("INSERT OR IGNORE INTO drip_config (key, value) VALUES (?, ?)").run(k, v);
  }
}

export function getConfig(): DripConfig {
  refreshConfig();
  return { ...CFG_MIRROR };
}

export function setConfig(patch: Partial<DripConfig>): DripConfig {
  const db = _db as DripDb;
  const cur = getConfig();
  const next = { ...cur, ...patch };
  const stmt = db.prepare("UPDATE drip_config SET value = ? WHERE key = ?");
  for (const [k, v] of Object.entries(DRIP_DEFAULTS)) {
    stmt.run(String((next as any)[k] ?? ""), k);
  }
  CFG_MIRROR = { ...DRIP_DEFAULTS, ...next };
  if (next.launch_at) {
    // Launch anchor just set: backfill any waiting E5/E6 rows with a real date.
    backfillLaunchJobs();
  } else {
    // Launch anchor cleared (e.g. launch date changed): release launch-anchored
    // E5/E6 rows back to NULL so they wait for the correct launch date instead
    // of firing on a stale one.
    const unanchored = db.prepare(
      "UPDATE drip_jobs SET send_at = NULL WHERE email_key IN ('e5','e6') AND status = 'pending' AND send_at IS NOT NULL"
    ).run().changes;
    if (unanchored > 0) console.log(`[GOD-15] unanchored ${unanchored} launch-anchored E5/E6 job(s) (launch_at cleared)`);
  }
  return { ...CFG_MIRROR };
}

function refreshConfig(): void {
  if (!_db) return;
  const rows = _db.prepare("SELECT key, value FROM drip_config").all() as Array<{ key: string; value: string }>;
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  CFG_MIRROR = {
    enabled: map.enabled ?? DRIP_DEFAULTS.enabled,
    launch_at: map.launch_at ?? "",
    early_bird_deadline: map.early_bird_deadline ?? "",
    purchase_link: map.purchase_link ?? "",
  };
}

function isoAddDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

// ---- Copy (final, from GOD-6 email-sequence doc) ----
// Only the {first_name}/{{...}} placeholders vary per recipient.
interface EmailDef {
  key: DripKey;
  subject: string;
  buildText: (ctx: DripRecipientCtx) => string;
  buildHtml: (ctx: DripRecipientCtx) => string;
}

const FONTFAMILY = "font-family:Helvetica,Arial,sans-serif";
const GOLD = "#C4A484";
const DARK = "#111111";
const BODY =
  `<div style="${FONTFAMILY};background:#0A0A0A;color:#E8E6E3;padding:24px;">` +
  `<div style="max-width:540px;margin:0 auto;font-size:15px;line-height:1.6;">`;

const BUTTON = (href: string, label: string) =>
  `<p><a href="${href}" style="display:inline-block;background:${GOLD};color:#000;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:bold;">${label}</a></p>`;

function footer(signoff: string): string {
  return `<p style="margin-top:28px;border-top:1px solid #2a2a2a;padding-top:14px;font-size:12px;color:#8a8a8a;">${signoff}</p>`;
}

// resolve placeholders in double-brace + single-brace form.
function fill(template: string, ctx: DripRecipientCtx): string {
  return template
    .replace(/\{\{first_name\}\}|\{first_name\}/g, ctx.first_name)
    .replace(/\{\{waitlist_position\}\}/g, ctx.waitlist_position ? String(ctx.waitlist_position) : "the list")
    .replace(/\{\{purchase_link\}\}/g, ctx.purchase_link || "https://godseye.digitalhustlerx.com")
    .replace(/\{\{early_bird_deadline\}\}/g, ctx.early_bird_deadline || "the first 500 is full");
}

const EMAILS: EmailDef[] = [
  {
    key: "e1",
    subject: "You're in the first 500 — welcome to Godseye",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `You're on the list, and your spot in the first 500 is locked.\n\n` +
        `That means two things the moment Godseye opens:\n` +
        `  • 500 free credits, no time limit\n` +
        `  • Early-bird pricing, held for you forever\n\n` +
        `Why waitlist for Godseye?\n` +
        `Because managing WordPress should be a chat, not a chore.\n` +
        `Instead of emailing your developer (again), you type in Telegram:\n\n` +
        `  "update the pricing page"\n` +
        `  "write a 500-word post about our new feature"\n` +
        `  "update all plugins and fix the broken layout"\n\n` +
        `...and it's done.\n\n` +
        `We'll email you the moment doors open — no noise before then.\n` +
        `Reply to this email if there's a WordPress task driving you crazy right now.\n` +
        `We read every one.\n\n` +
        `— The Godseye team\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">You're in the first 500</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>You're on the list, and your spot in the first 500 is locked. That means two things the moment Godseye opens:</p>` +
      `<ul><li><strong>500 free credits</strong>, no time limit</li><li><strong>Early-bird pricing</strong>, held for you forever</li></ul>` +
      `<p>Managing WordPress should be a chat, not a chore. Instead of emailing your developer (again), you type in Telegram:</p>` +
      `<p style="font-family:monospace">"update the pricing page"<br>"write a 500-word post about our new feature"<br>"update all plugins and fix the broken layout"</p>` +
      `<p>...and it's done.</p>` +
      `<p>We'll email you the moment doors open — no noise before then. Reply to this email if there's a WordPress task driving you crazy right now. We read every one.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
  {
    key: "e2",
    subject: "What \"chat with your agent\" actually looks like",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `The simplest way to show you what Godseye does is to name the things you'll say to it:\n\n` +
        `  ✍️ "Write a 500-word post for my blog about our new product."\n` +
        `  🧩 "Install WooCommerce and set it up for my shop."\n` +
        `  🔧 "Update all my plugins and fix the broken homepage layout."\n` +
        `  🛡️ "Run a health check and tell me if anything's risky."\n\n` +
        `Real sentences. That's the whole interface.\n\n` +
        `You connect your WordPress site from Telegram once, and from then on your\n` +
        `site answers to chat — not FTP, not git, not a stack of admin logins.\n\n` +
        `The first 500 of you keep 500 free credits to try all of it the day we open.\n\n` +
        `You're currently #{{waitlist_position}} on the list.\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">What "chat with your agent" actually looks like</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>The simplest way to show you what Godseye does is to name the things you'll say to it:</p>` +
      `<p style="font-family:monospace">✍️ "Write a 500-word post for my blog about our new product."<br>🧩 "Install WooCommerce and set it up for my shop."<br>🔧 "Update all my plugins and fix the broken homepage layout."<br>🛡️ "Run a health check and tell me if anything's risky."</p>` +
      `<p><strong>Real sentences. That's the whole interface.</strong></p>` +
      `<p>You connect your WordPress site from Telegram once, and from then on your site answers to chat — not FTP, not git, not a stack of admin logins.</p>` +
      `<p>The first 500 of you keep 500 free credits to try all of it the day we open.</p>` +
      `<p>You're currently <strong>#${c.waitlist_position ?? "the list"}</strong> on the list.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
  {
    key: "e3",
    subject: "3 steps. That's the whole setup.",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `Here's exactly what happens when Godseye opens:\n\n` +
        `  1. Connect your WordPress site from Telegram (one link, one time).\n` +
        `  2. Start chatting — install, write, update, fix, whatever the site needs.\n` +
        `  3. Done. It works while you work on anything else.\n\n` +
        `No dashboards to learn. No developers to pay per change.\n\n` +
        `And because your spot in the first 500 comes with 500 free credits and\n` +
        `price-lock, there's nothing to lose by being ready. Credits never expire.\n` +
        `If we don't launch, you don't pay — full stop.\n\n` +
        `See you at launch.\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">3 steps. That's the whole setup.</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>Here's exactly what happens when Godseye opens:</p>` +
      `<ol><li>Connect your WordPress site from Telegram (one link, one time).</li><li>Start chatting — install, write, update, fix, whatever the site needs.</li><li>Done. It works while you work on anything else.</li></ol>` +
      `<p>No dashboards to learn. No developers to pay per change.</p>` +
      `<p>Your spot in the first 500 comes with <strong>500 free credits</strong> and price-lock. Credits never expire. If we don't launch, you don't pay — full stop.</p>` +
      `<p>See you at launch.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
  {
    key: "e4",
    subject: "Doors open soon — your early-bird price is almost live",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `We're days out.\n\n` +
        `When Godseye opens, the first 500 (you included) get:\n` +
        `  • 500 free credits\n` +
        `  • Early-bird pricing held forever: Pro at $19/mo instead of $29, Business at $49 instead of $79\n` +
        `  • Your price never goes up as long as you're in\n\n` +
        `That locked-in price only exists for the first 500. When the list fills,\n` +
        `it's normal pricing, and those spots stay filled.\n\n` +
        `If you know a site owner who's done paying developers for every small\n` +
        `change, forward this — invited members skip the line.\n\n` +
        `We'll send one more email: the second doors actually open.\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">Doors open soon — your early-bird price is almost live</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>We're days out.</p>` +
      `<p>When Godseye opens, the first 500 (you included) get:</p>` +
      `<ul><li><strong>500 free credits</strong></li><li><strong>Early-bird pricing held forever:</strong> Pro at $19/mo instead of $29, Business at $49 instead of $79</li><li><strong>Your price never goes up</strong> as long as you're in</li></ul>` +
      `<p>That locked-in price only exists for the first 500. When the list fills, it's normal pricing, and those spots stay filled.</p>` +
      `<p>If you know a site owner who's done paying developers for every small change, forward this — invited members skip the line.</p>` +
      `<p>We'll send one more email: the second doors actually open.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
  {
    key: "e5",
    subject: "Godseye is live — your early-bird price is waiting",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `Doors are open.\n\n` +
        `  • Claim your spot → {{purchase_link}}\n` +
        `  • Your 500 free credits are already on your account\n` +
        `  • Early-bird price is yours until the first 500 fills\n\n` +
        `Choose what fits:\n` +
        `  🧑 Solo — Pro $19/mo: 500 credits, 3 sites\n` +
        `  🏢 Agency — Business $49/mo: 2,000 credits, 20 sites\n\n` +
        `Both come with your locked early-bird rate and a cancel-anytime guarantee.\n` +
        `Credits never expire.\n\n` +
        `This is the email we promised — no further pushes unless you want one.\n\n` +
        `— The Godseye team\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">Godseye is live — your early-bird price is waiting</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>Doors are open.</p>` +
      `${BUTTON(c.purchase_link || "https://godseye.digitalhustlerx.com", "Claim your early-bird spot →")}` +
      `<ul><li>Your <strong>500 free credits</strong> are already on your account</li><li><strong>Early-bird price</strong> is yours until the first 500 fills</li></ul>` +
      `<p><strong>Choose what fits:</strong><br>🧑 Solo — Pro $19/mo: 500 credits, 3 sites<br>🏢 Agency — Business $49/mo: 2,000 credits, 20 sites</p>` +
      `<p>Both come with your locked early-bird rate and a cancel-anytime guarantee. Credits never expire.</p>` +
      `<p>This is the email we promised — no further pushes unless you want one.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
  {
    key: "e6",
    subject: "Your early-bird spot is still here — just barely",
    buildText: (c) =>
      fill(
        `Hi {first_name},\n\n` +
        `The first 500 marker is filling. Your early-bird price is still held for\n` +
        `you, but once the list fills it's normal pricing and that rate goes away.\n\n` +
        `If the reason you haven't claimed is "I'm not sure it'll handle my setup,"\n` +
        `that's exactly what your 500 free credits are for — real use, no obligation.\n\n` +
        `Or if you'd rather hand the whole thing to someone else: reply "custom"\n` +
        `and we'll quote a done-for-you setup. We get you on Godseye and working\n` +
        `in two weeks.\n\n` +
        `Either way, the spot is yours until {{early_bird_deadline}}.\n\n` +
        `— The Godseye team\n`,
        c
      ),
    buildHtml: (c) =>
      `${BODY}<h2 style="color:#fff;">Your early-bird spot is still here — just barely</h2>` +
      `<p>Hi ${c.first_name},</p>` +
      `<p>The first 500 marker is filling. Your early-bird price is still held for you, but once the list fills it's normal pricing and that rate goes away.</p>` +
      `<p>If the reason you haven't claimed is "I'm not sure it'll handle my setup," that's exactly what your <strong>500 free credits</strong> are for — real use, no obligation.</p>` +
      `<p>Or if you'd rather hand the whole thing to someone else: reply "custom" and we'll quote a done-for-you setup. We get you on Godseye and working in two weeks.</p>` +
      `<p>Either way, the spot is yours until <strong>${c.early_bird_deadline || "the first 500 is full"}</strong>.</p>` +
      `${footer("— The Godseye team")}</div></div>`,
  },
];

export function getEmailDef(key: DripKey): EmailDef {
  const def = EMAILS.find((e) => e.key === key);
  if (!def) throw new Error(`Unknown drip email key: ${key}`);
  return def;
}

// ---- recipient context resolution ----
export interface RecipientRow {
  email: string;
  waitlist_id: number;
  signup_at: string;
}

// Resolve per-recipient tokens. Position computed by counting waitlist rows
// with a strictly earlier id (matches the /api/waitlist position logic so the
// "you're #N" number is consistent with the live endpoint).
export function resolveCtx(row: RecipientRow, position: number | null): DripRecipientCtx {
  const db = _db as DripDb;
  const user = db
    .prepare("SELECT name FROM users WHERE lower(email) = ?")
    .get(row.email.toLowerCase()) as { name?: string } | undefined;
  const firstName =
    user?.name?.trim() ||
    row.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) ||
    "there";
  const cfg = getConfig();
  return {
    first_name: firstName,
    waitlist_position: position,
    purchase_link: cfg.purchase_link || "https://godseye.digitalhustlerx.com",
    early_bird_deadline: cfg.early_bird_deadline,
  };
}

// ---- enqueue on waitlist join ----
// Called once a waitlist row exists (INSERT succeeded). Idempotent: UNIQUE
// (email, email_key) means a re-run/restart never duplicates a job.
export function enqueueDrip(email: string, waitlistId: number, signupAt: string): void {
  const db = _db as DripDb;
  const cfg = getConfig();
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO drip_jobs (email, waitlist_id, email_key, subject, send_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  for (const key of DRIP_KEYS) {
    let sendAt: string | null = null;
    const relDays = LAUNCH_OFFSET_DAYS[key];
    if (relDays !== undefined) {
      // launch-anchored (e5/e6): only schedulable once launch_at is set.
      if (cfg.launch_at) sendAt = isoAddDays(cfg.launch_at, relDays);
    } else {
      const delayMin = RELATIVE_DELAY_MIN[key] ?? 0;
      sendAt = new Date(new Date(signupAt).getTime() + delayMin * 60000).toISOString();
    }
    stmt.run(email.toLowerCase(), waitlistId, key, getEmailDef(key).subject, sendAt);
  }
}

// Backfill send_at for launch-anchored pending E5/E6 now that launch_at is set.
export function backfillLaunchJobs(): void {
  const db = _db as DripDb;
  const cfg = getConfig();
  if (!cfg.launch_at) return;
  // Re-anchor ALL pending E5/E6 to the currently-configured launch_at. This
  // both (a) schedules rows that were waiting on a NULL anchor and (b) moves
  // rows that were anchored to an earlier launch date when the date changes
  // (so a slip doesn't leave them firing at a stale time).
  const pending = db
    .prepare("SELECT id, email_key FROM drip_jobs WHERE email_key IN ('e5','e6') AND status='pending'")
    .all() as Array<{ id: number; email_key: string }>;
  const upd = db.prepare("UPDATE drip_jobs SET send_at = ? WHERE id = ?");
  for (const j of pending) {
    const days = LAUNCH_OFFSET_DAYS[j.email_key as DripKey] ?? 0;
    upd.run(isoAddDays(cfg.launch_at, days), j.id);
  }
  if (pending.length) console.log(`[GOD-15] anchored ${pending.length} launch jobs (launch_at=${cfg.launch_at})`);
}

// ---- worker tick ----
// Flush due pending jobs. Gates:
//   1. drip.enabled must be "1" (master gate, default OFF).
//   2. Recipient waitlist row must not be paid (GOD-10 paid_at gate — joiners
//      who convert stop getting nudges; those rows flip to skipped_paid).
//   3. send_at must be in the past and non-null.
// Idempotent: attempts incremented per failure, release on success; UNIQUE
// (email,email_key) plus a status guard prevents double-sends across restarts.
export async function flushDue(): Promise<{ sent: number; skipped_paid: number }> {
  const db = _db as DripDb;
  const cfg = getConfig();
  if (cfg.enabled !== "1") return { sent: 0, skipped_paid: 0 };

  const now = new Date().toISOString();
  const due = db
    .prepare(
      `SELECT j.id, j.email, j.subject, j.email_key, j.waitlist_id,
              w.created_at AS signup_at
       FROM drip_jobs j
       LEFT JOIN waitlist w ON w.id = j.waitlist_id
       WHERE j.status = 'pending'
         AND j.send_at IS NOT NULL
         AND j.send_at <= ?
       ORDER BY j.send_at ASC
       LIMIT 50`
    )
    .all(now) as Array<{ id: number; email: string; subject: string; email_key: string; waitlist_id: number | null; signup_at: string | null }>;

  let sent = 0;
  let skippedPaid = 0;
  for (const job of due) {
    // Mark in-flight to avoid concurrent ticks double-sending (defensive;
    // single process, but cheap and safe against overlapping manual runs).
    const claim = db.prepare(
      "UPDATE drip_jobs SET status = 'sending' WHERE id = ? AND status = 'pending'"
    ).run(job.id);
    if (claim.changes === 0) continue; // another tick grabbed it

    // Paid gate: users who already converted stop getting nudges.
    if (job.waitlist_id != null) {
      const wl = db.prepare("SELECT paid_at FROM waitlist WHERE id = ?").get(job.waitlist_id) as { paid_at: string | null } | undefined;
      if (wl?.paid_at) {
        db.prepare("UPDATE drip_jobs SET status='skipped_paid', sent_at=? WHERE id=?").run(now, job.id);
        skippedPaid++;
        continue;
      }
    }

    // Position for placeholder (matches /api/waitlist?email=).
    let position: number | null = null;
    try {
      const me = db.prepare("SELECT id, created_at FROM waitlist WHERE id = ?").get(job.waitlist_id) as any;
      if (me) {
        const before = db.prepare(
          "SELECT COUNT(*) as c FROM waitlist WHERE id < ? OR (id = ? AND created_at < ?)"
        ).get(me.id, me.id, me.created_at) as { c: number };
        position = before.c + 1;
      }
    } catch {
      position = null;
    }

    const def = getEmailDef(job.email_key as DripKey);
    const ctx = resolveCtx(
      { email: job.email, waitlist_id: job.waitlist_id ?? 0, signup_at: job.signup_at || now },
      position
    );
    const mail: MailOptions = {
      to: job.email,
      subject: def.subject,
      text: def.buildText(ctx),
      html: def.buildHtml(ctx),
    };
    const result = await sendMail(mail);
    if (result.ok) {
      db.prepare("UPDATE drip_jobs SET status='sent', sent_at=?, last_error=NULL WHERE id=?").run(now, job.id);
      sent++;
      console.log(`[GOD-15] sent ${job.email_key} -> ${job.email} (${job.email})`);
    } else {
      const attempts = (db.prepare("SELECT attempts FROM drip_jobs WHERE id=?").get(job.id) as any).attempts + 1;
      db.prepare(
        "UPDATE drip_jobs SET status='pending', attempts=?, last_error=? WHERE id=?"
      ).run(attempts, String(result.error || "unknown"), job.id);
      console.error(`[GOD-15] send failed ${job.email_key} -> ${job.email}: ${result.error}`);
    }
  }
  return { sent, skipped_paid: skippedPaid };
}

export function startDripWorker(intervalMs = 60_000): NodeJS.Timeout {
  // First flush shortly after boot (30s) so E1 welcome lands promptly for
  // signups that joined while the process was down, then on the interval.
  flushDue().catch((e) => console.error("[GOD-15] initial flush error:", e));
  const t = setInterval(() => {
    flushDue().catch((e) => console.error("[GOD-15] worker tick error:", e));
  }, intervalMs);
  // Don't keep the process alive solely for the worker (server runs this).
  t.unref?.();
  console.log(`[GOD-15] drip worker started (interval=${intervalMs}ms, enabled=${getConfig().enabled})`);
  return t;
}
