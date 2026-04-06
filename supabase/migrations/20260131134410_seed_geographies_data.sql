-- TASK-012b: Seed geography hierarchy data
-- Continents, key M&A market countries, and Brazilian states

-- =============================================
-- LEVEL 1: CONTINENTS (+ Global)
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, sort_order) VALUES
('GLOBAL', 'continent', NULL, 'Global', 'Global', 0),
('AMERICAS', 'continent', NULL, 'Americas', 'Américas', 1),
('EUROPE', 'continent', NULL, 'Europe', 'Europa', 2),
('ASIA', 'continent', NULL, 'Asia', 'Ásia', 3),
('AFRICA', 'continent', NULL, 'Africa', 'África', 4),
('OCEANIA', 'continent', NULL, 'Oceania', 'Oceania', 5),
('MIDDLE_EAST', 'continent', NULL, 'Middle East', 'Oriente Médio', 6);

-- =============================================
-- LEVEL 2: COUNTRIES - AMERICAS
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'AMERICAS'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('BR', 'Brazil', 'Brasil', '🇧🇷', 'BRA', 1),
  ('US', 'United States', 'Estados Unidos', '🇺🇸', 'USA', 2),
  ('MX', 'Mexico', 'México', '🇲🇽', 'MEX', 3),
  ('AR', 'Argentina', 'Argentina', '🇦🇷', 'ARG', 4),
  ('CL', 'Chile', 'Chile', '🇨🇱', 'CHL', 5),
  ('CO', 'Colombia', 'Colômbia', '🇨🇴', 'COL', 6),
  ('PE', 'Peru', 'Peru', '🇵🇪', 'PER', 7),
  ('UY', 'Uruguay', 'Uruguai', '🇺🇾', 'URY', 8),
  ('PY', 'Paraguay', 'Paraguai', '🇵🇾', 'PRY', 9),
  ('EC', 'Ecuador', 'Equador', '🇪🇨', 'ECU', 10),
  ('BO', 'Bolivia', 'Bolívia', '🇧🇴', 'BOL', 11),
  ('VE', 'Venezuela', 'Venezuela', '🇻🇪', 'VEN', 12),
  ('PA', 'Panama', 'Panamá', '🇵🇦', 'PAN', 13),
  ('CR', 'Costa Rica', 'Costa Rica', '🇨🇷', 'CRI', 14),
  ('DO', 'Dominican Republic', 'República Dominicana', '🇩🇴', 'DOM', 15),
  ('GT', 'Guatemala', 'Guatemala', '🇬🇹', 'GTM', 16),
  ('CA', 'Canada', 'Canadá', '🇨🇦', 'CAN', 17)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 2: COUNTRIES - EUROPE
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'EUROPE'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('GB', 'United Kingdom', 'Reino Unido', '🇬🇧', 'GBR', 1),
  ('DE', 'Germany', 'Alemanha', '🇩🇪', 'DEU', 2),
  ('FR', 'France', 'França', '🇫🇷', 'FRA', 3),
  ('ES', 'Spain', 'Espanha', '🇪🇸', 'ESP', 4),
  ('IT', 'Italy', 'Itália', '🇮🇹', 'ITA', 5),
  ('PT', 'Portugal', 'Portugal', '🇵🇹', 'PRT', 6),
  ('NL', 'Netherlands', 'Países Baixos', '🇳🇱', 'NLD', 7),
  ('BE', 'Belgium', 'Bélgica', '🇧🇪', 'BEL', 8),
  ('CH', 'Switzerland', 'Suíça', '🇨🇭', 'CHE', 9),
  ('AT', 'Austria', 'Áustria', '🇦🇹', 'AUT', 10),
  ('SE', 'Sweden', 'Suécia', '🇸🇪', 'SWE', 11),
  ('NO', 'Norway', 'Noruega', '🇳🇴', 'NOR', 12),
  ('DK', 'Denmark', 'Dinamarca', '🇩🇰', 'DNK', 13),
  ('FI', 'Finland', 'Finlândia', '🇫🇮', 'FIN', 14),
  ('IE', 'Ireland', 'Irlanda', '🇮🇪', 'IRL', 15),
  ('PL', 'Poland', 'Polônia', '🇵🇱', 'POL', 16),
  ('CZ', 'Czech Republic', 'República Tcheca', '🇨🇿', 'CZE', 17),
  ('GR', 'Greece', 'Grécia', '🇬🇷', 'GRC', 18),
  ('LU', 'Luxembourg', 'Luxemburgo', '🇱🇺', 'LUX', 19)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 2: COUNTRIES - ASIA
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'ASIA'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('CN', 'China', 'China', '🇨🇳', 'CHN', 1),
  ('JP', 'Japan', 'Japão', '🇯🇵', 'JPN', 2),
  ('KR', 'South Korea', 'Coreia do Sul', '🇰🇷', 'KOR', 3),
  ('IN', 'India', 'Índia', '🇮🇳', 'IND', 4),
  ('SG', 'Singapore', 'Singapura', '🇸🇬', 'SGP', 5),
  ('HK', 'Hong Kong', 'Hong Kong', '🇭🇰', 'HKG', 6),
  ('TW', 'Taiwan', 'Taiwan', '🇹🇼', 'TWN', 7),
  ('TH', 'Thailand', 'Tailândia', '🇹🇭', 'THA', 8),
  ('MY', 'Malaysia', 'Malásia', '🇲🇾', 'MYS', 9),
  ('ID', 'Indonesia', 'Indonésia', '🇮🇩', 'IDN', 10),
  ('VN', 'Vietnam', 'Vietnã', '🇻🇳', 'VNM', 11),
  ('PH', 'Philippines', 'Filipinas', '🇵🇭', 'PHL', 12)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 2: COUNTRIES - MIDDLE EAST
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'MIDDLE_EAST'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('AE', 'United Arab Emirates', 'Emirados Árabes', '🇦🇪', 'ARE', 1),
  ('SA', 'Saudi Arabia', 'Arábia Saudita', '🇸🇦', 'SAU', 2),
  ('IL', 'Israel', 'Israel', '🇮🇱', 'ISR', 3),
  ('QA', 'Qatar', 'Catar', '🇶🇦', 'QAT', 4),
  ('KW', 'Kuwait', 'Kuwait', '🇰🇼', 'KWT', 5),
  ('BH', 'Bahrain', 'Bahrein', '🇧🇭', 'BHR', 6),
  ('OM', 'Oman', 'Omã', '🇴🇲', 'OMN', 7)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 2: COUNTRIES - AFRICA
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'AFRICA'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('ZA', 'South Africa', 'África do Sul', '🇿🇦', 'ZAF', 1),
  ('EG', 'Egypt', 'Egito', '🇪🇬', 'EGY', 2),
  ('NG', 'Nigeria', 'Nigéria', '🇳🇬', 'NGA', 3),
  ('KE', 'Kenya', 'Quênia', '🇰🇪', 'KEN', 4),
  ('MA', 'Morocco', 'Marrocos', '🇲🇦', 'MAR', 5),
  ('AO', 'Angola', 'Angola', '🇦🇴', 'AGO', 6),
  ('MZ', 'Mozambique', 'Moçambique', '🇲🇿', 'MOZ', 7)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 2: COUNTRIES - OCEANIA
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, flag_emoji, iso_code, sort_order)
SELECT code, 'country', (SELECT id FROM geographies WHERE code = 'OCEANIA'), name_en, name_pt, flag_emoji, iso_code, sort_order
FROM (VALUES
  ('AU', 'Australia', 'Austrália', '🇦🇺', 'AUS', 1),
  ('NZ', 'New Zealand', 'Nova Zelândia', '🇳🇿', 'NZL', 2)
) AS t(code, name_en, name_pt, flag_emoji, iso_code, sort_order);

-- =============================================
-- LEVEL 3: BRAZILIAN STATES (all 27)
-- =============================================
INSERT INTO geographies (code, type, parent_id, name_en, name_pt, iso_code, sort_order)
SELECT code, 'state', (SELECT id FROM geographies WHERE code = 'BR'), name_en, name_pt, iso_code, sort_order
FROM (VALUES
  -- Sudeste (principais mercados)
  ('BR-SP', 'São Paulo', 'São Paulo', 'BR-SP', 1),
  ('BR-RJ', 'Rio de Janeiro', 'Rio de Janeiro', 'BR-RJ', 2),
  ('BR-MG', 'Minas Gerais', 'Minas Gerais', 'BR-MG', 3),
  ('BR-ES', 'Espírito Santo', 'Espírito Santo', 'BR-ES', 4),
  -- Sul
  ('BR-PR', 'Paraná', 'Paraná', 'BR-PR', 5),
  ('BR-SC', 'Santa Catarina', 'Santa Catarina', 'BR-SC', 6),
  ('BR-RS', 'Rio Grande do Sul', 'Rio Grande do Sul', 'BR-RS', 7),
  -- Centro-Oeste
  ('BR-DF', 'Federal District', 'Distrito Federal', 'BR-DF', 8),
  ('BR-GO', 'Goiás', 'Goiás', 'BR-GO', 9),
  ('BR-MT', 'Mato Grosso', 'Mato Grosso', 'BR-MT', 10),
  ('BR-MS', 'Mato Grosso do Sul', 'Mato Grosso do Sul', 'BR-MS', 11),
  -- Nordeste
  ('BR-BA', 'Bahia', 'Bahia', 'BR-BA', 12),
  ('BR-PE', 'Pernambuco', 'Pernambuco', 'BR-PE', 13),
  ('BR-CE', 'Ceará', 'Ceará', 'BR-CE', 14),
  ('BR-MA', 'Maranhão', 'Maranhão', 'BR-MA', 15),
  ('BR-PB', 'Paraíba', 'Paraíba', 'BR-PB', 16),
  ('BR-RN', 'Rio Grande do Norte', 'Rio Grande do Norte', 'BR-RN', 17),
  ('BR-AL', 'Alagoas', 'Alagoas', 'BR-AL', 18),
  ('BR-PI', 'Piauí', 'Piauí', 'BR-PI', 19),
  ('BR-SE', 'Sergipe', 'Sergipe', 'BR-SE', 20),
  -- Norte
  ('BR-AM', 'Amazonas', 'Amazonas', 'BR-AM', 21),
  ('BR-PA', 'Pará', 'Pará', 'BR-PA', 22),
  ('BR-RO', 'Rondônia', 'Rondônia', 'BR-RO', 23),
  ('BR-AC', 'Acre', 'Acre', 'BR-AC', 24),
  ('BR-AP', 'Amapá', 'Amapá', 'BR-AP', 25),
  ('BR-RR', 'Roraima', 'Roraima', 'BR-RR', 26),
  ('BR-TO', 'Tocantins', 'Tocantins', 'BR-TO', 27)
) AS t(code, name_en, name_pt, iso_code, sort_order);
