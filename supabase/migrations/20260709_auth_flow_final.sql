-- ═══════════════════════════════════════════════════════════════════════
--  Auth flow — 2 fixes:
--  1. prevent_role_escalation allows service_role to change roles
--     (admin API bypass — needed for backfills/managed operations).
--  2. Add FK agencies -> profiles so PostgREST can embed:
--     GET /profiles?select=*,agencies(*)
--     Previously the FK was only agencies.user_id -> auth.users, which
--     PostgREST cannot resolve for a public.profiles query.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.role() != 'service_role'
     AND NOT is_super_admin()
     AND NOT is_platform_owner()
  THEN
    RAISE EXCEPTION 'Role change requires admin privileges';
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE agencies DROP CONSTRAINT IF EXISTS agencies_profiles_fkey;
ALTER TABLE agencies
  ADD CONSTRAINT agencies_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
