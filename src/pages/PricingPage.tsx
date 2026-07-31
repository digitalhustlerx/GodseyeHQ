import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { PRICING_PLANS } from '../mockData';

const FAQ = [
  {
    q: 'What counts as a credit?',
    a: '1 credit = 1 command or message sent to your agent. If it does not understand, no credits deducted.',
  },
  {
    q: 'Do credits roll over?',
    a: 'Yes. Unused credits from active subscriptions roll over month to month. They never expire.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, from your account dashboard. Remaining credits stay in your wallet.',
  },
  {
    q: 'How is this different from hiring a developer?',
    a: 'A developer charges $50-150/hr. GodsEye handles the same tasks instantly, 24/7, for a fraction of the cost.',
  },
  {
    q: 'What is God Mode?',
    a: 'Everything unlimited plus a dedicated VPS, your own API keys, and full server architecture control. Perfect for agencies and power users.',
  },
];

const CREDIT_PACKS = [
  { name: 'Wallet Top-Up', price: '$10', credits: '100' },
  { name: 'Starter Pack', price: '$9', credits: '500' },
  { name: 'Pro Pack', price: '$29', credits: '2,000' },
];

// Comparison table rows. 'text' => display as string, 'check' => ✓, 'dash' => —
type Cell = { type: 'check' } | { type: 'dash' } | { type: 'text'; value: string };

const COMPARISON_ROWS: { feature: string; free: Cell; starter: Cell; pro: Cell; godmode: Cell }[] = [
  { feature: 'Monthly Credits', free: { type: 'text', value: '50' }, starter: { type: 'text', value: '500' }, pro: { type: 'text', value: '2,000' }, godmode: { type: 'text', value: '10,000' } },
  { feature: 'WordPress Sites', free: { type: 'text', value: '1' }, starter: { type: 'text', value: '1' }, pro: { type: 'text', value: '3' }, godmode: { type: 'text', value: '10' } },
  { feature: 'Post & Page Management', free: { type: 'check' }, starter: { type: 'check' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Store Overview', free: { type: 'text', value: '✓ (read-only)' }, starter: { type: 'text', value: '✓ (full)' }, pro: { type: 'text', value: '✓ (full)' }, godmode: { type: 'text', value: '✓ (full)' } },
  { feature: 'Visual Editor (Elementor)', free: { type: 'dash' }, starter: { type: 'check' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Content Creation', free: { type: 'dash' }, starter: { type: 'check' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Proactive Security Monitoring', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Automations & Recurring Tasks', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Business Analytics', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Social Media Analytics', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'check' }, godmode: { type: 'check' } },
  { feature: 'Dedicated VPS', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'dash' }, godmode: { type: 'check' } },
  { feature: 'Bring Your Own API Keys', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'dash' }, godmode: { type: 'check' } },
  { feature: 'Full Server Control', free: { type: 'dash' }, starter: { type: 'dash' }, pro: { type: 'dash' }, godmode: { type: 'check' } },
  { feature: 'Rate Priority', free: { type: 'text', value: 'Standard' }, starter: { type: 'text', value: 'Standard' }, pro: { type: 'text', value: 'Priority' }, godmode: { type: 'text', value: 'Unlimited' } },
];

function renderCell(cell: Cell) {
  if (cell.type === 'check') {
    return <Check className="mx-auto h-4 w-4 text-[#C4A484]" />;
  }
  if (cell.type === 'dash') {
    return <span className="text-white/40">—</span>;
  }
  return <span className="text-[#F2F2F2]">{cell.value}</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4.5 flex items-center justify-between text-left cursor-pointer"
      >
        <span className="text-xs md:text-sm font-semibold text-white/90 tracking-tight pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#C4A484] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 text-xs text-white/60 leading-relaxed font-light border-t border-white/10">
          {a}
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const paidPlans = PRICING_PLANS.filter((p) => p.id !== 'free');

  return (
    <div className="bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/80 font-bold">
              Simple Billing
            </span>
          </div>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Plans for every stage.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {paidPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col bg-[#121212] border rounded-3xl p-8 ${
                plan.isPopular ? 'border-[#C4A484]' : 'border-white/10'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C4A484] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A] font-bold">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/50">/month</span>
              </div>
              <p className="mt-2 text-sm text-[#C4A484]">{plan.credits} Credits/mo</p>
              <p className="mt-1 text-sm text-white/50">{plan.sites}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-white/75 font-light">
                    <Check className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-[#C4A484]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => (window as any).godseyeCheckout(plan)}
                className={`mt-8 w-full ${
                  plan.isPopular
                    ? 'bg-[#C4A484] hover:bg-[#b59574] text-black text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-full text-[10px] uppercase tracking-widest font-bold'
                }`}
              >
                Get {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* FEATURE COMPARISON TABLE */}
        <div className="mt-24">
          <h2 className="font-display text-center text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]">Compare Plans</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse overflow-hidden rounded-xl bg-[#121212] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-4 text-left font-semibold text-white/70">Feature</th>
                  <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-4 text-center font-semibold text-white/70">Free</th>
                  <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-4 text-center font-semibold text-white/70">Starter</th>
                  <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-4 text-center font-semibold text-white/70">Pro</th>
                  <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-4 text-center font-semibold text-[#C4A484]">God Mode</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-white/10 last:border-0">
                    <td className="px-4 py-3 text-left text-white/80">{row.feature}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.free)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.starter)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.pro)}</td>
                    <td className="px-4 py-3 text-center">{renderCell(row.godmode)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREDIT PACKS SECTION */}
        <div className="mt-24">
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-6 w-6 text-[#C4A484]" />
            <h3 className="font-display text-2xl md:text-3xl font-light tracking-tighter text-[#F2F2F2]">Need more credits? Top up anytime.</h3>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.name}
                className="flex flex-col items-center bg-[#121212] border border-white/10 rounded-3xl p-8 text-center"
              >
                <Coins className="h-8 w-8 text-[#C4A484]" />
                <p className="mt-4 text-3xl font-bold">{pack.price}</p>
                <p className="mt-2 text-sm text-white/60">{pack.credits} credits</p>
                <button
                  type="button"
                  onClick={() =>
                    (window as any).godseyeCheckout({
                      name: pack.name,
                      price: pack.price,
                      credits: pack.credits,
                    })
                  }
                  className="mt-6 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
                >
                  Buy {pack.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="mt-24">
          <h2 className="font-display text-center text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]">Frequently Asked Questions</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                <FAQItem q={item.q} a={item.a} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 border-t border-white/10 pt-12 text-center space-y-3">
          <p className="text-xs text-white/50 font-light">Still have questions?</p>
          <Link
            to="/docs"
            className="text-xs text-[#C4A484] hover:text-[#b59574] font-semibold uppercase tracking-wider"
          >
            Read the docs →
          </Link>
        </div>
      </div>
    </div>
  );
}
