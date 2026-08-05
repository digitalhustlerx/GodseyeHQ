// Shared GOD-9 referral helpers for the frontend.
// Talks to the same-origin /api/referral* endpoints (proxied to the Node backend).

export interface ReferralStatsData {
  email: string;
  referral_token: string;
  invites_sent: number;
  funnel?: { invite_to_signup: number; signup_to_paid: number; signup_to_activated: number };
  invite_to_signup: number;
  signup_to_paid: { signups: number; paid: number; rate: number };
  referred_revenue: number;
  rewards: {
    waiting: number;
    paid_count: number;
    rewards_unlocked: Record<
      string,
      { unlocked: boolean; detail: string }
    >;
  };
  rewards_ledger?: Array<{ kind: string; label: string; status: string }>;
  referral_discount?: number;
}

// Fetch/create this user's opaque referral token.
export async function getReferralToken(email: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/referral?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.referral_token || null;
  } catch {
    return null;
  }
}

// Fetch funnel + reward stats for a referrer email.
export async function getReferralStats(email: string): Promise<ReferralStatsData | null> {
  try {
    const res = await fetch(`/api/referral/stats?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Build the sharable referral URL for a token. Always points at the landing
// root (/) where the waitlist modal + ?ref= reading live, so a referred user
// lands on the signup surface regardless of where the inviter copied the link.
export function referralUrl(token: string): string {
  const origin = window.location.origin;
  return `${origin}/?ref=${encodeURIComponent(token)}`;
}

// GOD-8 §4 — waitlist banner copy (verbatim).
export const WAITLIST_REFERRAL_COPY =
  "Godseye does more with your people in it. Share your invite link — if the people you work with sign up, you both get launch pricing locked in. No spam, no points-tracking dashboard. Just a better network on the same tool.";

// GOD-8 §4 — in-product "Bring your team" copy (verbatim).
export const IN_PRODUCT_REFERRAL_COPY =
  "Bring your team. Send your link to the people who live in WordPress admin from their phone. When they pay, your next month's free — and you both keep working in the same shared view.";
