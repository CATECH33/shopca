-- Ajout colonnes parking et ascenseur sur les annonces
ALTER TABLE listings
  ADD COLUMN parking  boolean NOT NULL DEFAULT false,
  ADD COLUMN elevator boolean NOT NULL DEFAULT false;

-- Seed : valeurs réalistes selon type de bien, surface et prix
UPDATE listings SET
  parking = CASE
    WHEN property_type IN ('villa','maison')                         THEN true
    WHEN property_type = 'loft'                                      THEN true
    WHEN property_type = 'appartement' AND price > 800000            THEN true
    WHEN property_type = 'appartement' AND surface > 90              THEN true
    WHEN title ILIKE '%parking%' OR title ILIKE '%garage%'           THEN true
    ELSE false
  END,
  elevator = CASE
    WHEN property_type IN ('maison','villa')                         THEN false
    WHEN property_type = 'studio' AND price < 900                    THEN false
    WHEN property_type = 'appartement' AND city ILIKE '%paris%'      THEN true
    WHEN property_type = 'appartement' AND surface > 80              THEN true
    WHEN property_type = 'loft'                                      THEN true
    WHEN property_type = 'appartement' AND price > 600000            THEN true
    ELSE false
  END
WHERE status = 'active';
