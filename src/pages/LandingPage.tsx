import { Link, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef, type TouchEvent } from "react";
import { PRICING_PLANS } from "../mockData";
import WaitlistModal from "../components/WaitlistModal";

// ─── HERO SLIDES (Vicky version — plain, human, non-technical) ─────────────
const HERO_SLIDES = [
  {
    // Slide 1 — THE HOOK
    badge: "HIRE AI AGENTS FOR YOUR BUSINESS",
    h1: <>Hire AI agents that work 24 hours, 365 days.<br /><span className="italic text-[#C4A484]">Better reliability than any human.</span></>,
    p: "Your store manager. Your content writer. Your administrator. Your receptionist. Your support agent. Whatever you point it at, it becomes — for less than one part-timer costs. No salaries. No sick days. No drama. Just work, done right, all the time.",
  },
  {
    // Slide 2 — THE CONVERSATION
    badge: "LIVES ON TELEGRAM",
    h1: <>You don't need a website. You don't need a dashboard.<br /><span className="italic text-[#C4A484]">You need someone handling things. So you don't have to.</span></>,
    p: "Everything happens in a group chat — on Telegram, where you already are. Your agent sets it up, sorts your business into sections, and gets to work. Booking clients. Replying to messages. Posting on social. Sending reminders. Tracking orders. You check in when you want. The rest of the time, it's handling things you'd otherwise stress over.",
  },
  {
    // Slide 3 — THE ROLES
    badge: "ONE HIRE. EVERY ROLE.",
    h1: <>It becomes whatever you want it to be.<br /><span className="italic text-[#C4A484]">Point it at a problem. It solves it.</span></>,
    p: "Your receptionist — replying to clients and booking appointments. Your social media manager — posting your work, writing captions, scheduling content. Your administrator — tracking orders, organizing files, sending reminders. Your personal assistant — reminding you, researching for you, handling whatever you throw at it. One agent. Or a fleet of them. Orchestrated, autonomous, always working.",
  },
  {
    // Slide 4 — THE ONE-MAN ARMY
    badge: "BUILT FOR ONE-MAN ARMIES",
    h1: <>You're doing the work of five people.<br /><span className="italic text-[#C4A484]">Now you don't have to.</span></>,
    p: "You sell lashes. You do hair. You run a store. You manage clients. You're the marketing, the admin, the customer service — all at once. Your agent takes every role off your plate. You stay lean. You stay creative. Everything else gets handled — 24/7, 365.",
  },
  {
    // Slide 5 — THE SIMPLE TRUTH
    badge: "BUILD WHATEVER YOU WANT TO BUILD",
    h1: <>Tell it what you need.<br /><span className="italic text-[#C4A484]">It builds it. Handles it. Runs it.</span></>,
    p: "You don't need to be technical. You don't need to understand websites or plugins or dashboards. You just tell your agent what your business does and what you need help with — and it starts. It converses with you, understands your style, and gets to work. Building whatever you want to build. Handling whatever you don't want to. That's it.",
  },
];

// ─── USE CASE BLOCKS ──────────────────────────────────────────────────────
const USE_CASES = [
  {
    icon: "📱",
    title: "Managing Clients",
    line: "Replying to messages. Booking appointments. Sending reminders. Following up.",
    body: "Your agent handles every conversation — in your tone, on your schedule. Clients get replies in minutes, not hours. You never lose a client to slow response again.",
  },
  {
    icon: "📸",
    title: "Social Media",
    line: "Posts your work. Writes captions. Schedules content. Tracks engagement.",
    body: "Your Instagram, TikTok, and Facebook run themselves. Your agent posts your work, writes captions that sound like you, and tells you what's getting traction.",
  },
  {
    icon: "📦",
    title: "Orders & Inventory",
    line: "Tracks orders. Updates products. Sends confirmations. Manages stock.",
    body: "Your agent runs your online store from a chat. New orders? Processed. Stock running low? You get a nudge. No spreadsheets. No admin panels. Just ask.",
  },
  {
    icon: "🧾",
    title: "Admin & Organization",
    line: "Files, invoices, receipts, reminders. Nothing falls through the cracks.",
    body: "Your agent keeps everything organized. When something needs attention, it pings you. When something can be handled without you, it just does it.",
  },
  {
    icon: "📊",
    title: "Your Numbers, Explained",
    line: "Ask a question. Get a plain-English answer.",
    body: "\"How's my store doing this month?\" \"Which product is selling best?\" Your agent reads your data and answers like a consultant would — with clear insights, not graphs.",
  },
  {
    icon: "🛡️",
    title: "Always Watching",
    line: "Monitors your business 24/7. Fixes problems before they cost you.",
    body: "Broken page? Fixed before you notice. Slow loading? Caught and reported. You wake up to a message: \"Fixed this overnight. All good.\"",
  },
];

// ─── PROACTIVE NUDGES (the differentiator) ──────────────────────────────────
const NUDGES = [
  "Your top product got 40 new views today. Want me to run a 10% promo for the next 48 hours? Say yes and I'll set it up.",
  "Sarah booked an appointment 3 weeks ago and hasn't been back. Want me to send her a reminder with a 15% return discount?",
  "Your last 3 Instagram posts got 2x more engagement than usual. Want me to post more in that style? I drafted 3 already.",
  "Your store traffic dropped 20% since Tuesday. I checked — your homepage is loading slowly. I can fix it now if you approve.",
];

// ─── AGENT FLEET ───────────────────────────────────────────────────────────
const AGENT_FLEET = [
  { icon: "📝", name: "Content Writer", desc: "Drafts posts, product descriptions, emails" },
  { icon: "📣", name: "Social Manager", desc: "Posts, schedules, tracks engagement" },
  { icon: "🔍", name: "Lead Finder", desc: "Searches for new customers, enriches data, exports lists" },
  { icon: "💬", name: "Support Rep", desc: "Replies to customers, handles tickets, follows up" },
  { icon: "📊", name: "Analyst", desc: "Reads your numbers, explains them, suggests improvements" },
  { icon: "🛡️", name: "Security Watch", desc: "Monitors your site 24/7, fixes issues automatically" },
];

// ─── AUDIENCE BLOCKS ──────────────────────────────────────────────────────
const AUDIENCES = [
  {
    icon: "🧑‍🎨",
    title: "The Craftsperson",
    quote: "I do lashes. I do hair. I don't do spreadsheets.",
    body: "Your agent handles the business side — clients, bookings, social, orders — so you can focus on your craft. No website needed. Just Telegram.",
  },
  {
    icon: "💼",
    title: "The Solopreneur",
    quote: "I'm a one-person army.",
    body: "Your agent fills every seat — receptionist, writer, analyst, admin, support. You stay lean, look professional, and get more done than people with full teams.",
  },
  {
    icon: "🏪",
    title: "The Store Owner",
    quote: "I sell things. Online and off.",
    body: "Your agent processes orders, updates products, manages inventory, runs promos, and reads your sales data to tell you what's working.",
  },
  {
    icon: "🏢",
    title: "The Agency",
    quote: "I manage multiple clients.",
    body: "Spin up dedicated agents per client. White-label the experience. Scale without adding headcount. Every client feels like they have a full team.",
  },
  {
    icon: "💻",
    title: "The Developer",
    quote: "I want to self-host and extend it.",
    body: "Full open-source option. Run it on your own VPS. Bring your own API keys. Extend with MCP. It's your infrastructure, not a black box.",
  },
];

// ─── COST COMPARISON ──────────────────────────────────────────────────────
const COST_COMPARISON = [
  { tool: "Virtual assistant", cost: "$200-500/mo" },
  { tool: "Social media scheduler", cost: "$15-50/mo" },
  { tool: "Email marketing tool", cost: "$20-100/mo" },
  { tool: "Analytics dashboard", cost: "$10-50/mo" },
  { tool: "Customer support tool", cost: "$15-80/mo" },
  { tool: "Website management plugin", cost: "$10-50/mo" },
];

// ─── FAQS ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Do I need a website?",
    a: "No. Your agent works from Telegram alone. If you have a website, it can manage that too — but it's not required.",
  },
  {
    q: "Do I need to be technical?",
    a: "Not at all. If you can send a text message, you can use Godseye. It's just a chat.",
  },
  {
    q: "How is this different from ChatGPT or other AI tools?",
    a: "ChatGPT talks to you. Godseye talks to you AND does the work. It replies to your clients. Posts your content. Processes your orders. Reads your analytics. It doesn't just give advice — it executes.",
  },
  {
    q: "Can it really manage my whole business?",
    a: "It manages the parts you tell it to. Start with one thing — say, replying to clients. When you're comfortable, add more. It scales with you.",
  },
  {
    q: "What if it makes a mistake?",
    a: "You're always in control. It suggests, you approve. And if something goes wrong, it tells you and fixes it. It learns from every interaction.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. You can self-host on your own server with your own keys. Even on our cloud, your data is isolated and never shared. Your business stays your business.",
  },
  {
    q: "What does \"spawn more agents\" mean?",
    a: "When your workload grows, your main agent creates specialists — a content writer, a lead finder, a support rep. They work inside your group chat, handle specific tasks, and report back to you.",
  },
  {
    q: "How fast does it start?",
    a: "Immediately. Plug your domain in (or skip it), and your agent is ready in your Telegram within a minute.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts. No lock-in. Cancel and your agent stops. Your hours don't expire — they're yours.",
  },
  {
    q: "What if I need help?",
    a: "Text your agent. If it can't help, text us. Support is built into the same chat.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GODSEYE-WAITLIST: target launch date for the countdown. Change this one value
// (ISO string) to move the countdown. When null, the countdown section hides.
const LAUNCH_AT = "2026-09-07T00:00:00Z"; // ~30 days out — update as launch firms up

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get("ref") || undefined;
  const [showWaitlist, setShowWaitlist] = useState(
    () => typeof window !== "undefined" && !!refParam
  );

  // GODSEYE-POPUP: floating animated waitlist trigger. Appears after a short
  // delay so it doesn't cover the hero on first paint; hides once the modal opens.
  // Shows the REAL early-adopter spots-left from /api/waitlist/stats (never a fake
  // number), and logs popup_impression / popup_click so we can measure adoption
  // from a clean baseline.
  const [showPopup, setShowPopup] = useState(false);
  const [impressionLogged, setImpressionLogged] = useState(false);
  const [stats, setStats] = useState<null | {
    count: number;
    spotsTotal: number;
    spotsLeft: number;
    pct: number;
    waitlistOpen: boolean;
  }>(null);

  // Fetch real live adoption stats once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/waitlist/stats");
        const d = await r.json();
        if (alive) setStats(d);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  // Entrance + log popup_impression exactly once (self-hosted tracker event).
  useEffect(() => {
    const t = setTimeout(() => {
      setShowPopup(true);
      if (!impressionLogged) {
        setImpressionLogged(true);
        try {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "popup_impression", selector: "waitlist-popup", page: "/" }),
          });
        } catch {}
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [impressionLogged]);

  // GODSEYE-WAITLIST: live countdown to launch. Updates every second.
  const [countdown, setCountdown] = useState(() => {
    const target = new Date(LAUNCH_AT).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: diff <= 0 };
  });

  useEffect(() => {
    const t = setInterval(() => {
      const target = new Date(LAUNCH_AT).getTime();
      const diff = Math.max(0, target - Date.now());
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        done: diff <= 0,
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const goToSlide = useCallback((idx: number, dir: "next" | "prev") => {
    setSlideDir(dir);
    setCurrentSlide(idx);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      setSlideDir("next");
      return (prev + 1) % HERO_SLIDES.length;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      setSlideDir("prev");
      return (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    });
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) nextSlide();
    else prevSlide();
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="space-y-24 pb-20">
      {/* ═══ 1. HERO SLIDER ═══ */}
      <section
        className="px-4 pt-16 md:pt-24 max-w-7xl mx-auto relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Hero ambience layer (Phase 1: sci-fi premium) ── */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="hero-grid absolute inset-0"></div>
          <div className="animate-heroGlow absolute left-1/2 top-[8%] -translate-x-1/2 w-[720px] h-[520px] bg-[#C4A484]/10 rounded-full blur-[120px]"></div>
          <div className="animate-heroGlow absolute left-[12%] top-[28%] w-[340px] h-[340px] bg-[#C4A484]/[0.06] rounded-full blur-[90px]" style={{ animationDelay: "2.5s" }}></div>
          {/* Glowing eye orb */}
          <div className="absolute right-[10%] top-[20%] hidden lg:flex items-center justify-center">
            <div className="relative w-28 h-28">
              <div className="animate-eyePulse absolute inset-0 rounded-full border border-[#C4A484]/40"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C4A484]/25 to-transparent flex items-center justify-center">
                <span className="text-4xl">👁️</span>
              </div>
            </div>
          </div>
          {/* Floating gold dust particles */}
          {[...Array(7)].map((_, i) => (
            <span key={i} className="particle" style={{ left: `${8 + i * 13 + (i % 3) * 5}%`, width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`, animationDuration: `${6 + (i % 4) * 2}s`, animationDelay: `${i * 1.3}s` }}></span>
          ))}
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div key={currentSlide} className={`space-y-8 ${slideDir === "next" ? "animate-slideInNext" : "animate-slideInPrev"}`}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
              <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
              <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono font-bold">{HERO_SLIDES[currentSlide].badge}</span>
            </div>

            <div className="relative">
              <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2] mb-4 font-display">
                {HERO_SLIDES[currentSlide].h1}
              </h1>
              <button onClick={prevSlide} aria-label="Previous slide" className="flex absolute -left-3 sm:-left-8 lg:-left-14 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 text-[#F2F2F2] items-center justify-center transition-all cursor-pointer z-10">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button onClick={nextSlide} aria-label="Next slide" className="flex absolute -right-3 sm:-right-8 lg:-right-14 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 text-[#F2F2F2] items-center justify-center transition-all cursor-pointer z-10">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto font-light">
              {HERO_SLIDES[currentSlide].p}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setShowWaitlist(true)}
                className="btn-shine w-full sm:w-auto bg-[#C4A484] hover:bg-[#b59574] text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md text-center cursor-pointer"
              >
                Get On The Waitlist →
              </button>
              <button
                onClick={() => setShowWaitlist(true)}
                className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 text-[#F2F2F2] px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center cursor-pointer"
              >
                Hire Your Agent
              </button>
            </div>

            <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold font-mono">
              No website required · Just Telegram · First 100 get 50% off for a year
            </p>
          </div>

          {/* Slide Dots */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => goToSlide(idx, idx > currentSlide ? "next" : "prev")} className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? "w-8 bg-[#C4A484]" : "w-3 bg-white/20 hover:bg-white/40"}`} aria-label={`Slide ${idx + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 1.5 COUNTDOWN TO LAUNCH ═══ */}
      <section className="px-4 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-[#C4A484]/25 bg-[#121212] px-6 py-10 text-center space-y-5">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">
            ⏳ Godseye goes live in
          </span>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {[
              { v: countdown.d, label: "Days" },
              { v: countdown.h, label: "Hours" },
              { v: countdown.m, label: "Minutes" },
              { v: countdown.s, label: "Seconds" },
            ].map((b) => (
              <div key={b.label} className="bg-black/40 rounded-2xl border border-white/10 py-4">
                <div className="text-3xl md:text-4xl font-light text-[#F2F2F2] tabular-nums" style={{ fontFamily: "'Georgia', serif" }}>
                  {String(b.v).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono mt-1">{b.label}</div>
              </div>
            ))}
          </div>
          {countdown.done ? (
            <button
              onClick={() => setShowWaitlist(true)}
              className="bg-[#C4A484] text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b59574] transition-all cursor-pointer"
            >
              We're Live — Get Started →
            </button>
          ) : (
            <button
              onClick={() => setShowWaitlist(true)}
              className="bg-[#C4A484] text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b59574] transition-all cursor-pointer"
            >
              Join the Founders List →
            </button>
          )}
          <p className="text-[11px] text-white/40 font-light">
            First <strong className="text-[#C4A484]">100</strong> to join lock in <strong className="text-[#C4A484]">50% off</strong> for their first year.
          </p>
        </div>
      </section>

      {/* ═══ 2. WHAT DO YOU NEED HELP WITH? ═══ */}
      <section className="px-4 max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">What do you need help with?</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Point it there. It starts immediately.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc, i) => (
            <div key={i} className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3.5 hover:bg-white/5 transition-all">
              <div className="text-xl">{uc.icon}</div>
              <h4 className="text-sm font-semibold text-white">{uc.title}</h4>
              <p className="text-xs text-[#C4A484] font-medium leading-relaxed">{uc.line}</p>
              <p className="text-xs text-white/60 leading-relaxed font-light">{uc.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 3. HOW IT WORKS ═══ */}
      <section className="px-4 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">How it works</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
              Three steps. Under 60 seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">01</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">Plug your domain in</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">Tell your agent where your business lives. Got a website? Connect it. Don't have one? No problem — your agent works from Telegram alone.</p>
              <p className="text-[10px] text-white/40 font-mono">Takes 30 seconds</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">02</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">It sets up your space</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">Your agent creates a group chat for your business — organized into sections: Tasks, Customers, Files, Analytics, Settings. Then deploys the right agents.</p>
              <p className="text-[10px] text-white/40 font-mono">Automatic. You don't do anything.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-[#C4A484] flex items-center justify-center font-light text-base">03</div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-white">Just talk to it</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">Text your agent like you'd text a person. Tell it what you need. Ask it questions. Approve its suggestions. It handles the rest — 24/7, 365.</p>
              <p className="text-[10px] text-white/40 font-mono">That's it. You're running.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. THE AGENT THAT DOESN'T WAIT (PROACTIVE NUDGES) ═══ */}
      <section className="px-4 max-w-5xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">This is what makes it different</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            It doesn't just answer.
          </h2>
          <p className="text-base text-[#C4A484] italic">It thinks ahead.</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {NUDGES.map((nudge, i) => (
            <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex items-start gap-3 hover:border-[#C4A484]/30 transition-all">
              <div className="w-8 h-8 rounded-full bg-[#C4A484]/10 border border-[#C4A484]/30 flex items-center justify-center shrink-0 text-sm">💬</div>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-light">{nudge}</p>
            </div>
          ))}
        </div>

        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm text-white/60 leading-relaxed font-light">
            You approve. It's done. That's what it looks like when an agent grows with your business.
          </p>
        </div>
      </section>

      {/* ═══ 5. ONE AGENT OR A WHOLE TEAM (FLEET) ═══ */}
      <section className="px-4 max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Scale on demand</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Start with one. Spawn more when you grow.
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-light">Your agent brings in help when the workload demands it.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {AGENT_FLEET.map((agent, i) => (
            <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl p-5 text-center space-y-2 hover:border-[#C4A484]/30 transition-all">
              <div className="text-2xl">{agent.icon}</div>
              <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
              <p className="text-[10px] text-white/50 leading-snug font-light">{agent.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm text-white/60 leading-relaxed font-light">
            They work inside your group chat. Report back to you. Coordinate with each other. You're the boss. They're your team. All from Telegram.
          </p>
        </div>
      </section>

      {/* ═══ 6. CONNECTS TO WHAT YOU USE (INTEGRATIONS) ═══ */}
      <section className="px-4 py-16 bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-y border-white/10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Integrations</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
              Plug into your stack
            </h2>
            <p className="text-xs text-white/60 font-light">Your agent connects to the tools your business already uses.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {["🌐 WordPress", "🛒 Online Store", "📊 Google Analytics", "📧 Email", "🐦 Social Media", "💬 Customer Support", "🔌 + anything via MCP"].map((int, i) => (
              <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 font-medium">{int}</span>
            ))}
          </div>

          <div className="bg-white/5 border border-[#C4A484]/20 rounded-2xl p-6 max-w-2xl mx-auto mt-8">
            <p className="text-sm text-white/80 font-light">🔒 <strong className="text-[#C4A484]">Your data stays yours.</strong> Self-host on your own server with your own keys. Nothing leaves your infrastructure. Full control. Zero surprises.</p>
          </div>
        </div>
      </section>

      {/* ═══ 7. WHO IS THIS FOR? ═══ */}
      <section className="px-4 max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Who uses Godseye?</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Anyone who runs anything.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCES.map((aud, i) => (
            <div key={i} className="p-6 bg-[#121212] border border-white/10 rounded-2xl space-y-3 hover:bg-white/5 transition-all">
              <div className="text-2xl">{aud.icon}</div>
              <h4 className="text-sm font-semibold text-white">{aud.title}</h4>
              <p className="text-xs text-[#C4A484] italic">"{aud.quote}"</p>
              <p className="text-xs text-white/60 leading-relaxed font-light">{aud.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 8. STOP WASTING MONEY ═══ */}
      <section className="px-4 max-w-4xl mx-auto space-y-14">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Cost comparison</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            One agent replaces all of this.
          </h2>
          <p className="text-xs text-white/60 font-light">The average business pays for tools they barely use.</p>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
          {COST_COMPARISON.map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-4 ${i !== COST_COMPARISON.length - 1 ? "border-b border-white/10" : ""}`}>
              <span className="text-xs md:text-sm text-white/70 font-light">{item.tool}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 line-through font-light">{item.cost}</span>
                <span className="text-xs text-[#C4A484] font-bold">✓ Included</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 py-5 bg-[#C4A484]/5 border-t border-[#C4A484]/20">
            <span className="text-sm font-bold text-white">Total with Godseye</span>
            <span className="text-lg font-black text-[#C4A484]">$9-29/mo</span>
          </div>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm text-white/60 leading-relaxed font-light">
            You're spending hundreds a month on fragmented tools. Godseye replaces all of them for the price of one. And it actually does the work — not just gives you a dashboard to do it yourself.
          </p>
        </div>
      </section>

      {/* ═══ 9. PRICING TEASER ═══ */}
      <section className="px-4 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Hire by the hour. Or put it on retainer.
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-light">Buy hours when you need them. Or keep an agent on standby. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.filter(p => p.id !== 'free').map((plan) => (
            <div key={plan.id} className={`relative bg-[#121212] rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 ${plan.isPopular ? 'border-[#C4A484] shadow-lg shadow-[#C4A484]/5 ring-1 ring-[#C4A484]/30 bg-gradient-to-br from-[#0A0A0A] to-[#151515]' : 'border-white/10 hover:border-white/20'}`}>
              {plan.isPopular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#C4A484] text-black font-mono uppercase text-[9px] font-bold px-3 py-1 rounded-full tracking-wider border border-[#b29373]">Most Popular</span>
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
                  Hire {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono mb-2">Or buy hours</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">1h Trial — $9</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">10h Pack — $69</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">50h Pack — $249</span>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">100h Pack — $399</span>
          </div>
          <Link to="/pricing" className="inline-block mt-4 text-xs text-[#C4A484] hover:text-[#b59574] font-semibold uppercase tracking-wider">See full pricing →</Link>
        </div>
      </section>

      {/* ═══ 10. PLUG IT IN (FORM) ═══ */}
      <section className="px-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4A484]/5 rounded-full blur-3xl"></div>

          <div className="space-y-3 relative">
            <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Get started</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
              Plug it in.
            </h2>
            <p className="text-xs text-white/60 font-light">Tell us what you do. We'll handle the rest.</p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <button onClick={() => setShowWaitlist(true)} className="block w-full bg-[#C4A484] hover:bg-[#b59574] text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer">
              Get My AI Agent →
            </button>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
              No credit card required · Cancel anytime · Your data stays yours
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 11. FAQ ═══ */}
      <section className="px-4 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-semibold font-mono">Questions</span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Questions
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

      {/* ═══ 12. FOOTER ═══ */}
      <section className="px-4 max-w-7xl mx-auto border-t border-white/10 pt-12 pb-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-white/60 font-light italic" style={{ fontFamily: "'Georgia', serif" }}>
            Godseye — your business, running from a chat.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-white/40 font-mono">
            <Link to="/start" className="hover:text-[#C4A484]">How It Works</Link>
            <Link to="/pricing" className="hover:text-[#C4A484]">Pricing</Link>
            <Link to="/features" className="hover:text-[#C4A484]">Features</Link>
            <Link to="/docs" className="hover:text-[#C4A484]">Docs</Link>
          </div>
          <p className="text-[10px] text-white/30 font-mono">© 2026 Godseye. Built by DigitalHustlerX.</p>
        </div>
      </section>

      {/* ═══ FLOATING WAITLIST POPUP ═══
          Animated gold trigger, bottom-right. Entrances after 6s, gently bobs,
          pulses a gold glow, and opens the waitlist modal on click. Hides itself
          once the modal is up so it never overlaps the real form. */}
      {showPopup && !showWaitlist && (
        <button
          onClick={() => {
            setShowPopup(false);
            // GODSEYE-ADOPTION: log the click to the local tracker (real funnel data).
            try {
              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "popup_click", selector: "waitlist-popup", page: "/" }),
              });
            } catch {}
            try {
              const u = (window as any).umami;
              if (u?.track) u.track("waitlist_popup_click");
            } catch {}
            setShowWaitlist(true);
          }}
          aria-label="Join the early-adopter waitlist"
          className="popup-shine animate-popupEntrance fixed bottom-5 right-5 z-40 w-[264px] rounded-2xl border border-[#C4A484]/40 bg-[#0A0A0A]/95 p-3 text-left shadow-2xl backdrop-blur-md hover:border-[#C4A484] transition-colors cursor-pointer"
        >
          {/* Top row: eye icon + live spots badge */}
          <div className="flex items-center gap-3">
            <span className="animate-popupFloat flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C4A484] text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-[#C4A484] uppercase tracking-widest font-mono">
                {stats && stats.spotsLeft > 0
                  ? <>🔸 {stats.spotsLeft} early-adopter {stats.spotsLeft === 1 ? "spot" : "spots"} left</>
                  : <>🚀 Waitlist open</>}
              </span>
              <span className="block text-[13px] text-white/90 font-light leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                {stats && stats.spotsLeft > 0
                  ? <>First <span className="text-[#C4A484]">{stats.spotsTotal}</span> lock in the founder rate.</>
                  : <>Join the list for launch-day priority access.</>}
              </span>
            </span>
          </div>

          {/* Real adoption progress bar — only meaningful while spots remain */}
          {stats && stats.spotsLeft > 0 && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#C4A484] transition-all duration-700"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] uppercase tracking-widest text-white/40 font-mono">
                {stats.count} joined · {stats.pct}% of 100
              </p>
            </div>
          )}

          {/* Pulsing gold attention dot */}
          <span className="animate-popupPulse absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0A] bg-[#C4A484]" />
        </button>
      )}

      <WaitlistModal open={showWaitlist} onClose={() => setShowWaitlist(false)} onSuccess={() => setShowWaitlist(false)} referralParam={refParam} />

    </div>
  );
}
