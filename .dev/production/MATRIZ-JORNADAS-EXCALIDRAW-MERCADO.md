# Matriz Jornada × Tela × Backlog × Status (Mercado em escala)

**Data:** 2026-04-10  
**Fontes:** [jornadas-usuario-mary.md](../../src/docs/jornadas-usuario-mary.md), Excalidraw `src/docs`, [6-PRODUCT_BACKLOG_PRIORIZADO.md](./6-PRODUCT_BACKLOG_PRIORIZADO.md), rotas em `src/app/`.  
**Legenda status:** ✅ aderente / implementado · ⚠️ parcial · ❌ ausente · 🔄 refatoração  

**Coluna Escala:** requisito para operação self-service + compliance (S = sim, P = parcial, N = não).

---

## W1 — Fundação global (E0 / UX transversal)

| Etapa | Rota / artefato | Regra (doc) | Backlog | Status código | Escala |
|-------|-----------------|-------------|---------|---------------|--------|
| Breadcrumb | `/(protected)/*/layout` | `Início > …` clicável | H0.4 | ✅ `BreadcrumbBar` + `resolveBreadcrumbs` | S |
| Mary AI | Layout protegido | Sidebar push, assistente; não executora | H0.5 | ✅ `MaryAiSidebar` (≥1024px) + `MaryAiQuickChatSheet` mobile | S |
| Auto-save / tooltips | Formulários | Debounce + feedback | H0.6 | ⚠️ `useAutoSave` em onboarding/MRS; cobertura total em revisão | P |
| Menu por perfil | Sidebar | Radar→Tese→Feed→Pipeline (investidor); MRS→Radar→Feed→Projeto (ativo); Advisor radar→perfil→feed→projetos | H0.7 | ✅ `src/types/navigation.ts` `getMenuByProfile` | S |
| Multi-org | `OrgSwitcher` | CTA nova org com 1 org | B0.8 | ✅ Dropdown sempre; Gerenciar + Nova org; redirect `/dashboard/organizations/new` |

---

## W2 — Investidor

| Etapa jornada | Rota canônica | Jornada (URL alvo) | Backlog | Status | Escala |
|---------------|---------------|-------------------|---------|--------|--------|
| Landing público | `/invest` → signup | `/invest` | — | ✅ redirect `src/app/invest/page.tsx` | S |
| Cadastro | `/signup?profile=investor` | `/register/investor` | E2 | ✅ | S |
| MFA | `/verify-mfa` | — | — | ✅ | S |
| Onboarding tese | `/onboarding` | `/onboarding/investor` | H0.2/H2.x | ✅ Tese + critérios | S |
| Radar Aha | `/[orgSlug]/radar` | `/:investor/radar` | H2.2 | ✅ | S |
| Teses | `/[orgSlug]/thesis` | `/:investor/thesis` | H0.2 | ✅ | S |
| Feed | `/[orgSlug]/feed` | Atualizações | E5 | ⚠️ Feed existe; digest/prefs H5.1 pendente | P |
| Pipeline | `/[orgSlug]/pipeline` | Kanban investidor move | H0.3 | ✅ 12 fases | S |
| Projetos / VDR | `/[orgSlug]/projetos`, `projects/.../vdr` | Data room | E4 | ⚠️ | P |
| Oportunidades (legado) | `/[orgSlug]/opportunities` | — | — | ✅ rota existe | P |

---

## W2 — Ativo (empresa)

| Etapa jornada | Rota | Jornada | Backlog | Status | Escala |
|---------------|------|---------|---------|--------|--------|
| Landing | `/sell-raise` → signup | `/sell-raise` | — | ✅ `src/app/sell-raise/page.tsx` | S |
| Cadastro | `/signup?profile=asset` | `/register/asset` | — | ✅ | S |
| Onboarding | `/onboarding` | 4 passos | H0.1 | ✅ steps asset | S |
| MRS Aha | `/[orgSlug]/mrs` | — | E3 | ✅ | S |
| Radar | `/[orgSlug]/radar` | Espelho investidores | — | ✅ | P |
| Feed | `/[orgSlug]/feed` | — | E5 | ⚠️ | P |
| Projeto | `/[orgSlug]/projeto`, `/projects` | Codinome | E4 | ✅ | P |
| VDR | `/[orgSlug]/assetvdr`, `projects/.../vdr` | — | — | ✅ | P |

---

## W2 — Advisor

| Etapa | Rota | Jornada | Backlog | Status | Escala |
|-------|------|---------|---------|--------|--------|
| Landing | `/advise` → signup | `/advise` | — | ✅ `src/app/advise/page.tsx` | S |
| Área logada | `/advisor/dashboard` | Dashboard mandatos | E8 | ⚠️ página existe; escopo E8 parcial | P |
| Radar | `/advisor/radar` | — | E8 | ✅ | P |
| Projetos | `/advisor/projects` | — | E8 | ✅ | P |
| Feed | `/advisor/feed` | — | E5 | ⚠️ | P |
| Perfil | `/advisor/profile` | Onboarding 4 passos | E8 | ⚠️ | P |

---

## W3 — Deal, VDR, notificações

| Capacidade | Onde | Backlog | Status | Escala |
|------------|------|---------|--------|--------|
| Pipeline 12 fases + drag | `/[orgSlug]/pipeline` | H0.3 | ✅ | S |
| VDR por projeto | `projects/[codename]/vdr` | E4/E7 | ⚠️ RBAC | P |
| NDA / gates | actions + DB | E4 | ⚠️ | P |
| Feed de eventos | `feed`, `lib/actions` feed | E5 | ⚠️ | P |
| E-mail / WhatsApp | `src/lib/email`, Z-API | — | ⚠️ mock/dev | P |

---

## W4 — Escala (ops + compliance)

| Tema | Evidência / ação | Backlog | Status |
|------|------------------|---------|--------|
| Self-service org | `/dashboard/organizations`, `OrgSwitcher`, `/onboarding` | B0.8 | ✅ ajustado |
| Nova org URL | `/dashboard/organizations/new` → `/onboarding` | — | ✅ redirect |
| Assinatura eletrônica | Decisão produto | T7.1 | ❌ pendente |
| Política upload | Baseline | T7.2 | ❌ pendente |
| Hardening IA/docs | Ownership, injection | E7 | ❌ pendente |
| IA assistida c/ aprovação humana | — | E6 | ❌ pendente |

---

## Rotas públicas e auth (referência rápida)

| Rota | Função |
|------|--------|
| `/` | Landing |
| `/login`, `/signup`, `/verify-mfa`, `/forgot-password`, `/reset-password` | Auth |
| `/onboarding`, `/onboarding/[step]` | Onboarding |
| `/terms`, `/privacy` | Legal |
| `/dashboard`, `/dashboard/organizations`, `/dashboard/organizations/new` | Gestão contas |
| `/[orgSlug]/*` | App multi-tenant investidor/ativo |
| `/advisor/*` | Advisor (fora de slug org) |
| `/invite/project/[token]` | Convite projeto |
| `/vdr/share/[token]` | Share VDR |

---

## Como usar esta matriz

1. **Priorização:** linhas com ⚠️ ou ❌ alimentam sprints (vincular a H0.x / E5–E8).  
2. **ClickUp:** importar [clickup-import-mary-mercado.csv](./clickup-import-mary-mercado.csv).  
3. **Revisão:** após cada release, atualizar coluna Status com evidência (PR, checklist ou link spec).
