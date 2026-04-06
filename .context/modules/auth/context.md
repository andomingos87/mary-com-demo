# Modulo Auth - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Auth
- **Owner tecnico:** Plataforma/Security (confirmar owner nominal)
- **Owner de negocio:** Produto (confirmar owner nominal)
- **Status:** em estruturacao governada
- **Ultima atualizacao:** 2026-03-30

## 2) Objetivo de negocio

- **Problema que resolve:** garantir autenticacao confiavel com MFA obrigatorio, reduzindo risco de acesso indevido e loops de sessao.
- **Publico/area impactada:** todos os usuarios autenticados (investor, asset, advisor) e time de suporte.
- **Valor esperado:** seguranca operacional, menor regressao em login/MFA/OTP e trilha auditavel de eventos criticos.
- **Nao objetivos (fora de escopo):** regra de menu/navegacao por perfil e matriz de acesso funcional por rota (dominio de foundation-common).

## 3) Escopo funcional

- **Entradas principais:**
  - credenciais (`email`, `password`)
  - OTP de MFA (`code`)
  - identificador de sessao (`mary_session_id`, `sessionId`)
  - contexto de dispositivo (`user-agent`, IP, idioma)
- **Processamentos-chave:**
  - login primario com Supabase Auth
  - criacao/invalidacao de `user_sessions`
  - emissao e verificacao de `otp_codes`
  - validacao de `mfa_verified` no middleware
  - rate limit de login, tentativa MFA e resend OTP
- **Saidas/entregaveis:**
  - sessao autenticada + sessao interna Mary validada
  - acesso liberado apenas apos MFA
  - auditoria de eventos de auth
- **Fluxo principal (happy path):**
  - `/login` -> auth Supabase -> `/verify-mfa` -> `verifyMfaAction` -> cookie `mary_session_id` -> `/dashboard`
- **Fluxos alternativos/erros:**
  - sem usuario em rota protegida -> `/login`
  - usuario sem sessao Mary valida -> `/verify-mfa`
  - OTP invalido/expirado -> erro + limite de tentativas
  - reenvio OTP limitado por rate-limit

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI (App Router), Server Actions, Middleware, Supabase Auth/DB, auditoria.
- **Componentes/servicos principais:**
  - `src/app/login/page.tsx`
  - `src/app/verify-mfa/page.tsx`
  - `src/app/verify-mfa/mfa-form.tsx`
  - `src/lib/actions/auth.ts`
  - `src/lib/auth/mfa.ts`
  - `src/lib/auth/otp.ts`
  - `src/lib/auth/session.ts`
  - `src/lib/auth/rate-limit.ts`
  - `src/lib/supabase/middleware.ts`
  - `src/middleware.ts`
- **Dependencias internas:** `user_sessions`, `otp_codes`, `known_devices`, `rate_limits`, `audit_logs`, `user_profiles`.
- **Dependencias externas:** Supabase Auth/DB, WhatsApp Business API (ou mock), provedor SMS (ou mock).
- **Decisoes arquiteturais relevantes:**
  - dupla validacao de sessao (Supabase + sessao interna Mary com `mfa_verified=true`)
  - MFA obrigatorio para rotas protegidas
  - anti-cascata em `/verify-mfa` com reuso de sessao pendente + OTP valido

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/login`, `src/app/verify-mfa`, `src/app/signup`, `src/app/forgot-password`, `src/app/reset-password`
- **API routes:** `src/app/api/auth/**` (parte legada/deprecated + recovery ativo)
- **Acoes de servidor:** `src/lib/actions/auth.ts`
- **Servicos de auth:** `src/lib/auth/**`
- **Middleware:** `src/lib/supabase/middleware.ts`, `src/middleware.ts`
- **Tipos/schemas:** `src/types/database.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `user_sessions`, `otp_codes`, `known_devices`, `rate_limits`, `user_profiles`, `audit_logs`.
- **Campos criticos:**
  - `user_sessions.is_active`
  - `user_sessions.expires_at`
  - `user_sessions.mfa_verified`
  - `otp_codes.code_hash`, `otp_codes.attempts`, `otp_codes.max_attempts`, `otp_codes.expires_at`
- **Regras de validacao:**
  - acesso protegido exige sessao Mary ativa + `mfa_verified=true`
  - OTP invalido incrementa tentativas; sucesso consome codigo
  - rate-limit fail-closed em falha de infraestrutura
- **Contratos de API/eventos:**
  - `loginAction`, `initiateMfaAction`, `verifyMfaAction`, `logoutAction`, `resendOtpAction`
  - eventos `auth.*` em `audit_logs`
- **Regras de autorizacao:** fluxo de auth e sessao usa admin client server-side para operacoes criticas.

## 7) Fronteira com Foundation Common

- **Auth (este modulo) decide:**
  - login/signup/logout/recovery
  - emissao e validacao MFA/OTP
  - validade de sessao interna Mary
  - rate-limit e alertas de seguranca de auth
- **Foundation Common decide:**
  - autorizacao funcional por perfil/role
  - contexto de navegacao e menu por org/perfil
  - gates transversais de rotas alem do nucleo auth
- **Contrato entre modulos:**
  - Auth entrega estado de sessao confiavel.
  - Foundation consome esse estado para aplicar regras de acesso da plataforma.

## 8) Seguranca e conformidade

- **Dados sensiveis envolvidos:** credenciais, OTP, telefone, metadados de dispositivo e localizacao.
- **Controles aplicados:**
  - OTP hash com bcrypt
  - expiracao curta de OTP e limite de tentativas
  - bloqueio por rate-limit e logs de auditoria
  - bloqueio de exibicao de OTP em producao (`shouldExposeOtpInUi`)
- **Riscos atuais:**
  - coexistencia de fluxo client-side e server action no login pode gerar divergencia operacional
  - manutencao de API routes legadas pode confundir fluxos em evolucao
- **Mitigacoes recomendadas:**
  - convergir login para fluxo unico governado
  - manter checklist de descomissionamento de rotas legadas

## 9) Observabilidade e operacao

- **Logs importantes:**
  - `loginAction:*`, `initiateMfaAction:*`, `verifyMfaAction:*`
  - logs de middleware para recuperacao de `mary_session_id`
  - eventos `auth.*` em `audit_logs`
- **Metricas-chave:**
  - taxa de sucesso de login
  - taxa de falha de MFA
  - volume de resend OTP
  - incidencias de rate-limit por acao
- **Alertas necessarios:**
  - aumento anormal de `auth.mfa_failed`
  - pico de bloqueios `mfa_attempt`/`login`
  - crescimento de redirecionamento forcado para `/verify-mfa`
- **Runbook basico:**
  - validar usuario Supabase
  - validar `mary_session_id`
  - validar `user_sessions` ativo + expiracao + `mfa_verified`
  - validar OTP vigente e attempts

## 10) Qualidade e testes

- **Testes existentes:**
  - `src/lib/auth/__tests__/mfa-test-mode.test.ts`
  - `src/app/verify-mfa/__tests__/mfa-form.test.tsx`
- **Lacunas criticas:**
  - cobertura integrada de login -> verify-mfa -> dashboard
  - cenarios de rate-limit e expiracao de sessao Mary
- **Plano minimo de teste manual:**
  - login valido com MFA
  - OTP incorreto ate limite
  - resend OTP com cooldown
  - acesso protegido sem sessao Mary valida

## 11) Backlog do modulo

- **Curto prazo:**
  - alinhar fluxo de login para caminho unico (evitar drift client/server)
  - reduzir dependencia de API routes deprecated de auth
- **Medio prazo:**
  - suite integrada para funil auth completo
  - telemetria padronizada por etapa do funil MFA
- **Risco bloqueante e resolucao:**
  - **Issue:** divergencia de comportamento entre entradas de login.
  - **Solucao recomendada:** adotar um unico entrypoint oficial para login/MFA.
  - **Justificativa:** reduz regressao e simplifica operacao.
  - **Urgencia:** alta.

## 12) Checklist de pronto do modulo

- [ ] Escopo e fronteira Auth vs Foundation validados
- [ ] Skill e especialista do modulo criados
- [ ] Revisao tecnica formal executada
- [ ] Registro de backlog inicial e handoff publicado

## Evidencias usadas para este modulo

- `src/lib/actions/auth.ts`
- `src/lib/auth/mfa.ts`
- `src/lib/auth/otp.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/rate-limit.ts`
- `src/lib/auth/mfa-test-mode.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`
- `src/app/login/page.tsx`
- `src/app/verify-mfa/page.tsx`
- `src/app/verify-mfa/mfa-form.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/verify-mfa/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/types/database.ts`
