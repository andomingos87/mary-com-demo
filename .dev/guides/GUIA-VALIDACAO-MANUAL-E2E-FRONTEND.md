# Guia de Validacao Manual E2E do Frontend

## Objetivo

Executar a validacao manual ponta a ponta do frontend da Mary com foco em:

- navegacao publica
- autenticacao e MFA
- onboarding por perfil
- modulos protegidos por perfil
- responsividade
- guardas de acesso e redirecionamentos

## Pre-requisitos

- Rodar `npm run dev`
- Garantir `.env.local` com:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Em dev, habilitar `SHOW_MFA_CODE=true` se quiser validar MFA sem depender de canal externo
- Ter pelo menos estas contas de teste:
  - 1 conta `investor`
  - 1 conta `asset`
  - 1 conta `advisor`
  - 1 conta adicional em outra organizacao para teste cruzado de isolamento

## Regras de guarda que precisam ser validadas

- Usuario nao autenticado ao acessar rota protegida deve ir para `/login`
- Usuario autenticado sem MFA valido deve ir para `/verify-mfa`
- Usuario com onboarding incompleto deve ir para `/onboarding`
- Usuario de perfil errado nao deve acessar rotas exclusivas de outro perfil
- URL legada `/register/*` deve redirecionar para `/signup?profile=*`
- `/dashboard` deve redirecionar para a organizacao primaria correta

## Ordem recomendada

1. Smoke das rotas publicas
2. Auth completo: signup, login, MFA, logout, forgot/reset
3. Jornada investidor
4. Jornada ativo
5. Jornada advisor
6. Fluxos compartilhados: VDR, convites, rotas com token
7. Validacao cruzada de permissao e multi-tenant
8. Passes de responsividade

## Smoke publico

Validar carregamento, copy principal, CTAs e ausencia de erro visual em:

- `/`
- `/invest`
- `/sell-raise`
- `/advise`
- `/terms`
- `/privacy`
- `/design-system`

Checklist:

- Todos os CTAs principais abrem a rota esperada
- Botao de login aparece no shell publico
- Navegacao entre landing e selecao de perfil funciona sem 404
- Nenhuma pagina publica quebra em mobile ou desktop

## Auth e onboarding base

### Rotas

- `/signup?profile=investor`
- `/signup?profile=asset`
- `/signup?profile=advisor`
- `/signup/success`
- `/login`
- `/verify-mfa`
- `/forgot-password`
- `/reset-password`

### O que validar

- Signup exige perfil valido via querystring
- Email generico e bloqueado
- Website e obrigatorio
- Investidor exige tipo de investidor
- Advisor exige LinkedIn valido
- Senha valida regras minimas e confirmacao
- Login leva para `/verify-mfa`
- MFA aprovado leva para `/dashboard`
- `/dashboard` resolve para a area correta do usuario

## Jornada investidor

### Entrada

- Landing: `/invest`
- Registro legado: `/register/investor`
- Signup: `/signup?profile=investor`

### Onboarding

Validar que o fluxo efetivo do investidor tem 2 etapas:

- `/onboarding/profile-details`
- `/onboarding/eligibility-check`

Resultado esperado:

- ao concluir onboarding, o usuario vai para `/:orgSlug/thesis`

### Modulos protegidos

- `/:orgSlug/dashboard`
- `/:orgSlug/thesis`
- `/:orgSlug/radar`
- `/:orgSlug/feed`
- `/:orgSlug/pipeline`
- `/:orgSlug/profile`
- `/:orgSlug/settings`
- `/:orgSlug/mary-ai-private`
- `/:orgSlug/validacao-epicos`

### Checklist funcional

- Sidebar do investidor mostra `Radar`, `Tese`, `Feed` e `Pipeline`
- Criacao, edicao e ativacao de tese funcionam
- Existe apenas 1 tese ativa por vez
- Radar reage a tese ativa
- CTAs de teaser, NDA e follow respondem sem erro
- Feed abre sem tela branca
- Pipeline abre com estagios canonicos

## Jornada ativo

### Entrada

- Landing: `/sell-raise`
- Registro legado: `/register/asset`
- Signup: `/signup?profile=asset`

### Onboarding

Fluxo esperado do ativo:

- `/onboarding/cnpj-input`
- `/onboarding/data-enrichment`
- `/onboarding/data-confirmation`
- `/onboarding/asset-company-data`
- `/onboarding/asset-matching-data`
- `/onboarding/asset-team`
- `/onboarding/asset-codename`
- `/onboarding/eligibility-check`
- `/onboarding/pending-review` quando aplicavel

### Modulos protegidos

- `/:orgSlug/dashboard`
- `/:orgSlug/mrs`
- `/:orgSlug/radar`
- `/:orgSlug/feed`
- `/:orgSlug/projeto`
- `/:orgSlug/projects`
- `/:orgSlug/projects/:codename`
- `/:orgSlug/projects/:codename/members`
- `/:orgSlug/projects/:codename/responsibles`
- `/:orgSlug/projects/:codename/vdr`
- `/:orgSlug/assetvdr`
- `/:orgSlug/profile`
- `/:orgSlug/settings`
- `/:orgSlug/mary-ai-private`
- `/:orgSlug/validacao-epicos`

### Checklist funcional

- Sidebar do ativo mostra `MRS`, `Radar`, `Feed` e `Projeto`
- Enriquecimento por CNPJ preenche e permite confirmar dados
- MRS abre com 4 passos
- Status, prioridade e score do MRS reagem a alteracoes
- Gates bloqueiam quando requisitos nao foram cumpridos
- Upload multiplo por item funciona
- Projeto principal abre sem 404
- Detalhe do projeto, membros, responsaveis e VDR carregam

## Jornada advisor

### Entrada

- Landing: `/advise`
- Registro legado: `/register/advisor`
- Signup: `/signup?profile=advisor`

### Modulos protegidos

- `/advisor/dashboard`
- `/advisor/radar`
- `/advisor/feed`
- `/advisor/projects`
- `/advisor/profile`
- `/advisor/settings`
- `/advisor/mary-ai-private`

### Checklist funcional

- Onboarding do advisor conclui sem etapa quebrada
- Dashboard e modulos laterais abrem sem erro
- Advisor ve apenas suas rotas
- Advisor nao entra em areas exclusivas de investidor ou ativo

## Fluxos compartilhados e sensiveis

Validar tambem:

- `/invite/project/[token]`
- `/vdr/share/[token]`

Checklist:

- Link invalido mostra estado de erro tratavel
- Link valido abre o conteudo esperado
- Protecao por senha do VDR compartilhado funciona quando exigida
- Usuario sem permissao nao acessa conteudo privado por URL direta

## Validacao por epicos dentro do produto

Existe uma tela de apoio em:

- `/validacao-epicos`
- `/:orgSlug/validacao-epicos`

Observacoes:

- a rota raiz redireciona para a organizacao do usuario
- hoje os epicos habilitados na UI sao `E1`, `E2`, `E3` e `E4`
- use essa tela para registrar aprovacao, reprovacao, bug e comentarios durante a sessao

## Passes obrigatorios de responsividade

Executar pelo menos nestes breakpoints:

- Mobile: `375x812`
- Tablet: `768x1024`
- Desktop: `1440x900`

Em cada breakpoint validar:

- landing publica
- login
- verify-mfa
- onboarding
- tela principal do investidor
- tela principal do ativo
- tela principal do advisor
- sidebar mobile, breadcrumbs e CTA da Mary AI

## Evidencias minimas

Para cada fluxo aprovado ou reprovado, registrar:

- rota
- perfil usado
- resultado esperado
- resultado observado
- screenshot ou video curto
- severidade se houver bug

## Matriz curta de execucao

- `E1 Navegacao`: menu certo por perfil, redirecionamentos, bloqueio entre perfis
- `E2 Onboarding Investidor`: onboarding em 2 etapas, tese, radar
- `E3 MRS Canonico`: MRS do ativo, score, gates, upload
- `E4 Projetos e marcos juridicos`: pipeline, gate de NDA, transicoes
- `Complementar`: advisor, VDR compartilhado, forgot/reset, responsividade

## Criterio de saida

Considerar a rodada pronta quando:

- nao houver tela branca, loop ou erro 500 nos fluxos principais
- onboarding investidor e ativo concluirem de ponta a ponta
- modulos principais por perfil abrirem e responderem
- bloqueios entre perfis e entre organizacoes forem confirmados
- evidencias e anotacoes estiverem registradas em `/validacao-epicos`
