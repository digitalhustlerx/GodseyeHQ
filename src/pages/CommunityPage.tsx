import { FormEvent, useState } from "react";
import { Check, ArrowRight, Users, Shield, Terminal, BookOpen } from "lucide-react";

const benefits = [
  "Private VPS setup and harness configuration",
  "One practical agent workflow configured for you",
  "Telegram and tool integrations",
  "Workspace and profile isolation review",
  "A plain-English operating guide",
  "A private walkthrough after delivery",
  "30 days of support and improvements",
];

const paths = [
  {
    title: "Agent Orientation",
    price: "Details after signup",
    text: "A focused session to map your work, choose the right infrastructure, and leave with a practical build plan.",
    points: ["90-minute session", "VPS and tool recommendations", "Written action plan"],
  },
  {
    title: "Forward-Deployed Setup",
    price: "Details after consultation",
    text: "A done-for-you private AI environment for people who want to start using agents now.",
    points: ["VPS setup and configuration", "One workflow deployed", "Guide, walkthrough, and 30-day support"],
    featured: true,
  },
  {
    title: "Private AI Network",
    price: "Details after consultation",
    text: "For creators, founders, and teams that need multiple agents, integrations, and operating rules.",
    points: ["Multiple workspaces or agents", "Custom integrations", "Extended support and security review"],
  },
];

export default function CommunityPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/forward-deployment-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Could not submit your application.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-24 pb-20">
      <section className="px-4 pt-16 md:pt-24 max-w-5xl mx-auto text-center space-y-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-[#C4A484] font-mono font-bold">
          <Users className="w-3.5 h-3.5" /> GodsEye Agent Setup
        </span>
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-[#F2F2F2] font-display">
          Stop asking what AI can do.<br /><span className="italic text-[#C4A484]">Start building with it.</span>
        </h1>
        <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-3xl mx-auto font-light">
          A practical community and forward-deployment service for people who want agents working in their real lives and businesses—not another chatbot tab.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#apply" className="bg-[#C4A484] hover:bg-[#b59574] text-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all">Apply for a setup <ArrowRight className="inline w-4 h-4 ml-1" /></a>
          <a href="https://t.me/GodseyeXbot" target="_blank" rel="noreferrer" className="border border-white/20 hover:bg-white/5 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all">Talk to the bot</a>
        </div>
        <p className="text-xs text-white/40">Founding setup access · Applications reviewed before payment</p>
      </section>

      <section className="px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
        {[{ icon: Terminal, title: "Configure", text: "Your VPS, harness, keys, tools, and first workflow are configured deliberately." }, { icon: Shield, title: "Separate", text: "We test boundaries between profiles, workspaces, and customer data before handoff." }, { icon: BookOpen, title: "Understand", text: "You receive a clear guide and walkthrough so you can keep moving as the technology evolves." }].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-3">
            <Icon className="w-6 h-6 text-[#C4A484]" />
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="text-xs text-white/60 leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      <section className="px-4 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3"><span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-mono">Setup options</span><h2 className="text-3xl md:text-5xl font-light text-white">Start where you are.</h2></div>
        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path) => <div key={path.title} className={`rounded-3xl border p-7 flex flex-col ${path.featured ? "border-[#C4A484] bg-[#C4A484]/5" : "border-white/10 bg-[#121212]"}`}>
            {path.featured && <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-mono mb-4">Most requested</span>}
            <h3 className="text-lg font-semibold text-white">{path.title}</h3><p className="text-3xl font-black text-[#C4A484] mt-3">{path.price}</p><p className="text-xs text-white/60 leading-relaxed mt-4">{path.text}</p>
            <ul className="space-y-2 mt-6 text-xs text-white/70 flex-1">{path.points.map((point) => <li key={point}><Check className="inline w-3.5 h-3.5 text-[#C4A484] mr-2" />{point}</li>)}</ul>
            <a href="#apply" className="mt-7 text-center rounded-full border border-white/20 hover:border-[#C4A484] px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-white">Apply for this path</a>
          </div>)}
        </div>
      </section>

      <section id="apply" className="px-4 max-w-3xl mx-auto">
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-7 md:p-10">
          {submitted ? <div className="text-center py-12 space-y-4"><Check className="w-10 h-10 text-[#C4A484] mx-auto" /><h2 className="text-2xl text-white">Application received.</h2><p className="text-sm text-white/60">I’ll review your use case and send the right next step. If it’s a fit, you’ll receive a payment link and delivery plan.</p></div> : <><div className="space-y-3 mb-8"><span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-mono">Founding applications</span><h2 className="text-3xl font-light text-white">Tell me what you want to make possible.</h2><p className="text-sm text-white/60">No payment is taken here. We confirm the scope first, then send a real payment link or invoice.</p></div><form onSubmit={submit} className="space-y-4"><input required name="name" placeholder="Name" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white" /><input required type="email" name="email" placeholder="Email" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white" /><input name="telegram" placeholder="Telegram username" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white" /><input required name="work" placeholder="What do you do?" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white" /><textarea required name="goal" placeholder="What would you want your agent to handle?" rows={4} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white" /><select name="vps" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white"><option value="no">I need help choosing a VPS</option><option value="yes">I already have a VPS</option></select>{error && <p className="text-sm text-red-400">{error}</p>}<button disabled={loading} className="w-full rounded-full bg-[#C4A484] hover:bg-[#b59574] text-black py-4 text-xs uppercase tracking-widest font-bold">{loading ? "Sending…" : "Apply for a founding setup"}</button></form></>}
        </div>
      </section>
    </div>
  );
}

// CommunityPage is the Agents School / forward-deployment funnel.
// It is intentionally separate from the canonical product landing page.

export { CommunityPage };
