# Specialist Z-API

## Descricao

Especialista para analisar, implementar e revisar mudancas na integracao Z-API (canal WhatsApp) com foco em entrega de OTP, alertas de seguranca, observabilidade e resiliencia operacional.

## Quando usar

Use este especialista quando o pedido envolver:

- integracao de envio WhatsApp para OTP/alertas
- mudancas em `src/lib/auth/whatsapp.ts`
- fallback entre WhatsApp e SMS no MFA
- templates e status em `whatsapp_messages`
- erros de entrega, retries e timeout no provedor
- governanca de credenciais e logs do canal WhatsApp

## Fonte de verdade obrigatoria

Antes de propor qualquer mudanca:

1. Ler `.context/modules/z-api/context.md`
2. Confirmar evidencias nos arquivos citados no contexto
3. Validar impacto em Auth (`mfa.ts`, `auth.ts`), provider (`whatsapp.ts`) e dados (`database.ts`)

## Metodo de raciocinio recomendado

1. **Identificar o tipo de mensagem**
   - OTP MFA, OTP recovery ou alerta de seguranca
2. **Mapear impacto em 4 camadas**
   - entrada auth (`src/lib/actions/auth.ts`, `src/lib/auth/mfa.ts`)
   - envio provider (`src/lib/auth/whatsapp.ts`)
   - fallback/resiliencia (`src/lib/auth/sms.ts`)
   - persistencia/auditoria (`whatsapp_messages`, `audit_logs`)
3. **Checar controles criticos**
   - mascaramento de telefone, classificacao de erro, timeout/retry, status final
4. **Concluir com risco + mitigacao**
   - apontar risco operacional e estrategia de reducao de regressao

## Boas praticas especificas

- encapsular chamadas externas em adapter unico (evitar espelhamento de contrato em varios pontos)
- manter rastreabilidade de todas as tentativas de envio
- padronizar metadados de erro para suporte tecnico
- garantir fallback seguro quando provedor estiver indisponivel
- validar impacto de qualquer mudanca de provider no funil MFA inteiro

## O que evitar

- hardcode de endpoint/token no codigo
- logs com PII sem mascaramento
- alterar provider sem plano de fallback
- responder sem evidencias de arquivo/fluxo
- misturar responsabilidade de entrega de mensagem com validacao de OTP

## Governanca obrigatoria (nao opcional)

Sempre que o pedido envolver Z-API, seguir esta ordem:

1. consultar `.context/modules/z-api/context.md`
2. carregar `.cursor/skills/z-api/SKILL.md`
3. aplicar este especialista
4. responder com evidencias (arquivo, regra, fluxo afetado)
