-- RLS policies for project_invites
ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;

-- SELECT: inviter, project manager, org admin, or invitee by email
CREATE POLICY "project_invites_select" ON project_invites
  FOR SELECT USING (
    project_invites.invited_by = auth.uid()
    OR project_invites.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_invites.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          om.role IN ('admin', 'owner')
          OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.role = 'manager'
          )
        )
    )
  );

-- INSERT: project creator, manager, or org admin/owner
CREATE POLICY "project_invites_insert" ON project_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_invites.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          p.created_by = auth.uid()
          OR om.role IN ('admin', 'owner')
          OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.role = 'manager'
          )
        )
    )
  );

-- DELETE: inviter or org admin/owner
CREATE POLICY "project_invites_delete" ON project_invites
  FOR DELETE USING (
    project_invites.invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_invites.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
  );
