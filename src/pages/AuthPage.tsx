import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, register, User } from "../lib/auth";

export default function AuthPage({
  mode: forcedMode,
  onAuthed,
}: {
  mode?: "login" | "signup";
  onAuthed?: (user: User) => void;
}) {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(forcedMode || params.get("mode") === "signup" ? "signup" : "login");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(params.get("ref") || "");
  const [bonusChoice, setBonusChoice] = useState<"context" | "memory">("context");
  const [bonusApplied, setBonusApplied] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirect = params.get("next") || "/account";

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError("");
    setBonusApplied("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let user: User;
      if (mode === "signup") {
        user = await register(email, password, name, referralCode || undefined, bonusChoice);
        if (referralCode && referralCode.trim()) {
          setBonusApplied(bonusChoice === "memory" ? "You got the extra memory bonus. Your agent's vault is bigger, plus your standard credits." : "You got the extra context bonus. More free tokens to start, plus your standard credits.");
        }
      } else {
        user = await login(email, password);
      }
      onAuthed?.(user);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F2F2F2] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center space-y-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl mx-auto">
            👁️
          </div>
          <h1 className="font-display text-3xl font-light tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-white/50 font-light">
            {mode === "login" ? "Log in to manage your Godseye subscription." : "Sign up to get your agent working in minutes."}
          </p>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
          {/* Mode toggle */}
          <div className="flex rounded-full bg-white/5 border border-white/10 p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                  mode === m ? "bg-[#C4A484] text-black" : "text-white/50 hover:text-white"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[10px] text-[#C4A484] font-mono uppercase font-bold mb-1.5">Full name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] text-[#C4A484] font-mono uppercase font-bold mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#C4A484] font-mono uppercase font-bold mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all"
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] text-[#C4A484] font-mono uppercase font-bold">Referral bonus (optional)</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter a referral code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 transition-all"
                />
                {referralCode && referralCode.trim() !== "" && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="text-[10px] text-white/50 font-light">When you sign up with a referral, choose your bonus:</div>
                    {(["context", "memory"] as const).map((b) => (
                      <label
                        key={b}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                          bonusChoice === b ? "border-[#C4A484]/60 bg-[#C4A484]/10" : "border-white/10 bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="bonus"
                          checked={bonusChoice === b}
                          onChange={() => setBonusChoice(b)}
                          className="accent-[#C4A484]"
                        />
                        <span className="text-xs text-white/80 font-normal">
                          {b === "context" ? "Extra free context (+20k tokens)" : "Extra memory (+250MB vault)"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {bonusApplied && (
              <div className="rounded-lg border border-[#C4A484]/30 bg-[#C4A484]/10 px-3 py-2.5 text-xs text-[#e8d1b6]">
                {bonusApplied}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#C4A484] hover:bg-[#b59574] disabled:opacity-40 text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log In →" : "Create Account →"}
            </button>
          </form>

          <p className="mt-5 text-[11px] text-white/50 text-center font-light">
            {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-[#C4A484] hover:text-[#d9c4af] font-semibold"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-[11px] text-white/40 hover:text-[#C4A484] transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
