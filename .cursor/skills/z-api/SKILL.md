---
name: z-api
description: Analisa e implementa mudancas no modulo de Z-API com foco em entrega de OTP/alertas via WhatsApp, resiliencia de provider, fallback para SMS e seguranca operacional. Use quando o usuario pedir ajustes em integracao WhatsApp, provider externo, templates de mensagem, status de envio, retries/timeout ou erros de entrega no fluxo MFA.
---

## Fonte de verdade do modulo

- Contexto funcional: `.context/modules/z-api/context.md`
- Indice de caminhos: `.context/modules/module-index.json`

## Objetivo

Analisar e implementar integracao Z-API para OTP/alertas via WhatsApp, fallback SMS e resiliencia operacional.

## Gatilhos

- MFA WhatsApp, provider, `whatsapp_messages`, templates, timeout/retries, fallback SMS, PII em logs

## Evidencia

Citar arquivos e regras concretas do repositorio; evitar conclusoes sem referencia.
