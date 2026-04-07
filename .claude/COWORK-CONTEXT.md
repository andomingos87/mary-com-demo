# Mary AI Platform — Contexto Unificado para Claude Cowork

> Documento gerado em 2026-04-06 por varredura profunda do repositório com 6 agentes especializados.
> Objetivo: dar ao Claude Cowork compreensão total do projeto para assistir Anderson.

---

## 1. O QUE É O PROJETO

**Mary AI Platform** é uma plataforma B2B de ecossistema M&A (Mergers & Acquisitions) que conecta três perfis:

- **Ativo** (empresa que busca investimento/venda)
- **Investidor** (PE Fund, Corporate ou Individual buyer)
- **Advisor** (boutique de M&A que assessora ativos)

**Proposta de valor:** Matching inteligente via IA entre ativos e investidores, com MRS (Market Readiness Score) como sistema de progressão documental e Mary AI como copiloto contextual.

**Deploy:** Vercel (região São Paulo — gru1)

---

## 2. HISTÓRICO E PIVOTAGENS

| Data | Evento |
|------|--------|
| Nov 2025 | Início do projeto. Docs v1.0/v1.1 com escopo amplo (Leonardo + Cássio) |
| Fev 2026 | Construção inicial. PRD v1.0/v2.2. Documentação em `.dev/archives/doc-v1.1/` e `doc-v1.2/` |
| 07/03/2026 | **PIVOT CRÍTICO**: Redução de escopo para MVP minimalista (Onboarding Investidor 5→2 etapas, MRS como núcleo, Mary AI sugere/não executa) |
| 14/03/2026 | Descoberta de divergência entre Excalidraw (aprovado pelo cliente) e implementação |
| Mar 2026 | PRD v3.0 RECONCILIADO — campo a campo com Excalidraw. Criação do Épico E0 (Realinhamento) |
| 02-03/04/2026 | Limpeza de repositório. 73 arquivos removidos/movidos. Consolidação documental |
| 04-06/04/2026 | Implementação e validação de H0.1, H0.2, H0.3. Contexto modular em `.context/modules/` |

---

## 3. STACK TÉCNICO

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14.2 (App Router, RSC) |
| Runtime | React 18, TypeScript 5 |
| Styling | Tailwind CSS 3.4, DM Sans font |
| UI | shadcn/ui (Radix Primitives), CVA, Lucide icons |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Auth | Supabase Auth + MFA (WhatsApp/SMS OTP) |
| DnD | @dnd-kit (Kanban pipeline) |
| i18n | next-intl (pt-br, en-us, es) |
| Testing | Jest + Testing Library |
| Docs | Storybook 10 |
| Deploy | Vercel (gru1) |
| Enrichment | BrasilAPI + CVM + Jina.ai + Clearbit + OpenAI |

---

## 4. ARQUITETURA DE CONTEXT ENGINEERING

O projeto possui um sistema sofisticado em **5 camadas** de contexto para IA:

### L1 — Entry Points (Raiz)
- `CLAUDE.md` → Convenções de código (imports, tokens, segurança)
- `AGENTS.md` → Snapshot do projeto, JIT Index, comandos
- `DOCS.md` → Índice mestre de documentação canônica

### L2 — Governance
- `.context/AI_GOVERNANCE.md` → Precedência obrigatória, regras de conflito

### L3 — Knowledge Base (`.context/`)
- **20 agents transversais** em `.context/agents/` (architect, frontend, backend, code-reviewer, security-auditor, etc.)
- **18 módulos** em `.context/modules/` (auth, onboarding, radar, mrs, thesis, projects, mary-ai, feed, collaboration, etc.)
  - Cada módulo: `context.md` + `agents.md` + `skills.md`
- **11 skills transversais** em `.context/skills/` (code-review, test-generation, refactoring, etc.)
- **8 docs técnicos** em `.context/docs/` (architecture, data-flow, design-system, security, etc.)

### L4 — IDE Context (`.cursor/`)
- **35+ skills funcionais** em `.cursor/skills/` (por módulo do produto)
- **19 specialists** em `.cursor/specialists/` (specialist-radar, specialist-onboarding, etc.)
- **29 commands** em `.cursor/commands/` (execute, recruit, context, plan, etc.)
- **Rules** em `.cursor/rules/` (design-tokens.mdc, communication-style.mdc)

### L5 — Platform Skills (`.agents/`)
- Supabase/Postgres best practices (30+ reference docs)
- Vercel/React best practices (50+ rules)
- Systematic debugging
- Tailwind design system
- Skill creator (com evals e benchmarks)

### Regra de Precedência (Obrigatória)
**Cenário A** (demanda funcional): `.context/modules/<modulo>/context.md` → `.cursor/skills/<modulo>/SKILL.md` → `.cursor/specialists/specialist-<modulo>.md`

**Cenário B** (demanda transversal): `.context/agents/<agent>.md` → se impactar módulo → voltar ao Cenário A

---

## 5. SPEC-DRIVEN DEVELOPMENT

### Ciclo: Spec → Implementação → Validação

1. **Spec**: Excalidraw (fonte visual) → PRD v3.0 (tradução executável) → Specs H0.X (planos técnicos)
2. **Implementação**: Template de 5 fases (leitura → mapeamento de impacto → checklist → plano incremental → execução)
3. **Validação**: Checklists `[x]/[~]/[ ]/[N/A]` + evidências (screenshots, SQL, logs)

### Hierarquia de Precedência Documental
1. Excalidraw (`.dev/excalidraw/`)
2. PRD v3.0 (`.dev/production/PRD-v3.0-RECONCILIADO.md`)
3. Backlog (`.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`)
4. Specs (`.dev/specs/`)
5. Guias (`.dev/guides/`)

### Status das Specs (Épico E0 — Realinhamento Excalidraw)

| Spec | Título | Status |
|------|--------|--------|
| H0.1 | Refatorar Onboarding Ativo (4 Passos) | ✅ APROVADO |
| H0.2 | Complementar Campos Tese Investidor | ✅ APROVADO |
| H0.3 | Expandir Pipeline 5→12 Fases | ✅ APROVADO |
| H0.4 | Breadcrumbs Globais | ⌛ PENDENTE |
| H0.5 | Mary AI Sidebar | ⌛ PENDENTE |
| H0.6 | Auto-save + Tooltips Globais | ⚠️ EM PROGRESSO |
| H0.7 | Ajustar Menus por Perfil | ⚠️ PARCIAL |

---

## 6. REGRAS DE NEGÓCIO ESSENCIAIS

### Papéis e Onboarding
- **Ativo**: 4 passos (Dados Empresa → Matching → Equipe → Codinome)
- **Investidor**: 2 passos (Primeira Tese → Refinamento)
- **Advisor**: 2 passos (Perfil Atuação → Clientes Atuais)

### Radar (Matching)
- Ativo vê investidores com tese aderente
- Investidor vê ativos anonimizados compatíveis
- Advisor vê leads (ativos sem advisor) + investidores
- Score: Setor (+40) + Tamanho (+30) + Geografia (+20) + Estágio (+10)

### Pipeline M&A — 12 Fases
```
Screening → Teaser → NDA → CIM/DFs → IoI → Management Meetings →
NBO → DD/SPA → Signing → CPs → Closing → Disclosure
+ closed_won / closed_lost
```

### MRS (Market Readiness Score)
- Score 0-100 em 4 passos (pesos: 20% + 30% + 30% + 20%)
- Gates: NDA (Passos 1&2 ≥ 70%) | NBO (Passos 3&4 ≥ 70% + Total ≥ 75%)

### NDA Gate & Acesso Progressivo
```
Visitante → Cadastrado (sem NDA) → Com NDA (Passos 1&2) → Com NBO (3&4) → SPA (Fechado)
```

### Mary AI (Copiloto)
- MVP: **Sugere, não executa**
- Gera: Dossiê, MRS, Teaser, Valuation, CIM
- Fluxo: Gera v1 → Usuário refina → Aprova → Final + alimenta RAG

### VDR (Virtual Data Room)
- 2 camadas: PRÉ-DD (automática) + DUE DILIGENCE (livre)
- Controle de acesso progressivo por investidor

---

## 7. MAPA DE ROTAS

### Públicas (12 rotas)
`/`, `/login`, `/signup`, `/signup/success`, `/forgot-password`, `/reset-password`, `/verify-mfa`, `/privacy`, `/terms`, `/auth/error`, `/vdr/share/[token]`, `/invite/project/[token]`

### Protegidas — Multi-tenant (`/[orgSlug]/`)
Dashboard, Feed, Profile, Settings, Projects (CRUD + members + VDR), Pipeline (Kanban), Radar, Thesis, Opportunities, Mary AI Private, Asset VDR, Investor VDR

### Advisor
`/advisor/dashboard`, `/advisor/feed`, `/advisor/projects`, `/advisor/radar`, `/advisor/mary-ai-private`, `/advisor/profile`, `/advisor/settings`

### Admin
`/admin/dashboard`

---

## 8. DESIGN SYSTEM

- **Cores**: Primary Burgundy (HSL 350 73% 27%), com dark mode
- **Tokens**: Todos em CSS variables HSL — `bg-primary`, `text-foreground`, etc.
- **Sombras**: `shadow-card`, `shadow-elegant`, `shadow-glow` (nunca shadow-lg/xl genéricos)
- **Transições**: `transition-smooth` (300ms), `transition-bounce` (400ms), `transition-elegant` (500ms)
- **Font**: DM Sans (nunca sobrescrever)
- **Border radius**: `rounded-lg` (8px) padrão
- **Componentes UI**: 33 shadcn/ui components + 150+ custom

---

## 9. BACKEND & SUPABASE

### Schema (14 grupos)
- Multi-tenancy: Organizations + Members + Invites (RLS)
- Pipeline M&A: 14 status (12 fases + 2 exits) com gates
- VDR: Folders, documents, permissions, shared links, auditoria
- Radar: Investor follows, opportunities, CTA engagement
- Taxonomy: MAIC L1/L2/L3, geographies
- 32 migrations, 3.528 linhas SQL

### Auth
- Signup com validação email + org auto-creation
- Login com rate limit (10/15min), device tracking
- MFA WhatsApp preferred + SMS fallback
- Sessions 24h TTL, cookie-based

### Server Actions (30 arquivos)
Auth, projects, organizations, VDR (8 files), radar, thesis, onboarding, members, invites, taxonomy, notifications, analytics

---

## 10. COMO USAR ESTE CONTEXTO

Para trabalhar neste projeto, siga esta ordem:

1. **Sempre leia** `CLAUDE.md` e `AGENTS.md` para convenções
2. **Para demanda funcional**: carregue `.context/modules/<modulo>/context.md`
3. **Para demanda transversal**: identifique o agent em `.context/agents/`
4. **Consulte specs ativas** em `.dev/specs/` antes de implementar
5. **Valide contra Excalidraw** em `.dev/excalidraw/` como fonte de verdade
6. **Use o backlog** em `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md` para priorização

### Próximas Entregas (E0)
1. ⌛ H0.4 — Breadcrumbs
2. ⌛ H0.5 — Mary AI Sidebar
3. ⚠️ H0.6 — Revalidação E2E Auto-save
4. ⚠️ H0.7 — Menus Investidor/Ativo
