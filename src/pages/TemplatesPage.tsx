import { useState } from "react";
import { TEMPLATES } from "../templates";
import { ProfileTemplate } from "../types";
import { ArrowRight, Check, Sparkles, ChevronLeft, Send } from "lucide-react";

/**
 * Niche Profile Templates — the "gateway to the niche."
 *
 * A visitor picks the profile that matches their idea. That template boots an
 * agent that already knows their world (tools + skills), then walks them through
 * a short onboarding flow to go specific. This is the on-ramp: gateway → niche →
 * personal specificity.
 */
export default function TemplatesPage() {
  const [selected, setSelected] = useState<ProfileTemplate | null>(null);

  return (
    <div className="px-4 py-14 max-w-6xl mx-auto">
      {/* ── HEADER ── */}
      <div className="text-center max-w-3xl mx-auto space-y-5 mb-12">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-[#C4A484] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Profile Templates
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-light tracking-tighter text-[#F2F2F2] leading-tight">
          Start with an agent that <span className="italic text-[#C4A484]">already knows your niche.</span>
        </h1>
        <p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
          Pick the profile closest to what you do. The agent boots pre-loaded
          with the right skills and tools for your world — then asks a few
          quick questions to get specific. No blank slate. No setup guesswork.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Open-source templates · Free to fork · New niches added weekly
        </p>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="text-left group bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-[#C4A484]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                {t.icon}
              </div>
              {t.pro && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#C4A484] px-2 py-1 rounded-full bg-[#C4A484]/10 border border-[#C4A484]/30">
                  Pro
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-[#F2F2F2] mb-1.5">{t.title}</h3>
            <p className="text-xs text-white/60 font-light leading-relaxed mb-4">{t.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {t.capabilities.slice(0, 3).map((c) => (
                <span key={c.label} className="font-mono text-[9px] uppercase tracking-wider text-white/40 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                  {c.label}
                </span>
              ))}
              {t.capabilities.length > 3 && (
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#C4A484] px-2 py-0.5">
                  +{t.capabilities.length - 3}
                </span>
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#C4A484] group-hover:gap-2.5 transition-all">
              Choose this profile <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* ── "BUILD YOUR OWN" CARD ── */}
      <div className="mt-4 bg-[#121212] border border-dashed border-[#C4A484]/30 rounded-2xl p-8 text-center">
        <div className="text-2xl mb-3">🧩</div>
        <h3 className="text-base font-semibold text-[#F2F2F2] mb-2">Don't see your niche?</h3>
        <p className="text-xs text-white/60 font-light max-w-md mx-auto mb-5">
          Agent templates are open-source. Fork one as a starting point, or
          tell us your niche and we'll profile it — the agent then builds itself
          around your specific idea.
        </p>
        <button
          onClick={() => window.open("https://t.me/GodseyeXbot?start=template", "_blank")}
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#F2F2F2] text-[10px] uppercase tracking-widest font-bold px-6 py-3 rounded-full transition-all cursor-pointer"
        >
          Request a custom profile <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── TEMPLATE DETAIL MODAL ── */}
      {selected && (
        <TemplateDetail template={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function TemplateDetail({ template, onClose }: { template: ProfileTemplate; onClose: () => void }) {
  const [stage, setStage] = useState<"overview" | "onboarding" | "done">("overview");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");

  const questions = template.onboarding;

  const handleNext = () => {
    if (draft.trim()) {
      setAnswers((a) => ({ ...a, [questions[step].id]: draft.trim() }));
    }
    setDraft("");
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setStage("done");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 md:p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {stage === "overview" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                {template.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#F2F2F2]">{template.title}</h2>
                <p className="text-[11px] text-white/50 font-light">{template.tagline}</p>
              </div>
            </div>
            <p className="text-xs text-white/70 font-light leading-relaxed mb-5">
              {template.description}
            </p>

            <div className="mb-5">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#C4A484] mb-2.5">
                Pre-loaded behavior
              </h4>
              <ul className="space-y-2">
                {template.skills.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-white/70 font-light">
                    <Check className="w-3.5 h-3.5 text-[#C4A484] mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#C4A484] mb-2.5">
                Works with
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {template.capabilities.map((c) => (
                  <span key={c.label} className="font-mono text-[10px] uppercase tracking-wider text-white/60 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStage("onboarding")}
              className="w-full bg-[#C4A484] hover:bg-[#b59574] text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              Start with this profile <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {stage === "onboarding" && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#C4A484]" : "bg-white/10"}`}
                />
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-6">
              Onboarding · Q{step + 1} of {questions.length}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-light text-[#F2F2F2] leading-snug mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                {questions[step].prompt}
              </h3>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
              rows={3}
              placeholder={questions[step].placeholder}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { if (step > 0) { setStep(step - 1); } else { setStage("overview"); } }}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleNext}
                disabled={!draft.trim() && !answers[questions[step].id]}
                className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] disabled:opacity-40 text-black font-bold py-3 px-6 rounded-full text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
              >
                {step + 1 === questions.length ? "Finish" : "Next"} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#C4A484]/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-[#C4A484]" />
            </div>
            <h2 className="text-xl font-light text-[#F2F2F2] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
              Your <span className="text-[#C4A484]">{template.title}</span> agent is ready.
            </h2>
            <p className="text-xs text-white/60 font-light mb-6 max-w-sm mx-auto leading-relaxed">
              Your agent now knows your world. Finish the connection in Telegram —
              it'll verify these details and start helping the moment your site is linked.
            </p>

            <div className="text-left bg-[#121212] border border-white/10 rounded-xl p-4 mb-6">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#C4A484] mb-3">
                What your agent now knows
              </h4>
              <div className="space-y-2.5">
                {template.skills.slice(0, 3).map((s) => (
                  <div key={s} className="flex items-start gap-2 text-xs text-white/60 font-light">
                    <Check className="w-3.5 h-3.5 text-[#C4A484] mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-2.5 mt-2.5">
                  <p className="text-[10px] text-white/40 font-light">Your answers</p>
                  <div className="mt-1.5 space-y-1">
                    {questions.map((q) => (
                      <p key={q.id} className="text-[11px] text-white/50 font-light">
                        <span className="text-[#C4A484]">{q.prompt.slice(0, 40)}…</span> — {answers[q.id]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open("https://t.me/GodseyeXbot?start=" + template.id, "_blank")}
              className="w-full bg-[#C4A484] hover:bg-[#b59574] text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Continue in Telegram
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
