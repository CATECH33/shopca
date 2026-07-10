-- ═══════════════════════════════════════════════════════════════════════
--  Listing lifecycle + auto-notifications
--  - Full status set: draft/pending/active/rejected/sold/rented/archived/expired
--  - Trigger notify_user on INSERT + status change
--  - FK realignment listings.user_id -> auth.users
--  - Public visibility restricted to active + premium only
-- ═══════════════════════════════════════════════════════════════════════

-- Allowed statuses
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('draft','pending','active','rejected','sold','rented','archived','expired','flagged','suspended','premium'));

-- Default = draft for new listings
ALTER TABLE listings ALTER COLUMN status SET DEFAULT 'draft';

-- FK: auth.users (source of truth). public.users can be stale.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
ALTER TABLE listings
  ADD CONSTRAINT listings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Helper to insert a user notification (SECURITY DEFINER so triggers can bypass RLS)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id uuid, p_title text, p_message text, p_type text, p_link text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link, is_read, target, created_by)
  VALUES (p_user_id, p_title, p_message, p_type, p_link, false, 'user', p_user_id);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_user failed: %', SQLERRM;
END $$;

-- Trigger fires on INSERT and on status UPDATE
CREATE OR REPLACE FUNCTION on_listing_state_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_link text;
  v_title text := COALESCE(NEW.title, 'Annonce');
BEGIN
  v_link := '/annonces/' || NEW.id;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'draft' THEN
      PERFORM notify_user(NEW.user_id, 'Brouillon enregistré',
        'Votre annonce « ' || v_title || ' » a été sauvegardée en brouillon.',
        'listing_draft', v_link);
    ELSIF NEW.status = 'pending' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce en attente de validation',
        'Votre annonce « ' || v_title || ' » a été soumise et est en cours de modération.',
        'listing_pending', v_link);
    ELSIF NEW.status = 'active' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce publiée',
        'Votre annonce « ' || v_title || ' » est en ligne sur SHOPCA.',
        'listing_published', v_link);
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'active' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce publiée',
        'Votre annonce « ' || v_title || ' » est maintenant en ligne.',
        'listing_published', v_link);
    ELSIF NEW.status = 'pending' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce soumise à modération',
        'Votre annonce « ' || v_title || ' » attend la validation de notre équipe.',
        'listing_pending', v_link);
    ELSIF NEW.status = 'rejected' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce rejetée',
        'Votre annonce « ' || v_title || ' » a été rejetée. Motif : ' || COALESCE(NEW.rejection_reason, 'non spécifié'),
        'listing_rejected', v_link);
    ELSIF NEW.status = 'sold' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce vendue',
        'Félicitations ! Votre annonce « ' || v_title || ' » a été marquée comme vendue.',
        'listing_sold', v_link);
    ELSIF NEW.status = 'rented' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce louée',
        'Votre annonce « ' || v_title || ' » a été marquée comme louée.',
        'listing_rented', v_link);
    ELSIF NEW.status = 'archived' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce archivée',
        'Votre annonce « ' || v_title || ' » est archivée. Elle n''est plus visible publiquement.',
        'listing_archived', v_link);
    ELSIF NEW.status = 'expired' THEN
      PERFORM notify_user(NEW.user_id, 'Annonce expirée',
        'Votre annonce « ' || v_title || ' » a expiré. Republiez-la pour la remettre en avant.',
        'listing_expired', v_link);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_listing_state_change ON listings;
CREATE TRIGGER trg_listing_state_change
  AFTER INSERT OR UPDATE OF status ON listings
  FOR EACH ROW EXECUTE FUNCTION on_listing_state_change();

-- Neutralize legacy on_listing_inserted trigger that referenced dropped
-- columns of the alerts table (keywords, transaction_type, ...).
DROP TRIGGER IF EXISTS on_listing_inserted ON listings;

-- Restrict public listing visibility: only active + premium
DROP POLICY IF EXISTS "Public listings are viewable" ON listings;

-- Owner delete policy (safety)
DROP POLICY IF EXISTS listings_owner_delete ON listings;
CREATE POLICY listings_owner_delete ON listings FOR DELETE
  USING (auth.uid() = user_id);
