import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, Send, MessageSquare, Zap, ShieldCheck } from "lucide-react";

/**
 * AgentPage — master template for all /agents/* buyer pages.
 *
 * One component, driven by config. Every page is a "front door" into the same
 * core: Telegram agent, hire one → it spins up a team. Same design tokens as
 * the rest of the site (#0A0A0A bg, #C4A484 gold, Georgia display, Inter body).
 *
 * To add a new agent page: add a config to AGENT_PAGES and a <Route> in App.tsx.
 */
export interface AgentPageConfig {
  /** slug used for /agents/<slug> */
  slug: string;
  /** badge readout (e.g. "HIRE AN AGENT FOR") */
  badge: string;
  /** the headline framing */
  h1: string;
  /** gold subline */
  h2: string;
  /** body copy under the hero */
  body: string;
  /** 3 featured needs → what this agent does for them (max 3, shown as cards) */
  needs: { icon: string; title: string; desc: string }[];
  /** how people use it */
  how: string[];
  /** who this is for */
  forWho: string[];
  /** bottom hook */
  outro: string;
}

const AGENT_PAGES: AgentPageConfig[] = [
  {
    slug: "lead-gen",
    badge: "Hire an agent for leads",
    h1: "Hire one agent. It finds you real leads, every day, while you do anything else.",
    h2: "24/7. On Telegram. Choose a plan when you're ready.",
    body:
      "A lead agent doesn't wait for you to look. It hunts every day — finding people who need what you sell, reaching out for you, and keeping every opportunity warm until it closes. You just answer when it brings you a buyer.",
    needs: [
      {
        icon: "🎯",
        title: "Finds your buyers",
        desc: "It scans where your customers are and surfaces the ones most likely to buy — ranked, ready, no guesswork.",
      },
      {
        icon: "✍️",
        title: "Reaches out for you",
        desc: "It drafts and sends the outreach in your voice, follows up on schedule, and never lets a lead go cold.",
      },
      {
        icon: "📈",
        title: "Turns interest into cash",
        desc: "It tracks every conversation, nudges you the moment a prospect is hot, and keeps the deal moving forward.",
      },
    ],
    how: [
      "Pick the lead-gen profile (or tell it your niche in your own words).",
      "Talk to it on Telegram — it learns your offer, your voice, your market.",
      "It works 24/7. You approve outreach and close the deals it brings you.",
    ],
    forWho: [
      "Agencies & freelancers who need a steady flow of clients",
      "Founders selling B2B — who hate cold outreach but need it done",
      "Creators turning followers into paying customers",
    ],
    outro:
      "Stop waiting for leads to find you. Hire the agent that goes and gets them.",
  },
  {
    slug: "team",
    badge: "Hire a team that runs your business",
    h1: "Hire one agent. It spins up a team that runs your whole business.",
    h2: "The agent is your chief of staff. It orchestrates the rest.",
    body:
      "You're not hiring a tool — you're hiring a chief of staff. One intelligent entity that understands your business, breaks the work into pieces, spawns the right agents for each one, and coordinates them so you don't have to. You give it the goal. It runs the operation.",
    needs: [
      {
        icon: "🧠",
        title: "Your chief of staff",
        desc: "One agent holds the whole picture — your goals, your voice, your priorities — and directs every other agent around them.",
      },
      {
        icon: "👥",
        title: "Spawns its own team",
        desc: "Needs a writer, a client manager, a social poster? It spins each one up, briefed and on task, working in unison.",
      },
      {
        icon: "🔄",
        title: "Coordinates everything",
        desc: "No agent works in a silo. They report back, sync with each other, and hand off work — all inside your Telegram.",
      },
    ],
    how: [
      "Hire your chief of staff and tell it the goal in plain language.",
      "It builds the plan and spawns the specialist agents to execute it.",
      "You approve direction; the team runs the details 24/7.",
    ],
    forWho: [
      "Owners who are the bottleneck — too much to run solo",
      "Businesses growing past one person but not ready for full hires",
      "Founders who want leverage without the payroll",
    ],
    outro:
      "You don't need another employee. You need a chief of staff that commands a team of agents.",
  },
  {
    slug: "home",
    badge: "Hire an agent for your home & life",
    h1: "Hire an agent that runs your home — and automates your life.",
    h2: "One intelligent entity. Your private network. Your systems. Alive 24/7.",
    body:
      "Extend the same idea beyond business. Hire an agent that manages your home automation, builds and protects your private network, and runs the systems of your life — so your environment adapts to you instead of the other way around.",
    needs: [
      {
        icon: "🏠",
        title: "Home automation",
        desc: "Lights, climate, security, settings — your agent learns your routines and runs them automatically.",
      },
      {
        icon: "🔐",
        title: "Private network",
        desc: "It builds and maintains your own secure network for your devices and automations — no big-tech cloud dependency.",
      },
      {
        icon: "✨",
        title: "Life management",
        desc: "Health, schedules, tasks — one agent that keeps the moving parts of your life handled, agentically.",
      },
    ],
    how: [
      "Hire a home agent and connect your devices and systems.",
      "It audits what you have and proposes automations that actually help.",
      "Sit back — it runs your home and life 24/7, adjusting as you change.",
    ],
    forWho: [
      "Smart-home owners who want it to just work",
      "People who value owning their own private systems",
      "Anyone who'd rather direct their life than operate it",
    ],
    outro:
      "Hire an intelligent entity to manage aspects of your life agentically — automating your life like never before.",
  },
];

/* ─────────────────────────── the shared page ─────────────────────────── */

export function AgentPage({ slug }: { slug: string }) {
  const cfg = AGENT_PAGES.find((p) => p.slug === slug) as AgentPageConfig;

  return (
    <div className="px-4 py-14 md:py-20 max-w-6xl mx-auto">
      {/* Badge + back */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-[#C4A484] transition-colors mb-8"
        >
          <ArrowRight className="w-3 h-3 rotate-180" /> Back to everything
        </Link>
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-[#C4A484] font-medium">
            <Sparkles className="w-3.5 h-3.5" /> {cfg.badge}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-light tracking-tighter text-[#F2F2F2] leading-tight mb-5">
          {cfg.h1}
        </h1>
        <p className="text-lg text-[#C4A484] font-display italic mb-5">{cfg.h2}</p>
        <p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
          {cfg.body}
        </p>
      </div>

      {/* CTA — top */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
        <Link
          to="https://app.digitalhustlerx.com/signup"
          className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all active:scale-95 shadow-md"
        >
          Hire this agent <ArrowRight className="w-4 h-4" />
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
          Choose a plan when you're ready · No code · Live in Telegram
        </span>
      </div>

      {/* Featured needs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {cfg.needs.map((n) => (
          <div
            key={n.title}
            className="bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-[#C4A484]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
          >
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-4">
              {n.icon}
            </div>
            <h3 className="text-base font-semibold text-[#F2F2F2] mb-1.5">{n.title}</h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">{n.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="font-display text-2xl font-light text-[#F2F2F2] mb-6 text-center">
          How you <span className="italic text-[#C4A484]">get started</span>
        </h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {cfg.how.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-[#121212] border border-white/10 rounded-xl p-5"
            >
              <span className="w-8 h-8 rounded-full bg-[#C4A484]/15 border border-[#C4A484]/30 flex items-center justify-center font-mono text-xs text-[#C4A484] font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-white/70 font-light leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who it's for */}
      <div className="mb-16">
        <h2 className="font-display text-2xl font-light text-[#F2F2F2] mb-6 text-center">
          Built for
        </h2>
        <div className="max-w-2xl mx-auto space-y-2.5">
          {cfg.forWho.map((w) => (
            <div key={w} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#C4A484] mt-0.5 shrink-0" />
              <p className="text-sm text-white/70 font-light">{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center mb-16">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <MessageSquare className="w-3.5 h-3.5 text-[#C4A484]" /> Communicate with your agent on Telegram
        </span>
        <span className="hidden sm:inline text-white/20">·</span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <Zap className="w-3.5 h-3.5 text-[#C4A484]" /> Alive 24/7, 365
        </span>
        <span className="hidden sm:inline text-white/20">·</span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C4A484]" /> No-code developer
        </span>
      </div>

      {/* Outro + CTA */}
      <div className="text-center bg-[#121212] border border-[#C4A484]/20 rounded-2xl p-10">
        <h2 className="font-display text-2xl md:text-3xl font-light text-[#F2F2F2] leading-snug mb-2">
          {cfg.outro}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-6">
          Plan details available after signup
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="https://app.digitalhustlerx.com/signup"
            className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all active:scale-95 shadow-md"
          >
            Hire this agent <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#F2F2F2] text-xs uppercase tracking-widest font-bold px-8 py-4 rounded-full transition-all cursor-pointer"
          >
            See pricing
          </Link>
        </div>
      </div>

      {/* Fallback deep-link CTA */}
      <div className="mt-6 text-center">
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-[#C4A484] transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Start from a niche profile template instead
        </Link>
      </div>
    </div>
  );
}
