-- RLS policies for project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- SELECT: org member can see if project is public OR they are a project member OR they are org admin/owner
CREATE POLICY "project_members_select" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          p.visibility = 'public'
          OR project_members.user_id = auth.uid()
          OR om.role IN ('admin', 'owner')
        )
    )
  );

-- INSERT: project creator, manager, or org admin/owner
CREATE POLICY "project_members_insert" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          p.created_by = auth.uid()
          OR om.role IN ('admin', 'owner')
          OR EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = p.id
              AND pm2.user_id = auth.uid()
              AND pm2.role = 'manager'
          )
        )
    )
  );

-- UPDATE: project creator, manager, or org admin/owner
CREATE POLICY "project_members_update" ON project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          p.created_by = auth.uid()
          OR om.role IN ('admin', 'owner')
          OR EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = p.id
              AND pm2.user_id = auth.uid()
              AND pm2.role = 'manager'
          )
        )
    )
  );

-- DELETE: project creator, manager, or org admin/owner
CREATE POLICY "project_members_delete" ON project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_members.project_id
        AND om.user_id = auth.uid()
        AND p.deleted_at IS NULL
        AND (
          p.created_by = auth.uid()
          OR om.role IN ('admin', 'owner')
          OR EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = p.id
              AND pm2.user_id = auth.uid()
              AND pm2.role = 'manager'
          )
        )
    )
  );
