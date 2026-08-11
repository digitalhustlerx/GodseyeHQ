# Godseye — Dashboard Integration & Feature Plan (from GodseyeHQ-by-gemini + DV directives)
> Aug 11 2026. Reference repo: `digitalhustlerx/GodseyeHQ-by-gemini-` (built in Google AI Studio, Jul 30 2026).
> This becomes the REAL user dashboard. Agent.md in that repo is the component map.

## 1. What the gemini dashboard gives us (CLONE these boutique features)
- **UserDashboard.tsx** (1298 lines) — clean, color-free, OpenCode-style. Tabs:
  - **Usage & Tokens**: ROLLING token gauge + DAILY token bar (used/limit, fills/empties) + WEEKLY/MONTHLY quotas + auto-refill toggle + token-history table. ← the exact "token-allocation bar filling up and emptying" DV wants (like OpenCodeGo subscription).
  - **Models & Routing**: switch default model, max output tokens, temperature, web grounding.
  - **Virtual Vault**: media/backups/.md briefings/.zip storage.
  - **API Keys & MCP**: BYOK LLM keys, WordPress app passwords, copy `mcpServers` JSON for Claude/Cursor.
  - **Sites & REST API**: connected site, status, webhooks.
  - **Billing & Wallet**: credit balance, top-up, subscription.
  - **Profile & Telegram**: link Telegram ID/handle.
- **OnboardingModal.tsx**: 4-step wizard (Telegram sync → site → model → workspace).
- **Backend**: `/api/user/profile/:telegramId`, `/api/user/onboard` (allocates 50 credits + 100,000 tokens on signup), `/api/balance/:telegramId`, `/api/playground/generate`. **Tokens allocated on signup = the allocation model.**
- Design tokens match Godseye (#0A0A0A/#C4A484).

## 2. Referral bonus on signup (NEW — DV directive)
- On the **account-creation page**, after the form, a **referral-code field/button** ("enter a referral bonus").
- Using a referrer's code grants the new user a **choice of bonus: extra memory OR extra free context/tokens** (additional runtime OR the extra context).
- **First quantify the actual context/token allocation** before building (base = the signup allocation: 50 credits + 100,000 tokens per the gemini server; must define the "extra free context" figure).

## 3. Burst Plan (NEW — DV's "head-turner" perk)
- People **without a subscription** can access their resources for **certain hours with limitations**.
- Name: **"Burst Plan"** (or similar). Extra perk to make the platform unique.
- Selling point: paid users get guaranteed always-on; free/no-sub users can "burst" access resources in limited windows.

## 4. Payments = FLUTTERWAVE (DV directed)
- Use **Flutterwave** gateways. DV said "go use Flutterwave" (overriding Paystack/Polar for this).
- NOTE: Flutterwave is NOT currently connected on Composio or OpenConnector. The Godseye-repo already has a Flutterwave payment path (memory: Flutterwave (Composio) preferred). **Needs DV to wire the Flutterwave API keys** OR confirm the existing keys in /root/godseye-repo/.env are live.

## 5. Agency / Company AI training (under Digital HustlerX/Bio)
- Offer **AI training for companies and organisations** under `digitalhustlerx.com/bio`.
- Add a dedicated plan/card on the bio mentorship page: company/agency AI training + AI integration service.

## 6. Don't push WordPress
- Domain is NOT WordPress-first. Users can connect a site if they choose; do NOT write blog content about connecting WordPress to Godseye. **MCPs handle site connections on the user's account** — no need for the old plugin narrative.

## 7. Model economics
- Base model = DeepSeeK (DV: "no one better than that"). Later run open-source models (the only way forward).
- Pricing: re-evaluate once the token-allocation context is quantified (memory add-on + burst + domain add-on locked to middle plan).

## IMMEDIATE ACTIONS (safe, no keys needed)
1. Port the gemini `UserDashboard.tsx` + `OnboardingModal.tsx` + `server.ts` account/onboard/balance APIs into the Godseye-repo as the live dashboard (replacing the thin AccountPage).
2. Add the referral-code field + bonus choice (extra memory OR extra context) to the account-creation form.
3. Build the **Burst Plan** concept into pricing (access in limited windows).
4. Add **Agency/Company AI training** card to the bio mentorship page.
5. Wire Flutterwave checkout (once keys confirmed).
