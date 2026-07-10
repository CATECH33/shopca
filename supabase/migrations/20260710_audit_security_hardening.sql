-- ═══════════════════════════════════════════════════════════════════════
--  Audit hardening — security fixes flagged by Supabase advisors
--  - public_profiles view: security_invoker so RLS applies
--  - contact_requests: replace USING(true) with listing-owner ACL
--  - audit_trail: admin only
--  - Add missing policies on RLS-enabled tables (app_settings, users,
--    webhook_debug, boosts)
--  - Lock search_path on all custom functions (SQL injection protection)
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public_profiles WITH (security_invoker = true) AS
SELECT id, first_name, last_name, avatar_url, username,
  CASE WHEN role IN ('platform_owner','super_admin','moderator','admin') THEN 'user'
       ELSE COALESCE(role, 'user') END AS role,
  account_type
FROM profiles;
GRANT SELECT ON public_profiles TO anon, authenticated;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='contact_requests' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON contact_requests', r.policyname);
  END LOOP;
END $$;

CREATE POLICY contact_requests_listing_owner_read ON contact_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM listings l WHERE l.id = contact_requests.listing_id AND l.user_id = auth.uid())
    OR is_super_admin() OR is_platform_owner()
  );
CREATE POLICY contact_requests_public_insert ON contact_requests FOR INSERT
  WITH CHECK (true);

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='audit_trail' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON audit_trail', r.policyname);
  END LOOP;
END $$;

CREATE POLICY audit_trail_admin_read ON audit_trail FOR SELECT
  USING (is_super_admin() OR is_platform_owner());

CREATE POLICY app_settings_admin_read ON app_settings FOR SELECT
  USING (is_super_admin() OR is_platform_owner());
CREATE POLICY users_self_or_admin_read ON users FOR SELECT
  USING (auth.uid() = id OR is_super_admin() OR is_platform_owner());
CREATE POLICY webhook_debug_admin_read ON webhook_debug FOR SELECT
  USING (is_super_admin() OR is_platform_owner());
CREATE POLICY boosts_owner_read ON boosts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM listings l WHERE l.id = boosts.listing_id AND l.user_id = auth.uid())
    OR is_super_admin() OR is_platform_owner()
  );

ALTER FUNCTION public.is_super_admin() SET search_path = public;
ALTER FUNCTION public.is_platform_owner() SET search_path = public;
ALTER FUNCTION public.expire_stale_subscriptions() SET search_path = public;
ALTER FUNCTION public.is_premium_active(uuid) SET search_path = public;
ALTER FUNCTION public.get_early_access_stats() SET search_path = public;
ALTER FUNCTION public.prevent_role_escalation() SET search_path = public;
ALTER FUNCTION public.send_welcome_email() SET search_path = public;
ALTER FUNCTION public.notify_user(uuid, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.on_listing_state_change() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
