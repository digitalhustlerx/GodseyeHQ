# ACCOUNTS REGISTRY — EVERY HANDLE WE OWN

> Single source of truth for every Godseye account/handle. Status: 🔴 create / 🟡 partial (needs creds / blocked) / 🟢 live.
> Note creds location (NEVER in this file — link to where they live, e.g. Composio / openconnector / local PC).
> Rule: one row per account. No orphan accounts.

---

## 🔷 Organic Social
| Platform | Handle / Name | URL | Status | Creds / Notes |
|----------|---------------|-----|--------|----------------|
| X / Twitter | @godseyehq | twitter.com/godseyehq | 🟡 | Needs oauth2 token (xurl, local PC). Launch thread built. |
| LinkedIn | (company + personal) | linkedin.com | 🔴 | Founder-led page. |
| TikTok | — | — | 🔴 | Create. |
| Instagram | — | — | 🔴 | Create. |
| Facebook / Insta page | — | — | 🔴 | Create. |
| Threads | — | — | 🔴 | Tie to Instagram. |

## 🟢 Telegram (native home)
| Handle | Status | Creds / Notes |
|--------|--------|----------------|
| GodseyeHQ group | 🟢 | ID `-1004450820767`, forum topics 462-467. |
| @GodseyeXbot | 🟡 | **`/start` NOT wired — CRITICAL blocker.** via openconnector. |
| Godseye News channel | 🔴 | Create broadcast channel. |

## 📰 Content / Forums
| Platform | Handle | Status | Notes |
|----------|--------|--------|-------|
| WordPress.org forums | (helper account) | 🟢 | Reachable via curl. |
| Hacker News | @godseyehq | 🔴 | Create + Karma. |
| Reddit | (main + per-sub) | ⛔ | Bot-blocked from cron; needs proxy. |
| Medium | — | 🔴 | Create. |
| Quora | — | 🔴 | Create. |
| StackExchange | — | 🔴 | Create. |

## 🎬 Video
| Platform | Handle | Status | Notes |
|----------|--------|--------|-------|
| YouTube | — | 🔴 | Create main channel + Shorts. |
| X video | @godseyehq | 🟡 | via X. |

## 📧 Email
| System | Status | Notes |
|--------|--------|-------|
| Waitlist list | 🔴 | Convert captured emails → nurture flow. |
| Cold outreach (Google/Composio Gmail) | 🔴 | getviralcity@gmail.com default. |
| Transactional (receipts) | 🔴 | Polar handles receipts. |

## 📦 Directory / Listings
| Platform | Status | Notes |
|----------|--------|-------|
| ProductHunt | 🔴 | Big launch-day opportunity. |
| Indie Hackers | 🔴 | Product + launch post. |
| SaaSHub / AlternativeTo / G2 | 🔴 | Comparison listings. |
| WordPress.org plugin dir | 🔴 | Only if free companion plugin ships. |

---

## 🔑 CREDENTIALS HOME (link, don't store here)
- **Social auth (X/IG/FB/LinkedIn/TikTok):** check **Composio** (`mcp__composio`) and **OpenConnector** (`mcp__openconnector`, port 3002) FIRST before asking user for creds. He connects platforms through these 9/10 times.
- **X oauth2:** local PC `~/.xurl`, run `xurl auth oauth2 --app godseyehq @godseyehq`, bring back.
- **Bots:** Telegram @GodseyeXbot (openconnector), GodseyeHQ group.
- **Email:** Google via Composio = Gmail (getviralcity@gmail.com default).
