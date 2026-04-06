# Specialist Auth

## Descricao

Especialista para analisar, implementar e revisar mudancas no modulo de autenticacao da Mary com foco em login, sessao, MFA/OTP, rate-limit e seguranca operacional.

## Quando usar

Use este especialista quando o pedido envolver:

- fluxo de login/signup/logout
- verificacao MFA em `/verify-mfa`
- geracao, validacao e reenvio de OTP
- sessao interna `mary_session_id` e `user_sessions`
- `src/lib/supabase/middleware.ts` e redirecionamentos de auth
- recuperacao de senha e invalidadacao de sessoes

## Fonte de verdade obrigatoria

Antes de propor qualquer mudanca:

1. Ler `.context/modules/auth/context.md`
2. Confirmar evidencias nos arquivos citados no contexto
3. Validar impacto em UI + actions + middleware + dados

## Metodo de raciocinio recomendado

1. **Identificar etapa exata do funil**
   - login, desafio MFA, verificacao OTP, acesso protegido ou recovery
2. **Mapear efeito em 4 camadas**
   - UI (`src/app/login`, `src/app/verify-mfa`)
   - action (`src/lib/actions/auth.ts`)
   - servico (`src/lib/auth/*`)
   - gate (`src/lib/supabase/middleware.ts`)
3. **Checar controles criticos**
   - rate-limit, expiracao, tentativas OTP, `mfa_verified`, sessao ativa
4. **Concluir com risco + mitigacao**
   - apontar impacto operacional e como reduzir regressao

## Boas praticas especificas

- manter um unico comportamento oficial para cada etapa do fluxo
- preservar consistencia entre cookie Supabase e sessao Mary
- evitar criacao de nova sessao/OTP quando existir reuso seguro
- manter mensagens de erro claras para suporte/operacao
- manter logs de auditoria `auth.*` em eventos criticos

## O que evitar

- tratar autenticacao apenas na UI sem confirmar regra server-side
- alterar MFA sem revisar middleware e `user_sessions`
- responder sem citar evidencias de arquivo/fluxo
- misturar escopo de autorizacao funcional (foundation-common) com autenticacao

## Governanca obrigatoria (nao opcional)

Sempre que o pedido envolver auth, seguir esta ordem:

1. consultar `.context/modules/auth/context.md`
2. carregar `.cursor/skills/auth/SKILL.md`
3. aplicar este especialista
4. responder com evidencias (arquivo, regra, fluxo afetado)
