# Godseye — "Continue without a website" → Free LLM Chat Mode
## Implementation Plan (DRAFT for review — nothing deployed)

Status: DISCOVERY DONE · CODE SKETCH READY · AWAITING APPROVAL
Date: 2026-08-11
Source of truth: /root/godseye-repo (edit ONLY here)

---

## 1. What exists today (verified in code)

- Button `↩️ Continue without a website` = callback `ob:website_no` in
  `telegram-bot/src/index.js:320`, handled at `index.js:466`.
- Today it sets `hasWebsite=false`, `onboardingStep=10`, then runs a HARDCODED
  5-question wizard (index.js:839-871) and prints a CUSTOM text reply
  ("You are onboarded..."). NO LLM. NO streaming. NO real reply.
- The Telegram bot (`index.js`, 961 lines) has ZERO AI calls. All replies canned.
- The ONLY LLM in the whole stack = `/api/playground/generate` in `server.ts:586`
  → Google Gemini `gemini-3.5-flash` (client `ai = new GoogleGenAI({apiKey: GEMINI_API_KEY})`
  at server.ts:18-20, key already in landing-api env). Used only by the marketing
  SPA's static "Live Playground" demo. The bot does NOT call it today.
- Streaming: `@google/genai@^2.4.0` (package.json:16) exposes `generateContentStream`;
  the bot's `send()` (index.js:190) is whole-message only — no typing action,
  no edit-message streaming loop.

## 2. What the user wants

"When a user clicks 'Continue without a website', that should be where onboarding
ends, and they can start. LLM response, streaming back-and-forth, free conversation."

## 3. Proposed flow (before → after)

BEFORE  (click button):
  ob:website_no → 5 canned questions → canned "You are onboarded" → dead end (typed
  messages with no site get a canned repeat at index.js:906).

AFTER  (click button):
  ob:website_no → "✅ You're set up. Tell me what you're working on — or just chat.
  I'll respond live." + lightweight keyboard [💬 Chat · 💳 Plans]
  → set state.onboardingStep = 99 (CHAT MODE)
  → any subsequent typed message hits the LLM:
     sendChatAction("typing")
     POST /api/chat (SSE stream)  →  bot edits the message in place as chunks arrive
  → onboarding is DONE; user is in free conversation until they hit the free cap.

## 4. Backend change — server.ts (add one endpoint, reuse existing AI client)

POST /api/chat
  body: { messages: [{role:"user"|"assistant", content}...], profile: string|null }
  1. cap history to last ~16 messages (cost control)
  2. build system prompt from profile + brand voice (Godseye, plain/normie copy)
  3. res.setHeader for text/event-stream + no-buffer
  4. ai.models.generateContentStream({ model:"gemini-3.5-flash", ... , stream:true })
  5. pipe content deltas as SSE `data: {delta}` chunks
  6. end with `data: [DONE]`

Guards:
  - bound free usage per telegramId (store in data/godseye.db chat_usage table:
    daily+total msg count, cap e.g. 25/day / 100 total free) → 429 with upgrade nudge.
  - auth via GODSEYE_BOT_INTERNAL_KEY header (same as /api/telegram/workspaces/bind,
    server.ts:564) so only the bot can hit it.
  - error → SSE `data: {error}` then close.

## 5. Bot change — telegram-bot/src/index.js

Add streaming helpers:
  sendTyping(chatId)            → telegram("sendChatAction", {chat_id, action:"typing"})
  streamReply(chatId, initial)  → sendMessage, then loop editMessageText appending chunks,
                                 ~every 1-2 chunks, cap edits ~30, finalize.

ob:website_no (line 466) →
  skip wizard; set state.chatModeEnrolled=true, onboardingStep=99, continue without
  asking the 5 questions (drop straight to active conversation).

handleMessage — insert a CHAT MODE branch BEFORE the site/no-site branching:
  if (state.onboardingStep === 99):
    sendTyping
    if profile missing → one quick "what do you do?" FIRST, save, then chat.
    else → streamReply(ChatRequest(messages = last 16 turns))
    guard: if over free cap → canned upgrade message + PREVIEW_KYBD.
  Remove the canned "You are onboarded..." wall at index.js:906 for chat-mode users.

Keep all existing paths (with-site task loop) untouched — chat mode is an additive
branch; site-connected users keep /tasks plan/execute.

## 6. Known caveats / honest limits

- Model is Gemini `gemini-3.5-flash` (already wired). Real free chat costs tokens —
  the cap in §4 is REQUIRED by your "bounded free experience" preference, not optional.
- Telegram "streaming" = in-place editMessageText chunk updates (paced). Looks like
  streaming to the user; not token-by-token like a web SSE client.
- The bot's API_BASE_URL (:3000 landing-api) currently LACKS /api/tasks/plan &
  /api/tasks/:id/approve (those live on legacy :8787 godseye-backend). That breaks
  the with-site task promise the bot references. I recommend fixing the bot's
  /api/tasks target in a FOLLOW-UP (separate change) — do not conflate with this.
- Free chat + WordPress action are two different products on the same bot. This change
  delivers the free chat half; the site-action half needs the endpoint fix.

## 7. Files touched (draft — not yet modified)

  /root/godseye-repo/server.ts            → + POST /api/chat (SSE) + chat_usage guard
  /root/godseye-repo/telegram-bot/src/index.js → ob:website_no shortcut + chat-mode
                                               branch + streaming helpers
  /root/godseye-repo/data/godseye.db      → + chat_usage table (runtime migration)

Deploy after approval:
  server.ts → esbuild → systemctl restart godseye-landing-api
  bot       → systemctl restart godseye-telegram-bot
  (nginx nil — bot uses api.godseyes.digitalhustlerx.com already)

## 8. Decision needed before I build

  A. Free cap: 25 msgs/day + 100 total ? (my default) — or a different number, or
     unlimited for now.
  B. Should "Continue without a website" keep asking the 5 business questions first,
     or drop STRAIGHT to open chat? (You said the button should END onboarding →
     I plan drop-straight-to-chat, priming the LLM with one casual opener.)
  C. Approve the with-site /api/tasks endpoint retarget as a separate follow-up?
