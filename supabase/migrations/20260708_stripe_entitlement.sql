-- ═══════════════════════════════════════════════════════════════════════
--  Stripe entitlement automation
--  - Fix subscriptions.user_id FK to point at auth.users (source of truth)
--  - Backfill public.users from auth.users so any legacy FKs stay valid
--  - expire_stale_subscriptions() — revokes premium when period ended
--  - is_premium_active(uuid)      — cheap RPC callable from the app
--  - pg_cron schedule (hourly)
-- ═══════════════════════════════════════════════════════════════════════

-- 1) FK realignment
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

INSERT INTO public.users (id, email, is_verified, created_at)
SELECT au.id, au.email, (au.email_confirmed_at IS NOT NULL), au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- 2) Expire stale subscriptions job
CREATE OR REPLACE FUNCTION expire_stale_subscriptions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_subs int := 0;
  v_revoked_users int := 0;
BEGIN
  WITH updated AS (
    UPDATE subscriptions
    SET status = 'expired'
    WHERE type = 'premium_alerts'
      AND status IN ('canceled', 'unpaid', 'incomplete_expired', 'past_due')
      AND (current_period_end < now() OR end_date < now())
    RETURNING id
  )
  SELECT count(*) INTO v_expired_subs FROM updated;

  WITH revoked AS (
    UPDATE profiles p
    SET premium_alerts = false
    WHERE premium_alerts = true
      AND NOT EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = p.id
          AND s.type = 'premium_alerts'
          AND s.status IN ('active', 'trialing', 'past_due')
          AND (s.current_period_end IS NULL OR s.current_period_end > now())
      )
    RETURNING p.id
  )
  SELECT count(*) INTO v_revoked_users FROM revoked;

  RETURN json_build_object(
    'expired_subscriptions', v_expired_subs,
    'revoked_users',         v_revoked_users,
    'ran_at',                now()
  );
END;
$$;

REVOKE ALL ON FUNCTION expire_stale_subscriptions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION expire_stale_subscriptions() TO service_role;

-- 3) Cheap entitlement RPC callable by the client
CREATE OR REPLACE FUNCTION is_premium_active(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND type = 'premium_alerts'
      AND status IN ('active', 'trialing', 'past_due')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

GRANT EXECUTE ON FUNCTION is_premium_active(uuid) TO anon, authenticated;

-- 4) Scheduled expiration — runs hourly
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-stale-subscriptions') THEN
    PERFORM cron.unschedule('expire-stale-subscriptions');
  END IF;
  PERFORM cron.schedule(
    'expire-stale-subscriptions',
    '0 * * * *',
    $c$SELECT public.expire_stale_subscriptions();$c$
  );
END $$;
