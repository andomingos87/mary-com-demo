# Modulo Foundation Common - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Foundation Common
- **Owner tecnico:** Plataforma (confirmar owner nominal)
- **Owner de negocio:** Produto (confirmar owner nominal)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** centralizar os blocos base que sustentam todos os modulos do MVP (auth, org, permissao, navegacao, auditoria e observabilidade).
- **Publico/area impactada:** todos os perfis (investor, asset, advisor), times de engenharia e operacao.
- **Valor esperado:** consistencia de acesso, menor retrabalho entre modulos e governanca minima para seguranca.
- **Nao objetivos (fora de escopo):** regras funcionais especificas de tese, radar, feed, projetos ou MRS.

## 3) Escopo funcional

- **Entradas principais:** sessao autenticada, organizacao ativa, papel do membro, rota solicitada.
- **Processamentos-chave:** resolucao de org ativa, validacao de acesso por rota/perfil, montagem de menu, gate de onboarding, logs de auditoria.
- **Saidas/entregaveis:** contexto de navegacao completo, redirecionamentos seguros, trilha minima de eventos criticos.
- **Fluxo principal (happy path):** login -> org ativa -> validacao de rota -> layout protegido -> modulo de destino.
- **Fluxos alternativos/erros:** sem sessao, sem membership, onboarding incompleto, perfil invalido para rota.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, Auth, Middleware, DB.
- **Componentes/servicos principais:**
  - `src/lib/actions/navigation.ts`
  - `src/types/navigation.ts`
  - `src/middleware.ts`
  - `src/app/(protected)/layout.tsx`
  - `src/components/providers/NavigationProvider.tsx`
  - `src/components/providers/OrganizationProvider.tsx`
  - `src/lib/audit.ts`
  - `src/lib/analytics.ts`
- **Dependencias internas:** `organizations`, `organization_members`, `audit_logs`.
- **Dependencias externas:** Supabase Auth/DB.
- **Decisoes arquiteturais relevantes:** gate de acesso em camadas (middleware + layout + action), menu por perfil e isolamento por workspace.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/**`, `src/app/dashboard/**`
- **Componentes UI:** `src/components/navigation/**`, `src/components/providers/**`
- **Acoes de servidor:** `src/lib/actions/navigation.ts`, `src/lib/actions/auth.ts`
- **Schemas/tipos:** `src/types/navigation.ts`, `src/types/database.ts`
- **Migrations/policies:** `supabase/migrations/**` (organizations, memberships, audit)

## 6) Dados e contratos

- **Entidades/tabelas principais:** `organizations`, `organization_members`, `audit_logs`.
- **Campos criticos:** `profile_type`, `verification_status`, `onboarding_step`, `role`.
- **Regras de validacao:** rota valida perfil e onboarding antes de liberar acesso.
- **Contratos de API/eventos:** `getNavigationContext`, `validateRouteAccess`, eventos de auditoria via actions.
- **Regras de autorizacao (RLS/permissoes):** menor privilegio por membership e role.

## 7) Seguranca e conformidade

- **Dados sensiveis envolvidos:** identidade de usuario, vinculacao organizacional, trilha de eventos.
- **Controles aplicados:** autenticacao obrigatoria, filtros por org e membership, trilha de auditoria.
- **Riscos atuais:** drift entre regras de middleware e regras de actions.
- **Mitigacoes recomendadas:** testes de regressao para matriz rota x perfil x onboarding.

## 8) Observabilidade e operacao

- **Logs importantes:** erros de auth/route access e eventos de auditoria.
- **Metricas-chave:** falhas de acesso por motivo, tempo de carregamento de contexto de navegacao.
- **Alertas necessarios:** aumento de `wrong_profile`, `not_member` e falhas de onboarding gate.
- **Runbook basico (falhas comuns + acao):** validar sessao, membership, profile e slug da org.

## 9) Qualidade e testes

- **Testes unitarios existentes:** testes de onboarding e readiness; cobertura parcial de fundacao.
- **Testes de integracao existentes:** nao mapeados de forma consolidada.
- **Cenarios criticos sem cobertura:** matriz completa de autorizacao por rota/perfil.
- **Plano minimo de teste manual:** login, troca de org, bloqueio de rotas indevidas, fallback para dashboard.

## 10) Backlog do modulo

- **Divida tecnica:** concentrar contratos de permissao para evitar regra duplicada por tela.
- **Melhorias de curto prazo:** suite de testes para `validateRouteAccess` e perfis.
- **Melhorias de medio prazo:** policy-as-code de autorizacao por rota.
- **Riscos bloqueantes e plano de resolucao:**
  - **Issue:** inconsistencias entre checks de perfil em paginas e no modulo de navegacao.
  - **Solucao recomendada:** criar helper unico de guardas de perfil usado por todas as paginas protegidas.
  - **Justificativa:** reduz divergencia e erros de autorizacao.
  - **Urgencia:** alta.

## 11) Checklist de pronto

- [ ] Escopo funcional validado com negocio.
- [ ] Requisitos de seguranca aplicados.
- [ ] Testes minimos implementados e executados.
- [ ] Documentacao tecnica atualizada.
- [ ] Monitoramento basico definido.

## 12) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-03-25 | Consolidar modulo de fundacao comum | Evitar fragmentacao de regras transversais | Base unica para auth/perfis/navegacao/auditoria |
| 2026-03-29 | Formalizar test mode de MFA para OTP na UI | Viabilizar testes sem integracao WhatsApp sem expor OTP em producao | Fluxo de `verify-mfa` permite exibicao controlada por env e fallback de telefone mock em dev/homologacao |

## Evidencias usadas para este modulo

- `src/lib/actions/navigation.ts`
- `src/types/navigation.ts`
- `src/components/navigation/Sidebar.tsx`
- `src/middleware.ts`
- `src/lib/audit.ts`
- `src/lib/analytics.ts`
