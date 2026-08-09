# Godseye Onboarding Blueprint

## Core promise
Godseye is the user's business operator in Telegram. Business discovery comes before payment, licensing, websites, or integrations.

## Flow

```text
/start
  -> business discovery questions
  -> tailored help map
  -> first action plan / safe preview
  -> invite user to create a private business group
  -> user enables Topics and adds Godseye as admin
  -> /setup installs standard forum topics
  -> ask about website only when relevant
  -> WordPress path: paid plan -> issued license -> plugin connection
  -> secure Connections links for external tools
```

## Private chat vs business room

- Private chat: onboarding, billing, account recovery, sensitive setup guidance.
- Business room: daily operations and team-visible work.
- One business workspace maps to one private Telegram group.
- Agencies use separate workspaces/groups per client; never mix client context.

## Standard topics

- Tasks — requests, plans, approvals
- Notifications — website/customer/system alerts
- Websites — sites, blogs, landing pages, health
- Customers — customer work and follow-up
- Content — posts, email, campaigns, drafts
- Reports — summaries and metrics
- Connections — integrations and connection status
- Settings — workspace preferences and operating rules

## Safety rules

- Never request WordPress credentials in Telegram.
- Live external mutations require paid entitlement and approval where appropriate.
- Close completed topics; do not delete them automatically.
- Route alerts to Notifications instead of flooding general chat.
- Use secure, one-time web links for OAuth and external connections.
- Keep workspace, group, site, and client data tenant-scoped.

## Bot behavior

The user creates the group. Godseye does not create or invite users into groups without explicit Telegram action. The bot must be an administrator with topic-management permission before `/setup` can create the template.

## Activation milestone

The group is offered after the user has answered the discovery questions and seen the first useful action plan. It is encouraged, not mandatory at `/start`.

## Implementation status

- Business-first discovery: live.
- Website/platform qualification: live.
- License deferred until paid WordPress activation: live.
- Group setup prompt and `/setup`: live.
- Persistent room-to-workspace ownership: next hardening step.
- Secure Connections/OAuth links: next integration step.
- Topic-aware routing and notification delivery: next integration step.
- Session/service watcher coverage: active; verify after each deployment.

Last updated: 2026-08-10
