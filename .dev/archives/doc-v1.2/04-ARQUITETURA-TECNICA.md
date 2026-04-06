# 04 — Arquitetura Técnica

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Engenharia

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|--------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | TypeScript, Tailwind CSS, shadcn/ui (Radix primitives) |
| **Backend** | Supabase | PostgreSQL + RLS + Edge Functions |
| **Deploy** | Vercel | Plano pago, região São Paulo, staging separado |
| **IA** | OpenAI (principal) | Fallback: OpenRouter (Claude, Gemini, Grok) |
| **Pagamentos** | Stripe | Assinaturas recorrentes |
| **E-mail** | Brevo | Transacional |
| **WhatsApp** | Meta Business API | MFA + notificações |
| **Versionamento** | GitHub | CI/CD via Vercel |
| **Monitoramento** | A definir (Sentry sugerido) | Vercel Analytics como base |

---

## 2. Convenções de Código

| Aspecto | Padrão |
|---------|--------|
| Imports | `@/` para `src/` |
| Componentes UI | shadcn/ui em `src/components/ui` |
| Server Actions | `src/lib/actions/` |
| Supabase Client (Browser) | `import { createClient } from '@/lib/supabase/client'` |
| Supabase Client (Server) | `import { createServerClient } from '@/lib/supabase/server'` |
| Testes | `__tests__/*.test.ts(x)` |
| Multi-tenant | Rotas via `[orgSlug]` em `src/app/(protected)/` |
| Database types | `src/types/database.ts` (auto-generated) |

---

## 3. Estrutura de Diretórios (resumo)

```
src/
├── app/
│   ├── (protected)/           # Rotas autenticadas
│   │   ├── [orgSlug]/         # Multi-tenant por organização
│   │   │   ├── dashboard/
│   │   │   ├── thesis/
│   │   │   ├── opportunities/
│   │   │   ├── pipeline/
│   │   │   ├── projects/
│   │   │   ├── assetvdr/
│   │   │   ├── investorvdr/
│   │   │   ├── mary-ai-private/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── advisor/
│   │   └── admin/
│   ├── login/
│   ├── verify-mfa/
│   ├── onboarding/
│   └── api/
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── onboarding/            # Wizard (9 componentes + 2 hooks)
│   ├── navigation/            # Sidebar, Header, OrgSwitcher
│   ├── dashboard/             # Dashboards por perfil
│   ├── guards/                # ReadOnlyBanner, FeatureGate
│   ├── providers/             # OrganizationProvider, NavigationProvider
│   ├── mrs/                   # MRS components (ScoreCards, RadarChart, StepTable)
│   └── chat/                  # MaryAIChatSheet
├── lib/
│   ├── actions/               # Server Actions
│   ├── supabase/              # Clients (client, server, middleware)
│   └── enrichment/            # APIs externas (BrasilAPI, Jina, CVM, etc.)
├── types/
│   ├── database.ts            # Tipos auto-gerados do Supabase
│   ├── navigation.ts
│   └── onboarding.ts
└── middleware.ts               # Auth middleware
```

---

## 4. Modelo de Dados

### 4.1 Visão geral das tabelas

**Implementadas (11):**

| Tabela | Marco | Descrição |
|--------|-------|-----------|
| `profiles` | M1 | Perfis de usuário (FK auth) |
| `organizations` | M1 | Organizações (investor, asset, advisory) |
| `organization_members` | M1 | Membros e roles |
| `organization_invites` | M1 | Convites com expiração |
| `advisor_project_assignments` | M1 | Vinculação advisor↔projeto (sell/buy) |
| `audit_events` | M1 | Log de auditoria |
| `projects` | M2 | Projetos do ativo |
| `mary_taxonomy` | M2 | Taxonomia MAICS (L1/L2/L3) |
| `vdr_documents` | M2 | Itens do VDR |
| `vdr_document_links` | M2 | Links dos documentos |
| `vdr_document_validations` | M2 | Validações N1/N2/N3 |
| `vdr_qa_messages` | M2 | Comentários/Q&A |
| `vdr_access_logs` | M2 | Logs de acesso ao VDR |
| `vdr_access_permissions` | M2 | Permissões granulares |
| `cvm_participants` | M1 | Cache local CVM |

**Pendentes (16):**

| Tabela | Marco | Prioridade | Descrição |
|--------|-------|------------|-----------|
| `investor_theses` | M2 | P0 | Teses de investimento |
| `thesis_filters_sector` | M2 | P0 | Filtros setoriais da tese |
| `thesis_filters_geo` | M2 | P0 | Filtros geográficos da tese |
| `thesis_filters_ranges` | M2 | P0 | Filtros de range (ticket, receita, EBITDA) |
| `matches` | M2 | P0 | Resultados do matching (score + breakdown) |
| `ndas` | M2 | P0 | NDAs por par projeto×investidor |
| `teasers` | M2 | P0 | Teasers dos projetos |
| `investor_drs` | M2 | P0 | DR espelhado por investidor |
| `settings_matching` | M2 | P1 | Configurações de pesos do matching |
| `settings_readiness` | M2 | P2 | Pesos de readiness por seção |
| `pipeline_tickets` | M3 | P0 | Tickets do pipeline kanban |
| `notifications` | M3 | P0 | Sistema de notificações |
| `rag_chunks` | M3 | P0 | Chunks para RAG (embedding_vector) |
| `qna_threads` | M3 | P1 | Threads de Q&A com IA |
| `qna_messages` | M3 | P1 | Mensagens das threads |
| `ia_dossiers` | M3 | P1 | Dossiês gerados pela IA |
| `ia_processing_queue` | M3 | P1 | Fila de processamento IA |

### 4.1.1 Atualização canônica (baseline MCP de 18/03/2026)

Para evitar drift histórico, considerar os nomes/estados abaixo como canônicos para kickoff:

- Tabela de identidade: `user_profiles` (não `profiles` em novos artefatos).
- Tabela de auditoria: `audit_logs` (não `audit_events` em novos artefatos).
- Taxonomia MAICS: `taxonomy_maics` (não `mary_taxonomy` em novos artefatos).
- Blocos M2/P0 já convergidos no banco oficial: `investor_theses`, `thesis_filters_sector`, `thesis_filters_geo`, `thesis_filters_ranges`, `matches`, `teasers`, `ndas`, `investor_drs`.

Os nomes legados permanecem neste documento apenas como referência histórica.

### 4.2 Modelo de identidade

```
profiles (user_id FK auth, role, org_id, name, email_domain, status)
  └── organizations (name, type {investor, asset, advisory}, slug)
       └── organization_members (org_id, user_id, role, verification_status)
            └── organization_invites (org_id, email, token, expires_at)
```

### 4.3 Modelo de investidor

```
investor_theses (org_id, status, readiness_min, objectives, ticket_min, ticket_max)
  ├── thesis_filters_sector (thesis_id, taxonomy_id, level, is_exclusion)
  ├── thesis_filters_geo (thesis_id, region, is_exclusion)
  └── thesis_filters_ranges (thesis_id, metric, min_value, max_value)
```

### 4.4 Modelo de ativo e projeto

```
projects (org_id_asset, codename, objective, sector_main, geo, summary, status)
  ├── teasers (project_id, status, sections_json, share_token, approved_by)
  ├── ndas (project_id, investor_org_id, status, file_url, signed_at)
  └── investor_drs (project_id, investor_org_id)
```

### 4.5 Modelo de VDR

```
vdr_documents (project_id, parent_id, title, section, description, visibility, priority, status)
  ├── vdr_document_links (item_id, url, provider, access_level)
  ├── vdr_document_validations (item_id, level {N1,N2,N3}, validator_user_id, hash_opt)
  ├── vdr_qa_messages (item_id, author_user_id, body, thread_id)
  └── vdr_access_logs (entity, entity_id, action, actor_user_id, meta_json)
```

### 4.6 Modelo de matching e pipeline

```
matches (thesis_id, project_id, score, breakdown_json, top_reasons, status)
settings_matching (weight_sector, weight_ticket, weight_geo, weight_readiness, weight_operational)
pipeline_tickets (project_id, investor_org_id, stage, moved_by, moved_at)
```

---

## 5. RLS — Princípios de Segurança

### Regras globais

1. **Isolamento por organização:** usuário acessa apenas dados das organizações a que pertence
2. **Isolamento por par projeto×investidor:** dados do DR espelhado, NDA, Q&A e marcações privadas
3. **Advisor contextual:** acessa apenas projetos em que foi vinculado; sell-side OU buy-side, nunca ambos
4. **Validação por perfil:** L1 = ativo, L2 = advisor vinculado, L3 = auditor
5. **Investidor isolado:** lê apenas o DR que lhe pertence; nunca o VDR original do ativo

### Funções RBAC implementadas

| Função | Descrição |
|--------|-----------|
| `is_org_member(user_id, org_id)` | Verifica membership |
| `has_org_permission(user_id, org_id, permission)` | Verifica permissão por role |
| `get_user_role(user_id, org_id)` | Retorna role do usuário |
| `get_user_organizations(user_id)` | Lista organizações do usuário |
| `check_advisor_conflict(user_id, project_id, side)` | Verifica conflito sell/buy |

---

## 6. APIs / RPCs Previstas (V1)

| RPC | Descrição | Marco |
|-----|-----------|-------|
| `rpc_upsert_profile()` | Cria/atualiza perfil + org | M1 ✅ |
| `rpc_create_thesis(org_id, filters)` | Grava tese + filtros | M2 |
| `rpc_list_opportunities(thesis_id, paging)` | Aplica matching, retorna score + explain | M2 |
| `rpc_create_project(org_id_asset, payload)` | Cria projeto + teaser | M2 |
| `rpc_set_nda_status(project_id, investor_org_id, status)` | Ao `signed` cria `investor_drs` | M2 |
| `rpc_dr_upsert_item(project_id, payload)` | Cria/edita item VDR + log | M2 ✅ |
| `rpc_dr_validate(item_id, level, comment?)` | Grava N1/N2/N3 + recalcula readiness | M2 ✅ |
| `rpc_qna_ask(project_id, question)` | Cria thread; IA tenta responder | M3 |
| `rpc_pipeline_move(project_id, investor_org_id, new_stage)` | Valida transição + notifica | M3 |

---

## 7. Integrações Externas

### Implementadas

| Integração | Provider | Status |
|------------|----------|--------|
| CNPJ lookup | BrasilAPI | ✅ |
| Website scraping | Jina.ai | ✅ |
| Logo | DuckDuckGo Icons (Clearbit fallback) | ✅ |
| CEP | ViaCEP | ✅ |
| CVM | Cache local + RPC | ✅ |
| Descrição IA | OpenAI GPT-4o-mini | ✅ |

### Pendentes

| Integração | Provider | Marco |
|------------|----------|-------|
| LLM (RAG + geração) | OpenAI + OpenRouter | M3 |
| Pagamentos | Stripe | M3 |
| E-mail transacional | Brevo | M3 |
| WhatsApp (produção) | Meta Business API | M3 |
| Monitoramento | Sentry (sugerido) | M3 |

---

## 8. Arquitetura IA (princípios)

| Princípio | Descrição |
|-----------|-----------|
| **Desacoplamento** | Banco IA separado do Supabase principal; UUID como elo |
| **Assíncrono** | IA nunca bloqueia UX; comunicação pull (nunca push) |
| **Status rastreável** | `pending → processing → ready/error` visível no admin |
| **Trigger por evento** | `company_onboarding_completed` dispara pipeline IA |
| **Migração futura** | Preparado para mover banco IA para outro provider sem impacto na plataforma |

---

## 9. Plano Técnico P0 — Supabase (Schema, RLS e Validação)

> **Objetivo:** preparar o caminho crítico de Marco 2 com sequência auditável e baixo risco de regressão.

### 9.1 Regra operacional obrigatória (MCP)

Antes de chamar qualquer ferramenta MCP do Supabase:
1. Ler o schema/descritor da ferramenta MCP correspondente.
2. Validar parâmetros obrigatórios e escopo.
3. Executar chamadas de inspeção primeiro, depois alterações.

### 9.2 Ordem de migrations P0 (sem quebra)

| Ordem | Entrega | Tabelas | Critério de conclusão |
|---|---|---|---|
| 1 | Tese do investidor | `investor_theses`, `thesis_filters_sector`, `thesis_filters_geo`, `thesis_filters_ranges` | CRUD de tese funcional e validado |
| 2 | Matching | `matches`, `settings_matching` | Score persistido com breakdown |
| 3 | Teaser | `teasers` | Teaser publicado com link rastreável |
| 4 | NDA | `ndas` | Transição de status com trilha de auditoria |
| 5 | DR espelhado | `investor_drs` | Isolamento por `(project_id, investor_org_id)` validado |

### 9.3 Checklist de validação técnica

- Constraints e índices criados para consultas críticas.
- Policies RLS testadas com cenário positivo e negativo.
- RPCs de fluxo crítico com autorização correta por papel.
- Logs de auditoria para transições sensíveis (`nda.signed`, `advisor.conflict_blocked`, acesso negado DR).
- Script de rollback documentado por migration P0.

---

## 10. Snapshot do Ambiente Real (MCP Supabase)

> **Fonte:** [11-RELATORIO-ADERENCIA-MCP-SUPABASE.md](./11-RELATORIO-ADERENCIA-MCP-SUPABASE.md)
> **Projeto inspecionado:** `eetoztxgkvyxjjmkgdvm`

### 10.1 Diagnóstico resumido

- Blocos P0 do M2 já convergidos no ambiente oficial (`investor_theses`, `thesis_filters_*`, `matches`, `teasers`, `ndas`, `investor_drs`).
- RPCs canônicas do fluxo M2 já publicadas no schema `public` com nomenclatura padronizada (`rpc_*`).
- Hardening S0 eliminou erros críticos de segurança; permanecem warnings residuais para tratamento contínuo.
- Estado atual está aderente para kickoff técnico com controle de risco.

### 10.2 Implicação arquitetural

- O modelo descrito neste documento deve ser tratado como **arquitetura alvo**.
- O banco inspecionado representa **estado convergido S0/S1** para o escopo P0 de M2.
- O desenvolvimento de feature M2 pode iniciar sob regime de gate semanal, mantendo hardening residual como trilha paralela.
