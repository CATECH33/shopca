-- ── 1. Remove any existing CHECK constraints on profiles.role ─────────────────
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.profiles'::regclass
    AND c.contype = 'c'
    AND a.attname = 'role'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- ── 2. Add updated constraint including platform_owner ────────────────────────
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'pro_user', 'agency', 'agency_admin', 'super_admin', 'platform_owner'));

-- ── 3. Grant platform_owner role to the platform administrator ────────────────
UPDATE public.profiles
SET role = 'platform_owner'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'pemoustaskit@gmail.com'
)
AND id IS NOT NULL;
