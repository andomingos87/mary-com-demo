-- Test Data Cleanup (Mary)
-- ==========================================================
-- Objetivo:
-- 1) DRY-RUN: listar quantos registros seriam removidos
-- 2) EXECUCAO: remover usuarios de teste + dados relacionados
--
-- IMPORTANTE:
-- - Sempre rode primeiro o bloco DRY-RUN.
-- - Revise os filtros de email/teste antes de executar.
-- - Execute em transacao (ja incluido no bloco EXECUCAO).
-- ==========================================================

-- ==========================================================
-- BLOCO 1: DRY-RUN (nao remove nada)
-- ==========================================================
with
config as (
  select
    array[
      '%@andersondomingos.com.br'
    ]::text[] as email_patterns,
    array[
      -- Ex.: 'qa1@minhaempresa.com',
      --      'qa2@minhaempresa.com'
    ]::text[] as explicit_emails,
    array[
      -- Ex.: '11111111-1111-1111-1111-111111111111'::uuid
    ]::uuid[] as explicit_user_ids,
    array[
      'admin@mary.com.br'
    ]::text[] as protected_emails
),
target_users as (
  select u.id, lower(u.email) as email
  from auth.users u
  cross join config c
  where coalesce(u.deleted_at, 'infinity'::timestamptz) = 'infinity'::timestamptz
    and (
      lower(u.email) like any(c.email_patterns)
      or lower(u.email) = any(c.explicit_emails)
      or u.id = any(c.explicit_user_ids)
      or coalesce((u.raw_user_meta_data ->> 'is_test')::boolean, false) = true
    )
    and lower(u.email) <> all(c.protected_emails)
),
target_orgs as (
  select distinct o.id
  from public.organizations o
  left join public.organization_members om on om.organization_id = o.id
  where o.created_by_user_id in (select id from target_users)
     or o.created_by in (select id from target_users)
     or om.user_id in (select id from target_users)
),
target_projects as (
  select distinct p.id
  from public.projects p
  where p.created_by in (select id from target_users)
     or p.updated_by in (select id from target_users)
     or p.organization_id in (select id from target_orgs)
     or p.asset_org_id in (select id from target_orgs)
     or p.buyer_org_id in (select id from target_orgs)
),
counts as (
  select 'auth.users' as table_name, count(*)::bigint as qty from auth.users where id in (select id from target_users)
  union all select 'public.user_profiles', count(*) from public.user_profiles where user_id in (select id from target_users)
  union all select 'public.user_sessions', count(*) from public.user_sessions where user_id in (select id from target_users)
  union all select 'public.otp_codes', count(*) from public.otp_codes where user_id in (select id from target_users)
  union all select 'public.known_devices', count(*) from public.known_devices where user_id in (select id from target_users)
  union all select 'public.whatsapp_messages', count(*) from public.whatsapp_messages where user_id in (select id from target_users)
  union all select 'public.notifications', count(*) from public.notifications where user_id in (select id from target_users)
  union all select 'public.audit_logs', count(*) from public.audit_logs where user_id in (select id from target_users)
  union all select 'public.organization_members', count(*) from public.organization_members where user_id in (select id from target_users) or organization_id in (select id from target_orgs)
  union all select 'public.organization_invites', count(*) from public.organization_invites where invited_by in (select id from target_users) or organization_id in (select id from target_orgs)
  union all select 'public.organizations', count(*) from public.organizations where id in (select id from target_orgs)
  union all select 'public.projects', count(*) from public.projects where id in (select id from target_projects)
  union all select 'public.project_members', count(*) from public.project_members where user_id in (select id from target_users) or project_id in (select id from target_projects)
  union all select 'public.project_invites', count(*) from public.project_invites where invited_by in (select id from target_users) or project_id in (select id from target_projects)
  union all select 'public.advisor_project_assignments', count(*) from public.advisor_project_assignments
    where advisor_member_id in (select id from public.organization_members where user_id in (select id from target_users))
       or assigned_by in (select id from target_users)
       or project_id in (select id from target_projects)
  union all select 'public.eligibility_reviews', count(*) from public.eligibility_reviews
    where submitted_by in (select id from target_users)
       or reviewed_by in (select id from target_users)
       or organization_id in (select id from target_orgs)
  union all select 'public.investment_theses', count(*) from public.investment_theses
    where created_by in (select id from target_users)
       or updated_by in (select id from target_users)
       or organization_id in (select id from target_orgs)
  union all select 'public.investor_theses', count(*) from public.investor_theses
    where created_by in (select id from target_users)
       or organization_id in (select id from target_orgs)
  union all select 'public.thesis_filters_sector', count(*) from public.thesis_filters_sector where thesis_id in (select id from public.investor_theses where organization_id in (select id from target_orgs))
  union all select 'public.thesis_filters_geo', count(*) from public.thesis_filters_geo where thesis_id in (select id from public.investor_theses where organization_id in (select id from target_orgs))
  union all select 'public.thesis_filters_ranges', count(*) from public.thesis_filters_ranges where thesis_id in (select id from public.investor_theses where organization_id in (select id from target_orgs))
  union all select 'public.matches', count(*) from public.matches where project_id in (select id from target_projects)
  union all select 'public.investor_follows', count(*) from public.investor_follows
    where created_by in (select id from target_users)
       or updated_by in (select id from target_users)
       or project_id in (select id from target_projects)
       or investor_organization_id in (select id from target_orgs)
       or asset_organization_id in (select id from target_orgs)
  union all select 'public.nda_requests', count(*) from public.nda_requests
    where requested_by in (select id from target_users)
       or reviewed_by in (select id from target_users)
       or updated_by in (select id from target_users)
       or project_id in (select id from target_projects)
       or investor_organization_id in (select id from target_orgs)
       or asset_organization_id in (select id from target_orgs)
  union all select 'public.ndas', count(*) from public.ndas
    where created_by in (select id from target_users)
       or reviewed_by in (select id from target_users)
       or project_id in (select id from target_projects)
       or investor_org_id in (select id from target_orgs)
  union all select 'public.investor_drs', count(*) from public.investor_drs
    where project_id in (select id from target_projects)
       or investor_org_id in (select id from target_orgs)
  union all select 'public.teasers', count(*) from public.teasers
    where created_by in (select id from target_users)
       or approved_by in (select id from target_users)
       or project_id in (select id from target_projects)
  union all select 'public.vdr_folders', count(*) from public.vdr_folders where project_id in (select id from target_projects) or created_by in (select id from target_users)
  union all select 'public.vdr_documents', count(*) from public.vdr_documents where project_id in (select id from target_projects) or created_by in (select id from target_users)
  union all select 'public.vdr_document_files', count(*) from public.vdr_document_files
    where document_id in (select id from public.vdr_documents where project_id in (select id from target_projects))
       or uploaded_by in (select id from target_users)
  union all select 'public.vdr_document_links', count(*) from public.vdr_document_links
    where document_id in (select id from public.vdr_documents where project_id in (select id from target_projects))
       or created_by in (select id from target_users)
  union all select 'public.vdr_document_validations', count(*) from public.vdr_document_validations
    where project_id in (select id from target_projects)
       or validated_by in (select id from target_users)
  union all select 'public.vdr_qa_messages', count(*) from public.vdr_qa_messages
    where project_id in (select id from target_projects)
       or author_id in (select id from target_users)
       or author_org_id in (select id from target_orgs)
  union all select 'public.vdr_access_permissions', count(*) from public.vdr_access_permissions
    where project_id in (select id from target_projects)
       or grantee_org_id in (select id from target_orgs)
       or grantee_user_id in (select id from target_users)
       or granted_by in (select id from target_users)
       or revoked_by in (select id from target_users)
  union all select 'public.vdr_shared_links', count(*) from public.vdr_shared_links
    where project_id in (select id from target_projects)
       or created_by in (select id from target_users)
       or revoked_by in (select id from target_users)
  union all select 'public.vdr_access_logs', count(*) from public.vdr_access_logs
    where project_id in (select id from target_projects)
       or user_id in (select id from target_users)
       or organization_id in (select id from target_orgs)
)
select *
from counts
where qty > 0
order by qty desc, table_name;

-- ==========================================================
-- BLOCO 2: EXECUCAO REAL (remove dados)
-- ==========================================================
-- 1) Rode este bloco SOMENTE apos validar o DRY-RUN
-- 2) Se algo parecer incorreto, execute ROLLBACK em vez de COMMIT

begin;

create temp table tmp_target_users on commit drop as
with config as (
  select
    array[
      '%@andersondomingos.com.br'
    ]::text[] as email_patterns,
    array[
      -- Ex.: 'qa1@minhaempresa.com',
      --      'qa2@minhaempresa.com'
    ]::text[] as explicit_emails,
    array[
      -- Ex.: '11111111-1111-1111-1111-111111111111'::uuid
    ]::uuid[] as explicit_user_ids,
    array[
      'admin@mary.com.br'
    ]::text[] as protected_emails
)
select u.id, lower(u.email) as email
from auth.users u
cross join config c
where coalesce(u.deleted_at, 'infinity'::timestamptz) = 'infinity'::timestamptz
  and (
    lower(u.email) like any(c.email_patterns)
    or lower(u.email) = any(c.explicit_emails)
    or u.id = any(c.explicit_user_ids)
    or coalesce((u.raw_user_meta_data ->> 'is_test')::boolean, false) = true
  )
  and lower(u.email) <> all(c.protected_emails);

create temp table tmp_target_orgs on commit drop as
select distinct o.id
from public.organizations o
left join public.organization_members om on om.organization_id = o.id
where o.created_by_user_id in (select id from tmp_target_users)
   or o.created_by in (select id from tmp_target_users)
   or om.user_id in (select id from tmp_target_users);

create temp table tmp_target_projects on commit drop as
select distinct p.id
from public.projects p
where p.created_by in (select id from tmp_target_users)
   or p.updated_by in (select id from tmp_target_users)
   or p.organization_id in (select id from tmp_target_orgs)
   or p.asset_org_id in (select id from tmp_target_orgs)
   or p.buyer_org_id in (select id from tmp_target_orgs);

-- Referencias de tese
delete from public.thesis_filters_sector where thesis_id in (select id from public.investor_theses where organization_id in (select id from tmp_target_orgs));
delete from public.thesis_filters_geo where thesis_id in (select id from public.investor_theses where organization_id in (select id from tmp_target_orgs));
delete from public.thesis_filters_ranges where thesis_id in (select id from public.investor_theses where organization_id in (select id from tmp_target_orgs));

-- VDR (filhos -> pais)
delete from public.vdr_access_logs
where project_id in (select id from tmp_target_projects)
   or user_id in (select id from tmp_target_users)
   or organization_id in (select id from tmp_target_orgs);

delete from public.vdr_access_permissions
where project_id in (select id from tmp_target_projects)
   or grantee_org_id in (select id from tmp_target_orgs)
   or grantee_user_id in (select id from tmp_target_users)
   or granted_by in (select id from tmp_target_users)
   or revoked_by in (select id from tmp_target_users);

delete from public.vdr_qa_messages
where project_id in (select id from tmp_target_projects)
   or author_id in (select id from tmp_target_users)
   or author_org_id in (select id from tmp_target_orgs);

delete from public.vdr_document_validations
where project_id in (select id from tmp_target_projects)
   or validated_by in (select id from tmp_target_users);

delete from public.vdr_document_files
where document_id in (select id from public.vdr_documents where project_id in (select id from tmp_target_projects))
   or uploaded_by in (select id from tmp_target_users);

delete from public.vdr_document_links
where document_id in (select id from public.vdr_documents where project_id in (select id from tmp_target_projects))
   or created_by in (select id from tmp_target_users);

delete from public.vdr_shared_links
where project_id in (select id from tmp_target_projects)
   or created_by in (select id from tmp_target_users)
   or revoked_by in (select id from tmp_target_users);

delete from public.vdr_documents
where project_id in (select id from tmp_target_projects)
   or created_by in (select id from tmp_target_users);

delete from public.vdr_folders
where project_id in (select id from tmp_target_projects)
   or created_by in (select id from tmp_target_users);

-- Fluxos de matching e radar
delete from public.matches where project_id in (select id from tmp_target_projects);
delete from public.investor_follows
where project_id in (select id from tmp_target_projects)
   or investor_organization_id in (select id from tmp_target_orgs)
   or asset_organization_id in (select id from tmp_target_orgs)
   or created_by in (select id from tmp_target_users)
   or updated_by in (select id from tmp_target_users);
delete from public.nda_requests
where project_id in (select id from tmp_target_projects)
   or investor_organization_id in (select id from tmp_target_orgs)
   or asset_organization_id in (select id from tmp_target_orgs)
   or requested_by in (select id from tmp_target_users)
   or reviewed_by in (select id from tmp_target_users)
   or updated_by in (select id from tmp_target_users);
delete from public.investor_drs
where project_id in (select id from tmp_target_projects)
   or investor_org_id in (select id from tmp_target_orgs);
delete from public.ndas
where project_id in (select id from tmp_target_projects)
   or investor_org_id in (select id from tmp_target_orgs)
   or created_by in (select id from tmp_target_users)
   or reviewed_by in (select id from tmp_target_users);
delete from public.teasers
where project_id in (select id from tmp_target_projects)
   or created_by in (select id from tmp_target_users)
   or approved_by in (select id from tmp_target_users);

-- Projetos e membros
delete from public.advisor_project_assignments
where project_id in (select id from tmp_target_projects)
   or assigned_by in (select id from tmp_target_users)
   or advisor_member_id in (select id from public.organization_members where user_id in (select id from tmp_target_users));
delete from public.project_invites
where project_id in (select id from tmp_target_projects)
   or invited_by in (select id from tmp_target_users);
delete from public.project_members
where project_id in (select id from tmp_target_projects)
   or user_id in (select id from tmp_target_users)
   or added_by in (select id from tmp_target_users);
delete from public.projects where id in (select id from tmp_target_projects);

-- Teses
delete from public.investment_theses
where organization_id in (select id from tmp_target_orgs)
   or created_by in (select id from tmp_target_users)
   or updated_by in (select id from tmp_target_users);
delete from public.investor_theses
where organization_id in (select id from tmp_target_orgs)
   or created_by in (select id from tmp_target_users);

-- Organizacao
delete from public.settings_matching where organization_id in (select id from tmp_target_orgs);
delete from public.eligibility_reviews
where organization_id in (select id from tmp_target_orgs)
   or submitted_by in (select id from tmp_target_users)
   or reviewed_by in (select id from tmp_target_users);
delete from public.organization_invites
where organization_id in (select id from tmp_target_orgs)
   or invited_by in (select id from tmp_target_users);
delete from public.organization_members
where organization_id in (select id from tmp_target_orgs)
   or user_id in (select id from tmp_target_users)
   or invited_by in (select id from tmp_target_users);
delete from public.organizations where id in (select id from tmp_target_orgs);

-- User-centric
delete from public.notifications where user_id in (select id from tmp_target_users);
delete from public.whatsapp_messages where user_id in (select id from tmp_target_users);
delete from public.known_devices where user_id in (select id from tmp_target_users);
delete from public.otp_codes where user_id in (select id from tmp_target_users);
delete from public.user_sessions where user_id in (select id from tmp_target_users);
delete from public.user_profiles where user_id in (select id from tmp_target_users);
delete from public.audit_logs where user_id in (select id from tmp_target_users);

-- Auth (por ultimo)
delete from auth.users where id in (select id from tmp_target_users);

-- Preview final
select
  (select count(*) from tmp_target_users) as deleted_users,
  (select count(*) from tmp_target_orgs) as deleted_organizations,
  (select count(*) from tmp_target_projects) as deleted_projects;

-- Se estiver tudo certo:
commit;
-- Se quiser desfazer manualmente antes do commit:
-- rollback;

