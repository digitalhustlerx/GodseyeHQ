// GOD-9 end-to-end backend test against a scratch SQLite DB.
// Spins up the bundled server on a test port with a temp CWD, drives the
// referral flow via HTTP, and asserts the ledger + rewards + billing behavior.
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const PORT = 3451 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
const work = mkdtempSync(join(tmpdir(), "god9-test-"));
const SERVER_CJS = resolve(new URL(".", import.meta.url).pathname, "../dist/server.cjs");

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
let output = "";
server.stdout.on("data", (d) => (output += d));
server.stderr.on("data", (d) => (output += d));

async function waitReady() {
  for (let i = 0; i < 30; i++) {
    if (server.exitCode !== null) break;
    try {
      const r = await fetch(`${BASE}/api/waitlist`);
      if (r.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function main() {
  const ready = await waitReady();
  if (!ready) { check("server ready", false, output); server.kill(); process.exit(1); }
  check("server ready", true);

  // 1. Create a referrer token
  const inviter = "founder.testsenior@gmail.com";
  const rRef = await (await fetch(`${BASE}/api/referral?email=${encodeURIComponent(inviter)}`)).json();
  check("referrer token issued", !!rRef.referral_token && rRef.referral_token.startsWith("godseye-uv"),
    rRef.referral_token);
  const token = rRef.referral_token;

  // 2. Invitee signs up via referrer link
  const invitee = "bob.partner@gmail.com";
  const signup = await (await fetch(`${BASE}/api/waitlist`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: invitee, referredBy: token }),
  })).json();
  check("signup via ref link", !!signup.referral_token, JSON.stringify(signup));

  // 3. Stats show signup attribution (first-touch, de-dup)
  const stats0 = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  check("signup attributed first-touch", stats0.invites_sent === 1 && stats0.funnel?.invite_to_signup === 1,
    JSON.stringify(stats0.funnel));

  // 4. Paid attribution gated on a real 'paid' event (via webhook path is complex; emulate by
  //    opening a purchase with the referrer_token then calling /api/referral/activate won't be paid).
  //    For the paid stage we rely on /api/flw-webhook. Here we assert the activated stage works separately.
  const act = await (await fetch(`${BASE}/api/referral/activate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: invitee }),
  })).json();
  check("activated stage credited (first-touch via waitlist referred_by)", act.ok === true, JSON.stringify(act));

  // 5. Self-referral guard: invitee signs up with inviter's own email via their token
  const self = await (await fetch(`${BASE}/api/waitlist`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: inviter, referredBy: token }),
  })).json();
  const stats1 = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  check("self-referral guard (no extra signup credit)", stats1.invites_sent === 1,
    `invites_sent=${stats1.invites_sent}`);

  // 6. Disposable-domain filter on signup intake
  const disp = await (await fetch(`${BASE}/api/waitlist`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "junk@10minutemail.com", referredBy: token }),
  })).json();
  const stats2 = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  check("disposable-domain filtered", stats2.invites_sent === 1, JSON.stringify(stats2.funnel));

  // 7. De-dup: same invitee signup twice → still one credit
  const dup = await (await fetch(`${BASE}/api/waitlist`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: invitee, referredBy: token }),
  })).json();
  const stats3 = await (await fetch(`${BASE}/api/referral/stats?email=${encodeURIComponent(inviter)}`)).json();
  check("email de-dup (one credit per invitee)", stats3.invites_sent === 1, `invites=${stats3.invites_sent}`);

  // 8. Reward ladder present in stats
  check("reward ladder in stats", !!stats3.rewards?.rewards_unlocked?.one_free_month,
    JSON.stringify(stats3.rewards?.rewards_unlocked));

  // 9. Activation recorded in funnel
  check("activated funnel count", stats3.funnel?.signup_to_activated === 1, JSON.stringify(stats3.funnel));

  // Output DB path for inspection
  console.log(`DB: ${work}/data/godseye.db`);

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  server.kill();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); server.kill(); process.exit(1); });
