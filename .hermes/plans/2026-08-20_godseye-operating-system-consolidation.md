# GodsEye Operating System Consolidation Plan

> **For Hermes:** Execute in phases. Do not move, delete, rename, or rewrite existing project files until the inventory and classification gates pass.

**Goal:** Merge Jared Rhod's anti-drift structure with Hermes's existing memory, skills, session search, cron, and graph tooling without duplicating or destabilizing the current system.

**Architecture:** Use a separate VPS-wide control plane for orchestration and knowledge, while leaving each project repository's own source-of-truth documents in place. Hermes remains the execution engine; the control plane supplies orientation, priorities, job-specific context, and checkpoints. Graphify remains a read-only analysis/indexing layer, not the source of truth.

---

## 1. Final Architectural Decision

### Do adopt

- Master index
- Active priorities
- Job/context cards
- Daily checkpoints
- Explicit priming instructions
- Evidence and verification rules
- Project registry and dependency map
- Graphify after the corpus is organized

### Do not adopt literally

- Do not create an Obsidian-style second copy of all project documents.
- Do not put the entire VPS inside `/root/godseye-repo`.
- Do not replace Hermes memory, skills, session search, or cron with markdown equivalents.
- Do not dump all 971 past sessions into a new vault.
- Do not make a daily cron invent session summaries.
- Do not move or delete existing files during the first pass.
- Do not treat Jobs and cron jobs as the same thing: Jobs are context/operating cards; cron jobs are execution schedules.

### Why this is the right hybrid

Jared's system solves orientation and retrieval. Hermes already solves persistence, procedural skills, search, automation, delegation, and verification. Duplicating those capabilities would create a second system that can drift from the first. The control plane should therefore contain pointers, decisions, priorities, and operating procedures—not duplicate source documents.

---

## 2. Three-Layer Structure

### Layer A — Hermes engine (leave intact)

- `/root/.hermes/` — models, skills, cron, session search, memory
- Hermes memory remains for compact, durable cross-session facts.
- Skills remain the procedural layer.
- Session search remains the historical archive.
- Cron remains automation/execution.

### Layer B — Control plane (new, separate)

Create:

```text
/root/dhx-operating-system/
├── MASTER-INDEX.md
├── ACTIVE-PRIORITIES.md
├── PROJECT-REGISTRY.md
├── DECISIONS.md
├── daily-notes/
│   └── _template.md
├── jobs/
│   ├── DEPLOYMENT.md
│   ├── GODSEYE-LANDING.md
│   ├── TELEGRAM-BOT.md
│   ├── CUSTOMER-BACKEND.md
│   ├── OPENSAAS-AUTH.md
│   ├── CONTENT-DISTRIBUTION.md
│   └── INFRASTRUCTURE.md
├── projects/
│   ├── GODSEYE.md
│   ├── DIGITAL-HUSTLERS.md
│   ├── AEVRIXTRADES.md
│   ├── GETVIRALCITY.md
│   ├── NEXA-BANK.md
│   └── REFERENCE-PROJECTS.md
├── audits/
│   ├── VPS-INVENTORY-YYYY-MM-DD.md
│   └── SESSION-DNA-EXTRACTION.md
└── graph/
    └── README.md
```

This is not a new application and not a replacement vault. It is a small control plane for deciding where work belongs and what context to load.

### Layer C — Project source of truth (leave local)

Examples:

- `/root/godseye-repo/AGENTS.md`, `PRD.md`, `HANDOFF.md`, `docs/`, `drafts/`
- `/srv/digitalhustlers/...`
- `/root/open-saas/...`

Project cards point to these files. They do not copy them.

---

## 3. Session Arrangement

### Global orientation

At the start of a GodsEye/project session, load in this order:

1. `/root/dhx-operating-system/MASTER-INDEX.md`
2. `/root/dhx-operating-system/ACTIVE-PRIORITIES.md`
3. The relevant project card in `projects/`
4. The relevant Job card in `jobs/`
5. The project's local boot/source-of-truth files
6. Only then task-specific files

The entire control plane must not be loaded on every task. Load the index and priorities globally; load one project card and one Job card based on the active task.

### Session modes

Every session should be classified as one of:

- **Build:** implementation or production change
- **Investigate:** diagnosis/research, no edits by default
- **Decide:** compare options and record a decision
- **Publish:** content, authority, distribution, outreach
- **Operate:** health checks, payments, services, scheduled workflows
- **Review:** audit, retrospective, drift check

The mode determines which Job card is primed and what checkpoint fields are required.

### End-of-session checkpoint

For any session with a decision, file change, external action, or meaningful research:

1. Update the relevant project or Job card if the durable procedure changed.
2. Append one structured entry to the daily note.
3. Update `ACTIVE-PRIORITIES.md` if an item changed state.
4. Add material decisions to `DECISIONS.md`.
5. Verify the written files by reading them back.
6. Report unresolved blockers explicitly.

A daily note is an index/log, never the only home for durable knowledge.

---

## 4. Anti-Drift Behavior Rules

These become the control-plane operating contract and a concise addition to project boot instructions:

1. **Evidence only:** do not claim current state without checking the source.
2. **Full reads for audits:** do not infer from samples when the request is to audit/review everything.
3. **Prime before producing:** load the relevant project and Job context before writing, editing, or advising.
4. **One source of truth:** update the proper contextual home; do not create competing copies.
5. **No loose ends:** record blockers and next action before ending a session.
6. **Scope before action:** identify the project and impact boundary before touching files or services.
7. **No destructive cleanup on discovery passes:** classify first, archive/move only after verification.
8. **Separate facts, decisions, proposals, and hypotheses:** label them in notes.
9. **Do not let cron silently redefine priorities:** automation may surface and report; owner-facing priority changes require evidence and explicit reasoning.
10. **Protect the money path:** prioritize revenue, customer access, payment, live reliability, and authority-building work over cosmetic or speculative work.

---

## 5. Priority Model

`ACTIVE-PRIORITIES.md` should contain no more than:

- **Now:** one to three outcomes that matter this work window
- **Next:** confirmed follow-ups
- **Waiting:** blocked by a person, credential, decision, or external system
- **Maintenance:** recurring operational obligations
- **Parked:** explicitly deferred ideas, with reason

Each item must include:

```text
ID · project · outcome · current evidence · next action · blocker · last checked
```

This replaces scattered TODO accumulation. Finished items move to the daily note or decision log; they do not remain indefinitely in the active list.

---

## 6. Jobs: What They Are and What They Are Not

A Job is a reusable operating card, not a scheduled task.

Every Job contains:

- Purpose and success condition
- `READ BEFORE WORKING` list
- Allowed scope and approval boundary
- Standard sequence
- Verification commands/checks
- Known failure modes
- Escalation rule
- Output/checkpoint requirements
- Related cron IDs, if any

Example:

```markdown
# Deployment Job

## READ BEFORE WORKING
- /root/godseye-repo/AGENTS.md
- /root/godseye-repo/HANDOFF.md
- relevant source/spec files

## Sequence
1. Read-only diagnosis
2. Back up exact target
3. Smallest change
4. Syntax/type checks
5. Build
6. Verify generated artifacts
7. Restart only required service
8. Verify live route/behavior
9. Checkpoint evidence

## Never
- Do not deploy unverified output
- Do not restart OpenSaaS without checking generated artifacts
- Do not run destructive payment/database tests
```

---

## 7. Past Session DNA Extraction

Do not bulk-import 971 sessions. That creates noise and consumes attention.

Instead, perform a bounded retrospective extraction:

1. Search session history for recurring corrections, repeated projects, repeated failures, and durable preferences.
2. Extract only stable patterns into `audits/SESSION-DNA-EXTRACTION.md`.
3. Classify every extracted item as `fact`, `rule`, `decision`, `procedure`, `preference`, or `temporary state`.
4. Promote only stable facts/preferences to Hermes memory.
5. Promote reusable procedures to Skills or Job cards.
6. Put project facts in project cards/source-of-truth documents.
7. Leave temporary progress in daily notes and session history.

No session transcript becomes canonical merely because it was said once.

---

## 8. VPS Rights and Scope

The control plane is VPS-wide but index-only on first pass.

- `/root/dhx-operating-system/`: root-owned, private, mode `700` directory; markdown files `600` unless a service explicitly needs read access.
- Existing repositories retain their current ownership and permissions.
- No automatic writes to unrelated projects.
- Each project card records: canonical path, runtime, service, public URL, source-of-truth docs, deployment boundary, and owner.
- Production changes still require the local project's AGENTS/safe workflow.
- No global `/root` cleanup until inventory, owner, runtime, and backup status are known.

---

## 9. Graphify Strategy

Graphify is used after the control plane and source map exist:

1. Graphify `/root/godseye-repo` in read-only analysis mode.
2. Keep graph outputs under the repo's existing `graphify-out/` or a dedicated control-plane graph directory.
3. Treat `GRAPH_REPORT.md` and graph JSON as analysis artifacts, not canonical facts.
4. Run separate graphs for separate projects; do not graph all of `/root` as one corpus.
5. Use graph results to detect orphaned docs, duplicate concepts, and dependency edges.
6. Update project cards with verified relationships; do not let inferred edges rewrite source-of-truth docs automatically.

---

## 10. Phased Execution Plan

### Phase 0 — Discovery gate

- Create no new control files except this plan.
- Confirm current Hermes profile, memory stores, cron fleet, session database, and project paths.
- Save an inventory report.
- Decide which profile is canonical for this work.

**Gate:** no ambiguous duplicate source-of-truth remains unlisted.

### Phase 1 — Non-destructive skeleton

- Create `/root/dhx-operating-system/`.
- Create `MASTER-INDEX.md`, `ACTIVE-PRIORITIES.md`, `PROJECT-REGISTRY.md`, `DECISIONS.md`.
- Create daily template and seven Job cards.
- Create project cards for the revenue-critical projects only.
- Do not move or edit existing project files.

**Gate:** a fresh session can identify the active project, priority, and correct files in under two minutes.

### Phase 2 — Behavioral integration

- Add a concise control-plane startup/checkpoint section to `/root/godseye-repo/AGENTS.md` after showing the exact before/after.
- Create/update a reusable Hermes skill for checkpointing and priming.
- Keep automation conservative: daily note skeleton creation may be scripted; summarization must use real session evidence.
- Review cron jobs for duplicate completion loops, stale model pins, overlapping workdirs, and monthly quota failures.

**Gate:** no cron job is allowed to create noise, duplicate work, or silently consume a broken model route.

### Phase 3 — Historical DNA extraction

- Search session history by recurring project/problem clusters.
- Write only stable patterns to the control plane, Jobs, Skills, or Hermes memory.
- Leave temporary logs untouched.

**Gate:** every promoted fact has a source pointer or explicit confidence label.

### Phase 4 — Cleanup proposal only

- Inventory duplicate reports and root-level documents.
- Propose archive/move batches with an itemized manifest.
- Back up before every batch.
- Execute only after the manifest is reviewed and verified.

### Phase 5 — Graph and optimization

- Run Graphify per project.
- Use findings to improve indexes and Job cards.
- Measure drift: repeated rediscovery, stale priorities, failed cron jobs, unverified completion claims, and duplicated docs.

---

## 11. Success Metrics

After two weeks of use:

- A new session identifies the active project and next action without re-interviewing the owner.
- No more than three active priorities are in `Now`.
- Every meaningful work session has a checkpoint.
- Repeated tasks use a Job card rather than re-explaining procedure.
- Completion claims include verification evidence.
- Cron failures are visible and not silently repeated.
- No new duplicate report pile is created.
- The system reduces conversation drift without making every response slower or more bureaucratic.

If it increases overhead without reducing rediscovery, simplify it. Structure is a means, not the product.

---

## Final Recommendation

Proceed with **Phase 0 and Phase 1 only**. Build the separate control plane first. Do not reorganize the VPS or godseye-repo yet. This gives us Jared's structure without contaminating or duplicating the engine and existing source-of-truth documents.

The first useful artifact is not a giant vault. It is a small, authoritative map: **what exists, what matters now, what to read for each job, and what changed today.**
