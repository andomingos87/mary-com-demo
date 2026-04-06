# src/

## Identidade do pacote
- App Next.js 14 (App Router) com auth, onboarding e dashboards
- Domínios principais: onboarding, projetos, auth e navegação

## Setup e execução
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`

## Padrões e convenções
- Páginas/layouts vivem em `src/app/**`
  - Exemplo: `src/app/login/page.tsx`
  - Exemplo: `src/app/(protected)/layout.tsx`
- Route handlers ficam em `src/app/api/**/route.ts`
  - Exemplo: `src/app/api/auth/login/route.ts`
- Componentes de UI base em `src/components/ui`
  - Exemplo: `src/components/ui/button.tsx`
- Componentes de domínio organizados por área
  - Onboarding: `src/components/onboarding/OnboardingWizard.tsx`
  - Projetos: `src/components/projects/ProjectCard.tsx`
  - Navegação: `src/components/navigation/Sidebar.tsx`
- Providers em `src/components/providers`
  - Exemplo: `src/components/providers/OrganizationProvider.tsx`
- Ações do servidor em `src/lib/actions/*`
  - Exemplo: `src/lib/actions/onboarding.ts`
  - Exemplo: `src/lib/actions/projects.ts`
- Supabase clients em `src/lib/supabase`
  - Browser: `src/lib/supabase/client.ts`
  - Server: `src/lib/supabase/server.ts`
- Tipos compartilhados em `src/types/*`
  - Exemplo: `src/types/onboarding.ts`
- Estilos globais em `src/app/globals.css`

## Módulos por Domínio

### Onboarding & Eligibility
| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/actions/onboarding.ts` | Ações de onboarding (CNPJ, website, descrição AI) |
| `src/lib/actions/eligibility.ts` | Revisão manual de elegibilidade |
| `src/lib/actions/geographies.ts` | Hierarquia de geografias |
| `src/components/onboarding/OnboardingWizard.tsx` | Wizard principal de onboarding |
| `src/components/onboarding/EligibilityForm.tsx` | Formulário de elegibilidade |
| `src/components/onboarding/GeographySelector.tsx` | Seletor cascata de geografias |

### Email
| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/email/index.ts` | Serviço de email (Brevo/mock) |
| `src/lib/email/send-invite.ts` | Envio de convites de organização |
| `src/lib/email/send-manual-review.ts` | Notificação de revisão manual |
| `src/lib/email/templates/invite.ts` | Template HTML/texto de convite |
| `src/lib/email/templates/manual-review.ts` | Template de revisão manual |

### Projects & Taxonomy
| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/actions/projects.ts` | CRUD de projetos |
| `src/lib/actions/taxonomy.ts` | Taxonomia MAICS (L1/L2/L3) |
| `src/lib/actions/readiness.ts` | Cálculo de readiness score |

## Arquivos chave
- `src/app/layout.tsx`
- `src/app/(protected)/ProtectedLayoutClient.tsx`
- `src/components/ObservabilityProvider.tsx`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `src/lib/actions/index.ts` (re-exports de todas as actions)

## JIT Index
- Componentes de onboarding: `rg -n "Onboarding|Profile" src/components/onboarding`
- Ações de onboarding: `rg -n "onboarding" src/lib/actions`
- Ações de eligibility: `rg -n "eligibility|review" src/lib/actions`
- Email templates: `rg -n "generate.*Html|generate.*Text" src/lib/email`
- API auth: `rg -n "auth" src/app/api/auth`
- Testes: `rg -n "describe\\(" src/**/__tests__`

## Gotchas comuns
- Use o alias `@/` para imports de `src/` (config em `tsconfig.json`)
- Mudanças em fluxo autenticado costumam tocar `src/app/(protected)`
- Emails em dev são mock (logados no console); configure `BREVO_API_KEY` para produção

## Pre-PR
- `npm run lint && npm run test`
