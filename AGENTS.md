# Mary AI Platform

## Project Snapshot
- **Tipo:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase
- **Domínio:** Plataforma B2B de ecossistema M&A (Mergers & Acquisitions)
- **Deploy:** Vercel (região São Paulo)
- **Detalhes específicos:** Consulte os sub-AGENTS.md linkados abaixo
- **Navegação documental:** use `DOCS.md` como índice mestre de backlog/specs/guias canônicos

## Root Setup Commands
```bash
npm install          # Instalar dependências
npm run dev          # Dev server (localhost:3000)
npm run build        # Build de produção
npm run lint         # ESLint
npm run test         # Jest tests
npm run validate     # Full validation: build + bundle + test
```

## Universal Conventions
- **Imports:** Sempre use `@/` para `src/` (configurado em `tsconfig.json`)
- **Componentes:** shadcn/ui (Radix primitives) em `src/components/ui`
- **Server Actions:** Centralizadas em `src/lib/actions/`
- **Documentação canônica:** backlog em `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`; specs em `.dev/specs/`; guias em `.dev/guides/`
- **Supabase Clients:**
  - Browser: `import { createClient } from '@/lib/supabase/client'`
  - Server: `import { createServerClient } from '@/lib/supabase/server'`
- **Testes:** Colocados em `__tests__` com extensão `*.test.ts(x)`
- **Multi-tenant:** Rotas via `[orgSlug]` em `src/app/(protected)/`

## Security & Secrets
- **NUNCA** commitar `.env*`, chaves de serviço ou tokens
- Remover/mascarar PII em exemplos e logs
- Validar env: `node scripts/validate-env.js`
- **`SUPABASE_SERVICE_ROLE_KEY`** obrigatória para `createAdminClient` — obtenha em Supabase Dashboard → Settings → API → service_role key
- Revisar RLS policies em migrations antes de merge
- `SHOW_MFA_CODE=true` é **exclusiva para dev/test** — NUNCA habilitar em produção (bloqueia log de OTP automaticamente, mas gera warning)

## JIT Index

### Package Structure
| Diretório | Responsabilidade | Sub-AGENTS.md |
|-----------|------------------|---------------|
| `src/` | App Next.js (pages, components, actions) | [src/AGENTS.md](src/AGENTS.md) |
| `supabase/` | Migrations, RLS policies, seed data | [supabase/AGENTS.md](supabase/AGENTS.md) |
| `.dev/production/` | Backlog, PRD, auditorias e specs de entrega | [.dev/production/AGENTS.md](.dev/production/AGENTS.md) |
| `.dev/docs/` | Documentação funcional e técnica | [.dev/docs/AGENTS.md](.dev/docs/AGENTS.md) |
| `scripts/` | Scripts de manutenção/diagnóstico | [scripts/AGENTS.md](scripts/AGENTS.md) |
| `ajustes_cliente/` | Materiais e entregáveis do cliente | [ajustes_cliente/AGENTS.md](ajustes_cliente/AGENTS.md) |

### Quick Find Commands
```bash
# Route handlers (GET, POST, PUT, DELETE)
rg -n "export (async )?function (GET|POST|PUT|DELETE)" src/app/api

# Server actions
rg -n "export async function" src/lib/actions

# Componentes por nome
rg -n "export (function|const)" src/components

# Supabase clients
rg -n "create.*Client" src

# Tabelas/policies no banco
rg -n "CREATE TABLE|POLICY" supabase/migrations

# Testes
rg -n "describe\(" src/**/__tests__
```

### Key Entry Points
- **Auth middleware:** `src/middleware.ts`
- **Root layout:** `src/app/layout.tsx`
- **Protected routes:** `src/app/(protected)/`
- **API routes:** `src/app/api/`
- **Database types:** `src/types/database.ts` (auto-generated)

## Definition of Done
```bash
npm run lint && npm run test && npm run build
# Ou validação completa:
npm run validate
```
