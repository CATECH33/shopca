-- Politique RLS : lecture publique des annonces actives (sans authentification)
CREATE POLICY "public_read_active_listings"
  ON listings
  FOR SELECT
  USING (status = 'active');
