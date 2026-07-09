-- ═══════════════════════════════════════════════════════════════════════
--  Automatic welcome email on user signup
--  - After the profile is created (by handle_new_user), fire pg_net HTTP
--    call to the send-email edge function with the "welcome" template.
--  - The service_role JWT is stored in app_settings so the function body
--    stays generic.
-- ═══════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Settings table for opaque values used by triggers
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);
REVOKE ALL ON app_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON app_settings TO service_role;

-- After INSERT on profiles, call send-email edge function
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jwt text;
  v_url text := 'https://vvjmcrcakmmjuhpbtzbu.supabase.co/functions/v1/send-email';
BEGIN
  SELECT value INTO v_jwt FROM app_settings WHERE key = 'edge_service_jwt';
  IF v_jwt IS NULL THEN
    RAISE WARNING 'send_welcome_email: edge_service_jwt not set — email skipped';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_jwt
    ),
    body := jsonb_build_object(
      'type', 'welcome',
      'to',   NEW.email,
      'data', jsonb_build_object('firstName', NEW.first_name)
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'send_welcome_email failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION send_welcome_email() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION send_welcome_email();

-- The JWT must be set manually once (kept out of migration for security):
--   INSERT INTO app_settings (key, value) VALUES
--     ('edge_service_jwt', '<service_role_jwt>')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
