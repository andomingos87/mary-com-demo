---
name: auth
description: Analisa e executa mudancas no modulo de autenticacao com foco em login, sessao, MFA, OTP, rate-limit e seguranca operacional. Use quando o usuario pedir ajustes em auth, verify-mfa, otp, login/signup/logout, recovery, middleware de sessao ou hardening de autenticacao.
---

# Auth Skill

## Objetivo

Garantir respostas e implementacoes consistentes no dominio de autenticacao da Mary com evidencias reais do codigo.

## Fonte primaria (obrigatoria)

Antes de qualquer analise:

1. ler `.context/modules/auth/context.md`
2. confirmar evidencias nos arquivos citados no contexto

Sem isso, nao seguir com recomendacao final.

## Gatilhos de ativacao

Ative esta skill quando houver pedidos sobre:

- login, signup, logout, forgot/reset password
- MFA (`verify-mfa`), OTP, resend OTP
- `user_sessions`, `mary_session_id`, recuperacao de sessao
- rate-limit de auth (`login`, `mfa_attempt`, `otp_request`)
- exibicao de OTP em ambiente de teste (`SHOW_MFA_CODE`)
- hardening de seguranca em autenticacao

## Metodo de analise

1. **Mapear etapa do funil auth**
   - entrada (login/signup/recovery), desafio MFA, verificacao, redirecionamento
2. **Impacto tecnico por camada**
   - UI: `src/app/login/*`, `src/app/verify-mfa/*`
   - servidor: `src/lib/actions/auth.ts`
   - servicos: `src/lib/auth/*`
   - gate de acesso: `src/lib/supabase/middleware.ts`, `src/middleware.ts`
   - persistencia: `src/types/database.ts`
3. **Validar controles de seguranca**
   - limite de tentativas, expiracao de OTP, sessao ativa + MFA verificado
4. **Validar observabilidade**
   - auditoria `auth.*`, logs de erro, sinais de regressao

## Avaliacao de impacto de mudancas

Sempre avaliar:

- risco de bypass para rotas protegidas sem MFA
- regressao de redirect (`/login` <-> `/verify-mfa` <-> `/dashboard`)
- churn indevido de sessao/OTP no refresh de tela MFA
- inconsistencias entre fluxo server action e fluxo legado
- impacto em recovery de senha e invalidadacao de sessoes

## Padrao de resposta por evidencia

Toda resposta deve incluir:

- quais arquivos sustentam a conclusao
- qual regra de auth foi aplicada
- qual etapa do fluxo foi impactada
- qual risco existe e como mitigar

Evitar resposta generica sem referencia de codigo.

## Fronteira com Foundation Common

- Auth trata identidade, sessao, MFA/OTP e hardening do funil de autenticacao.
- Foundation Common trata autorizacao funcional, navegacao e guardas transversais de rota.

## Governanca obrigatoria

Para demandas de auth, seguir sempre:

1. consultar `.context/modules/auth/context.md`
2. carregar esta skill
3. usar `.cursor/specialists/specialist-auth.md`
4. responder com evidencias (arquivos, regras, fluxo)
