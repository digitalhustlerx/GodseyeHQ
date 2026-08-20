# GitHub Profile Cleanup Guide

## Problem
100 public repos dilutes your signal. Visitors see noise, not craft.

## Recommended Actions

### 🔴 Archive These (37 forks — add "template" or "demo" repos that aren't yours)

Most forks add zero signal. Archive or delete:

- `GodseyeHQ-by-gemini-` — duplicate of GodseyeHQ
- `nexabank-demo` — superseded by nexabank
- All 37 forks (see list below)
- `Queen-skilia-` — unclear what this is
- `chakra` / `chakraa` — empty repos
- `Aeverix` — empty repo
- `blaze` — empty repo
- `gatesib` — empty repo
- `digitalhustlerx-site` — replaced by dhx-hub
- `admin-aevrixtrades` — internal, no public value
- `huly-hero-1` — "first" — zero value
- `Genie-vibecoder` — empty description
- `precedent-boilerplate` — empty description
- `Nexafinance-Landing-Page` — old iteration
- `Nexafinance-front-end` — old iteration
- `nexafinance1` — old iteration
- `getviralcity-nextjs` — replaced by getviralcity
- `GetviralcityMainphpsmm` — old version
- `getviralcity-clippers` — internal
- `vercelaichatbot` — empty
- `Content-gamefication` — empty
- `quickpost` — empty
- `paddle-billing-subscription-starter` — template, not yours
- `soham` — unclear
- `Heuristic-nash9-phkg` — template

### 🟡 Keep But Improve Descriptions

These repos are real projects but have weak/missing descriptions:

| Repo | Current Description | Suggested Description |
|------|--------------------|-----------------------|
| `Social-harness` | "Social harness" | "Omnichannel social inbox — manage all DMs from one dashboard" |
| `hyperframes` | "HyperFrames — programmatic video rendering" | "Write HTML, render video. Built for AI agents." |
| `paperclip` | "Paperclip — agent orchestration platform" | "Multi-agent orchestration — spawn, coordinate, and monitor AI agents" |
| `godseye-bot` | (empty) | "Telegram bot for GodsEye — your AI business operator" |
| `godseye-bot` → rename to keep? | (empty) | Consider merging into GodseyeHQ |

### 🟢 Pin These 6 Repos (the ones that show on your profile)

GitHub lets you pin 6 repos. These should be:

1. **GodseyeHQ** — your flagship product ⭐
2. **Pandora Box** — multi-agent orchestration
3. **Social-harness** — omnichannel inbox
4. **HyperFrames** — video rendering for agents
5. **TrustClaw** — personal AI agent with memory
6. **Scaffold** — CLI bootstrapper

### 🟢 These Repos Are Fine (keep as-is)

- `vault` — private, internal docs ✓
- `telegram-pi` — private, bridge ✓
- `getviralcity` — private, active ✓
- `hqtraders-main` — private, active ✓
- `virtual-bank` — private, active ✓
- `dhx-hub` — private, landing pages ✓
- `nexabank` — private, active ✓
- `composio-mcp` — private, integration ✓
- `telegram-mcp-server` — private, tool ✓

## Execution Plan

1. **Create profile README** (see `github-profile-readme.md`)
2. **Set bio** to: "Building AI agents that run businesses. Founder of GodsEye."
3. **Set location** to: "Lagos, Nigeria"
4. **Pin 6 repos** from the list above
5. **Archive empty/old repos** (use GitHub UI: Settings → Archive this repository)
6. **Add descriptions** to the yellow-listed repos
7. **Delete truly empty repos** that add nothing (chakra, chakraa, blaze, gatesib, soham)

## Commands to Archive via API

```bash
# Archive a repo (makes it read-only, hidden from search by default)
TOKEN=$(cat ~/.github-token)
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/digitalhustlerx/REPO_NAME" \
  -d '{"archived": true}'
```

Or do it in bulk:
```bash
for repo in chakra chakraa blaze gatesib soham Queen-skilia- huly-hero-1 Genie-vibecoder Nexafinance-Landing-Page Nexafinance-front-end nexafinance1; do
  echo "Archiving $repo..."
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN" \
    "https://api.github.com/repos/digitalhustlerx/$repo" \
    -d '{"archived": true}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  {d.get(\"archived\",\"FAILED\")}')"
done
```
