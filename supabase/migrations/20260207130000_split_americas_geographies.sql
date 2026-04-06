-- Split AMERICAS into SOUTH_AMERICA, CENTRAL_AMERICA, NORTH_AMERICA
-- Ref: ajustes_cliente/🟠 to-do/edit.md §5

-- =============================================
-- 1. Insert 3 new continent rows (same sort_order slot as AMERICAS was)
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, sort_order) VALUES
('SOUTH_AMERICA', 'continent', NULL, 'South America', 'América do Sul', 1),
('CENTRAL_AMERICA', 'continent', NULL, 'Central America & Caribbean', 'América Central e Caribe', 2),
('NORTH_AMERICA', 'continent', NULL, 'North America', 'América do Norte', 3);

-- =============================================
-- 2. Update countries: set parent_id to the new continent
-- =============================================
-- South America: BR, AR, CL, CO, PE, UY, PY, EC, BO, VE
UPDATE geographies
SET parent_id = (SELECT id FROM geographies WHERE code = 'SOUTH_AMERICA' AND type = 'continent' LIMIT 1)
WHERE code IN ('BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'PY', 'EC', 'BO', 'VE')
  AND type = 'country';

-- Central America & Caribbean: PA, CR, DO, GT, MX
UPDATE geographies
SET parent_id = (SELECT id FROM geographies WHERE code = 'CENTRAL_AMERICA' AND type = 'continent' LIMIT 1)
WHERE code IN ('PA', 'CR', 'DO', 'GT', 'MX')
  AND type = 'country';

-- North America: US, CA
UPDATE geographies
SET parent_id = (SELECT id FROM geographies WHERE code = 'NORTH_AMERICA' AND type = 'continent' LIMIT 1)
WHERE code IN ('US', 'CA')
  AND type = 'country';

-- Renumber other continents so display order stays: Americas (1,2,3) then Europe, Asia, ...
UPDATE geographies SET sort_order = 4 WHERE code = 'EUROPE' AND type = 'continent';
UPDATE geographies SET sort_order = 5 WHERE code = 'ASIA' AND type = 'continent';
UPDATE geographies SET sort_order = 6 WHERE code = 'AFRICA' AND type = 'continent';
UPDATE geographies SET sort_order = 7 WHERE code = 'OCEANIA' AND type = 'continent';
UPDATE geographies SET sort_order = 8 WHERE code = 'MIDDLE_EAST' AND type = 'continent';

-- =============================================
-- 3. Backfill organizations.settings: replace 'AMERICAS' with the 3 new codes
-- =============================================
UPDATE organizations o
SET settings = jsonb_set(
  o.settings,
  '{geography_focus}',
  (
    SELECT jsonb_agg(DISTINCT replacement ORDER BY replacement)
    FROM jsonb_array_elements_text(COALESCE(o.settings->'geography_focus', '[]'::jsonb)) AS elem(e),
    LATERAL (
      SELECT CASE
        WHEN elem.e = 'AMERICAS' THEN ARRAY['SOUTH_AMERICA', 'CENTRAL_AMERICA', 'NORTH_AMERICA']
        ELSE ARRAY[elem.e]
      END AS arr
    ) exp,
    LATERAL unnest(exp.arr) AS replacement
  )::jsonb
)
WHERE (o.settings->'geography_focus') @> '["AMERICAS"]'::jsonb;

-- =============================================
-- 4. Remove the old AMERICAS continent row
-- =============================================
DELETE FROM geographies
WHERE code = 'AMERICAS' AND type = 'continent';
