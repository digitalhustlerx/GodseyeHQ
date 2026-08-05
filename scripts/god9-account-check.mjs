import { spawn } from "child_process";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { createRequire } from "module";
const PORT = 5090 + Math.floor(Math.random()*60);
const BASE = `http://127.0.0.1:${PORT}`;
const work = mkdtempSync(join(tmpdir(),"god9-acc-"));
const SERVER_CJS = resolve(new URL(".", import.meta.url).pathname, "../dist/server.cjs");
const require = createRequire(import.meta.url);
const server = spawn("node",[SERVER_CJS],{cwd:work,env:{...process.env,PORT:String(PORT),NODE_ENV:"test"},stdio:["ignore","pipe","pipe"]});
let log=""; server.stdout.on("data",d=>log+=d); server.stderr.on("data",d=>log+=d);
let ready=false;
for (let i=0;i<50;i++){ try{ const r= await fetch(BASE+"/healthcheck"); if(r.status<500){ready=true;break;} }catch{} await new Promise(r=>setTimeout(r,300)); }
if(!ready){ console.log("SERVER NOT READY:", log.slice(-500)); server.kill(); process.exit(1);}
const mail = "founder.billing@gmail.com";
const reg = await fetch(BASE+"/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:mail,password:"password123",name:"Billing"})});
const cookie = reg.headers.get("set-cookie")?.split(";")[0];
if(reg.status!==200){ console.log("register failed", reg.status, log.slice(-400)); server.kill(); process.exit(1);}
const rRef = await (await fetch(BASE+`/api/referral?email=${encodeURIComponent(mail)}`)).json();
const db = new (require("better-sqlite3"))(join(work,"data","godseye.db"));
const inv = db.prepare("SELECT id FROM referrers WHERE email=?").get("founderbilling@gmail.com");
db.prepare("INSERT INTO referral_events (inviter_id, inviter_email, invitee_email, stage, credited_at, status, source) VALUES (?,?,?, 'paid', datetime('now'), 'credited', 'x')").run(inv.id, "founderbilling@gmail.com","invitee.paid@gmail.com");
db.close();
const acc = await fetch(BASE+"/api/account",{headers:{Cookie:cookie}});
const a = await acc.json();
console.log("discount=", a.subscription?.referral_discount, "label=", a.subscription?.referral_discount_label, "rewards=", JSON.stringify(a.subscription?.rewards?.map(r=>r.kind)));
console.log(acc.status===200 && a.subscription?.referral_discount===29 && a.subscription?.referral_discount_label ? "PASS /api/account billing label path" : "FAIL account");
server.kill(); process.exit(0);
