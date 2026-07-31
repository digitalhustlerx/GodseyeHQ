import { Link } from "react-router-dom";
import { Download } from "lucide-react";

export default function StartPage() {
  const steps = [
    {
      num: "01",
      title: "Install Plugin",
      body: (
        <>
          <p className="text-sm text-white/70 font-light leading-relaxed mb-5">
            Download the GodsEye plugin, upload it to your WordPress dashboard
            (Plugins &gt; Add New), and activate it.
          </p>
          <button
            onClick={() =>
              alert(
                "GodsEye Plugin v1.0.5 — download coming soon. For now, ask @GodseyeXbot for the latest build."
              )
            }
            className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] text-black text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full px-5 transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            Download Plugin v1.0.5
          </button>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
            Size: 64 KB &middot; Requires PHP 7.4+ / WP 5.0+
          </p>
        </>
      ),
    },
    {
      num: "02",
      title: "Connect Telegram",
      body: (
        <>
          <p className="text-sm text-white/70 font-light leading-relaxed mb-5">
            Send <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] text-[#C4A484]">/connect</code> to{" "}
            <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] text-[#C4A484]">@GodseyeXbot</code>{" "}
            in Telegram and follow the prompts. You will need your site URL,
            WordPress username, and an Application Password.
          </p>
          <a
            href="https://t.me/GodseyeXbot?start=connect"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full px-5 transition-all active:scale-95"
          >
            Open Telegram Bot
          </a>
        </>
      ),
    },
    {
      num: "03",
      title: "Start Chatting",
      body: (
        <>
          <p className="text-sm text-white/70 font-light leading-relaxed mb-4">
            You are set! Try sending these commands:
          </p>
          <ul className="space-y-2.5">
            {[
              "Write a draft post about AI trends",
              "Show me my latest WooCommerce orders",
              "Check my site health",
              "Change the hero price to $399",
            ].map((cmd) => (
              <li key={cmd}>
                <code className="block w-full bg-black/40 font-mono text-[11px] text-[#C4A484] border border-white/10 rounded px-3 py-2">
                  {cmd}
                </code>
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="px-4 py-16 max-w-7xl mx-auto space-y-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-[#C4A484] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4A484] animate-pulse"></span>
            Get Started
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-light tracking-tighter text-[#F2F2F2] leading-tight">
          Set up in under <span className="italic text-[#C4A484]">60 seconds.</span>
        </h1>
        <p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
          Three steps to connect your WordPress site to your AI agent.
        </p>
      </div>

      {/* STEPS */}
      <div className="space-y-5">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-[#121212] border border-white/10 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-32 shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Step
                </span>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-lg font-display font-light text-[#C4A484]">
                  {step.num}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-[#F2F2F2] mb-3">
                  {step.title}
                </h3>
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* APP PASSWORD HELP CARD */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#C4A484]/10 flex items-center justify-center">
            <span className="text-[#C4A484] text-xs">★</span>
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F2]">
            Generate an Application Password
          </h3>
        </div>
        <p className="text-xs text-white/60 font-light leading-relaxed">
          To generate an Application Password: Go to{" "}
          <span className="text-[#C4A484]">Users &gt; Profile</span> in your
          WordPress dashboard, scroll to{" "}
          <span className="text-[#C4A484]">Application Passwords</span>, enter{" "}
          <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] text-[#C4A484]">
            GodsEye Agent
          </code>{" "}
          and click <span className="text-[#C4A484]">Generate</span>. Copy the
          password.
        </p>
      </div>

      {/* BOTTOM CTA */}
      <div className="text-center space-y-4 border-t border-white/5 pt-12">
        <p className="text-sm text-white/50 font-light">Prefer to see it first?</p>
        <Link
          to="/features"
          className="inline-flex items-center gap-2 text-[#C4A484] hover:text-[#d9c4af] text-[10px] uppercase tracking-widest font-bold transition-colors"
        >
          Explore Features &rarr;
        </Link>
      </div>
    </div>
  );
}
