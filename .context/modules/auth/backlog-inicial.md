# Backlog Inicial de Correcao - Auth (pos-aprovacao)

## Objetivo

Definir a primeira onda de implementacao tecnica apos aprovacao do time especialista do modulo Auth.

## Priorizacao

### P0 - Unificacao do entrypoint de login

- **Problema:** coexistencia de fluxo client-side e server action pode gerar drift operacional.
- **Acao recomendada:** consolidar login em entrypoint unico governado.
- **Arquivos foco:** `src/app/login/page.tsx`, `src/lib/actions/auth.ts`, `src/lib/supabase/middleware.ts`
- **Criterio de aceite:**
  - comportamento unico de login em todos os cenarios
  - sem regressao em redirect `/login` -> `/verify-mfa` -> `/dashboard`
  - logs/auditoria de login consistentes

### P0 - Reducao de superficie legada em API routes de auth

- **Problema:** rotas deprecated de auth aumentam custo de manutencao.
- **Acao recomendada:** formalizar descomissionamento faseado, preservando recovery ativo.
- **Arquivos foco:** `src/app/api/auth/login/route.ts`, `src/app/api/auth/verify-mfa/route.ts`, `src/app/api/auth/signup/route.ts`
- **Criterio de aceite:**
  - rotas legadas nao sao mais entrypoint funcional principal
  - comunicacao clara de deprecacao e fallback seguro

### P1 - Cobertura integrada do funil auth

- **Problema:** cobertura atual e parcial no fluxo ponta a ponta.
- **Acao recomendada:** adicionar testes de integracao para login + MFA + sessao.
- **Arquivos foco:** `src/app/verify-mfa/__tests__/mfa-form.test.tsx`, `src/lib/auth/__tests__/mfa-test-mode.test.ts`
- **Criterio de aceite:**
  - cenarios de sucesso e erro de OTP cobertos
  - cenarios de rate-limit criticos cobertos

### P1 - Observabilidade padronizada

- **Problema:** diagnostico de incidentes de auth pode ficar disperso.
- **Acao recomendada:** padronizar eventos e campos minimos de log por etapa.
- **Arquivos foco:** `src/lib/actions/auth.ts`, `src/lib/auth/mfa.ts`, `src/lib/supabase/middleware.ts`
- **Criterio de aceite:**
  - eventos essenciais emitidos de forma uniforme
  - runbook operacional atualizado no contexto do modulo

## Responsaveis sugeridos

- **Tech Lead:** sequenciamento e aceite tecnico
- **Backend Specialist:** implementacao de fluxo server-side
- **Security Auditor:** revisao de risco por etapa
- **Test Writer:** cobertura automatizada

## Evidencias exigidas por item

- diff de codigo com arquivos impactados
- testes executados e resultado
- risco/mitigacao registrados
- decisao de aprovacao no PR/review
