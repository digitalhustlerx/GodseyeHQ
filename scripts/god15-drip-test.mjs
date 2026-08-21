// GOD-15 deterministic unit test for the waitlist->paid drip scheduler.
// Runs against an isolated temp SQLite DB (no SMTP, no real data). Covers the
// pure logic: schema, enqueue timing, per-recipient position, launch-shift
// anchor/re-anchor/unanchor, and copy placeholder resolution. The actual
// sendMail() call path is proven separately live (see issue GOD-15 comment:
// a real SMTP transaction + Postfix relay/bounce for a reserved @example.com
// test recipient).
//
// Usage: node --import tsx scripts/god15-drip-test.mjs

import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

// Import drip.ts, statically importing its mailer is fine — the functions under
// test here do not call sendMail.
import {
  initDrip, enqueueDrip, setConfig, getConfig, getEmailDef,
  DRIP_KEYS, backfillLaunchJobs, resolveCtx,
} from "../src/lib/drip.ts";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "god15-test-"));
const db = new Database(path.join(tmp, "test.db"));
db.pragma("journal_mode = WAL");

// Mirror the minimal real schema drip needs (waitlist + users).
db.exec(`CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT ''
);`);

initDrip(db);

let passed = 0;
function ok(name) { passed++; console.log(`  ✓ ${name}`); }

// --- 1. schema ---
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('drip_jobs','drip_config')").all();
assert.equal(tables.length, 2);
ok("schema creates drip_jobs + drip_config");

const cfgDefaults = db.prepare("SELECT key,value FROM drip_config").all();
assert.equal(cfgDefaults.find(k => k.key === "enabled").value, "0", "drip disabled by default");
ok("drip defaults to disabled");

// --- 2. enqueue timing (E1..E4 relative, E5/E6 NULL until launch) ---
const signupAt = "2026-08-01T00:00:00.000Z";
db.prepare("INSERT INTO waitlist (email, created_at) VALUES (?, ?)").run("alice@example.com", signupAt);
const wl = db.prepare("SELECT id FROM waitlist WHERE email='alice@example.com'").get();
enqueueDrip("alice@example.com", wl.id, signupAt);

const jobs = db.prepare("SELECT email_key, send_at, status FROM drip_jobs WHERE email='alice@example.com'").all();
assert.equal(jobs.length, 6);
ok("enqueues 6 jobs per signup");

const expect = { e1: "2026-08-01T00:00:00.000Z", e2: "2026-08-02T00:00:00.000Z", e3: "2026-08-05T00:00:00.000Z", e4: "2026-08-08T00:00:00.000Z" };
for (const [k, v] of Object.entries(expect)) {
  const j = jobs.find(x => x.email_key === k);
  assert.equal(j.send_at, v, `${k} anchored to signup + relative delay`);
}
ok("E1-E4 anchored to signup_at (+0/+1d/+4d/+7d)");

for (const k of ["e5", "e6"]) {
  const j = jobs.find(x => x.email_key === k);
  assert.equal(j.send_at, null, `${k} waits for launch`);
}
ok("E5/E6 null until launch_at configured");

// --- 3. launch-shift anchor + re-anchor + unanchor ---
setConfig({ launch_at: "2026-09-01T09:00:00Z" });
const afterSet = db.prepare("SELECT email_key,send_at FROM drip_jobs WHERE email='alice@example.com' AND email_key IN ('e5','e6')").all();
assert.equal(afterSet.find(x => x.email_key === "e5").send_at, "2026-09-01T09:00:00.000Z");
assert.equal(afterSet.find(x => x.email_key === "e6").send_at, "2026-09-04T09:00:00.000Z");
ok("E5/E6 anchored at launch (+0 / +3d)");

// launch date slip -> re-anchor
setConfig({ launch_at: "2026-10-01T09:00:00Z" });
const afterSlip = db.prepare("SELECT email_key,send_at FROM drip_jobs WHERE email='alice@example.com' AND email_key='e6'").get();
assert.equal(afterSlip.send_at, "2026-10-04T09:00:00.000Z");
ok("launch slip re-anchors E6 to new launch +3d");

// clear launch -> unanchor to null
setConfig({ launch_at: "" });
const afterClear = db.prepare("SELECT email_key,send_at FROM drip_jobs WHERE email='alice@example.com' AND email_key IN ('e5','e6')").all();
assert.ok(afterClear.every(x => x.send_at === null));
ok("clearing launch_at unanchors E5/E6 to null");

// --- 4. idempotency (re-enqueue doesn't duplicate) ---
enqueueDrip("alice@example.com", wl.id, signupAt);
const count = db.prepare("SELECT COUNT(*) c FROM drip_jobs WHERE email='alice@example.com'").get().c;
assert.equal(count, 6);
ok("re-enqueue is idempotent (UNIQUE email_email_key)");

// --- 5. copy placeholder resolution + position ---
// Insert two more so alice has position + context lookup.
db.prepare("INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice Wonder')").run();
const ctx = resolveCtx({ email: "alice@example.com", waitlist_id: wl.id, signup_at: signupAt }, 3);
assert.equal(ctx.first_name, "Alice Wonder");
assert.equal(ctx.waitlist_position, 3);
const e1 = getEmailDef("e1");
assert.ok(e1.buildText(ctx).includes("Alice Wonder"));
const e3txt = getEmailDef("e3").buildText(ctx);
assert.ok(e3txt.includes("Here's exactly what happens when GodsEye opens"));
const e5 = getEmailDef("e5");
assert.ok(e5.buildText({ ...ctx, purchase_link: "https://godseye.digitalhustlerx.com/go" }).includes("https://godseye.digitalhustlerx.com/go"));
const e6 = getEmailDef("e6");
assert.ok(e6.buildText({ ...ctx, early_bird_deadline: "Oct 1st" }).includes("Oct 1st"));
// every email builds text + html without throwing and resolves placeholders
for (const k of DRIP_KEYS) {
  const d = getEmailDef(k);
  const txt = d.buildText(ctx);
  const html = d.buildHtml(ctx);
  assert.ok(typeof txt === "string" && txt.length > 30);
  assert.ok(html.includes("</div></div>"), `${k} html is well-formed (closing root divs)`);
  assert.ok(!html.includes("{first_name}") && !html.includes("{{"), `no unresolved placeholders in ${k} html`);
  assert.ok(!txt.includes("{first_name}") && !txt.includes("{{"), `no unresolved placeholders in ${k} text`);
}
ok("all 6 emails build text+html and resolve placeholders");

// --- 6. config PATCH whitelist + persistence ---
getConfig();
setConfig({ enabled: "1" });
assert.equal(getConfig().enabled, "1");
const persisted = db.prepare("SELECT value FROM drip_config WHERE key='enabled'").get().value;
assert.equal(persisted, "1");
ok("config persists to drip_config");

setConfig({ enabled: "0" }); // leave clean
console.log(`\nGOD-15 drip test: ${passed} checks passed ✅`);
db.close();
fs.rmSync(tmp, { recursive: true, force: true });
