import { Link } from "react-router-dom";
import { Check, TrendingUp } from "lucide-react";

const features = [
  { emoji: "🧠", title: "Content Creator", desc: "Give it a topic — it writes the post, formats it, and schedules it. Blog posts, product descriptions, landing page copy. No blank page, no writer's block." },
  { emoji: "🛒", title: "Store Manager", desc: "Check orders, update products, adjust prices, generate coupons. Run your entire WooCommerce store through conversation." },
  { emoji: "🛡️", title: "Proactive Security", desc: "Monitors your site health 24/7. Catches broken pages, plugin conflicts, and slowdowns before they cost you sales. Recalibrates automatically to keep things running." },
  { emoji: "⚡", title: "Automations", desc: "Set recurring tasks in plain English. \"Every Monday morning, draft a roundup post.\" \"Alert me when stock drops below 10.\" Your site runs itself." },
  { emoji: "📊", title: "Business Analyst", desc: "Ask \"How's my store doing?\" and get a real answer. GodsEye synthesizes your dashboard data into plain-English insights and recommendations." },
  { emoji: "🎨", title: "Visual Editor", desc: "Change prices, update text, swap images on your landing pages. No builder UI, no clicking through menus. Just tell it what to change." }
];

export default function FeaturesPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* HERO */}
      <section className="px-4 pt-16 md:pt-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
            <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono font-bold">Capabilities</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2]">
            One agent.<br />
            <span className="italic text-[#C4A484]">Everything your site needs.</span>
          </h1>
          <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-light">
            GodsEye replaces a dozen plugins and tools. Content, commerce, security, automations — all handled by one agent that never sleeps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/pricing" className="w-full sm:w-auto bg-[#C4A484] hover:bg-[#b59574] text-black font-bold text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-full transition-all">
              View Plans
            </Link>
            <Link to="/start" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-[#F2F2F2] font-bold text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-full transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID — exact Gemini card styling */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 transition-all hover:bg-white/5">
              <div className="text-xl">{f.emoji}</div>
              <h4 className="text-sm font-semibold text-white">{f.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARADIGM SHIFT — Gemini exact */}
      <section className="px-4 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Why Switch?</span>
            <h2 className="font-display text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]">
              Why pay for multiple tools<br />
              <span className="italic text-[#C4A484]">when you can have all of them?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Way */}
            <div className="bg-white/[0.01] border border-red-500/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-xs font-bold">✕</div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90">The Old Way</h4>
                  <p className="text-[11px] text-white/40 font-mono">Slow, fragile, expensive</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs font-light text-white/60">
                <li className="flex gap-2"><span className="text-red-500/60 mt-0.5">•</span><span>30 minutes clicking through dashboard layers for a simple typo fix.</span></li>
                <li className="flex gap-2"><span className="text-red-500/60 mt-0.5">•</span><span>$100/hr developer tickets for basic content updates.</span></li>
                <li className="flex gap-2"><span className="text-red-500/60 mt-0.5">•</span><span>Finding out a page is broken only when a customer complains.</span></li>
                <li className="flex gap-2"><span className="text-red-500/60 mt-0.5">•</span><span>15+ plugins eating your budget and slowing your site down.</span></li>
              </ul>
            </div>
            {/* GodsEye Way */}
            <div className="bg-[#C4A484]/[0.02] border border-[#C4A484]/20 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center text-[#C4A484] text-xs">★</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F2F2F2]">The GodsEye Way</h4>
                  <p className="text-[11px] text-[#C4A484]/70 font-mono">Fast, streamlined, one agent</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs font-light text-white/80">
                <li className="flex gap-2"><span className="text-[#C4A484] mt-0.5">•</span><span>Type "fix the pricing on homepage" — done instantly. No menus.</span></li>
                <li className="flex gap-2"><span className="text-[#C4A484] mt-0.5">•</span><span>Your agent is ready 24/7, no waiting on developers.</span></li>
                <li className="flex gap-2"><span className="text-[#C4A484] mt-0.5">•</span><span>Proactive monitoring catches issues before customers do.</span></li>
                <li className="flex gap-2"><span className="text-[#C4A484] mt-0.5">•</span><span>One agent replaces a dozen plugins. Save $1,200+/yr.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COST SAVINGS — streamlined as you requested */}
      <section className="px-4 max-w-4xl mx-auto text-center space-y-8">
        <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Cost Comparison</span>
        <h2 className="font-display text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]">
          One tool. <span className="italic text-[#C4A484]">Zero plugins to buy.</span>
        </h2>
        <p className="text-sm text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
          Why pay for 15+ plugins when one agent does it all? GodsEye replaces SEO tools, form builders, analytics dashboards, and automation plugins. Instead of buying a feature, just ask.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">Plugins Replaced</p>
            <p className="mt-3 text-5xl font-bold text-[#F2F2F2]">15+</p>
          </div>
          <div className="bg-[#121212] border border-[#C4A484]/40 rounded-2xl p-8 text-center">
            <p className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">Your Cost</p>
            <p className="mt-3 text-5xl font-bold text-[#C4A484]">$9</p>
            <p className="mt-2 text-xs text-white/50">/month</p>
          </div>
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">Cost of Alternatives</p>
            <p className="mt-3 text-5xl font-bold text-[#F2F2F2]">$1,200+</p>
            <p className="mt-2 text-xs text-white/50">/year</p>
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA ANALYTICS */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 space-y-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-[#C4A484]" />
            <h3 className="text-sm font-semibold text-white">Social Media Analytics</h3>
            <span className="bg-[#C4A484]/20 text-[#C4A484] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#C4A484]/30 uppercase tracking-wider">Pro</span>
          </div>
          <p className="text-xs text-white/60 font-light leading-relaxed max-w-3xl">
            Connect your social accounts through our managed integrations. Get cross-platform analytics, content performance insights, and trending topics for your niche — all through conversation. No developer keys needed. Available on Pro and God Mode plans.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C4A484]/5 rounded-full blur-3xl"></div>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2] max-w-2xl mx-auto">
            Ready to replace <span className="italic text-[#C4A484]">your plugin stack?</span>
          </h2>
          <p className="text-xs text-white/60 font-light max-w-xl mx-auto">
            Pick a plan that fits your site. No lock-in. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/pricing" className="w-full sm:w-auto bg-[#F2F2F2] text-[#0A0A0A] hover:bg-white text-[10px] uppercase tracking-widest font-bold px-8 py-3.5 rounded-full transition-all">
              View Plans
            </Link>
            <Link to="/start" className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F2F2] text-[10px] uppercase tracking-widest font-bold px-8 py-3.5 rounded-full transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
