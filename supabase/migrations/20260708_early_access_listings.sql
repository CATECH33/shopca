-- ─── Early Access columns on listings + public stats RPC ──────────────────
-- Adds early_access flag/countdown/tag on listings and a SECURITY DEFINER
-- function used by the /early-access page for public counters.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS early_access boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS early_access_ends_at timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS early_access_pct integer;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS early_access_tag text;

CREATE INDEX IF NOT EXISTS idx_listings_early_access
  ON listings(early_access, early_access_ends_at)
  WHERE early_access = true;

CREATE OR REPLACE FUNCTION get_early_access_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_listings int;
  v_premium_users   int;
  v_txn_month       int;
BEGIN
  SELECT count(*) INTO v_active_listings
  FROM listings
  WHERE early_access = true
    AND status = 'active'
    AND (early_access_ends_at IS NULL OR early_access_ends_at > now());

  SELECT count(*) INTO v_premium_users
  FROM profiles WHERE premium_alerts = true;

  SELECT count(*) INTO v_txn_month
  FROM subscriptions
  WHERE status = 'active'
    AND COALESCE(start_date, updated_at) >= date_trunc('month', now());

  RETURN json_build_object(
    'active_listings', v_active_listings,
    'premium_users',   v_premium_users,
    'txn_month',       v_txn_month
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_early_access_stats() TO anon, authenticated;
