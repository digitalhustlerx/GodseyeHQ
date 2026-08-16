# GodsEye WordPress Executor — State & Decision

**Date:** 2026-08-16
**Author:** Hermes (audit)
**Status:** Findings + recommendation. No code changes shipped.

## 1. What the "executor" actually is

GodsEye's WordPress execution pipeline has three layers. It is **not** an MCP layer — it is a purpose-built, signed-plugin architecture:

| Layer | Code | Job |
|---|---|---|
| Bridge plugin | `/root/godseye-repo/wp-plugin/` (built → `godseye-bridge-1.2.0.zip`) | Installed on the customer's WordPress. Exposes a local REST API: `/site`, `/posts`, `/pages`, `/media`, `/comments`, `/woocommerce/products`, `/seo`, `/plugins`, `/themes`, `/cron`, `/cache`. |
| Bridge client | `bridge-client.ts` | Signs every outbound call with **HMAC-SHA256** (`x-godseye-site-id`, `x-godseye-timestamp`, `x-godseye-signature`). |
| Executor + planner | `executor.ts`, `planner.ts`, `agents.ts` | Maps ~25 operation types to bridge calls; runs a plan as a sequence of operations with a `simulate` safety mode. |

## 2. Where each half lives (the split)

- **Plugin** — already in canonical repo `/root/godseye-repo/wp-plugin/`.
- **Connection/registration** (`/api/sites`, `/api/sites/connect`, `/api/sites/verify`, `bridge_sites` table) — already in canonical repo `server.ts`, port 3000.
- **Execution half** (`executor.ts`, `planner.ts`, `bridge-client.ts`, `agents.ts`, `types.ts`, `store.ts`, `state.json`) — **still stranded** in legacy `/root/godseye/backend`, served by `godseye-backend.service`, port 8787.

## 3. The blocker: incompatible secret models

| | Canonical repo (port 3000) | Legacy executor (port 8787) |
|---|---|---|
| Secret storage | **SHA-256 hash only** (`backend_secret_hash`). Raw secret sent to the plugin once, then discarded. | **Raw `backendSecret`** held in `state.json` (plaintext). |
| Signing | Plugin holds secret; no server-side outbound signing path. | `signBridgeRequest` signs with the raw `site.backendSecret`. |
| Security posture | Strong (DB leak can't expose a usable secret). | Weaker (10 sites' raw `gst_…` secrets sit in a JSON file). |

**These cannot be merged without choosing one model.** Copying `executor.ts` into the repo would fail — the repo has no raw secret to sign with.

## 4. The second problem: execution is mostly simulated

- `planner.ts` `createPlan()` handles only 3 keyword patterns: "list posts", "write/draft/create post", and a generic site-status fallback. Everything else falls through to `simulateOperation()` returning `status: "simulated"`.
- `planner.ts` `chooseModel()` still hardcodes **Ollama** (`llama3.2:3b`, `qwen2.5:7b`, `qwen2.5:14b`) — the same local "tiny llama" pattern already removed from `/api/chat`.
- Live `state.json`: 10 sites, but only 1 real (`digital.digitalhustlerx.com`); the rest are `example.com` / `mock.test`. 24 tasks, all prototype-era.

**"Godseye executes on WordPress" is not yet real in this code** — it is scaffolding with a secure transport and a simulation fallback.

## 5. Recommendation

Do **not** consolidate the executor into the repo yet. Instead:

1. **Keep port 8787 running** as-is (no breakage, it's the only execution path that exists).
2. **Decide the secret model first**: to consolidate, the executor must be rewritten to call *through the plugin's own signed flow* (plugin holds the secret and initiates/relays actions) rather than the server signing outbound calls with a raw secret. This is a design + build task, not a copy-paste.
3. **Fix `planner.ts` model selection** to point at `deepseek-v4-flash`/opencode-go (or freellmapi stopgap) when it's next touched — remove the Ollama reference.
4. **Document `:8787` as known tech-debt** in PRD/AGENTS until the executor is either (a) rewritten against the hash-first model, or (b) formally retired.

## 6. Immediate action taken

None (read-only). No services stopped, no data changed. `godseye-backend.service` (8787) left running per owner instruction.
