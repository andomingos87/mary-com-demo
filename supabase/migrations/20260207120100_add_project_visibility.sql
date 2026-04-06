-- Add visibility column to projects table
ALTER TABLE projects ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('public', 'private'));

CREATE INDEX idx_projects_visibility ON projects (visibility) WHERE deleted_at IS NULL;
