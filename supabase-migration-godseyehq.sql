-- GodseyeHQ: Commercial launch migration
-- Adds referral columns to waitlist table, creates payments table

-- Waitlist: add referral columns
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS signup_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS founder_status TEXT DEFAULT 'pending'; -- pending | locked_in | expired
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS founder_locked_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_referral_code_idx ON waitlist(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS waitlist_referred_by_idx ON waitlist(referred_by);

-- Payments: new table for pre-launch checkout
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  telegram_id TEXT,
  plan_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  founder_pricing BOOLEAN DEFAULT FALSE,
  checkout_id TEXT UNIQUE NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  founders_expires_at TIMESTAMPTZ,
  referral_code_applied TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payments_email_idx ON payments(email);
CREATE INDEX IF NOT EXISTS payments_referral_idx ON payments(referral_code_applied);

-- Enable RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
