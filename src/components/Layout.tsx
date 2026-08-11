import { useState, useEffect, FormEvent, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { PRICING_PLANS } from "../mockData";
import { PricingPlan } from "../types";
import { getMe, User } from "../lib/auth";
import { Menu, X, Coins, ArrowRight, RefreshCw, ChevronDown } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentsMenuOpen, setAgentsMenuOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  // Load session on mount + whenever location changes (page navigations).
  useEffect(() => {
    let active = true;
    getMe().then((u) => {
      if (active) setUser(u);
      if (u?.email && (!checkoutEmail)) setCheckoutEmail(u.email);
    });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleOpenCheckout = (plan: PricingPlan) => {
    // A logged-in user clicks Subscribe → straight to checkout with their email.
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const handleCreateCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !checkoutEmail) return;
    setCheckoutLoading(true);
    try {
      const priceNum = parseFloat(String(selectedPlan.price).replace(/[^0-9.]/g, ""));
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: checkoutEmail,
          plan_name: selectedPlan.name,
          price: priceNum,
          plan_id: selectedPlan.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      setCheckoutLoading(false);
      setShowCheckoutModal(false);
      setCheckoutEmail("");
      window.dispatchEvent(new CustomEvent("godseye:authed"));
      window.location.href = data.checkout_url;
    } catch (err: any) {
      setCheckoutLoading(false);
      alert(err.message || "Something went wrong. Please try again.");
    }
  };

  // Expose checkout handler globally so page components can trigger it
  if (typeof window !== "undefined") {
    (window as any).godseyeCheckout = handleOpenCheckout;
  }

  const navLinks = [
    { to: "/features", label: "Features" },
    { to: "/templates", label: "Templates" },
    { to: "/pricing", label: "Pricing" },
    { to: "/docs", label: "Docs" },
    { to: "/community/", label: "Community" },
    { to: "/blog", label: "Blog" },
  ];

  // "Agents" parent dropdown — every agent buyer page lives under /agents/<slug>.
  const agentsLinks = [
    { to: "/agents/lead-gen", label: "Lead Generation" },
    { to: "/agents/team", label: "Chief of Staff" },
    { to: "/agents/home", label: "Home & Life" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#C4A484]/30 selection:text-[#d9c4af]">
      {/* Top Banner */}
      <div className="bg-white/5 border-b border-white/10 text-center py-2.5 px-4 text-xs font-mono text-[#C4A484] uppercase tracking-widest">
        👁️ Now live — Start your first agent today. Get bonus credits as a founding member.
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-display text-lg text-white shadow-md">
              👁️
            </div>
            <span className="text-xl font-bold tracking-tighter text-[#F2F2F2]">
              GODS<span className="text-[#C4A484]">EYE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-400">
            {/* Agents dropdown parent */}
            <div
              className="relative"
              onMouseEnter={() => setAgentsMenuOpen(true)}
              onMouseLeave={() => setAgentsMenuOpen(false)}
            >
              <button
                onClick={() => setAgentsMenuOpen((o) => !o)}
                className={`flex items-center gap-1.5 hover:text-[#C4A484] transition-colors cursor-pointer ${location.pathname.startsWith("/agents")
                  ? "text-[#C4A484]"
                  : "text-gray-400"
                }`}
              >
                Agents <ChevronDown className={`w-3 h-3 transition-transform ${agentsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {agentsMenuOpen && (
                <div className="absolute left-0 top-full pt-3 z-50">
                  <div className="bg-[#121212] border border-white/10 rounded-2xl p-2 min-w-[220px] shadow-2xl shadow-black/50">
                    {agentsLinks.map((a) => (
                      <Link
                        key={a.to}
                        to={a.to}
                        onClick={() => setAgentsMenuOpen(false)}
                        className={`block px-4 py-2.5 rounded-xl text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                          location.pathname === a.to
                            ? "text-[#C4A484] bg-[#C4A484]/10"
                            : "text-gray-400 hover:text-[#C4A484] hover:bg-white/5"
                        }`}
                      >
                        {a.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-[#C4A484] transition-colors ${location.pathname === link.to ? "text-[#C4A484]" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                to="/account"
                className="text-[10px] uppercase tracking-widest font-bold bg-white/5 hover:bg-white/10 text-[#F2F2F2] border border-white/10 px-6 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/login?next=/account"
                className="text-[10px] uppercase tracking-widest font-bold bg-white/5 hover:bg-white/10 text-[#F2F2F2] border border-white/10 px-6 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95"
              >
                Log In
              </Link>
            )}
            <Link
              to="/start"
              className="text-[10px] uppercase tracking-widest font-bold bg-[#F2F2F2] hover:bg-white text-[#0A0A0A] px-6 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3.5 flex flex-col">
            {/* Agents expandable section */}
            <div>
              <button
                onClick={() => setAgentsMenuOpen((o) => !o)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#C4A484]"
              >
                Agents
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${agentsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {agentsMenuOpen && (
                <div className="mt-2 pl-3 space-y-2.5 flex flex-col border-l border-white/10">
                  {agentsLinks.map((a) => (
                    <Link
                      key={a.to}
                      to={a.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-medium text-gray-400 hover:text-white"
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-gray-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold bg-white/5 text-white border border-white/10 py-2.5 rounded-lg text-center"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/login?next=/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold bg-white/5 text-white border border-white/10 py-2.5 rounded-lg text-center"
              >
                Log In
              </Link>
            )}
            <Link
              to="/start"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center text-xs font-semibold bg-[#C4A484] text-black py-2.5 rounded-lg"
            >
              Get started
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-base text-white">
                👁️
              </div>
              <span className="text-lg font-bold tracking-tighter text-[#F2F2F2]">
                GODS<span className="text-[#C4A484]">EYE</span>
              </span>
            </div>
            <p className="text-xs text-white/50 font-light leading-relaxed">
              An AI agent that orchestrates a fleet of agents to run your business. It manages clients, content, orders, and analytics — all through conversation.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://x.com/GodseyeHQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GodsEye on X (Twitter)"
                title="Follow @GodseyeHQ on X"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#C4A484] hover:border-[#C4A484]/50 transition-all"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/digitalhustlerx/GodseyeHQ"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GodsEye on GitHub"
                title="GodsEye on GitHub"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#C4A484] hover:border-[#C4A484]/50 transition-all"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>

            <div className="text-[10px] text-white/40 font-mono">
              © 2026 GodsEye. All rights reserved.
            </div>
          </div>

          <div className="space-y-3.5 text-left md:pl-8">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Product</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li><Link to="/" className="hover:text-[#C4A484] transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-[#C4A484] transition-colors">Features</Link></li>
              <li><Link to="/agents/lead-gen" className="hover:text-[#C4A484] transition-colors">Hire an Agent</Link></li>
              <li><Link to="/pricing" className="hover:text-[#C4A484] transition-colors">Pricing</Link></li>
              <li><Link to="/start" className="hover:text-[#C4A484] transition-colors">Get Started</Link></li>
              <li><Link to="/community/" className="hover:text-[#C4A484] transition-colors">Living with Agents</Link></li>
              <li><Link to="/docs" className="hover:text-[#C4A484] transition-colors">Docs</Link></li>
            </ul>
          </div>

          <div className="space-y-3.5 text-left">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Works With</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li><span className="text-white/40">WordPress</span></li>
              <li><span className="text-white/40">WooCommerce</span></li>
              <li><span className="text-white/40">Elementor</span></li>
              <li><span className="text-white/40">Telegram</span></li>
            </ul>
          </div>

          <div className="space-y-3.5 text-left">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Security & Compliance</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li><span className="text-white/40">Application Passwords (no admin access)</span></li>
              <li><span className="text-white/40">Real-time site monitoring</span></li>
              <li><span className="text-white/40">Model Context Protocol support</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCheckoutModal(false); setCheckoutEmail(""); } }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => { setShowCheckoutModal(false); setCheckoutEmail(""); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#C4A484]/20 flex items-center justify-center mx-auto">
                <Coins className="w-5 h-5 text-[#C4A484]" />
              </div>
              <h2 className="text-xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                <span className="text-[#C4A484]">{selectedPlan.name}</span> Plan
              </h2>
              <div>
                <span className="text-3xl font-black text-white">{selectedPlan.price}</span>
                <span className="text-xs text-white/50 font-light ml-1">/month</span>
              </div>
              <p className="text-[11px] text-white/60 font-light">{selectedPlan.credits} credits/mo · {selectedPlan.sites}</p>
              {user && (
                <p className="text-[11px] text-[#C4A484] font-medium">
                  Logged in as {checkoutEmail || user.email}
                </p>
              )}
            </div>

            <form onSubmit={handleCreateCheckout} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#C4A484] font-mono uppercase font-bold mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all"
                />
              </div>
              {!user && (
                <p className="text-[10px] text-white/40 text-center font-light">
                  Tip: <Link to="/login?next=/pricing" className="text-[#C4A484] hover:text-[#d9c4af]">log in</Link> first to attach your subscription to an account.
                </p>
              )}

              <button
                type="submit"
                disabled={checkoutLoading || !checkoutEmail}
                className="w-full bg-[#C4A484] hover:bg-[#b59574] disabled:opacity-40 text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Pay Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-white/40 text-center font-light">
                Secure checkout. You'll get a receipt by email.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { PRICING_PLANS };
