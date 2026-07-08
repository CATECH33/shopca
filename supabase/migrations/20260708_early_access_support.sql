-- ─── Early Access support ──────────────────────────────────────────────────
-- Adds alert channel toggles on profiles and a listing_interest table used by
-- the /early-access page to persist "Je suis intéressé(e)" clicks.

-- 1) Alert channel toggles on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alerts_sms boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alerts_whatsapp boolean DEFAULT false;

-- 2) Interest tracking table
CREATE TABLE IF NOT EXISTS listing_interest (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_interest_user_id ON listing_interest(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_interest_listing_id ON listing_interest(listing_id);

ALTER TABLE listing_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own interests"
  ON listing_interest FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON listing_interest FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON listing_interest FOR DELETE
  USING (auth.uid() = user_id);
