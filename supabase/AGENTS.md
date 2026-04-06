# supabase/

## Identidade do pacote
- Migrations e seed do banco Supabase (SQL)

## Setup e execução
- Use o fluxo da equipe para aplicar migrations (CLI ou dashboard)

## Padrões e convenções
- Cada mudança de schema vira um novo arquivo em `supabase/migrations`
- Nomeie migrations como `YYYYMMDDHHMMSS_descricao.sql`
  - Exemplo: `supabase/migrations/20260110000000_profile_backcompat.sql`
- Evite editar migrations já aplicadas; crie uma nova
- Seed data fica em `supabase/seed.sql`
- Mudanças de schema exigem revisar tipos e queries em `src/lib/supabase` e `src/types`

## Tabelas Principais

### Onboarding & Eligibility
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `organizations` | Organizações/contas (investor, asset, advisor) | ✅ |
| `organization_members` | Membros com roles (owner, admin, member, viewer) | ✅ |
| `eligibility_reviews` | Solicitações de revisão manual de elegibilidade | ✅ |
| `geographies` | Hierarquia de geografias (continente → país → estado) | ✅ |

### Auth & Sessions
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `user_profiles` | Perfis de usuário (telefone, MFA) | ❌ |
| `user_sessions` | Sessões ativas | ❌ |
| `otp_codes` | Códigos OTP para MFA | ❌ |
| `known_devices` | Dispositivos conhecidos | ❌ |

### Projects & Taxonomy
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `projects` | Projetos M&A | ✅ |
| `taxonomy_maics` | Taxonomia setorial (L1/L2/L3) | ✅ |
| `advisor_project_assignments` | Assignments de advisors a projetos | ✅ |

## Arquivos chave
- `supabase/migrations/20251229125143_organizations_rbac_phase2.sql`
- `supabase/migrations/20260109141549_onboarding_schema_phase3.sql`
- `supabase/migrations/20260119102236_fase4_projects_schema.sql`
- `supabase/migrations/20260131134206_create_geographies_table.sql`
- `supabase/migrations/20260131145732_create_eligibility_reviews_table.sql`
- `supabase/seed.sql`

## JIT Index
- Tabelas/colunas: `rg -n "CREATE TABLE|ALTER TABLE" supabase/migrations`
- Policies/roles: `rg -n "POLICY|ROLE" supabase/migrations`
- Enums: `rg -n "CREATE TYPE" supabase/migrations`

## Pre-PR
- Garanta que migrations novas tenham revisão de segurança
- Verifique RLS policies para tabelas públicas
- Atualize `src/types/database.ts` após mudanças de schema
