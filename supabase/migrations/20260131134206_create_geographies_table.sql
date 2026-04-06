-- TASK-012a: Geography hierarchy table for cascading selector
-- Pattern: Self-referencing adjacency list for flexible hierarchy

CREATE TABLE geographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  code VARCHAR(20) UNIQUE NOT NULL,        -- 'AMERICAS', 'BR', 'BR-SP'
  type VARCHAR(20) NOT NULL,               -- 'continent', 'country', 'state', 'region'

  -- Hierarchy (self-referencing)
  parent_id UUID REFERENCES geographies(id) ON DELETE CASCADE,

  -- Display names (i18n ready)
  name_en VARCHAR(100) NOT NULL,           -- 'Brazil'
  name_pt VARCHAR(100),                    -- 'Brasil'
  flag_emoji VARCHAR(10),                  -- '🇧🇷' (for countries)

  -- Metadata
  iso_code VARCHAR(10),                    -- ISO 3166-1/2 codes
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_geography_type CHECK (type IN ('continent', 'country', 'state', 'region'))
);

-- Add comment for documentation
COMMENT ON TABLE geographies IS 'Hierarchical geography data for cascading location selectors';
COMMENT ON COLUMN geographies.code IS 'Unique code: continent (AMERICAS), country ISO (BR), state ISO (BR-SP)';
COMMENT ON COLUMN geographies.parent_id IS 'Self-reference for hierarchy: state->country->continent';

-- Performance indexes
CREATE INDEX idx_geographies_parent ON geographies(parent_id);
CREATE INDEX idx_geographies_type ON geographies(type);
CREATE INDEX idx_geographies_code ON geographies(code);
CREATE INDEX idx_geographies_active ON geographies(is_active) WHERE is_active = true;
CREATE INDEX idx_geographies_sort ON geographies(parent_id, sort_order);

-- Enable RLS
ALTER TABLE geographies ENABLE ROW LEVEL SECURITY;

-- Public read access (reference data)
CREATE POLICY "geographies_public_read"
  ON geographies
  FOR SELECT
  USING (true);

-- Only service role can modify (via migrations/admin)
CREATE POLICY "geographies_service_insert"
  ON geographies
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "geographies_service_update"
  ON geographies
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "geographies_service_delete"
  ON geographies
  FOR DELETE
  TO service_role
  USING (true);

-- Updated_at trigger
CREATE TRIGGER set_geographies_updated_at
  BEFORE UPDATE ON geographies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
