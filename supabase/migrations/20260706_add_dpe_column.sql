-- Ajout colonne DPE sur les annonces
ALTER TABLE listings
  ADD COLUMN dpe text CHECK (dpe IN ('A','B','C','D','E','F','G'));

-- Seed : valeurs réalistes selon type de bien et titre
UPDATE listings SET dpe = CASE
  WHEN title ILIKE '%neuf%' OR title ILIKE '%contemporain%' OR title ILIKE '%BBC%'        THEN 'A'
  WHEN title ILIKE '%rénov%' OR title ILIKE '%lumineux%' OR title ILIKE '%moderne%'       THEN 'B'
  WHEN title ILIKE '%refait%' OR title ILIKE '%design%' OR title ILIKE '%loft%'           THEN 'C'
  WHEN property_type = 'villa'                                                             THEN 'B'
  WHEN property_type = 'maison' AND price > 600000                                        THEN 'C'
  WHEN property_type = 'maison'                                                            THEN 'D'
  WHEN property_type = 'studio'                                                            THEN 'D'
  WHEN property_type = 'appartement' AND price > 1000000                                  THEN 'C'
  WHEN property_type = 'appartement' AND created_at < '2026-01-01'                        THEN 'E'
  WHEN property_type = 'appartement'                                                       THEN 'D'
  ELSE 'E'
END
WHERE status = 'active';
