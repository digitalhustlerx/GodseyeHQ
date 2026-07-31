import { useState, FormEvent, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { PRICING_PLANS } from "../mockData";
import { PricingPlan } from "../types";
import { Menu, X, Coins, ArrowRight, RefreshCw } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const location = useLocation();

  const handleOpenCheckout = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const handleCreateCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !checkoutEmail) return;
    setCheckoutLoading(true);
    // TODO: Wire to Flutterwave via Composio
    setTimeout(() => {
      setCheckoutLoading(false);
      setShowCheckoutModal(false);
      setCheckoutEmail("");
      window.location.href = `/start?upgraded=${selectedPlan.id}`;
    }, 1500);
  };

  // Expose checkout handler globally so page components can trigger it
  if (typeof window !== "undefined") {
    (window as any).godseyeCheckout = handleOpenCheckout;
  }

  const navLinks = [
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/docs", label: "Docs" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#C4A484]/30 selection:text-[#d9c4af]">
      {/* Top Banner */}
      <div className="bg-white/5 border-b border-white/10 text-center py-2.5 px-4 text-xs font-mono text-[#C4A484] uppercase tracking-widest">
        👁️ GodsEye v2.0 — From Private Beta to Public Release
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
            <Link
              to="/start"
              className="text-[10px] uppercase tracking-widest font-bold bg-[#F2F2F2] hover:bg-white text-[#0A0A0A] px-6 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              Start Free
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
            <Link
              to="/start"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center text-xs font-semibold bg-[#C4A484] text-black py-2.5 rounded-lg"
            >
              Start Free
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
              Your all-in-one AI agent for WordPress. Content, commerce, security, and automations — all through conversation.
            </p>
            <div className="text-[10px] text-white/40 font-mono">
              © 2026 GodsEye. All rights reserved.
            </div>
          </div>

          <div className="space-y-3.5 text-left md:pl-8">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Product</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li><Link to="/" className="hover:text-[#C4A484] transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-[#C4A484] transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-[#C4A484] transition-colors">Pricing</Link></li>
              <li><Link to="/start" className="hover:text-[#C4A484] transition-colors">Get Started</Link></li>
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
