import { useState, useEffect, FormEvent } from "react";

interface WaitlistSession {
  email: string;
  signupDate: string;
  isFounder: boolean;
  referralCode?: string;
}

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (session: WaitlistSession) => void;
  referralParam?: string;
}

export default function WaitlistModal({ open, onClose, onSuccess, referralParam }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"form" | "success" | "existing">("form");
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError("");
      setStatus("form");
      setSubmitting(false);
      setCopied(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, string> = { email: trimmed };
      if (referralParam) body.referredBy = referralParam;

      const res = await fetch("https://godseye.shop/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const isExisting = data.message === "Already on the waitlist!";

      // Fetch waitlist count for founder status
      let count = 0;
      try {
        const countRes = await fetch("https://godseye.shop/api/waitlist");
        const countData = await countRes.json();
        count = countData.count ?? 0;
      } catch {}

      // Generate referral code from email hash
      const code = btoa(trimmed).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
      const refLink = `${window.location.origin}${window.location.pathname}?ref=${code}`;

      setWaitlistCount(count);
      setReferralLink(refLink);
      setStatus(isExisting ? "existing" : "success");

      onSuccess({
        email: trimmed,
        signupDate: new Date().toISOString(),
        isFounder: count < 100,
        referralCode: code,
      });
    } catch {
      setError("Could not reach the waitlist server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 md:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {(status === "form" || status === "existing") && (
          <>
            {waitlistCount > 0 && (
              <div className="text-center mb-6">
                <span className="inline-block bg-[#C4A484]/10 text-[#C4A484] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-[#C4A484]/20">
                  {waitlistCount < 100
                    ? `🔸 Early adopter — ${100 - waitlistCount} founder spots left`
                    : `📋 ${waitlistCount} on the waitlist`}
                </span>
              </div>
            )}

            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
                Join the <span className="text-[#C4A484]">Founders</span> Waitlist
              </h2>
              <p className="text-white/50 text-sm font-light leading-relaxed">
                First <strong className="text-white">100</strong> to join get <strong className="text-[#C4A484]">50% off</strong> for one year
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/50 focus:ring-1 focus:ring-[#C4A484]/30 transition-all"
                  required
                  disabled={submitting}
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C4A484] text-black py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#C4A484]/90 transition-all disabled:opacity-50"
              >
                {submitting ? "Joining..." : status === "existing" ? "I'm back — confirm my spot" : "Secure my founder spot"}
              </button>

              {status === "existing" && (
                <p className="text-white/40 text-xs text-center">You're already on the list. We've refreshed your session.</p>
              )}

              {referralParam && (
                <p className="text-white/30 text-[10px] text-center">
                  Referred by a friend — you'll both get <strong className="text-[#C4A484]">500 free credits</strong> on first payment.
                </p>
              )}
            </form>

            <p className="text-white/30 text-[10px] text-center mt-4">
              No spam. We'll only email you about your bot access and founder status.
            </p>
          </>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#22C55E" strokeWidth="2">
                <path d="M4 10l4 4 8-8" />
              </svg>
            </div>

            <h2 className="text-xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
              You're on the <span className="text-[#C4A484]">Founders List</span>
            </h2>

            <p className="text-white/50 text-sm leading-relaxed">
              {waitlistCount < 100
                ? "🎉 You're one of the first 100. Your 50% founder pricing is locked in for 1 year once you subscribe."
                : `You're #${waitlistCount} on the list.`}
            </p>

            <p className="text-white/40 text-xs leading-relaxed bg-white/5 rounded-xl p-4">
              Check your email. We'll send you a private invite link to start your session with the bot. Your bot access details will arrive within minutes.
            </p>

            {/* Referral section */}
            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-white/60 text-xs mb-2 font-medium">
                Refer a friend → you both get <strong className="text-[#C4A484]">500 credits</strong> when they subscribe
              </p>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 bg-transparent text-white/60 text-xs px-2 py-1.5 outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="bg-[#C4A484] text-black text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider whitespace-nowrap hover:bg-[#C4A484]/90 transition-all"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-white/10 text-white py-2.5 px-6 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white/20 transition-all"
            >
              Start exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
