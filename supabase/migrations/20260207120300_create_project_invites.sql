-- Create project invites table
CREATE TABLE project_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role project_member_role NOT NULL DEFAULT 'viewer',
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, email)
);

CREATE UNIQUE INDEX idx_project_invites_token ON project_invites (token);
CREATE INDEX idx_project_invites_project ON project_invites (project_id);
CREATE INDEX idx_project_invites_email ON project_invites (email);

-- Trigger to enforce max 20 pending invites per project
CREATE OR REPLACE FUNCTION validate_project_invite_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM project_invites WHERE project_id = NEW.project_id) >= 20 THEN
    RAISE EXCEPTION 'Maximum of 20 pending invites per project reached'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_project_invite_limit
  BEFORE INSERT ON project_invites
  FOR EACH ROW
  EXECUTE FUNCTION validate_project_invite_limit();
