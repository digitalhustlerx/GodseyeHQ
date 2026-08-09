// GodseyeXbot — guided onboarding + WordPress-agent command flow.
// Pure Node (no runtime deps). Talks to the Godseye backend API and the Telegram Bot API.
// Onboarding goal: take a new user from /start to a first executed WordPress task in <2 min.
const API_BASE_URL = (process.env.GODSEYE_API_BASE_URL ?? "https://api.godseyes.digitalhustlerx.com").replace(/\/+$/, "");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const PLANT_PLUGIN_URL = process.env.GODSEYE_PLUGIN_URL ?? "https://api.godseyes.digitalhustlerx.com/dist/godseye-bridge.zip";
const SIGNUP_URL = process.env.GODSEYE_SIGNUP_URL ?? "https://godseye.digitalhustlerx.com";
// GOD-14 §C: the landing/referral API that owns the referral ledger. The bot
// fires the 'activated' stage event here once a user completes their first real
// action (successful /connect with a license + site) so Growth sees the
// signup -> activated -> paid funnel. Overridable for local testing.
const LANDING_API_BASE_URL = (process.env.GODSEYE_LANDING_API_BASE_URL ?? "https://godseye.digitalhustlerx.com").replace(/\/+$/, "");

// Per-chat session state.
const sessions = new Map();

// GOD-14 §C: one-shot activation emission per license key (activation is a first-
// action event; don't re-fire on every /connect or every message).
const activatedLicenses = new Set();

// Force IPv4 for outbound fetch. The VPS resolves api.telegram.org to IPv6 by default but has
// no working IPv6 route to Telegram, so node's fetch fails every poll. IPv4 works consistently.
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

// Niche Profile Templates — the /templates gateway deep-links here via
// t.me/GodseyeXbot?start=<template_id> so the agent already knows the niche.
import { botTemplate } from "./templates.js";

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || data?.message || `API request failed with HTTP ${response.status}`);
  return data;
}

// Fetch waitlist/founder stats for urgency messaging
async function getWaitlistStats() {
  try {
    const data = await api("/api/waitlist/stats");
    return data || { count: 0, spotsLeft: 100 };
  } catch (err) {
    console.error(`[stats] Failed to fetch waitlist stats: ${err.message}`);
    return { count: 0, spotsLeft: 100 };
  }
}

async function telegram(method, payload) {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is required.");
  // getUpdates is a LONG-POLL — Telegram holds the connection open up to `timeout` seconds (30s).
  // The AbortSignal budget MUST exceed the poll window or the request aborts mid-poll.
  const abortMs = method === "getUpdates" ? 75000 : 30000;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(abortMs),
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.description || "Telegram API request failed.");
    return data.result;
  } catch (err) {
    if (err.name === "TimeoutError" || err.code === "ETIMEDOUT") {
      console.log(`[telegram] ${method} timed out, retrying...`);
      return null;
    }
    throw err;
  }
}

function session(chatId) {
  const key = String(chatId);
  if (!sessions.has(key)) {
    sessions.set(key, {
      licenseKey: null,
      siteId: null,
      conversationId: null,
      pendingTaskId: null,
      // 0 = not onboarded; 1 = wizard awaiting "new or have-license"; 2 = awaiting license key entry
      onboardingStep: 0,
      // Preview-first business onboarding. Real-domain execution remains gated
      // behind an active subscription/license.
      previewProfile: null,
      previewTaskUsed: false,
      // Niche profile template (from /templates deep-link) + onboarding position.
      templateId: null,
      templateOnboardStep: -1,
      // Referral tracking from /start deep-link (ref_CODE)
      referralCode: null,
      onboardingIntent: null,
      hasWebsite: null,
      websitePlatform: null,
      onboardingQuestion: 0,
      onboardingAnswers: [],
    });
  }
  return sessions.get(key);
}

function inlineKeyboard(rows) {
  return { inline_keyboard: rows };
}

async function send(chatId, text, replyMarkup) {
  const payload = { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) };
  return telegram("sendMessage", payload);
}

async function answer(queryId, text) {
  return telegram("answerCallbackQuery", { callback_query_id: queryId, ...(text ? { text } : {}) });
}

async function findSitesForLicense(licenseKey) {
  const data = await api(`/api/sites?licenseKey=${encodeURIComponent(licenseKey)}&active=true`);
  return data.sites || [];
}

async function getLicense(licenseKey) {
  const data = await api(`/api/licenses/${encodeURIComponent(licenseKey)}`);
  return data.license || null;
}

// GOD-14 §C: emit a one-time 'activated' stage event to the referral ledger when
// a user takes their first real action (successful /connect). Dispatches to the
// landing API's /api/referral/activate; resolution is best-effort and never
// blocks or fails the connect flow.
async function emitActivation(licenseKey, email, state) {
  const key = `${licenseKey}:${(email || "").toLowerCase()}`;
  if (activatedLicenses.has(key)) return;
  activatedLicenses.add(key);
  if (state) state.activatedEmitted = key;
  const inviteeEmail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
    console.log(`[GOD-14] activation skipped for license ${licenseKey}: no valid email`);
    return;
  }
  try {
    const res = await fetch(`${LANDING_API_BASE_URL}/api/referral/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: inviteeEmail }),
    });
    const data = await res.json();
    console.log(`[GOD-14] activation emitted for ${inviteeEmail}: ok=${data?.ok} ignored=${data?.ignored ?? "null"} (HTTP ${res.status})`);
  } catch (err) {
    console.error(`[GOD-14] activation emission failed for ${inviteeEmail}: ${err.message}`);
  }
}

// Kick off a real task against the user's connected site. Returns {conversationId, task}.
async function startTask(siteId, conversationId, text, autoApprove = true) {
  const planned = await api("/api/tasks/plan", {
    method: "POST",
    body: JSON.stringify({ siteId, conversationId, prompt: text }),
  });
  const needsApproval = planned.task.plan.operations.some((operation) => operation.requiresApproval);
  if (!needsApproval && autoApprove) {
    const executed = await api(`/api/tasks/${planned.task.id}/approve`, { method: "POST" });
    return { conversationId: planned.conversationId, task: executed.task };
  }
  return { conversationId: planned.conversationId, task: planned.task, needsApproval };
}

function formatSite(site) {
  return `${site.name || site.url}${site.connectionStatus ? ` · ${site.connectionStatus}` : ""}${site.pluginVersion ? ` · plugin ${site.pluginVersion}` : ""}`;
}

// ---------- Onboarding wizard ----------

const WELCOME_KYBD = inlineKeyboard([
  [{ text: "✨ Set up my business", callback_data: "ob:business_setup" }],
  [{ text: "🔑 I have a license", callback_data: "ob:have_license" }],
]);
const WEBSITE_KYBD = inlineKeyboard([
  [{ text: "🌐 Yes, I have a website", callback_data: "ob:website_yes" }],
  [{ text: "↩️ No website yet", callback_data: "ob:website_no" }],
]);
const PLATFORM_KYBD = inlineKeyboard([
  [{ text: "🟦 WordPress", callback_data: "ob:wordpress" }],
  [{ text: "🌐 Something else", callback_data: "ob:other_site" }],
  [{ text: "↩️ Not sure yet", callback_data: "ob:platform_unknown" }],
]);
const GROUP_KYBD = inlineKeyboard([
  [{ text: "👥 How to use a group chat", callback_data: "ob:group_help" }],
  [{ text: "↩️ Continue privately", callback_data: "ob:preview" }],
]);
const PREVIEW_KYBD = inlineKeyboard([
  [{ text: "⚡ Try a safe demo", callback_data: "preview:demo" }],
  [{ text: "💳 Keep my agent working", callback_data: "preview:pricing" }],
  [{ text: "🔑 Connect my paid workspace", callback_data: "ob:have_license" }],
]);
const HAVE_LICENSE_KYBD = inlineKeyboard([
  [{ text: "🔗 Install / connect your WordPress site", callback_data: "ob:connect_site" }],
  [{ text: "⌨️ Full command list", callback_data: "ob:commands" }],
]);
const NEW_USER_KYBD = inlineKeyboard([[{ text: "🔑 I got my license", callback_data: "ob:have_license" }]]);
const CONNECT_SITE_KYBD = inlineKeyboard([
  [{ text: "⚡ Try a demo task", callback_data: "task:demo" }],
  [{ text: "🖥 /sites", callback_data: "cmd:sites" }],
  [{ text: "❓ Help", callback_data: "ob:commands" }],
]);
const COMMANDS_KYBD = inlineKeyboard([
  [{ text: "⚡ Try a demo task", callback_data: "task:demo" }],
  [{ text: "🖥 List my sites", callback_data: "cmd:sites" }],
  [{ text: "🔗 Manage WordPress", callback_data: "ob:connect_site" }],
]);

const DEMO_TASK_TEXT = "Create a draft post titled 'Hello Godseye' with the content block 'This post was created from Telegram.'";

function welcomeText(state) {
  const amConnected = !!(state.siteId || state.licenseKey);
  const lines = [
    "👁️ Welcome to Godseye.",
    "",
    "I'm your business agent. You can talk to me right here on Telegram.",
    "",
    "I can help with your customers, content, store, website, numbers, and admin — then bring in more specialist agents when the work grows.",
  ];
  if (amConnected) {
    lines.push("", `You're ready to go. Connected site: \`${state.siteId || "see /sites"}\` — try a demo task.`);
  }
  // Add founder spots urgency for non-connected users
  if (!amConnected) {
    lines.push("", "🔥 Founder Pass: Limited to 100 spots. Secure your spot at the special rate before the public launch.");
  }
  // Mention referral bonus if code exists
  if (state.referralCode) {
    lines.push("", `🎁 You have a referral bonus (${state.referralCode}) — extra credits when you activate.`);
  }
  lines.push("", "Start by telling me what you do and what you want off your plate first.");
  return lines.join("\n");
}

function previewWelcomeText() {
  return [
    "✨ Let's set up your business space.",
    "",
    "Reply in one line with:",
    "1) what you do, and",
    "2) the work you want help with first.",
    "",
    "Example: `I do hair and I need help replying to clients and posting on social.`",
  ].join("\n");
}

function commandsText() {
  return [
    "Godseye commands:",
    "",
    "`/connect <license>` — connect your license & sites",
    "`/sites` — list sites on your license",
    "`/site <site_id>` — pick the active site",
    "`/status` — check site/bridge status",
    "`/approve` · `/reject` — approve or reject a planned task",
    "",
    "Or just send a normal message and I'll turn it into a task on your active site.",
  ].join("\n");
}

// Route a callback query from an inline button.
async function handleCallback(chatId, queryId, data) {
  const state = session(chatId);
  await answer(queryId);

  if (data === "ob:business_setup") {
    state.onboardingIntent = "business_setup";
    state.onboardingStep = 10;
    state.onboardingQuestion = 0;
    state.onboardingAnswers = [];
    return send(chatId, [
      "✨ Let's build your business space from the ground up.",
      "",
      "Tell me what you do and the first repeatable job you want off your plate.",
      "Example: `I run a salon and need help with bookings and client follow-up.`",
      "",
      "I’ll ask a few short questions so I can make this specific to you. You do not need a license just to start onboarding.",
      "",
      "First: what do you do, or what are you building?",
    ].join("\n"));
  }

  if (data === "ob:website_yes") {
    state.hasWebsite = true;
    return send(chatId, "What platform is your website using?", PLATFORM_KYBD);
  }

  if (data === "ob:website_no") {
    state.hasWebsite = false;
    state.onboardingStep = 10;
    return send(chatId, [
      "✅ No problem. We'll set up your business workflow first.",
      "",
      "Tell me what you do and the first repeatable job you want off your plate.",
      "",
      "A license is only needed later if you activate a paid plan for live integrations.",
    ].join("\n"));
  }

  if (data === "ob:wordpress") {
    state.websitePlatform = "wordpress";
    state.onboardingStep = 10;
    return send(chatId, [
      "🟦 WordPress detected.",
      "",
      "Continue telling me about your business first. After you choose a paid plan, your license will be issued and I'll give you the Godseye plugin connection steps.",
      "",
      "No license is required just to preview onboarding, and never send WordPress credentials here.",
    ].join("\n"));
  }

  if (data === "ob:other_site" || data === "ob:platform_unknown") {
    state.websitePlatform = data === "ob:other_site" ? "other" : "unknown";
    state.onboardingStep = 10;
    return send(chatId, "✅ Got it. We'll start with your business workflow and choose the right connection later. Tell me what you do and what is stuck first.");
  }

  if (data === "ob:group_help") {
    return send(chatId, [
      "👥 Your group chat is the shared operating room.",
      "",
      "Create a private Telegram group, add @GodseyeXbot, and make it admin only if you want the agent to manage topics. Keep sensitive credentials out of chat.",
      "Use topics such as Tasks, Customers, Files, Analytics, and Settings. The agent reports there and keeps this private chat for setup and billing.",
      "",
      "I can't create or invite people into a group without Telegram's explicit group action, so you stay in control.",
    ].join("\n"), GROUP_KYBD);
  }

  if (data === "ob:preview") {
    state.onboardingStep = 10;
    return send(chatId, previewWelcomeText());
  }

  if (data === "preview:demo") {
    if (!state.previewProfile) return send(chatId, previewWelcomeText());
    if (state.previewTaskUsed) return send(chatId, "Your free preview task is already complete. Choose a plan to keep your agent working.", PREVIEW_KYBD);
    state.previewTaskUsed = true;
    const referralMsg = state.referralCode ? `🎁 Your referral gives you bonus credits when you activate.` : "";
    return send(
      chatId,
      [
        "⚡ Safe preview complete.",
        "",
        `Based on your business: ${state.previewProfile}`,
        "",
        "Your agent would organize this into a simple work plan, then handle the first task and bring you the result here.",
        "",
        "This preview does not connect to or change your real website, store, email, or social accounts.",
        "",
        "Ready to work on your real business? Choose a plan to activate your agent.",
        "",
        referralMsg,
      ].filter(Boolean).join("\n"),
      PREVIEW_KYBD
    );
  }

  if (data === "preview:pricing") {
    const referralMsg = state.referralCode ? `🎁 Your referral bonus (${state.referralCode}) gives you extra credits.` : "";
    return send(
      chatId,
      [
        "💳 Choose your plan at godseye.digitalhustlerx.com",
        "",
        "Founder Pass includes:",
        "• Full-price checkout + a one-time bonus token allocation on your first payment",
        "• Future payments use the normal token allocation — no repeat first-payment bonus",
        "• Unlimited sites on one license",
        "• Priority support + early feature access",
        "• Discounted renewal rate",
        "",
        "🔥 Limited to 100 founder spots.",
        "",
        referralMsg,
      ].filter(Boolean).join("\n"),
      PREVIEW_KYBD
    );
  }

  if (data === "ob:have_license") {
    state.onboardingStep = 2;
    return send(chatId, "🔑 Send me your license key in the format `GS-XXXX-XXXX`.\n\nExample: `/connect GS-1A2B-3C4D`\n\nDon't have it handy? Tap below to see where to get it.", HAVE_LICENSE_KYBD);
  }

  if (data === "ob:new_user") {
    state.onboardingStep = 1;
    return send(
      chatId,
      [
        "🆕 Getting started is a 3-step setup:",
        "",
        `1. Join early access at ${SIGNUP_URL}. We will send your verified license details when Founder Pass activation is ready.`,
        `2. Install the plugin on your WordPress site — download ${PLANT_PLUGIN_URL}, then Plugins → Upload → Activate. The plugin connects the site to your license automatically.`,
        "3. Come back here and/or connect: `/connect <license>`, then send a message to run your first task.",
        "",
        "Tap below once you have your license.",
      ].join("\n"),
      NEW_USER_KYBD
    );
  }

  if (data === "ob:connect_site") {
    const licence = state.licenseKey;
    return send(
      chatId,
      [
        `Plugin download: ${PLANT_PLUGIN_URL}`,
        "",
        "Install on your WordPress site: Plugins → Add New → Upload Plugin → select the zip → Activate.",
        "Then open Settings → Godseye, paste your license key, and click Connect.",
        licence ? `Your license: \`${licence}\`` : "You'll need a license key first (see /start).",
      ].join("\n"),
      COMMANDS_KYBD
    );
  }

  if (data === "ob:commands") {
    return send(chatId, commandsText(), COMMANDS_KYBD);
  }

  if (data === "cmd:sites") {
    return handleCommand(chatId, "/sites", false);
  }

  if (data === "task:demo") {
    if (!state.siteId) {
      return send(chatId, "Connect a site first. Tap below to connect.", HAVE_LICENSE_KYBD);
    }
    try {
      const { conversationId, task, needsApproval } = await startTask(state.siteId, state.conversationId, DEMO_TASK_TEXT);
      state.conversationId = conversationId;
      if (needsApproval) {
        state.pendingTaskId = task.id;
        return send(chatId, `${task.plan.summary}\nApprove with /approve or reject with /reject.`);
      }
      state.pendingTaskId = null;
      return send(chatId, `✅ Demo task executed:\n\n${task.result?.message ?? "Done."}\n\nThat's the loop — send any message and I'll plan + run it on your site.`, COMMANDS_KYBD);
    } catch (error) {
      return send(chatId, `Godseye error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return send(chatId, "Unknown option.");
}

// ---------- Commands ----------

const COMMANDS_KYBD_FOR_START = COMMANDS_KYBD;

async function handleCommand(chatId, text, fromCallback = true) {
  const state = session(chatId);
  const [rawCommand, ...rest] = text.trim().split(/\s+/);
  // Telegram appends @BotUsername when a command is sent in a group.
  // Treat /start@GodseyeXbot exactly like /start so onboarding cannot be
  // silently rejected depending on where the user tapped Start.
  const command = rawCommand.toLowerCase().replace(/@godseyexbot$/, "");

  if (command === "/start" || command === "/help") {
    // Deep-link from the /templates gateway: t.me/GodseyeXbot?start=<template_id>
    // Or referral deep-link: t.me/GodseyeXbot?start=ref_CODE
    const param = rest[0];

    // Handle referral codes (ref_ prefix)
    if (param && param.startsWith("ref_")) {
      state.referralCode = param.replace("ref_", "");
      state.onboardingStep = 0;
      // Pull founder stats for urgency
      const stats = await getWaitlistStats();
      const urgencyMsg = stats.spotsLeft < 20 ? `🔥 Only ${stats.spotsLeft} founder spots left!` : `🔥 ${stats.spotsLeft} founder spots remaining.`;
      // Referral users go straight to preview flow — no license button yet
      const REFERRAL_WELCOME_KYBD = inlineKeyboard([
        [{ text: "✨ Set up my business space", callback_data: "ob:preview" }],
      ]);
      return send(
        chatId,
        [
          `🎁 You're invited by a founder!`,
          "",
          `Your referral code is saved: \`${state.referralCode}\``,
          "",
          urgencyMsg,
          "",
          `You get bonus credits when you activate. Let's get you set up.`,
        ].join("\n"),
        REFERRAL_WELCOME_KYBD
      );
    }

    const tpl = param && param.startsWith("template_") ? botTemplate(param.replace("template_", "")) : botTemplate(param);
    if (tpl) {
      state.templateId = param;
      state.templateOnboardStep = 0;
      state.onboardingStep = 0;
      // The agent already knows the niche — acknowledge + ask the first question.
      const q1 = tpl.onboarding[0];
      return send(
        chatId,
        `${tpl.icon} Deep-link confirmed: **${tpl.title}** profile loaded.\n\n` +
          `I'm your agent, and I already know this world — your tools, your workflow, your corners. Before I start, one quick question to go specific:\n\n` +
          `_${q1}_`,
        HAVE_LICENSE_KYBD
      );
    }
    // Plain /start — no template. Pre-seed the empty slot so /templates can attach later.
    if (!state.templateId) state.onboardingStep = 0;
    return send(chatId, welcomeText(state), WELCOME_KYBD);
  }

  if (command === "/connect") {
    const licenseKey = rest[0];
    if (!licenseKey) {
      state.onboardingStep = 2;
      return send(chatId, "Usage: `/connect <license_key>`\n\nSend your license key now (format `GS-XXXX-XXXX`).", HAVE_LICENSE_KYBD);
    }
    try {
      const license = await getLicense(licenseKey);
      const sites = await findSitesForLicense(licenseKey);
      state.licenseKey = licenseKey;
      state.onboardingStep = 0;
      // GOD-14 §C: a successfully connected license is the user's first real
      // action in the /connect flow — emit the 'activated' stage event to the
      // referral ledger (best-effort, once per license).
      emitActivation(licenseKey, license?.email, state);
      if (!sites.length) {
        return send(chatId, `✅ License connected (${license.plan ?? "plan"}).\n\nNo connected sites yet. Install the plugin so your site registers, then come back to /sites.`, HAVE_LICENSE_KYBD);
      }
      state.siteId = sites[0].id;
      state.conversationId = null; // fresh conversation per setup
      const siteList = sites.map((site) => `• \`${site.id}\` — ${formatSite(site)}`).join("\n");
      return send(
        chatId,
        [
          "✅ Connected.",
          "",
          `Active site: \`${sites[0].id}\` — ${formatSite(sites[0])}`,
          "",
          siteList ? `Other sites:\n${siteList}` : "",
          "",
          "⚡ Run a demo task to see the loop.",
        ].join("\n"),
        CONNECT_SITE_KYBD
      );
    } catch (error) {
      return send(chatId, `Couldn't connect that license: ${error instanceof Error ? error.message : "invalid key"}. Check the key and try again.`);
    }
  }

  if (command === "/sites") {
    if (!state.licenseKey) return send(chatId, "Connect a license first with `/connect <license_key>`.", HAVE_LICENSE_KYBD);
    const sites = await findSitesForLicense(state.licenseKey);
    if (!sites.length) return send(chatId, "No sites found for this license yet. Install the plugin to register your site.", HAVE_LICENSE_KYBD);
    return send(chatId, "Your sites:\n" + sites.map((site) => `• \`${site.id}\` — ${formatSite(site)}`).join("\n"), COMMANDS_KYBD);
  }

  if (command === "/site") {
    const siteId = rest[0];
    if (!siteId) return send(chatId, "Usage: `/site <site_id>`");
    await api(`/api/sites/${siteId}`);
    state.siteId = siteId;
    return send(chatId, `Active site set to \`${siteId}\`.`);
  }

  if (command === "/status") {
    if (!state.siteId) return send(chatId, "No active site. Use `/connect` and `/site` first.", CONNECT_SITE_KYBD);
    const data = await api(`/api/sites/${state.siteId}`);
    const site = data.site;
    const statusMsg = [
      `*${site.name || site.url}*`,
      `Status: ${site.connectionStatus}`,
      `Plugin: ${site.pluginVersion || "unknown"}`,
      `Last bridge check: ${site.lastBridgeCheckAt || "not checked"}`,
    ];
    return send(chatId, statusMsg.join("\n"), COMMANDS_KYBD);
  }

  if (command === "/approve") {
    if (!state.pendingTaskId) return send(chatId, "No pending task to approve.");
    const data = await api(`/api/tasks/${state.pendingTaskId}/approve`, { method: "POST" });
    state.pendingTaskId = null;
    return send(chatId, data.task.result?.message || "Task approved and executed.", COMMANDS_KYBD);
  }

  if (command === "/reject") {
    if (!state.pendingTaskId) return send(chatId, "No pending task to reject.");
    await api(`/api/tasks/${state.pendingTaskId}/reject`, { method: "POST" });
    state.pendingTaskId = null;
    return send(chatId, "Task rejected.", COMMANDS_KYBD);
  }

  return send(chatId, "Unknown command. Send `/start` to get oriented, or use `/help`.", COMMANDS_KYBD);
}

export async function planTelegramMessage({ siteId, conversationId, text }) {
  return api("/api/tasks/plan", {
    method: "POST",
    body: JSON.stringify({ siteId, conversationId, prompt: text }),
  });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || "";
  const state = session(chatId);

  try {
    if (text.startsWith("/")) {
      state.onboardingStep = 0; // explicit command resets any pending wizard input
      return await handleCommand(chatId, text);
    }

    // Inline-keyboard "I'm new" already handled via callbacks; a free-text license key when
    // the wizard is awaiting one is treated as /connect with that key.
    if (state.onboardingStep === 2 && /^GS-[A-Z0-9-]{4,}$/i.test(text.trim())) {
      return await handleCommand(chatId, `/connect ${text.trim()}`);
    }

    if (state.onboardingStep === 10) {
      const answer = text.trim();
      state.onboardingAnswers[state.onboardingQuestion] = answer;
      const questions = [
        "What do you do, or what are you building?",
        "What is taking too much of your time right now?",
        "What is stressing you most in the business?",
        "What would you love to stop doing yourself?",
        "What result would make this feel worthwhile this week?",
      ];
      state.onboardingQuestion += 1;
      if (state.onboardingQuestion < questions.length) {
        return await send(chatId, `Got it.\n\n${questions[state.onboardingQuestion]}`);
      }
      state.previewProfile = state.onboardingAnswers.join(" | ");
      state.onboardingStep = 11;
      return await send(
        chatId,
        [
          "✅ I have your starting picture.",
          "",
          "I can help first with:",
          "• Planning and daily operations",
          "• Customer replies and support",
          "• Content, email, and follow-up",
          "• Sales, leads, and admin",
          "• Website, blog, and landing-page work when you need it",
          "",
          "Next, I’ll ask about your website only if it is relevant. You can continue without one.",
        ].join("\n"),
        inlineKeyboard([
          [{ text: "🌐 Tell me about my website", callback_data: "ob:website_yes" }],
          [{ text: "↩️ Continue without a website", callback_data: "ob:website_no" }],
          [{ text: "👥 Set up my group chat", callback_data: "ob:group_help" }],
          [{ text: "⚡ Show my first action plan", callback_data: "preview:demo" }],
        ])
      );
    }

    if (state.onboardingStep === 11 && state.previewProfile) {
      return await send(chatId, "Choose an option below to continue your preview or connect a paid workspace.", PREVIEW_KYBD);
    }

    // Niche template onboarding: after a template deep-link, a free-text reply
    // answers the current question and advances the in-chat onboarding flow.
    if (typeof state.templateOnboardStep === "number" && state.templateOnboardStep >= 0) {
      const tpl = botTemplate((state.templateId || "").replace("template_", ""));
      const answers = state.templateAnswers ?? (state.templateAnswers = []);
      answers[state.templateOnboardStep] = text.trim() || "";
      const next = state.templateOnboardStep + 1;
      if (tpl && next < tpl.onboarding.length) {
        state.templateOnboardStep = next;
        return await send(chatId, `_${tpl.onboarding[next]}_`);
      }
      // Onboarding complete — agent is primed with behavior + answers.
      state.templateOnboardStep = -1; // exit wizard
      return await send(
        chatId,
        `${tpl?.icon || "👁️"} Got it — your **${tpl?.title || "agent"}** is dialled in.\n\n` +
          `It now knows your niche and how you like to work. Finish the last step: connect your WordPress site so I can start doing real work.`,
        HAVE_LICENSE_KYBD
      );
    }

    if (!state.siteId) {
      // Offer preview demo as path forward
      const demoKb = inlineKeyboard([
        [{ text: "⚡ Try a free demo", callback_data: "ob:preview" }],
        [{ text: "🔑 Connect license", callback_data: "ob:have_license" }],
      ]);
      return await send(chatId, "Connect a site first, OR try a free demo to see how it works. Send `/connect <license_key>` or tap below.", demoKb);
    }

    const planned = await planTelegramMessage({ siteId: state.siteId, conversationId: state.conversationId, text });
    state.conversationId = planned.conversationId;
    state.pendingTaskId = planned.task.id;
    const needsApproval = planned.task.plan.operations.some((operation) => operation.requiresApproval);

    if (!needsApproval) {
      const executed = await api(`/api/tasks/${planned.task.id}/approve`, { method: "POST" });
      state.pendingTaskId = null;
      return await send(chatId, executed.task.result?.message || "Task executed.", COMMANDS_KYBD);
    }

    return await send(chatId, `${planned.task.plan.summary}\nApprove with /approve or reject with /reject.`, COMMANDS_KYBD);
  } catch (error) {
    return await send(chatId, `Godseye error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function runPolling() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("Set TELEGRAM_BOT_TOKEN to start the Telegram bot.");
    return;
  }

  let offset = 0;
  console.log("Godseye Telegram bot polling started.");
  while (true) {
    try {
      const updates = await telegram("getUpdates", { offset, timeout: 30 });
      if (!updates) continue; // timeout, retry
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.callback_query) {
          const chatId = update.callback_query.message.chat.id;
          const queryId = update.callback_query.id;
          const data = update.callback_query.data ?? "";
          await handleCallback(chatId, queryId, data);
        } else if (update.message?.text) {
          await handleMessage(update.message);
        }
      }
    } catch (err) {
      console.error(`[telegram] Polling error: ${err.message}`);
      await new Promise((r) => setTimeout(r, 5000)); // wait before retry
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPolling().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
