# Godseye Onboarding Flow Spec — DRAFT for approval (2026-08-17)

Source: user's staged-flow direction + godseye-bot-architecture skill. Draft-first;
nothing here is deployed. Approve in chat before implementation starts.

## 1. Two-stage model

- **Stage 1 (free, everyone):** user chats with @GodseyeXbot. Profile builds in the
  background from natural conversation. No BotFather, no tokens.
- **Stage 2 (ownership, paid/upgrade):** user creates their own bot, pastes its token,
  profile + session travel over. That bot = their business's private agent space.
  Token = tenant boundary (Pandora-box story; brother gets his own).

## 2. Persona lanes (default base first)

Presented as buttons AFTER engagement, never on /start. Multiple selectable, switchable later:

1. Developer / WordPress agent
2. Customer service
3. Management / operations
4. Online presence (site + social)
5. Social media strategist
6. General assistant (default base)

Selection configures the agent system prompt + tool set. Guardrail: user can change
lanes anytime ("switch me to customer-service mode") — no hard lock-in.

## 3. Button tree (inline keyboards)

```
/start → warm open (no setup buttons)
  └─ "👋 Tell me how it's going" / "💬 What can Godseye help with?" / "🔑 I'm already a customer"
       └─ user says need → "Which lane should I operate in?" [lanes above]
            └─ lane chosen → "I'm set up as <lane>. What's on your plate today?"
                 └─ after value shown → "💳 See plans" / "⚡ Example action plan" / "🤖 Make me my own bot" (Stage 2)
```

## 4. Profile extraction (background listener)

- `handleMessage` parses each exchange: name, business, goal, volunteered details.
- Upsert into `telegram_profiles` (already exists: telegram_id, state_json, updated_at) —
  keyed by telegram_id.
- Cron = profile-completion watcher: fills gaps, nudges, flags when session is ready.
- Credentials: encrypted vault scoped to session, never in plaintext transcripts,
  always revocable ("revoke access" button). /start copy answers this proactively.

## 5. Hard requirement

Persist sessions/workspaces to SQLite (`telegram_profiles` / `telegram_workspaces`),
NOT the in-memory Map — in-memory state vanishes on bot restart (known latent bug).

## 6. Proposed implementation order (on approval)

1. Profile-extraction pass on `handleMessage` (SQLite upsert) — 2-3h
2. Persona lane buttons + prompt/tool config per lane — 3-4h
3. Stage-2 /start copy answering the credentials trust question — 1h
4. Persona-switch guardrail — 1h
