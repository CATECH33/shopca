-- ═══════════════════════════════════════════════════════════════════════
--  Audit d'authentification — nettoyage RLS + sécurisation
--  - Ferme la fuite RGPD sur profiles (policy USING true)
--  - Consolide les policies dupliquées
--  - Ajoute une vue public_profiles pour affichage non-sensible
--  - Empêche l'élévation de rôle par un user normal
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Vue publique restreinte (nom, prénom, avatar, rôle non-sensible)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id, first_name, last_name, avatar_url, username,
  -- Les rôles administratifs sont anonymisés en 'user' pour ne pas leur trahir
  CASE
    WHEN role IN ('platform_owner','super_admin','moderator','admin') THEN 'user'
    ELSE COALESCE(role, 'user')
  END AS role,
  account_type
FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;

-- 2) Drop toutes les policies profiles pour repartir propre
DROP POLICY IF EXISTS "Tout le monde peut voir les profils" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "profiles: own read" ON profiles;
DROP POLICY IF EXISTS "profiles: own update" ON profiles;
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
DROP POLICY IF EXISTS sa_read_profiles ON profiles;
DROP POLICY IF EXISTS sa_update_profiles ON profiles;
DROP POLICY IF EXISTS mgr_owner_profiles_select ON profiles;

-- 3) 3 policies consolidées et claires
CREATE POLICY "profiles_read_own_or_admin"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR is_super_admin()
    OR is_platform_owner()
  );

CREATE POLICY "profiles_update_own_or_admin"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_super_admin());

CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  USING (is_super_admin());

-- 4) Empêche un user normal de changer son rôle
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND NOT is_super_admin()
     AND NOT is_platform_owner()
  THEN
    RAISE EXCEPTION 'Role change requires admin privileges';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION prevent_role_escalation();

-- 5) Nettoyage policies agencies redondantes
DROP POLICY IF EXISTS agency_self ON agencies;
DROP POLICY IF EXISTS sa_read_agencies ON agencies;
DROP POLICY IF EXISTS mgr_owner_agencies_select ON agencies;
