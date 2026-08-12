# GodsEye / DigitalHustlerX Cron Job Archive

> Snapshot of all cron jobs as of 2026-08-12, captured before consolidation to
> the 6-job set. Use this for future insight, synthesis, or re-enabling a
> specific automation. Each entry records the job id, purpose, schedule,
> delivery target, skills/toolsets, and consolidation fate.

Legend for `fate`:
- `CONSOLIDATED` = absorbed into one of the new 6 jobs
- `PAUSED` = kept disabled after consolidation
- `KEEP` = carried forward into the new set
- `REPLACED_BY` = superseded by a specific new job

---

## New consolidated set (6 jobs)

1. **Godseye Site Guard** — every 10m, script. Canonical root / OpenSaaS / bot / nginx health. Silent when healthy.
2. **Godseye Daily Briefing** — 07:00 daily. Site health, new leads, onboarding drop-offs, one tight report.
3. **Lead Radar** — 09:00 + 15:00. All lead-scouting batched to a Godseye topic.
4. **Inbound Watch** — every 60m. Telegram DMs/messages needing attention. Silent unless something real.
5. **Oversight Check-in** — every 6h. Calm project status, no directives.
6. **Completion Synthesizer** — every 30m. Finds pending/incomplete tasks, verifies live state, synthesizes ONE actionable list. Does NOT auto-edit code.

---

## Archived jobs (alphabetical by name)

### active-session-watcher
- **id:** 96edfd855620
- **fate:** CONSOLIDATED → Oversight Check-in
- **schedule:** every 45m
- **deliver:** origin
- **purpose:** Verify that work in recent Hermes sessions is advancing; alert on stalls.
- **toolsets:** session_search, terminal, file

### burst-focus-director
- **id:** a750d351b4f5
- **fate:** PAUSED
- **schedule:** every 30m
- **deliver:** origin
- **purpose:** Proactive driving co-agent for focused deep-work churn. High-noise, removed.
- **toolsets:** session_search, terminal, web, delegation, file

### competitor-benchmark
- **id:** f95b4616cae1
- **fate:** CONSOLIDATED → Lead Radar
- **schedule:** 0 9 */3 * *
- **deliver:** telegram:-1004295708174:68
- **purpose:** Analyze what's working in Godseye content/competitors.
- **skills:** autonomous-business-agents

### dhx-launch-coordinator-nudge
- **id:** f42cac59c86f
- **fate:** PAUSED
- **schedule:** */15 * * * *
- **deliver:** telegram:-1004295708174:67
- **purpose:** Launch-coordinator nudge to Ops topic. Stale (Aug 1 context), paused.

### godseye-group-completion-agent
- **id:** b6b6f4062d63
- **fate:** CONSOLIDATED → Completion Synthesizer
- **schedule:** */15 * * * *
- **deliver:** telegram:-1004442742830
- **purpose:** Post completion updates to the #godseye Telegram group.
- **skills:** i-have-adhd, godseye-brand-kit

### godseye-group-idle-nudge
- **id:** 3c914632e441
- **fate:** PAUSED
- **schedule:** */15 * * * *
- **deliver:** telegram:-1004442742830
- **purpose:** Group launch-nudge. Paused, group-noise source.

### godseye-idea-harvester
- **id:** 490036024f0a
- **fate:** CONSOLIDATED → Godseye Daily Briefing
- **schedule:** 0 7 * * *
- **deliver:** telegram:-1004295708174:62
- **purpose:** Scrape last 7 days of sessions for goldmine ideas.
- **skills:** i-have-adhd, session-learner

### godseye-lead-synthesizer
- **id:** 87e67877fa36
- **fate:** CONSOLIDATED → Godseye Daily Briefing / Lead Radar
- **schedule:** 0 */6 * * *
- **deliver:** telegram:-1004450820767:3438
- **purpose:** Synthesize leads from scouts into pitches.
- **skills:** marketing:prospecting

### godseye-opensaas-watcher
- **id:** 8c74266da150
- **fate:** CONSOLIDATED → Godseye Site Guard
- **schedule:** every 5m
- **deliver:** origin
- **purpose:** OpenSaaS build watchdog, silent when healthy.
- **script:** godseye-watcher.sh (no_agent)

### godseye-pain-scout
- **id:** 88382b794e74
- **fate:** CONSOLIDATED → Lead Radar
- **schedule:** 0 15 * * *
- **deliver:** telegram:-1004450820767:3438
- **purpose:** Find Godseye complaint/pain points. Skips Twitter.
- **skills:** money-scanner-fallback, research-alternatives

### godseye-proactive-followup
- **id:** 1b267368fd1e
- **fate:** CONSOLIDATED → Inbound Watch / Completion Synthesizer
- **schedule:** */15 * * * *
- **deliver:** origin
- **purpose:** Proactive follow-up nudges for Godseye. High-noise, in-thread.
- **skills:** i-have-adhd, hermes-cron-models

### godseye-reddit-scout
- **id:** a01acb2bde6b
- **fate:** CONSOLIDATED → Lead Radar
- **schedule:** 0 9 * * *
- **deliver:** telegram:-1004450820767:3438
- **purpose:** Reddit lead scout for Godseye.
- **skills:** money-scanner-fallback, research-alternatives

### godseye-social-scout
- **id:** 7a001c1afd7d
- **fate:** CONSOLIDATED → Lead Radar
- **schedule:** 0 12 * * *
- **deliver:** telegram:-1004450820767:3438
- **purpose:** Social lead scout (skips X/Twitter).
- **skills:** money-scanner-fallback, research-alternatives

### Godseye aggressive completion loop
- **id:** 042613eaf12e
- **fate:** CONSOLIDATED → Completion Synthesizer
- **schedule:** every 5m
- **deliver:** origin
- **purpose:** Aggressive commit+push completion loop. Was the main regression risk; replaced with non-edit synthesizer.
- **skills:** i-have-adhd, telegram-bot-onboarding-ux, hermes-cron-models

### Godseye Bot Onboarding Watchdog
- **id:** 3484f8f06a0e
- **fate:** CONSOLIDATED → Godseye Daily Briefing
- **schedule:** every 360m
- **deliver:** origin
- **purpose:** Scan godseye.db for bot onboarding drop-offs.
- **toolsets:** web, terminal, file

### Godseye canonical site health checker
- **id:** 1742cc1d02fc
- **fate:** CONSOLIDATED → Godseye Site Guard
- **schedule:** every 10m
- **deliver:** origin
- **purpose:** Read-only canonical-site health check. Safe, keep as model.
- **toolsets:** terminal, web

### Godseye proactive completion watcher
- **id:** f95cc2d9f3cb
- **fate:** CONSOLIDATED → Completion Synthesizer
- **schedule:** every 30m
- **deliver:** origin
- **purpose:** Proactive completion coaching in godseye-repo.
- **toolsets:** terminal, file, web

### intent-extractor
- **id:** a2ecd93a2b2b
- **fate:** CONSOLIDATED → Inbound Watch
- **schedule:** 0 11 */2 * *
- **deliver:** telegram:-1004295708174:64
- **purpose:** Lead qualification + intent extraction from inbound.
- **skills:** autonomous-business-agents

### labx-watchdog
- **id:** 28f307525e27
- **fate:** CONSOLIDATED → Inbound Watch / Oversight Check-in
- **schedule:** every 30m
- **deliver:** telegram:-1004442742830
- **purpose:** Watchdog for the #godseye project group.

### low-hanging-fruits
- **id:** ec5251f8d8f9
- **fate:** CONSOLIDATED → Completion Synthesizer
- **schedule:** 0 8 * * *
- **deliver:** telegram:-1004295708174:66
- **purpose:** Scan all projects for quick wins.

### money-scanner
- **id:** f523aa58bfa2
- **fate:** PAUSED (destructive-build/fast-bold risk)
- **schedule:** 0 9 * * *
- **deliver:** telegram:-1004295708174:62
- **purpose:** Bold money-opportunity scanning.
- **skills:** autonomous-business-agents

### orchestrator-main
- **id:** 1b31229f81a9
- **fate:** CONSOLIDATED → Oversight Check-in
- **schedule:** 0 */6 * * *
- **deliver:** telegram:-1004295708174:67
- **purpose:** Check ALL projects, coordinate.
- **skills:** orchestra-system

### overseer-bank
- **id:** 66647a4ed1ad
- **fate:** PAUSED
- **schedule:** every 30m
- **deliver:** origin
- **purpose:** Huntington Bank dedicated agent.
- **toolsets:** terminal

### project-continuation-watcher
- **id:** 886d43cfb13c
- **fate:** CONSOLIDATED → Completion Synthesizer
- **schedule:** 0 10 * * *
- **deliver:** telegram:-1004295708174:68
- **purpose:** Keep abandoned work alive without being asked.
- **skills:** autonomous-business-agents

### self-learner
- **id:** c1792b2ea5cf
- **fate:** PAUSED (last_status error)
- **schedule:** 0 22 * * *
- **deliver:** origin
- **purpose:** Review last 24h, find patterns, improve orchestration.
- **skills:** orchestra-system

### service-builder
- **id:** 36eae2c4594d
- **fate:** PAUSED (only triggers on money-scanner, which is paused)
- **schedule:** 0 15 * * *
- **deliver:** telegram:-1004295708174:64
- **purpose:** Build a service page when a viable opportunity is found.
- **skills:** autonomous-business-agents

### session-learner-daily
- **id:** 6bf6a01207ee
- **fate:** CONSOLIDATED → Godseye Daily Briefing
- **schedule:** 0 6 * * *
- **deliver:** origin
- **purpose:** Scan all sessions, produce tight report.
- **skills:** session-learner

### stall-watchdog
- **id:** de552c34f37f
- **fate:** CONSOLIDATED → Oversight Check-in
- **schedule:** */5 * * * *
- **deliver:** telegram:-1004295708174:65
- **purpose:** Overseer over all agents. High-noise, removed.
- **toolsets:** skills, session_search, terminal, delegation

### telegram-dm-monitor
- **id:** 0fec5f228f75
- **fate:** CONSOLIDATED → Inbound Watch (was erroring)
- **schedule:** 30 22 * * *
- **deliver:** telegram:-1004295708174:62
- **purpose:** Scan last 24h across Telegram DMs/channels.

### trader-hq
- **id:** 049b3576bdba
- **fate:** PAUSED
- **schedule:** every 30m
- **deliver:** origin
- **purpose:** HQ Traders dedicated agent.
- **toolsets:** terminal

---

## Insight notes

- **Noise was concentrated in:** stall-watchdog (5m), godseye-proactive-followup (15m), labx-watchdog (30m), active-session-watcher (45m), plus the completion agents (5m/30m).
- **Regression risk was concentrated in:** `Godseye aggressive completion loop` (5m, edit+commit+push) — this caused the live landing-page regressions. Replaced by a non-editing synthesizer.
- **Health/safety value was concentrated in:** canonical site health checker + opensaas-watcher — both kept in the new Site Guard.
- **One broken job:** `self-learner` and `telegram-dm-monitor` both showed `last_status: error` before consolidation.
