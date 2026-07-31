import { Link } from "react-router-dom";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { PRICING_PLANS } from "../mockData";

const HERO_SLIDES = [
  {
    badge: "From Private Beta to Public Release",
    h1: <>Your site's AI agent.<br /><span className="italic text-[#C4A484]">Everything, by just talking.</span></>,
    p: "GodsEye is an all-in-one agent for your WordPress site. Content creation, store management, security monitoring, automations — all through conversation in Telegram. Instead of buying another plugin, just ask."
  },
  {
    badge: "Stop Buying Plugins. Just Ask.",
    h1: <>One agent replaces<br /><span className="italic text-[#C4A484]">a dozen tools.</span></>,
    p: "SEO tools, form builders, analytics dashboards, automation plugins — GodsEye replaces them all. The average WordPress site spends $1,200+/yr on plugins. You just need one."
  },
  {
    badge: "Proactive, Not Reactive",
    h1: <>Your site heals itself<br /><span className="italic text-[#C4A484]">before you know it's broken.</span></>,
    p: "Real-time security monitoring catches broken pages, plugin conflicts, and slowdowns before they cost you customers. While others react to problems, you're already ahead."
  }
];

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const FAQS = [
    {
      q: "How does GodsEye work?",
      a: "GodsEye is an AI agent that connects to your WordPress site through a lightweight plugin. Instead of logging into wp-admin and clicking through menus, you just tell your agent what to do in Telegram — write posts, check orders, update prices, monitor security. It handles it."
    },
    {
      q: "Is it secure to connect my site?",
      a: "Yes. GodsEye uses WordPress Application Passwords — your main admin password is never shared or stored. The connection is encrypted via HTTPS, and the plugin restricts operations to safe, standard WordPress APIs."
    },
    {
      q: "What can the agent actually do?",
      a: "Everything you'd do in wp-admin, plus things no plugin can do: write content, analyze your store data, monitor security, set up automations, suggest improvements, and build features on request. If you can describe it, GodsEye can probably do it."
    },
    {
      q: "Do I need to find my Telegram User ID?",
      a: "No. When you sign up, your Telegram account is linked automatically. Just start the bot and follow the prompts."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, from your account dashboard. Remaining credits stay in your wallet and never expire."
    },
    {
      q: "What is God Mode?",
      a: "Everything unlimited plus a dedicated VPS, your own API keys, and full server architecture control. Perfect for agencies and power users who want full control."
    },
    {
      q: "How is this different from hiring a WordPress developer?",
      a: "A developer charges $50-150/hour and takes hours to respond. GodsEye handles the same tasks instantly, 24/7, for a fraction of the cost. It also catches problems before they happen — something no developer does."
    },
    {
      q: "Can I use it with Claude Desktop, Cursor, or ChatGPT?",
      a: "Yes. GodsEye supports the Model Context Protocol (MCP). Power users can expose their WordPress site directly inside AI clients like Claude Desktop, Cursor, or developer IDEs."
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Slider */}
      <section className="px-4 pt-16 md:pt-24 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Current Slide with fade transition */}
          <div key={currentSlide} className="space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
              <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
              <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono font-bold">{HERO_SLIDES[currentSlide].badge}</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2] mb-4 font-display">
              {HERO_SLIDES[currentSlide].h1}
            </h1>

            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-light">
              {HERO_SLIDES[currentSlide].p}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/start"
                className="w-full sm:w-auto bg-[#F2F2F2] text-[#0A0A0A] hover:bg-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center"
              >
                💬 Start Free
              </Link>
              <Link
                to="/features"
                className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F2F2] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center"
              >
                See How It Works
              </Link>
            </div>

            <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold font-mono">
              No credit card required • 50 free credits every month • Cancel anytime
            </p>
          </div>

          {/* Slide Navigation Dots */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentSlide ? "w-8 bg-[#C4A484]" : "w-3 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Simple Steps</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
              Setup in under 60 seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">01</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">⬇️ Install the Plugin</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Download the GodsEye plugin, upload it to your WordPress dashboard, and activate it.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">02</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">💬 Connect via Telegram</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Send <code className="bg-white/5 px-2 py-1 rounded text-[#C4A484] text-[10px] font-mono border border-white/10">/connect</code> to the bot and follow the prompt.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">03</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">⚡ Chat to Manage</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Send messages like "Make a draft post on AI trends" or "Show WooCommerce stats."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-4 max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            One agent. Everything your site needs.
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-light">
            GodsEye replaces a dozen plugins and tools. Content, commerce, security, automations — all handled by one agent that never sleeps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">🧠</div>
            <h4 className="text-sm font-semibold text-white">Content Creator</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Give it a topic — it writes the post, formats it, and schedules it. Blog posts, product descriptions, landing page copy. No blank page, no writer's block.
            </p>
          </div>
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">🛒</div>
            <h4 className="text-sm font-semibold text-white">Store Manager</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Check orders, update products, adjust prices, generate coupons. Run your entire WooCommerce store through conversation.
            </p>
          </div>
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">🛡️</div>
            <h4 className="text-sm font-semibold text-white">Proactive Security</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Monitors your site health 24/7. Catches broken pages, plugin conflicts, and slowdowns before they cost you sales. Recalibrates automatically.
            </p>
          </div>
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">⚡</div>
            <h4 className="text-sm font-semibold text-white">Automations</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Set recurring tasks in plain English. "Every Monday, draft a roundup post." "Alert me when stock drops below 10." Your site runs itself.
            </p>
          </div>
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">📊</div>
            <h4 className="text-sm font-semibold text-white">Business Analyst</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Ask "How's my store doing?" and get a real answer. GodsEye synthesizes your dashboard data into plain-English insights and recommendations.
            </p>
          </div>
          <div className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
            <div className="text-xl">🎨</div>
            <h4 className="text-sm font-semibold text-white">Visual Editor</h4>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Change prices, update text, swap images on your landing pages. No builder UI, no clicking through menus. Just tell it what to change.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link to="/features" className="text-xs text-[#C4A484] hover:text-[#b59574] font-semibold uppercase tracking-wider">
            Explore all features →
          </Link>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-4 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Simple Billing</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Flexible plans for any scale
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-light">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.filter(p => p.id !== 'free').map((plan) => (
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
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-white/50 font-light">/month</span>
                  </div>
                </div>
                <div className="py-3 border-y border-white/10">
                  <div className="text-[#C4A484] font-bold text-xs uppercase tracking-wider">{plan.credits} Credits/mo</div>
                  <div className="text-[11px] text-white/60 font-light mt-1">{plan.sites}</div>
                </div>
                <ul className="space-y-2 text-[11px] text-white/75 font-light">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C4A484] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4">
                <Link to="/pricing" className={`block text-center w-full ${plan.isPopular ? 'bg-[#C4A484] hover:bg-[#b59574] text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'} text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full transition-all`}>
                  Get {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/pricing" className="text-xs text-[#C4A484] hover:text-[#b59574] font-semibold uppercase tracking-wider">
            See full comparison →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 max-w-4xl mx-auto space-y-12">
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
              <div key={idx} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                <button onClick={() => setExpandedFaq(isOpen ? null : idx)} className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer">
                  <span className="text-xs md:text-sm font-semibold text-white/90 tracking-tight pr-4">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#C4A484]" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-white/60 leading-relaxed font-light border-t border-white/10">{faq.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C4A484]/5 rounded-full blur-3xl"></div>

          <h3 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2] max-w-2xl mx-auto" style={{ fontFamily: "'Georgia', serif" }}>
            Take control of your WordPress site.
          </h3>
          <p className="text-xs md:text-sm text-white/60 leading-relaxed max-w-xl mx-auto font-light">
            Connect your site in 60 seconds. Get 50 free credits every month. No credit card, no developers, no setup fees.
          </p>
          <div className="pt-3">
            <Link to="/start" className="inline-flex items-center gap-2 bg-[#F2F2F2] text-[#0A0A0A] hover:bg-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95">
              💬 Start Free
            </Link>
          </div>
          <div className="flex justify-center gap-6 pt-4 text-[10px] text-white/40 font-mono uppercase tracking-wider">
            <span>Secure payment • Cancel anytime</span>
            <span>•</span>
            <span>Unused credits roll over</span>
          </div>
        </div>
      </section>
    </div>
  );
}
