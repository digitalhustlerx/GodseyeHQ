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

export default function FeaturesPage() {
  const headingStyle = { fontFamily: "'Georgia', serif" } as const;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      {/* HERO */}
      <section className="px-4 py-16 max-w-7xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs tracking-widest uppercase border border-[#C4A484]/40 text-[#C4A484] rounded-full">
          Capabilities
        </span>
        <h1
          style={headingStyle}
          className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
        >
          One agent. Everything your site needs.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-white/70">
          GodsEye replaces a dozen plugins and tools. Content, commerce,
          security, automations — all handled by one agent that never sleeps.
        </p>
      </section>

      {/* FEATURE GRID */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#121212] border border-white/10 rounded-2xl p-8 transition-colors hover:border-[#C4A484]/40"
            >
              <div className="text-4xl mb-4">{feature.emoji}</div>
              <h3
                style={headingStyle}
                className="text-xl font-semibold text-[#C4A484]"
              >
                {feature.title}
              </h3>
              <p className="mt-3 text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PARADIGM SHIFT SECTION */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl p-8">
            <h3
              style={headingStyle}
              className="text-2xl font-semibold text-red-400 mb-6"
            >
              The Old Way
            </h3>
            <ul className="space-y-4">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-1 shrink-0">✕</span>
                  <span className="text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* GodsEye Way */}
          <div className="bg-[#121212] border border-[#C4A484]/40 rounded-2xl p-8">
            <h3
              style={headingStyle}
              className="text-2xl font-semibold text-[#C4A484] mb-6"
            >
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

      {/* COST SAVINGS SECTION */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2
            style={headingStyle}
            className="text-3xl md:text-4xl font-bold text-[#C4A484]"
          >
            One tool. Zero plugins to buy.
          </h2>
          <p className="mt-6 text-lg text-white/70 leading-relaxed">
            The average WordPress site runs 15+ plugins at $50-200/year each.
            SEO tools, form builders, analytics dashboards, automation plugins —
            GodsEye replaces them all. Instead of buying a feature, just ask for
            it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-white/50">
              Plugins
            </p>
            <p className="mt-3 text-4xl md:text-5xl font-bold text-red-400">
              $1,200+
            </p>
            <p className="mt-2 text-white/60">/yr saved vs buying individual plugins</p>
          </div>
          <div className="bg-[#121212] border border-[#C4A484]/40 rounded-2xl p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-[#C4A484]">
              GodsEye
            </p>
            <p
              style={headingStyle}
              className="mt-3 text-4xl md:text-5xl font-bold text-[#C4A484]"
            >
              $9
            </p>
            <p className="mt-2 text-white/60">/mo GodsEye</p>
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA ANALYTICS SECTION */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-7 h-7 text-[#C4A484]" />
            <h3
              style={headingStyle}
              className="text-2xl md:text-3xl font-semibold text-[#C4A484]"
            >
              Social Media Analytics (Pro)
            </h3>
          </div>
          <p className="text-white/70 leading-relaxed max-w-3xl">
            Connect your social accounts through our managed integrations. Get
            cross-platform analytics, content performance insights, and trending
            topics for your niche — all through conversation. No developer keys
            needed. Available on Pro and God Mode plans.
          </p>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-16 max-w-7xl mx-auto text-center">
        <h2
          style={headingStyle}
          className="text-3xl md:text-5xl font-bold text-[#F2F2F2]"
        >
          Ready to replace your plugin stack?
        </h2>
        <Link
          to="/pricing"
          className="inline-block mt-8 px-8 py-4 bg-[#C4A484] text-[#0A0A0A] font-semibold rounded-full transition-colors hover:bg-[#D4B494]"
        >
          View Plans
        </Link>
      </section>
    </div>
  );
}
