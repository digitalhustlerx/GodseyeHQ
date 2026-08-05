import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccount, logout, AccountData } from "../lib/auth";
import { PRICING_PLANS } from "../mockData";
import { Check, LogOut, RefreshCw, ArrowRight, Users, Copy, Gift } from "lucide-react";
import { getReferralToken, referralUrl, getReferralStats, IN_PRODUCT_REFERRAL_COPY } from "../lib/referral";
import type { ReferralStatsData } from "../lib/referral";

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  godmode: "God Mode",
  agency: "Agency",
};

export default function AccountPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  // GOD-9: in-product referral ("Bring your team") state.
  const [refLink, setRefLink] = useState("");
  const [refStats, setRefStats] = useState<ReferralStatsData | null>(null);
  const [refCopied, setRefCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAccount();
      setAccount(data);
      setNotLoggedIn(false);
      // GOD-9: fetch the user's opaque referral token + funnel/reward stats.
      const email = data.user.email;
      const token = await getReferralToken(email);
      if (token) setRefLink(referralUrl(token));
      const stats = await getReferralStats(email);
      setRefStats(stats);
      return data;
    } catch {
      setNotLoggedIn(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener("godseye:authed", load as any);
    return () => window.removeEventListener("godseye:authed", load as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await logout();
    await load();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#0A0A0A]">
        <RefreshCw className="w-6 h-6 text-[#C4A484] animate-spin" />
        <p className="text-xs text-white/50 font-mono uppercase tracking-widest">Loading account…</p>
      </div>
    );
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl mx-auto">👁️</div>
          <h1 className="font-display text-3xl font-light">You're not logged in</h1>
          <p className="text-sm text-white/50 font-light">Create an account or log in to manage your subscription.</p>
          <button
            onClick={() => navigate("/login?next=/account")}
            className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold py-3 px-8 rounded-full text-xs uppercase tracking-widest"
          >
            Log In / Sign Up <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const user = account!.user;
  const planId = user.plan_id;
  const isFree = user.plan === "free";
  const paidPlans = PRICING_PLANS.filter((p) => p.id !== "free");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] px-4 py-14">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-[#C4A484] font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A484] animate-pulse"></span>
              My Account
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight">
              Hey, <span className="italic text-[#C4A484]">{user.name || user.email}</span>
            </h1>
            <p className="mt-2 text-sm text-white/50 font-light">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 uppercase tracking-widest font-bold py-2.5 px-5 rounded-full transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        {/* Current plan card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] text-[#C4A484] font-mono uppercase tracking-widest font-bold mb-1">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{PLAN_LABEL[planId] || planId}</h2>
                {isFree && (
                  <span className="rounded-full bg-white/10 border border-white/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">
                    Free · 50 credits/mo
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/50 font-light">
                {isFree
                  ? "You're on the free plan. Upgrade to unlock full WordPress management, WooCommerce, security, and more."
                  : "Your subscription is active. Enjoy unlimited power from your agent."}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Credits remaining</p>
              <p className="text-3xl font-black text-[#C4A484]">{Math.round(user.credits_remaining)}</p>
            </div>
          </div>
        </div>

        {/* Subscription plans */}
        <div>
          <h3 className="font-display text-2xl font-light mb-2">
            {isFree ? "Choose a plan" : "Your plans"}
          </h3>
          <p className="text-sm text-white/50 font-light mb-6">
            {isFree ? "Subscribe to any plan to keep your agent working all month." : "Each plan gives you more sites, credits, and power."}
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {paidPlans.map((plan) => {
              const isCurrent = plan.id === planId;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-[#121212] border rounded-2xl p-6 ${
                    isCurrent ? "border-[#C4A484]" : "border-white/10"
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C4A484] px-3 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black font-bold">
                      Most Popular
                    </span>
                  )}
                  <h4 className="font-semibold text-base">{plan.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-white/50 text-xs">/month</span>
                  </div>
                  <p className="mt-1 text-xs text-[#C4A484]">{plan.credits} credits/mo</p>
                  <ul className="mt-4 mb-6 flex-1 space-y-2">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[11px] text-white/70 font-light">
                        <Check className="mt-0.5 w-3 h-3 flex-shrink-0 text-[#C4A484]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <span className="w-full text-center py-3 rounded-full border border-[#C4A484]/50 text-[11px] uppercase tracking-widest font-bold text-[#C4A484]">
                      Active Plan
                    </span>
                  ) : (
                    <button
                      onClick={() => (window as any).godseyeCheckout?.(plan)}
                      className="w-full bg-[#C4A484] hover:bg-[#b59574] text-black py-3 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all"
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* GOD-9: Bring your team (in-product referral surface) */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-[#C4A484]/10 border border-[#C4A484]/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#C4A484]" />
            </div>
            <h3 className="text-xl font-bold">Bring your team</h3>
          </div>
          <p className="text-sm text-white/50 font-light leading-relaxed mt-2 max-w-2xl">
            {IN_PRODUCT_REFERRAL_COPY}
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* Your link */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-[#C4A484] font-mono uppercase tracking-widest font-bold mb-2">Your invite link</p>
              <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  placeholder={refLink ? undefined : "Loading your link…"}
                  className="flex-1 bg-transparent text-white/60 text-[11px] px-2 py-1.5 outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => {
                    if (!refLink) return;
                    navigator.clipboard.writeText(refLink);
                    setRefCopied(true);
                    setTimeout(() => setRefCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#C4A484] text-black text-[10px] font-bold px-3 py-2 rounded-lg uppercase tracking-wider whitespace-nowrap hover:bg-[#C4A484]/90 transition-all"
                >
                  <Copy className="w-3 h-3" /> {refCopied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Funnel + referred revenue (GOD-8 §7) */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2">
                  <div className="text-lg font-black text-[#C4A484]">{refStats?.invites_sent ?? 0}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mt-0.5">Invites</div>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2">
                  <div className="text-lg font-black text-[#C4A484]">{refStats?.signup_to_paid?.paid ?? 0}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mt-0.5">Paid</div>
                </div>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2">
                  <div className="text-lg font-black text-[#C4A484]">${Math.round(refStats?.referred_revenue ?? 0)}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mt-0.5">Referred</div>
                </div>
              </div>
            </div>

            {/* Reward ladder (GOD-8 §3) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-3.5 h-3.5 text-[#C4A484]" />
                <p className="text-[10px] text-[#C4A484] font-mono uppercase tracking-widest font-bold">
                  Rewards — {refStats?.rewards?.paid_count ?? 0} paid invites
                </p>
              </div>
              <ul className="space-y-2 text-[11px] text-white/70 font-light">
                {[
                  { label: "Waitlist priority +1 per invitee", on: true },
                  { label: "1 paid invite → 1 month of your plan free (caps Pro)", on: (refStats?.rewards?.paid_count ?? 0) >= 1 },
                  { label: "3 paid invites → 14-day God Mode trial", on: (refStats?.rewards?.paid_count ?? 0) >= 3 },
                  { label: "5 paid invites → Lifetime -20% on your plan", on: (refStats?.rewards?.paid_count ?? 0) >= 5 },
                ].map((r) => (
                  <li key={r.label} className="flex items-start gap-2">
                    <Check className={`mt-0.5 w-3 h-3 flex-shrink-0 ${r.on ? "text-[#C4A484]" : "text-white/25"}`} />
                    <span className={r.on ? "text-white/80" : "text-white/40"}>{r.label}</span>
                  </li>
                ))}
              </ul>

              {/* Applied referral_discount on next invoice (GOD-8 §5) */}
              {account?.subscription.referral_discount ? (
                <div className="mt-3 bg-[#C4A484]/10 border border-[#C4A484]/30 rounded-lg px-3 py-2 text-[11px] text-[#C4A484]">
                  <strong>Next invoice:</strong> ${account.subscription.referral_discount} off —{" "}
                  {account.subscription.referral_discount_label}
                </div>
              ) : (
                <p className="mt-3 text-[10px] text-white/30 font-light">
                  Referred rewards are applied as a discount on your next invoice automatically.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
