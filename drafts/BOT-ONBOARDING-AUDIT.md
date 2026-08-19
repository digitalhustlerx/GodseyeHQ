# GodsEye Bot — End-to-End Onboarding Audit

**Date:** August 19, 2026
**Scope:** Full bot flow, every handler, every state transition, every dead end
**Perspective:** Marketing · Onboarding UX · Retention · Post-purchase

---

## 1. CURRENT FLOW MAP

### Entry Points

| Entry | What happens |
|---|---|
| `/start` (plain) | Welcome text + 4 buttons |
| `/start ref_CODE` | Referral welcome → "Set up my business space" |
| `/start template_xxx` | Niche template loaded → first template question |
| `/start connect` | Post-checkout deep link → license key entry |
| `/help` | Same as `/start` |

### Onboarding Steps (state machine)

| Step | Meaning | What it leads to |
|---|---|---|
| `0` | Not onboarded | Shows WELCOME_KYBD |
| `1` | "New or have license" (UNUSED) | Dead — never reached from current buttons |
| `2` | Awaiting license key | Waits for `GS-XXXX-XXXX` text |
| `10` | Collecting answers | 5-question wizard OR single "convo warm" answer |
| `11` | Onboarded, showing action plan | ACTION_PLAN_KYBD |
| `12` | "You are onboarded" wall | ACTION_PLAN_KYBD again |
| `99` | Free chat mode | LLM streaming via `/api/chat` SSE |
| Template `0..N` | Niche onboarding | Template-specific questions → HAVE_LICENSE_KYBD |

### Current `/start` Buttons (WELCOME_KYBD)

```
💬 Get to talking        → step 99 (chat mode)
👋 Tell me how it's going → step 10 (convo warm, 1 answer → action plan)
💬 What can Godseye help with? → ACTION_PLAN_KYBD (no state change)
🔑 I'm already a customer → step 2 (license key entry)
```

### Free Chat Limits

- **25 messages/day** (resets at midnight UTC)
- **100 messages total** (lifetime per Telegram ID)
- User is NOT told these limits until they hit them
- When limit hit: "You've hit today's free limit" / "You've used your free allowance" → PREVIEW_KYBD

### Post-Purchase Deep Link

- Checkout redirects to `/start connect`
- Shows: "Welcome back. Send your license key in the format GS-XXXX-XXXX"
- No email collected, no order context, no "here's what you bought" summary

---

## 2. PROBLEMS FOUND

### P1 — No Email Collection (Critical Gap)

**The bot never asks for or stores an email.** This means:
- Can't send login details after setup
- Can't send onboarding confirmation or receipts
- Can't do re-engagement email campaigns
- Can't recover abandoned onboarding
- Can't link Telegram identity to web account
- The `emitActivation` function REQUIRES an email from the license — if the license has no email, activation is silently skipped

**Where email IS referenced:**
- `emitActivation()` pulls `license.email` from the `/api/licenses/:key` response
- That email comes from the Polar checkout (the buyer's email at payment time)
- But there's no way for a FREE user to give an email — so free → paid conversion has no email bridge

**Impact:** You're collecting zero leads from the free funnel. Every free user is an anonymous Telegram ID that can't be contacted outside the bot.

### P2 — "Get to talking" vs "Get started" (Naming)

The button was just added. From a conversion standpoint:

| Option | Verdict |
|---|---|
| "Get to talking" | Vague. What am I talking to? Sounds like a social feature, not a business tool. |
| "Get started" | Universal. Clear. The user knows this means "begin the experience." |
| "Start free" | Best — implies value, implies free, implies immediate. |
| "Try Godseye now" | Action-oriented, but longer. |

**Recommendation:** Rename to **"🚀 Start free"** — it's the strongest conversion button. It implies immediate value, zero commitment, and the user knows what happens: they start.

### P3 — 4 Buttons at `/start` = Choice Paralysis

A new user sees 4 buttons and has to decide which one matches their situation:
- "Get to talking" — what does this do?
- "Tell me how it's going" — sounds nice but what's the outcome?
- "What can Godseye help with?" — how is this different from "Get to talking"?
- "I'm already a customer" — only relevant to paying users

**The problem:** Buttons 1 and 2 both lead to conversation but through different paths. Button 3 is an action plan (also conversation). A user has to guess which path is right for them.

**Recommendation:** Reduce to **3 buttons** max. The primary CTA should be the one you want most users to take.

### P4 — No Free Tier Visibility

The welcome text says "free starter allowance" and "Founder Pass" but never tells the user:
- You get 25 messages/day
- You get 100 messages total
- After that, you need a plan

The user only discovers the limit when they hit it — which feels like a trap, not a fair exchange.

**Impact:** Trust erosion. User feels misled when they suddenly can't chat after investing time.

### P5 — "You are onboarded" Is a Dead End

After the 5-question wizard (step 10→11), the bot says:
> "You are onboarded. You can now talk to me normally. I'll make suggestions as we work."

Then shows ACTION_PLAN_KYBD which has 4 options (website, continue without, group, pricing). But:
- The user's answers are stored in `previewProfile` as a pipe-delimited string
- They're NOT used to personalize the next message
- The user has to make ANOTHER choice (buttons) instead of just being able to type
- The "I'll make suggestions as we work" promise is never fulfilled — there are no proactive suggestions

### P6 — "Continue without a website" = "Get to talking" = "Chat with me"

Three different buttons lead to the exact same chat mode (step 99). This is confusing:
1. `ob:get_to_talking` → step 99
2. `ob:website_no` → step 99
3. `ob:chat_prompt` → step 99

A user who clicks different buttons at different times gets the same result but has no idea they're in the same place.

### P7 — No Post-Purchase Onboarding

When someone buys and clicks `/start connect`:
1. They see "Welcome back. Send your license key"
2. They paste the key
3. Bot says "License connected. No connected sites yet. Install the plugin."
4. Done.

**Missing:**
- No "Here's what you bought" summary
- No email confirmation
- No "Here are your credits/tokens" explanation
- No guided walkthrough of what to do first
- No "Your login for the web dashboard is..." (email + password setup)

### P8 — Session State Is Ephemeral

All session state lives in a JS `Map` — lost on bot restart. The `persistSession` function saves to the landing API, but:
- It's best-effort (silently fails)
- The `hydrateSession` only runs once per session (the `_hydrated` flag)
- If the bot restarts, users lose their onboarding position mid-flow

### P9 — Template Deep-Link Has No `/start` Button Return

After template questions are answered, the bot shows `HAVE_LICENSE_KYBD` (install plugin / command list). There's no "Go back to start" or "Chat with me" button. The user is funneled toward license/plugin only.

### P10 — The 5-Question Wizard Is Too Long

The `business_setup` / `preview` flow asks 5 sequential questions:
1. What do you do?
2. What takes too much time?
3. What stresses you most?
4. What would you stop doing yourself?
5. What result would matter this week?

For a Telegram bot, 5 sequential messages with no skip option is a lot. Most users will drop off after question 2-3. The "convo warm" path (1 question) converts better.

---

## 3. RECOMMENDED NEW FLOW

### The Principle

> **Bot = front door, not waiting room.** Every screen should either collect something useful (email, business context) or move the user closer to experiencing value. No buttons that lead nowhere. No forms that don't save.

### Proposed `/start` Screen

```
👁️ Hey — Godseye here.

I'm your AI business operator. I handle planning, operations,
content, customer replies, and website work — right from Telegram.

You get 25 free messages to try me out. No card, no commitment.

What would you like to do?
```

**3 buttons (not 4):**

| Button | Action | Why |
|---|---|---|
| 🚀 **Start free** | → Collect email → Step 99 chat | Primary CTA. Gets them chatting fastest. |
| 💼 **Set up my business** | → 3-question wizard (not 5) | For users who want structure first. |
| 🔑 **I'm a customer** | → License key entry | Only for paying users. |

**Removed:** "Tell me how it's going" (redundant with Start free + wizard).

### Step 1: Email Collection (New — Before Chat)

After clicking "Start free" or "Set up my business," the bot asks:

```
Quick one — what's your email?

I'll use it to save your progress and send you your
login details if you upgrade later. No spam, ever.

Just type it below 👇
```

**Why email first:**
- You capture the lead BEFORE they start chatting
- You can send abandoned-onboarding emails
- You can send upgrade prompts
- You can link Telegram identity to web account
- It's a micro-commitment (they've invested something = more likely to continue)

**Email validation:** Simple regex check. If invalid, ask again. If valid, store in `state.email` and persist.

**What happens with the email:**
1. Stored in `state.email` (persisted to landing API)
2. Saved to `users` table (linked to `telegram_id`)
3. Used for `emitActivation` (no more silent skip)
4. Available for future email campaigns

### Step 2: After Email → Immediate Chat

```
✅ You're in. You have 25 free messages today.

Go ahead — what's on your mind? I'm here to help with
your business.
```

**CHAT_MODE_KYBD with 3 buttons:**
- 💬 Chat with me (same as typing anything)
- 💳 See plans
- 🌐 Connect my website

### Step 3: Free Tier Limits — Show Them Upfront

When the user first enters chat mode, show the limits ONCE:
```
📊 Free tier: 25 messages/day · 100 messages total
After that, pick a plan to keep going.
```

When they hit the daily limit:
```
⏰ You've used your 25 free messages for today.
Come back tomorrow, or pick a plan for unlimited access.

[💳 See plans] [💬 Continue tomorrow]
```

When they hit the total limit:
```
🎉 You've used your 100 free messages — you clearly find
this useful! Time to go pro.

Your options:
[💳 Choose a plan] [🔑 I already have a license]
```

### Step 4: "Set up my business" Flow (Shortened)

**3 questions, not 5.** The first question does the heavy lifting; the other two refine:

```
Q1: What do you do, or what are you building?
    → (answer stored as previewProfile)

Q2: What's the #1 thing eating your time right now?
    → (stored in onboardingAnswers[1])

Q3: What would you love to stop doing yourself?
    → (stored in onboardingAnswers[2])
```

After Q3:
```
✅ Got it. Here's what I can help with right now:

• Planning and daily ops
• Customer replies and support
• Content, email, and follow-up
• Website and landing page work

[💬 Start chatting] [🌐 Connect my website] [💳 See plans]
```

**No "You are onboarded" wall.** The user is immediately able to type or click.

### Step 5: Post-Purchase Re-Onboarding

When `/start connect` is triggered (from checkout):

```
🎉 Welcome back! Your plan is active.

Here's what you've got:
• Plan: [plan name]
• Credits: [token allocation]
• License: GS-XXXX-XXXX (saved)

Next steps:
1. Install the plugin on your WordPress site
2. Connect it here with /connect
3. Start giving me tasks

[🔗 Install plugin] [💬 Ask me anything] [📋 See commands]
```

### Step 6: Web Login Details

After email is collected and user upgrades:
- Bot sends: "Your web dashboard login: [email]. Check your email for the password setup link."
- This bridges Telegram → web seamlessly

---

## 4. BUTTON RENAMING

### Current vs Recommended

| Current | Recommended | Reason |
|---|---|---|
| "Get to talking" | **"🚀 Start free"** | Clearer, implies immediate value |
| "Tell me how it's going" | **REMOVED** | Redundant — "Start free" covers this |
| "What can Godseye help with?" | **💼 Set up my business** | More specific, implies structure |
| "I'm already a customer" | **🔑 I'm a customer** | Shorter, same meaning |
| "Chat with me" (in chat mode) | **REMOVED** | User is already chatting — button is pointless |
| "See paid plans" | **💳 See plans** | Shorter |

### Final WELCOME_KYBD

```javascript
const WELCOME_KYBD = inlineKeyboard([
  [{ text: "🚀 Start free", callback_data: "ob:start_free" }],
  [{ text: "💼 Set up my business", callback_data: "ob:business_setup" }],
  [{ text: "🔑 I'm a customer", callback_data: "ob:have_license" }],
]);
```

### Final CHAT_MODE_KYBD

```javascript
const CHAT_MODE_KYBD = inlineKeyboard([
  [{ text: "💳 See plans", callback_data: "preview:pricing" }],
  [{ text: "🌐 Connect my website", callback_data: "ob:website_yes" }],
]);
```

(Remove "Chat with me" — they're already chatting.)

---

## 5. NEW SESSION STATE FIELDS

Add to `session()`:

```javascript
{
  // ... existing fields ...
  email: null,              // collected during onboarding
  emailCollected: false,    // flag to avoid re-asking
  freeTierShown: false,     // flag to show limits once
  freeTierMessagingSent: 0, // track which limit message was sent
}
```

Add to `persistableState()`:
```javascript
// Already serializes all fields — just ensure email is included
```

---

## 6. EMAIL COLLECTION HANDLER

```javascript
// After "Start free" or "Set up my business" button click:
if (data === "ob:start_free") {
  state.onboardingStep = 5; // NEW: email collection step
  state.onboardingIntent = "start_free";
  return send(chatId, [
    "Quick one — what's your email?",
    "",
    "I'll save your progress and send login details if you upgrade. No spam, ever.",
    "",
    "Just type it below 👇",
  ].join("\n"));
}

// In handleMessage, before chat mode:
if (state.onboardingStep === 5) {
  const email = text.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return send(chatId, "That doesn't look like an email. Try again? (e.g. you@company.com)");
  }
  state.email = email;
  state.emailCollected = true;
  state.onboardingStep = 99;
  state.onboardingChatHistory = [];
  
  // Persist email to users table
  // (API call to save email + telegram_id binding)
  
  return send(chatId, [
    "✅ You're in. You have 25 free messages today.",
    "",
    "Go ahead — what's on your mind? I'm here to help with your business.",
  ].join("\n"), CHAT_MODE_KYBD);
}
```

---

## 7. FREE TIER MESSAGING

### First Chat Message (after email collected)

```
📊 Free tier: 25 messages/day · 100 total
Go ahead — what's on your mind?
```

### Daily Limit Hit

```
⏰ You've used your 25 free messages for today.
Come back tomorrow, or pick a plan for unlimited.

[💳 See plans]
```

### Total Limit Hit

```
🎉 You've used your 100 free messages — you clearly
find this useful! Time to go pro.

[💳 Choose a plan] [🔑 I have a license]
```

### In Chat Mode — Occasional Nudge (every 10 messages)

```
💡 You've used X/25 messages today and Y/100 total.
[💳 See plans to go unlimited]
```

---

## 8. IMPLEMENTATION PRIORITY

| Priority | Change | Effort | Impact |
|---|---|---|---|
| **P0** | Rename "Get to talking" → "Start free" | 5 min | Higher conversion |
| **P0** | Add email collection step (step 5) | 30 min | Lead capture, re-engagement |
| **P0** | Show free tier limits upfront | 15 min | Trust, transparency |
| **P1** | Reduce 5-question wizard to 3 | 15 min | Lower drop-off |
| **P1** | Remove "Chat with me" from CHAT_MODE_KYBD | 2 min | Less confusion |
| **P1** | Improve limit-hit messages with CTA | 10 min | Conversion at limit |
| **P2** | Post-purchase re-onboarding flow | 20 min | Better activation |
| **P2** | Add `email` to session state + persist | 10 min | Foundation for email campaigns |
| **P3** | Occasional upgrade nudge in chat | 15 min | Soft monetization |

---

## 9. WHAT THE USER ASKED — DIRECT ANSWERS

**"Should there be forms or a way of collecting details?"**
Yes — but NOT a form. One question at a time. Email first (1 message), then business context (optional, 1-3 questions). The email is the critical piece because it bridges Telegram → web, enables re-engagement, and is required for the activation tracking that already exists.

**"Having that email makes it so we can mail them their login details."**
Exactly. The flow should be: collect email → store with telegram_id → when they upgrade, bot says "Check your email for login setup." The email is the bridge.

**"Is the whole onboarding process okay?"**
No. It's too many buttons, too many paths, no email capture, no free-tier transparency, and no post-purchase flow. The core product (chat mode) is good — the wrapper needs work.

**"Should it be 'Get to talking' or 'Get started'?"**
Neither. **"Start free"** is the strongest. It's 2 words, implies immediate value, implies no commitment, and is the most common CTA pattern that converts.

**"I want to use this as the first entrance."**
The bot IS the entrance — but the onboarding treats it like a middle step. The bot should be the front door AND the living room. Collect email, show value, set expectations, then let them loose.

**"Not meant to be a bot forever."**
Correct — the bot is the entry point, but the product eventually moves to web/app. Email collection is how you bridge that gap. Without it, Telegram users stay Telegram-only and can't become web/app users.

---

*Prepared by Hermes Agent · August 19, 2026*
