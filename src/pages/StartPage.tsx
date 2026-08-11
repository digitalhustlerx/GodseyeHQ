import { Link } from "react-router-dom";
import { Check, MessageCircle, Rocket, Wallet } from "lucide-react";

const ONBOARDING_STEPS = [
  {
    icon: Rocket,
    title: "Create your account",
    body: "Sign up with your email. You get 50 free credits to try Godseye immediately — no card required.",
    cta: "Sign up free",
    href: "https://app.digitalhustlerx.com/signup",
  },
  {
    icon: MessageCircle,
    title: "Meet your agent on Telegram",
    body: "After signing up, you'll connect to @GodseyeXbot on Telegram. That's where your agent lives — where the work happens.",
    cta: "Open Telegram bot",
    href: "https://t.me/GodseyeXbot",
  },
  {
    icon: Wallet,
    title: "Pick a plan when you're ready",
    body: "Start free. When you need more credits or always-on agents, upgrade from your account dashboard. Cancel anytime.",
    cta: "See pricing",
    href: "/pricing",
  },
];

export default function StartPage() {
  return (
    <div className="bg-[#0A0A0A] text-[#F2F2F2]">
      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/80 font-bold">
              Get Started
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: "'Georgia', serif" }}>
            Start in under 60 seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60 font-light">
            No dashboard to learn. No code to write. Just sign up, open Telegram, and put your agent to work.
          </p>
        </div>

        {/* STEPS */}
        <div className="mt-16 space-y-6">
          {ONBOARDING_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-5 bg-[#121212] border border-white/10 rounded-3xl p-8 hover:border-[#C4A484]/30 transition-all"
            >
              <div className="flex items-center gap-4 sm:flex-col sm:items-center">
                <div className="w-12 h-12 rounded-full border border-[#C4A484]/40 bg-[#C4A484]/10 text-[#C4A484] flex items-center justify-center font-light text-lg shrink-0" style={{ fontFamily: "'Georgia', serif" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <step.icon className="w-6 h-6 text-[#C4A484] sm:mt-2" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed font-light">{step.body}</p>
                <a
                  href={step.href}
                  className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-[#C4A484] hover:text-[#b59574] cursor-pointer"
                >
                  {step.cta} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <Link
            to="https://app.digitalhustlerx.com/signup"
            className="inline-block bg-[#C4A484] hover:bg-[#b59574] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
          >
            Create your free account →
          </Link>
          <p className="mt-4 text-xs text-white/40 font-light">
            Already have an account?{" "}
            <Link to="https://app.digitalhustlerx.com/login" className="text-[#C4A484] hover:text-[#b59574] font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
