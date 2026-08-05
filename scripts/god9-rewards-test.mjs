// GOD-9 backend test #2: reward ledger + billing integration.
// After signup/paid attribution, asserts that the rewards ledger synced and the
// pending referral_discount shows on the referrer's next invoice, per GOD-8 §3/§5.
import { spawn } from "child_process";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { createRequire } from "module";

const PORT = 3951 + Math.floor(Math.random() * 400);
const BASE = `http://127.0.0.1:${PORT}`;
const work = mkdtempSync(join(tmpdir(), "god9-rw-"));
const SERVER_CJS = resolve(new URL(".", import.meta.url).pathname, "../dist/server.cjs");
const require = createRequire(import.meta.url);

const server = spawn("node", [SERVER_CJS], {
  cwd: work,
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "test" },
  stdio: ["ignore", "pipe", "pipe"],
});
const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${extra ? " — " + extra : ""}`);
}
await new Promise((r) => setTimeout(r, 800));

async function waitReady() {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`${BASE}/api/waitlist`)).status < 500) return true; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

const main = async () => {
  const ready = await waitReady();
  if (!ready) { check("server ready", false); server.kill(); process.exit(1); }
  check("server ready", true);

  const inviter = "founder.paytier@gmail.com";
  const invitee = "referral.payment@gmail.com";
  const rRef = await (await fetch(`${BASE}/api/referral?email=${encodeURIComponent(inviter)}`)).json();
  await fetch(`${BASE}/api/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: invitee, referredBy: rRef.referral_token }) });

  // Open the DB and seed a "paid" referral_events row (the same shape the
  // Flutterwave webhook writes on a confirmed charge) + a paid purchase row.
  // Note: getOrCreateReferrer stores the gmail-dot-NORMALIZED email.
  const db = new (require("better-sqlite3"))(join(work, "data", "godseye.db"));
  const invRow = db.prepare("SELECT id, email FROM referrers WHERE email=?").get(inviter.replace(/\.(?=.*@gmail)/, ""));
  db.prepare(`INSERT INTO referral_events (inviter_id, inviter_email, invitee_email, stage, credited_at, status, source)
              VALUES (?,?,?, 'paid', datetime('now'), 'credited', 'pay-before-download')`).run(invRow.id, inviter, invitee);
  db.prepare(`INSERT INTO purchases (email, plan_id, plan_name, amount_usd, tx_ref, status, paid_at)
              VALUES (?, 'pro', 'Pro', 29, 'raftest1', 'paid', datetime('now'))`).run(invitee);
  db.close();

  // Rewards ledger syncs on read -> rewards_ledger populated + discount on next invoice.
  const stats = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  check("reward ladder paid_count=1", stats.rewards?.paid_count === 1, `paid_count=${stats.rewards?.paid_count}`);
  check("rewards ledger synced (free month pending)",
    (stats.rewards_ledger || []).some((r) => r.kind === "free_month" && r.status === "pending"),
    JSON.stringify(stats.rewards_ledger));
  check("pending referral_discount surfaced",
    stats.referral_discount === 29 &&
      (stats.rewards_ledger || []).some((r) => r.kind === "free_month" && typeof r.label === "string" && r.label.length > 0),
    `discount=${stats.referral_discount}`);

  // Milestone reward: bump to 3 paid invites -> god_mode_trial_14d once.
  let db2;
  for (let i = 0; i < 2; i++) {
    const invEmail = `paid${i}.invitee@gmail.com`;
    db2 = new (require("better-sqlite3"))(join(work, "data", "godseye.db"));
    db2.prepare(`INSERT INTO referral_events (inviter_id, inviter_email, invitee_email, stage, credited_at, status, source)
                VALUES (?,?,?, 'paid', datetime('now'), 'credited', 'pay-before-download')`).run(invRow.id, inviter, invEmail);
    db2.close();
  }
  const stats3 = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  const hasTrial = (stats3.rewards_ledger || []).some((r) => r.kind === "god_mode_trial_14d");
  check("3 paid invites -> God Mode trial unlocked (once)",
    hasTrial && stats3.rewards?.rewards_unlocked?.god_mode_trial_14d?.unlocked,
    JSON.stringify(stats3.rewards_ledger));

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  server.kill();
  process.exit(failed ? 1 : 0);
};
main().catch((e) => { console.error(e); server.kill(); process.exit(1); });
