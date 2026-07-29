# Graph Report - /root/godseye-repo  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 41 nodes · 58 edges · 7 communities (5 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b668c6cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `MockWPState` - 7 edges
2. `ActiveView` - 3 edges
3. `LivePlaygroundProps` - 2 edges
4. `WordPressDashboardProps` - 2 edges
5. `WordPressDashboard()` - 2 edges
6. `PRICING_PLANS` - 2 edges
7. `INITIAL_WP_STATE` - 2 edges
8. `SAMPLE_COMMANDS` - 2 edges
9. `WordPressPost` - 2 edges
10. `WordPressPlugin` - 2 edges

## Surprising Connections (you probably didn't know these)
- `LivePlaygroundProps` --references--> `MockWPState`  [EXTRACTED]
  src/components/LivePlayground.tsx → src/types.ts
- `WordPressDashboardProps` --references--> `MockWPState`  [EXTRACTED]
  src/components/WordPressDashboard.tsx → src/types.ts

## Import Cycles
- None detected.

## Communities (7 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (6): WordPressDashboard(), WordPressDashboardProps, INITIAL_WP_STATE, PRICING_PLANS, ActiveView, MockWPState

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (7): LivePlaygroundProps, SAMPLE_COMMANDS, PlaygroundMessage, WooCommerceOrder, WordPressMedia, WordPressPlugin, WordPressPost

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (4): navItems, Segment, WordsPullUpMultiStyleProps, WordsPullUpProps

### Community 3 - "Community 3"
Cohesion: 0.40
Nodes (4): CREDIT_PACKS, SELF_HOST_PLANS, PricingPlan, SelfHostPlan

## Knowledge Gaps
- **11 isolated node(s):** `WordsPullUpProps`, `Segment`, `WordsPullUpMultiStyleProps`, `navItems`, `ai` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MockWPState` connect `Community 0` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `WordsPullUpProps`, `Segment`, `WordsPullUpMultiStyleProps` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._