import { useState, useEffect, FormEvent } from "react";
import { MockWPState, ActiveView } from "./types";
import { INITIAL_WP_STATE, PRICING_PLANS } from "./mockData";
import WaitlistModal from "./components/WaitlistModal";
import WordPressDashboard from "./components/WordPressDashboard";
import LivePlayground from "./components/LivePlayground";
import { 
  Download, 
  CreditCard, 
  ArrowRight, 
  Check, 
  Menu, 
  X, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Coins
} from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [wpState, setWpState] = useState<MockWPState>(INITIAL_WP_STATE);
  const [lastActionType, setLastActionType] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PRICING_PLANS[0] | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Success state from query params
  const [successInfo, setSuccessInfo] = useState<{ checkoutId: string; productName: string } | null>(null);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistSession, setWaitlistSession] = useState<{ email: string; signupDate: string; isFounder: boolean; referralCode?: string } | null>(null);

  // Restore waitlist session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("godseye_waitlist_session");
    if (stored) {
      try {
        setWaitlistSession(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const urlRefParam = new URLSearchParams(window.location.search).get("ref") || undefined;

  // Parse checkout success query params from browser URL if simulated
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout_success") === "true") {
      const checkoutId = params.get("checkout_id") || "MOCK-1002";
      let productName = "Selected Plan";
      
      setSuccessInfo({ checkoutId, productName });
      setActiveView('success');
      
      // Clean up search parameters without full reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCreateCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setCheckoutLoading(true);

    const productId = selectedPlan.polarProductId;

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          email: checkoutEmail
        })
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      console.error(err);
      // Fallback checkout simulation
      window.location.href = `?checkout_success=true&checkout_id=sim_err_${Date.now()}&product_id=${selectedPlan.id}`;
    } finally {
      setCheckoutLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleOpenCheckout = (plan: typeof PRICING_PLANS[0]) => {
    setSelectedPlan(plan);
    setCheckoutEmail("");
    setShowCheckoutModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const FAQS = [
    {
      q: "How does GodsEye work?",
      a: "GodsEye connects your WordPress site's REST API with a secure Telegram Agent. When you send messages to the agent, they are parsed by our natural-language gateway, authenticated using your WordPress application password, and securely executed on your site via a lightweight custom-made WordPress plugin."
    },
    {
      q: "Is it secure to connect my site?",
      a: "Absolutely. GodsEye uses WordPress Application Passwords, meaning your main admin password is never shared or stored. The connection is encrypted via HTTPS and processed through our secure gateway, and the plugin strictly restricts operations to standard rest-capabilities with 20+ active security filters."
    },
    {
      q: "What operations can the AI Agent perform?",
      a: "You can manage posts & pages (create, edit drafts, publish), manage installed plugins (activate/deactivate), monitor WooCommerce e-commerce orders, edit basic Elementor visual content blocks (like updating headers and pricing fields), check overall site health, and browse or upload media files directly through your Telegram interface!"
    },
    {
      q: "What counts as a credit?",
      a: "1 credit corresponds exactly to 1 parsed command or message sent to your agent. If the agent doesn't understand your command, no credits are deducted."
    },
    {
      q: "Do monthly plan credits roll over?",
      a: "Yes! All unused credits from active Starter, Pro, and Agency subscriptions roll over and accumulate into your wallet month-over-month. Credits never expire as long as you have an active account."
    },
    {
      q: "How is GodsEye different from hiring a WordPress developer?",
      a: "A developer charges $50 to $150/hour for basic edits like toggling plugin states, changing pricing cards, or creating draft placeholders. GodsEye performs these tasks instantly, 24/7, for just a tiny fraction of the cost, eliminating delays and context switching."
    },
    {
      q: "Can I use it with custom AI clients like Claude or ChatGPT?",
      a: "Yes! The GodsEye agent plugin supports the Model Context Protocol (MCP). Power users can easily expose their secure WP-MCP endpoint directly inside Claude Desktop, ChatGPT, or developer IDEs like Cursor."
    },
    {
      q: "Where do I retrieve my Telegram User ID?",
      a: "Simply open Telegram, search for the user info bot `@userinfobot` or `@RawDataBot`, and send any message. It will immediately reply with your unique numerical Telegram User ID (e.g., `5829104`). Enter this ID in our checkout screen to instantly sync your subscription credits."
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes. You can manage or cancel your subscription instantly through our Polar.sh billing panel. If you cancel, your remaining credits will remain in your Telegram wallet and will not be lost."
    },
    {
      q: "What happens if the Agent can't fulfill a complex request?",
      a: "The WordPress REST API has certain boundaries (like not being able to modify your PHP configurations, access raw server files, or bulk-delete databases). If your request exceeds REST boundaries, the agent will politely explain the limitations and outline what you can do instead."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#C4A484]/30 selection:text-[#d9c4af]">
      
      {/* Top Banner Warning for Development SSL Restoration */}
      <div className="bg-white/5 border-b border-white/10 text-center py-2.5 px-4 text-xs font-mono text-[#C4A484] uppercase tracking-widest">
        👁️ GodsEye v2.0 Operational Environment • Payments Securely Powered by Polar.sh
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveView('landing')} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-display text-lg text-white shadow-md">
              👁️
            </div>
            <span className="text-xl font-bold tracking-tighter text-[#F2F2F2]">
              GODS<span className="text-[#C4A484]">EYE</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.2em] font-medium text-gray-400">
            {waitlistSession && (
            <button 
              onClick={() => setActiveView('playground')} 
              className="hover:text-[#C4A484] transition-colors cursor-pointer"
            >
              Sandbox
            </button>
            )}
            <button 
              onClick={() => { setActiveView('landing'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 50); }} 
              className="hover:text-[#C4A484] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => { setActiveView('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50); }} 
              className="hover:text-[#C4A484] transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                if (!waitlistSession) {
                  setShowWaitlistModal(true);
                } else {
                  window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                }
              }}
              className="text-[10px] uppercase tracking-widest font-bold bg-[#F2F2F2] hover:bg-white text-[#0A0A0A] px-6 py-3 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              Start Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3.5 flex flex-col">
            {waitlistSession && (
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('landing'); setTimeout(() => document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' }), 50) }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              Playground
            </button>
            )}
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('landing'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 50) }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              Features
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50) }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              Pricing Plans
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('landing'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 50) }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              FAQ
            </button>
            {waitlistSession && (
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('dashboard'); }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              Dashboard
            </button>
            )}
            {waitlistSession && (
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('playground'); }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left"
            >
              Sandbox
            </button>
            )}
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('download'); }} 
              className="text-xs font-medium text-gray-400 hover:text-white text-left flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Plugin
            </button>
            {waitlistSession && (
            <button 
              onClick={() => { setMobileMenuOpen(false); setActiveView('landing'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50) }} 
              className="flex-1 text-center text-xs font-medium bg-[#13131e] border border-gray-800 text-gray-300 py-2.5 rounded-lg"
            >
              Plans
            </button>
            )}
            <button
              onClick={() => {
                if (!waitlistSession) {
                  setShowWaitlistModal(true);
                } else {
                  window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                }
              }}
              className="flex-1 text-center text-xs font-semibold bg-indigo-600 text-white py-2.5 rounded-lg"
            >
              Start Free
            </button>
            </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1">
        
        {/* VIEW 3: WAITLIST PAGE */}
        {activeView === 'waitlist' && (
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-20">
            {/* Top Announcement Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full text-[10px] uppercase tracking-widest text-[#C4A484] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4A484] animate-pulse"></span>
                Tested in Private Discord Beta &bull; Launching Telegram V2
              </div>
            </div>

            {/* Display Header */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-[#F2F2F2] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                The end of clunky dashboards. <br />
                <span className="italic text-[#C4A484]">WordPress, managed by pure conversation.</span>
              </h1>
              <p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
                As a solopreneur, your focus belongs on building products and driving sales—not fighting nested menus, fixing broken plugins, or paying developers $100/hour for minor content updates. GodsEye converts your entire site into an active participant in your Telegram chat.
              </p>
            </div>

            {/* Waitlist Subscription Card */}
            <div className="max-w-xl mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C4A484] to-transparent opacity-50"></div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-[#F2F2F2]">Reserve Your Spot in Telegram V2.0</h3>
                <p className="text-xs text-white/50 font-light">
                  Join hundreds of independent creators stepping away from the classic WP-admin.
                </p>
              </div>

              {!waitlistSubmitted ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); setWaitlistSubmitted(true); }}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <input 
                    type="email" 
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C4A484]/50 font-light"
                  />
                  <button type="submit" className="bg-[#C4A484] text-black font-bold px-8 py-3.5 rounded-full text-[11px] uppercase tracking-widest transition-all hover:bg-[#b59574] active:scale-95 whitespace-nowrap">
                    Join Waiting List
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 text-green-400 mb-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-[#C4A484] font-medium text-sm">Welcome aboard—your AI developer is ready!</p>
                  <p className="text-xs text-white/50 font-light">We've reserved your place. Waves of beta invites are sent out weekly.</p>
                </div>
              )}

              <div className="pt-2 text-center text-[10px] text-white/40 font-mono">
                No credit card required. Free 500 initial command credits upon activation.
              </div>
            </div>

            {/* Old Way vs New Way Section */}
            <div className="space-y-8">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-medium font-mono">The Paradigm Shift</span>
                <h2 className="text-2xl md:text-4xl font-light text-[#F2F2F2] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  A clean break from tradition
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* The Old Way Card */}
                <div className="bg-white/[0.01] border border-red-500/10 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-xs font-bold">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white/90">The Old Way of WP Management</h4>
                      <p className="text-[11px] text-white/40 font-mono">Slow, fragile, and high maintenance</p>
                    </div>
                  </div>

                  <ul className="space-y-4 text-xs font-light text-white/60">
                    <li className="flex gap-2">
                      <span className="text-red-500/60 mt-0.5">&bull;</span>
                      <span>Spending 30 minutes clicking through infinite dashboard layers to fix a simple copy typo or toggle a broken script.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500/60 mt-0.5">&bull;</span>
                      <span>Hiring expensive developers or waiting hours on support tickets for standard updates, layout edits, or plugin configurations.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500/60 mt-0.5">&bull;</span>
                      <span>No real-time awareness—finding out a page layout is broken only when a user complains or checkout rates drop.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500/60 mt-0.5">&bull;</span>
                      <span>Frustrating, bloated menus that slow down your browser and fill your screen with heavy, unhelpful notifications.</span>
                    </li>
                  </ul>
                </div>

                {/* The GodsEye Way Card */}
                <div className="bg-[#C4A484]/[0.02] border border-[#C4A484]/20 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center text-[#C4A484] text-xs">
                      ★
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F2F2F2]">The GodsEye Autonomous Way</h4>
                      <p className="text-[11px] text-[#C4A484]/70 font-mono">Fast, streamlined, and direct</p>
                    </div>
                  </div>

                  <ul className="space-y-4 text-xs font-light text-white/80">
                    <li className="flex gap-2">
                      <span className="text-[#C4A484] mt-0.5">&bull;</span>
                      <span>Send a voice note or type: <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] text-[#C4A484]">"fix the title copy on home page"</code> and it's updated instantly.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C4A484] mt-0.5">&bull;</span>
                      <span>Fully sovereign: works with standard WordPress self-hosted setups (including cPanel, VPS, or premium hosts) through safe, lightweight APIs.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C4A484] mt-0.5">&bull;</span>
                      <span>No complex setup. GodsEye automatically spawns specialized sub-agents to draft layout revisions, run tests, and publish changes.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C4A484] mt-0.5">&bull;</span>
                      <span>Configure deep automations, automated daily blog draft schedules, and smart traffic alerts instantly from your text console.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why This Exists / Tested background */}
            <div className="border-t border-white/5 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <span className="text-[#C4A484] text-xs font-mono">01 / DISCORD TRIALS</span>
                <h4 className="text-base font-medium text-[#F2F2F2]">Proven in the wild</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Version 1.0 of GodsEye was a private agent on Discord. Over 15,000 automated commands successfully updated real sites, and our core parsing engine grew bulletproof.
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[#C4A484] text-xs font-mono">02 / TELEGRAM PORTABILITY</span>
                <h4 className="text-base font-medium text-[#F2F2F2]">Built for real builders</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Version 2.0 migrates this battle-tested parsing intelligence directly to Telegram, offering you complete control over your business, whether on your desktop or waiting in line at a cafe.
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[#C4A484] text-xs font-mono">03 / SOVEREIGN AUTONOMY</span>
                <h4 className="text-base font-medium text-[#F2F2F2]">Sovereign WordPress Hosting</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Keep your database, your cPanel server, and your content. GodsEye doesn't lock you into a proprietary hosting platform. You remain the sole owner of your hard work.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* VIEW 4: DASHBOARD (CENTRAL AI CHAT) */}
        {activeView === 'dashboard' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h2 className="text-3xl font-light text-white text-center">GodsEye Central</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LivePlayground 
                wpState={wpState} 
                setWpState={setWpState} 
                setLastActionType={setLastActionType} 
              />
              <WordPressDashboard 
                wpState={wpState} 
                setWpState={setWpState} 
                lastActionType={lastActionType} 
                setLastActionType={setLastActionType} 
              />
            </div>
          </div>
        )}

        {/* VIEW 5: PLAYGROUND (WP ADMIN REPRESENTATION) */}
        {activeView === 'playground' && (
          <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-light text-white text-center mb-8">WordPress Admin Sandbox</h2>
            <WordPressDashboard 
              wpState={wpState} 
              setWpState={setWpState} 
              lastActionType={lastActionType} 
              setLastActionType={setLastActionType} 
            />
          </div>
        )}
        
        {/* VIEW 1: LANDING PAGE */}
        {activeView === 'landing' && (
          <div className="space-y-24 pb-20">
            <section className="px-4 pt-16 md:pt-24 max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
                  <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
                  <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono font-bold">2026 WordPress Orchestration Engine</span>
                </div>
                
                <h1 className="text-5xl md:text-8.5xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2] mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                  Manage WordPress<br />
                  <span className="italic text-[#C4A484]">by just talking.</span>
                </h1>
                
                <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-light">
                  GodsEye connects your site to AI. Manage posts, plugins, and content just by sending a simple message in Telegram. No complicated menus—just talk to your site.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    if (!waitlistSession) {
                      setShowWaitlistModal(true);
                    } else {
                      window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                    }
                  }}
                  className="w-full sm:w-auto bg-[#F2F2F2] text-[#0A0A0A] hover:bg-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center cursor-pointer"
                >
                  💬 Start Free
                </button>
                  <button 
                    onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F2F2] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center cursor-pointer"
                  >
                    See How It Works
                  </button>
                </div>
                
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold font-mono">
                  Instantly activated inside Telegram • No credit card required • No setup fees
                </p>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how" className="px-4 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-y border-white/10 scroll-mt-24">
              <div className="max-w-7xl mx-auto space-y-14">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Simple Steps</span>
                  <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                    Setup in under 60 seconds
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-display font-light text-base">
                      01
                    </div>
                    <h3 className="text-sm uppercase tracking-wider font-semibold text-white">⬇️ Install the Plugin</h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Download the GodsEye plugin (v1.0.5), upload it to your WordPress dashboard, and activate it.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-display font-light text-base">
                      02
                    </div>
                    <h3 className="text-sm uppercase tracking-wider font-semibold text-white">💬 Connect via Telegram</h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Send <code className="bg-white/5 px-2 py-1 rounded text-[#C4A484] text-[10px] font-mono border border-white/10">/connect</code> to <code className="bg-white/5 px-1 py-0.5 rounded text-[#C4A484] text-[10px] font-mono border border-white/10">@GodseyeXbot</code> and follow the instant prompt.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-display font-light text-base">
                      03
                    </div>
                    <h3 className="text-sm uppercase tracking-wider font-semibold text-white">⚡ Chat to Manage</h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      You are set! Send messages in natural language like "Make a draft post on AI trends" or "Show WooCommerce stats."
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features List Section */}
            <section id="features" className="px-4 max-w-7xl mx-auto space-y-14 scroll-mt-24">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Capabilities</span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                  Real REST API integrations, not mockups
                </h2>
                <p className="text-xs md:text-sm text-white/60 font-light">
                  Unlike simulated landing pages, the real GodsEye plugin integrates directly with active WordPress core frameworks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">📝</div>
                  <h4 className="text-sm font-semibold text-white">Posts & Pages</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Create, retrieve, edit, publish, or delete posts and pages directly. Draft concepts automatically through standard workflows.
                  </p>
                </div>

                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">🔌</div>
                  <h4 className="text-sm font-semibold text-white">Plugin Management</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Safely activate or deactivate any installed plugin on your WordPress instance without having to navigate multiple menus.
                  </p>
                </div>

                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">🛒</div>
                  <h4 className="text-sm font-semibold text-white">WooCommerce Support</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Monitor product inventory, look up order statuses, query transaction summaries, or generate coupon discounts.
                  </p>
                </div>

                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">🎨</div>
                  <h4 className="text-sm font-semibold text-white">Elementor Block Edits</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Instantly update key visual strings on your Elementor builder block, edit product pricing lines, or clone page designs.
                  </p>
                </div>

                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">🩺</div>
                  <h4 className="text-sm font-semibold text-white">Site Health Check</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Query underlying PHP parameters, core WordPress version updates, active plugin lists, SSL security, and gateway latencies.
                  </p>
                </div>

                <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
                  <div className="text-xl">📸</div>
                  <h4 className="text-sm font-semibold text-white">Media Library Sync</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Query existing asset parameters or upload new images directly from your Telegram client into the WordPress media database.
                  </p>
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="px-4 max-w-7xl mx-auto space-y-12 scroll-mt-24">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Simple Billing</span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                  Flexible plans for any scale
                </h2>
                <p className="text-xs md:text-sm text-white/60 font-light">
                  Monthly subscription. Cancel anytime. All plans include full access to every feature.
                </p>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {PRICING_PLANS.filter(p => p.id !== 'free').map((plan) => {
                  const showFounder = waitlistSession?.isFounder && plan.foundersPrice;
                  return (
                  <div 
                    key={plan.id}
                    className={`relative bg-[#121212] rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 ${plan.isPopular ? 'border-[#C4A484] shadow-lg shadow-[#C4A484]/5 ring-1 ring-[#C4A484]/30 bg-gradient-to-br from-[#0A0A0A] to-[#151515]' : 'border-white/10 hover:border-white/20'}`}
                  >
                    {plan.isPopular && (
                      <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#C4A484] text-black font-mono uppercase text-[9px] font-bold px-3 py-1 rounded-full tracking-wider border border-[#b29373]">
                        Most Popular
                      </span>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/50 font-mono">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 mt-2">
                          {showFounder ? (
                            <>
                              <span className="text-3xl font-black text-[#C4A484]">{plan.foundersPrice}</span>
                              <span className="text-sm text-white/40 line-through">{plan.price}</span>
                              <span className="text-xs text-white/50 font-light">/month</span>
                            </>
                          ) : (
                            <>
                              <span className="text-3xl font-black text-white">{plan.price}</span>
                              <span className="text-xs text-white/50 font-light">/month</span>
                            </>
                          )}
                        </div>
                        {showFounder && (
                          <div className="mt-2">
                            <span className="bg-[#C4A484]/20 text-[#C4A484] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#C4A484]/30 uppercase tracking-wider">
                              {plan.foundersBadge} — 50% off for 1 year
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="py-3 border-y border-white/10">
                        <div className="text-[#C4A484] font-bold text-xs flex items-center gap-1 uppercase tracking-wider">
                          <Coins className="w-3.5 h-3.5" />
                          {plan.credits} Credits / mo
                        </div>
                        <div className="text-[11px] text-white/60 font-light mt-1">Allows {plan.sites}</div>
                      </div>

                      <ul className="space-y-2.5 pt-1 text-[11px] text-white/75 font-light">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#C4A484] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10">
                      <button
                        onClick={() => handleOpenCheckout(plan)}
                        className="w-full bg-[#C4A484] hover:bg-[#b59574] text-black text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {showFounder ? "Lock in Founder Pricing" : `Get ${plan.name}`}
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </section>

            {/* FAQ Accordion Section */}
            <section id="faq" className="px-4 max-w-4xl mx-auto space-y-12 scroll-mt-24">
              <div className="text-center space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Knowledge Base</span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-5 py-4.5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                      >
                        <span className="text-xs md:text-sm font-semibold text-white/90 tracking-tight pr-4">
                          {faq.q}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#C4A484]" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-white/60 leading-relaxed font-light border-t border-white/10">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Final Conversion Panel */}
            <section className="px-4 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C4A484]/5 rounded-full blur-3xl"></div>
                
                <h3 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2] max-w-2xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
                  Take control of your WordPress site.
                </h3>
                
                <p className="text-xs md:text-sm text-white/60 leading-relaxed max-w-xl mx-auto font-light">
                  Connect your site in 5 minutes. Get 50 credits every month completely free. No credit card. No developers needed.
                </p>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      if (!waitlistSession) {
                        setShowWaitlistModal(true);
                      } else {
                        window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-[#F2F2F2] text-[#0A0A0A] hover:bg-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    💬 Start Free on Telegram
                  </button>
                </div>
                
                <div className="flex justify-center gap-6 pt-4 text-[10px] text-white/40 font-mono uppercase tracking-wider">
                  <span>Payments processed securely by Polar.sh</span>
                  <span>•</span>
                  <span>Unused credits roll over</span>
                </div>
              </div>
            </section>
          </div>
        )}


        {/* VIEW 3: DOWNLOAD PAGE */}
        {activeView === 'download' && (
          <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display text-xl mx-auto shadow-md">
                ⬇️
              </div>
              <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter" style={{ fontFamily: "'Georgia', serif" }}>
                Download GodsEye Plugin
              </h2>
              <p className="text-xs md:text-sm text-white/60 max-w-lg mx-auto font-light">
                Install the lightweight GodsEye plugin to connect your WordPress site to Telegram. Takes 2 minutes.
              </p>
            </div>

            {/* Downloader Card */}
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-green-950/20 text-green-400 border border-green-900/40 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">
                  Stable v1.0.5 Release
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">godseye-agent.zip</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed max-w-md">
                  Includes full WordPress core REST-API bindings, robust capability safeguards, and support for Model Context Protocol (MCP) clients.
                </p>
                <div className="text-[10px] text-white/40 font-mono">
                  Size: 64 KB • Requirements: PHP 7.4+ / WP 5.0+
                </div>
              </div>

              {/* Sim download click button */}
              <button
                onClick={() => {
                  alert("👁️ GodsEye v1.0.5 package download initiated! In production, this saves the godseye-agent.zip archive file directly to your workspace download folder.");
                }}
                className="w-full md:w-auto shrink-0 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold px-8 py-4 rounded-full text-xs flex items-center justify-center gap-2 tracking-widest uppercase transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download v1.0.5
              </button>
            </div>

            {/* Six Step walk-through guide */}
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
              <h3 className="text-sm font-semibold text-white tracking-tight border-b border-white/10 pb-3 uppercase tracking-wider">
                📖 Installation & Connection Walkthrough
              </h3>

              <div className="space-y-5 text-xs">
                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">01</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Upload Plugin</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Navigate to your WordPress dashboard <code className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-[#C4A484] border border-white/10">Plugins &gt; Add New</code>, choose the downloaded ZIP, and upload it.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">02</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Activate Agent</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Click "Activate Plugin" to securely register the GodsEye API namespace inside your WordPress core.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">03</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Generate App Password</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Go to <code className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-[#C4A484] border border-white/10">Users &gt; Profile</code>, scroll down to "Application Passwords", input "GodsEye Agent" and click generate. Copy the 24-character code.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">04</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Search Telegram Bot</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Open your invite link in Telegram to start chatting with the bot.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">05</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Execute Connection</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Send the command <code className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-[#C4A484] border border-white/10">/connect</code>. Paste your site URL, your username, and the generated Application Password as prompted.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-white/5 text-[#C4A484] border border-white/20 flex items-center justify-center font-mono shrink-0 mt-0.5">06</div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Start Managing!</h4>
                    <p className="text-white/60 leading-relaxed font-light mt-1">Your site is now successfully linked. Test the connection by sending "Check site health" or "Show latest draft pages".</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Context Protocol (MCP) Setup Box */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#C4A484] flex items-center gap-2 uppercase tracking-wide">
                ⚙️ Model Context Protocol (MCP) Setup
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                For developers and power-users, GodsEye turns your WordPress site into a compliant <strong>MCP Server</strong>. You can connect it directly to AI clients like Claude Desktop, Cursor, or ChatGPT.
              </p>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-[11px] text-[#F2F2F2] space-y-2">
                <div className="text-white/40">// Expose WordPress inside claude_desktop_config.json</div>
                <div>{"{"}</div>
                <div className="pl-4">"mcpServers": {"{"}</div>
                <div className="pl-8">"godseye-wordpress": {"{"}</div>
                <div className="pl-12">"command": "node",</div>
                <div className="pl-12">"args": ["/path/to/godseye-mcp.js", "--url", "https://mysite.com", "--user", "admin", "--pass", "xxxx-xxxx"]</div>
                <div className="pl-8">{"}"}</div>
                <div className="pl-4">{"}"}</div>
                <div>{"}"}</div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button 
                onClick={() => setActiveView('landing')}
                className="text-xs text-[#C4A484] hover:text-[#b59574] font-semibold cursor-pointer underline uppercase tracking-wider"
              >
                ← Back to Landing Page
              </button>
            </div>
          </div>
        )}


        {/* VIEW 4: SUCCESS PAGE */}
        {activeView === 'success' && successInfo && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
              ✅
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter" style={{ fontFamily: "'Georgia', serif" }}>
                Purchase Successful!
              </h2>
              <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed">
                Thank you for upgrading! Your transaction was processed via Polar.sh and your credit wallet has been topped up instantly on the GodsEye network.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-left space-y-4 font-mono text-[11px] text-[#F2F2F2]">
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">PRODUCT UPGRADE:</span>
                <span className="font-bold text-[#C4A484] text-right">{successInfo.productName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-white/40">ORDER TRACKING ID:</span>
                <span className="text-white/80">{successInfo.checkoutId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">GATEWAY SYNC STATUS:</span>
                <span className="text-[#C4A484] font-bold">CREDITS SECURELY PROVISIONED ✅</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">🚀 Next Steps</h3>
              <p className="text-xs text-white/60 font-light leading-relaxed max-w-sm mx-auto">
                Open Telegram and send the bot the command <code className="bg-white/5 px-2 py-0.5 rounded text-[#C4A484] border border-white/10 font-mono">/credits</code>, and verify your new credit balance!
              </p>
              
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (!waitlistSession) {
                      setShowWaitlistModal(true);
                    } else {
                      window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold text-xs px-8 py-4 rounded-full shadow-md tracking-widest uppercase transition-all active:scale-95"
                >
                  Start Chatting on Telegram
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => { setSuccessInfo(null); setActiveView('landing'); }}
                className="text-xs text-white/40 hover:text-white/60 underline font-medium cursor-pointer"
              >
                Go back to Landing Home
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & copyright */}
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
              GodsEye AI assistant integration for standard WordPress site REST API networks. Secure, credit-driven, and lightning fast.
            </p>
            <div className="text-[10px] text-white/40 font-mono">
              © 2026 GodsEye. All rights reserved.
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3.5 text-left md:pl-8">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Product</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li>
                <button onClick={() => { setActiveView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#C4A484] transition-colors cursor-pointer">
                  Product Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('download')} className="hover:text-[#C4A484] transition-colors cursor-pointer">
                  Download Plugin
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('landing'); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#C4A484] transition-colors cursor-pointer">
                  View Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Core Integrations */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Integrations</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li>
                <button
                  onClick={() => {
                    if (!waitlistSession) {
                      setShowWaitlistModal(true);
                    } else {
                      window.open("https://t.me/GodseyeXbot?start=connect", "_blank");
                    }
                  }}
                  className="hover:text-[#C4A484] transition-colors text-left cursor-pointer"
                >
                  Telegram Bot
                </button>
              </li>
              <li>
                <span className="text-white/40 font-mono text-[11px]">Caddy Reverse Proxy Live</span>
              </li>
              <li>
                <span className="text-white/40 font-mono text-[11px]">Polar.sh Sandbox Billing</span>
              </li>
            </ul>
          </div>

          {/* Legal / Billing details */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-[10px] font-semibold text-[#C4A484] tracking-wider uppercase font-mono">Security & Compliance</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li>
                <span className="text-white/40">No admin password access</span>
              </li>
              <li>
                <span className="text-white/40">Model Context Protocol active</span>
              </li>
              <li>
                <span className="text-white/40">Deduplicated billing channels</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <WaitlistModal
        open={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
        onSuccess={(session) => {
          setWaitlistSession(session);
          localStorage.setItem("godseye_waitlist_session", JSON.stringify(session));
          setShowWaitlistModal(false);
        }}
        referralParam={urlRefParam}
      />

      {/* Checkout Modal */}
      {showCheckoutModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowCheckoutModal(false); setCheckoutEmail(""); }}}>
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
              {waitlistSession?.isFounder && selectedPlan.foundersPrice && (
                <div className="inline-block bg-[#C4A484]/20 text-[#C4A484] text-[9px] font-mono font-bold px-3 py-1 rounded-full border border-[#C4A484]/30 uppercase tracking-wider">
                  Founder — 50% off: {selectedPlan.foundersPrice}/mo
                </div>
              )}
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
                    Pay with Polar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-white/40 text-center font-light">
                Secure payment via Polar.sh. No account needed. You'll get a receipt by email.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
