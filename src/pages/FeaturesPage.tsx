import { Link } from 'react-router-dom';
import { Check, TrendingUp } from 'lucide-react';

const features = [
  {
    emoji: '🧠',
    title: 'Content Creator',
    description:
      'Give it a topic — it writes the post, formats it, and schedules it. Blog posts, product descriptions, landing page copy.',
  },
  {
    emoji: '🛒',
    title: 'Store Manager',
    description:
      'Check orders, update products, adjust prices, generate coupons. Run your entire WooCommerce store through conversation.',
  },
  {
    emoji: '🛡️',
    title: 'Proactive Security',
    description:
      'Monitors your site health 24/7. Catches broken pages, plugin conflicts, and slowdowns before they cost you sales. Recalibrates automatically.',
  },
  {
    emoji: '⚡',
    title: 'Automations',
    description:
      'Set recurring tasks in plain English. "Every Monday morning, draft a roundup post." "Alert me when stock drops below 10." Your site runs itself.',
  },
  {
    emoji: '📊',
    title: 'Business Analyst',
    description:
      'Ask "How is my store doing?" and get a real answer. GodsEye synthesizes your dashboard data into plain-English insights and recommendations.',
  },
  {
    emoji: '🎨',
    title: 'Visual Editor',
    description:
      'Change prices, update text, swap images on your landing pages. No builder UI, no clicking through menus. Just tell it what to change.',
  },
];

const oldWay = [
  '30 minutes clicking through dashboard layers for a typo',
  '$100/hr developer tickets for basic updates',
  'Finding out a page is broken when a customer complains',
  '15+ plugins eating your budget and slowing your site',
];

const godsEyeWay = [
  'Type "fix the pricing on homepage" — done instantly',
  'Your agent is ready 24/7, no waiting on developers',
  'Proactive monitoring catches issues before customers do',
  'One agent replaces a dozen plugins. Save $1,200+/yr.',
];

const stats = [
  { label: 'Plugins', value: '15+', suffix: 'tools replaced', gold: false },
  { label: 'Hours saved', value: '40+', suffix: 'hrs/month', gold: false },
  { label: 'Cost', value: '$9', suffix: '/mo instead of $1,200+/yr', gold: true },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* HERO */}
      <section className="px-4 py-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
          <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
          <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono font-bold">
            Capabilities
          </span>
        </div>

        <h1 className="font-display mt-8 text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2]">
          One agent.
          <br />
          <span className="italic text-[#C4A484]">Everything your site needs.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/60 leading-relaxed font-light">
          GodsEye replaces a dozen plugins and tools. Content, commerce,
          security, automations — all handled by one agent that never sleeps.
        </p>
      </section>

      {/* FEATURE GRID */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#121212] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20"
            >
              <div className="text-4xl mb-4">{feature.emoji}</div>
              <h3 className="font-display text-xl font-semibold text-[#C4A484]">
                {feature.title}
              </h3>
              <p className="mt-3 text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PARADIGM SHIFT */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">
            Why switch?
          </span>
          <h2 className="font-display mt-4 text-4xl md:text-5xl font-light tracking-tighter leading-tight text-[#F2F2F2]">
            Old tools vs.{' '}
            <span className="italic text-[#C4A484]">one conversation</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl p-8">
            <h3 className="font-display text-2xl font-semibold text-red-400 mb-6">
              The Old Way
            </h3>
            <ul className="space-y-4">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-1 shrink-0">✕</span>
                  <span className="text-white/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* GodsEye Way */}
          <div className="bg-[#121212] border border-white/10 hover:border-white/20 rounded-2xl p-8 transition-colors">
            <h3 className="font-display text-2xl font-semibold text-[#C4A484] mb-6">
              The GodsEye Way
            </h3>
            <ul className="space-y-4">
              {godsEyeWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#C4A484] mt-0.5 shrink-0" />
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* COST SAVINGS */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">
            cost comparison
          </span>
          <h2 className="font-display mt-4 text-4xl md:text-5xl font-light tracking-tighter leading-tight text-[#F2F2F2]">
            One tool.{' '}
            <span className="italic text-[#C4A484]">Zero plugins to buy.</span>
          </h2>
          <p className="mt-6 text-lg text-white/60 leading-relaxed font-light">
            The average WordPress site runs 15+ plugins at $50–200/year each.
            SEO tools, form builders, analytics dashboards, automation plugins —{' '}
            GodsEye replaces them all. Instead of buying a feature, just ask for it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-[#121212] border rounded-2xl p-8 text-center transition-colors ${
                stat.gold
                  ? 'border-[#C4A484]/40'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold font-mono text-white/40">
                {stat.label}
              </p>
              <p
                className={`mt-3 text-5xl md:text-6xl font-bold tracking-tight ${
                  stat.gold ? 'text-[#C4A484]' : 'text-[#F2F2F2]'
                }`}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-white/50 text-sm">{stat.suffix}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL MEDIA ANALYTICS */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-[#C4A484]" />
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#C4A484]">
                Social Media Analytics
              </h3>
            </div>
            <span className="w-fit px-3 py-1 bg-[#C4A484]/10 text-[#C4A484] text-[10px] uppercase tracking-widest font-semibold font-mono rounded-full border border-[#C4A484]/20">
              Pro
            </span>
          </div>
          <p className="text-white/60 leading-relaxed max-w-3xl">
            Connect your social accounts through our managed integrations. Get
            cross-platform analytics, content performance insights, and trending
            topics for your niche — all through conversation. No developer keys
            needed. Available on Pro and God Mode plans.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 max-w-7xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-light tracking-tighter leading-tight text-[#F2F2F2]">
          Ready to replace{' '}
          <span className="italic text-[#C4A484]">your plugin stack?</span>
        </h2>
        <p className="mt-6 text-lg text-white/60 leading-relaxed font-light max-w-xl mx-auto">
          Pick a plan that fits your site. No lock-in. Cancel anytime.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/pricing"
            className="w-full sm:w-auto bg-[#C4A484] hover:bg-[#b59574] text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center"
          >
            View Plans
          </Link>
          <Link
            to="/start"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-[#F2F2F2] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center"
          >
            Try Free
          </Link>
        </div>
      </section>
    </div>
  );
}
