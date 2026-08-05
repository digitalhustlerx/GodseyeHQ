import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccount, logout, AccountData } from "../lib/auth";
import { PRICING_PLANS } from "../mockData";
import { Check, LogOut, RefreshCw, ArrowRight } from "lucide-react";

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

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAccount();
      setAccount(data);
      setNotLoggedIn(false);
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
      </div>
    </div>
  );
}
