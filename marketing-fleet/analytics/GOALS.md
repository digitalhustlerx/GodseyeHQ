# ANALYTICS & GOALS

> What to measure, per channel, and what "winning" looks like. Keep it honest — report real numbers, not vibes.
> Cross-check claims vs real state before reporting (user rule).

---

## NORTH-STAR
**Paying customers.** Everything below feeds that.

## Funnel (define it)
`Eyeballs (impressions) → Engaged (clicks/likes/opens) → Leads (waitlist signup / bot Start) → Trials (bot active on a site) → Sales (Polar paid)`

## Per-Channel Metrics
| Channel | Primary metric | Secondary |
|---------|---------------|-----------|
| X / LinkedIn | profile visits → link clicks | engagement rate |
| Telegram group | joins → /start → demo → buy | messages |
| SEO blog | organic sessions | keyword rankings |
| HN / ProductHunt | upvotes → site visits | comments |
| YouTube | watch time → link clicks | subscribers |
| Email | open → click → buy | unsubscribe |
| Paid ads | CPA (cost per paying customer) | CTR, ROAS |
| WP.org forums | helpful answers → site visits | replies |

## GOALS (targets — review weekly, revise monthly)
| Metric | Current | 30-day target | 90-day target |
|--------|---------|---------------|---------------|
| Site visitors/week | TBD (need analytics wired) | 500 | 5,000 |
| Waitlist/leads captured | TBD | 100 | 1,000 |
| Bot /start activations | TBD | 50 | 500 |
| Paying customers | 0 (first customer = goal) | 10 | 100 |
| Email subscribers | TBD | 200 | 2,000 |

## ATTRIBUTION
- UTM params on every outbound link (`?utm_source=twitter&utm_campaign=launch`).
- Polar checkout accepts UTM natively — capture where the buyer came from.
- Ask "where did you hear about us?" on the claim/post-purchase form.

## TRACKING LAYER (to wire)
- Check if self-hosted analytics (Umami) is live on the Godseye domain — if not, deploy it (skill: `self-hosted-analytics`).
- Event: `bot_start` (Telegram), `checkout_complete` (Polar webhook), `lead_captured` (waitlist).

## IMPORTANT — BE HONEST
- No fake numbers. If you can't measure a channel yet, mark it "unmeasured", don't invent.
- First customer is the milestone. Don't paper over the Telegram /start blocker that stops onboarding.
