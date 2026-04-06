# Modulo Z-API - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Z-API
- **Owner tecnico:** Plataforma/Security (confirmar owner nominal)
- **Owner de negocio:** Produto (confirmar owner nominal)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-30

## 2) Objetivo de negocio

- **Problema que resolve:** garantir entrega confiavel de OTP e alertas de seguranca via WhatsApp usando provedor dedicado.
- **Publico/area impactada:** usuarios com MFA por WhatsApp e time de suporte operacional.
- **Valor esperado:** maior taxa de entrega no canal WhatsApp, menor friccao no funil de login/MFA e rastreabilidade de mensagens.
- **Nao objetivos (fora de escopo):** logica de validacao de OTP, rate-limit, regras de sessao e autorizacao de rotas (dominio de Auth/Foundation).

## 3) Escopo funcional

- **Entradas principais:**
  - `phoneNumber` normalizado
  - `templateType` (`otp_mfa`, `otp_recovery`, `new_device_alert`, `country_change_alert`, `session_invalidated`)
  - `templateParams` (code, device, location, country, time)
- **Processamentos-chave:**
  - enfileirar envio em `whatsapp_messages`
  - disparar envio para API de WhatsApp (modo real) ou mock
  - atualizar status de envio e metadados do provedor
  - registrar auditoria de eventos `auth.otp_sent`
- **Saidas/entregaveis:**
  - mensagem com status persistido (`pending`, `sent`, `failed`, `mock_sent`)
  - `provider_message_id` para rastreio
  - log operacional e trilha de auditoria
- **Fluxo principal (happy path):**
  - `initiateMfa` -> `sendOtpViaWhatsApp` -> `queueWhatsAppMessage` -> `sendWhatsAppMessage` -> update status -> UI de `/verify-mfa`
- **Fluxos alternativos/erros:**
  - credenciais ausentes -> modo mock automatico
  - falha de API -> status `failed` e fallback para SMS no funil de MFA
  - template desconhecido -> erro de validacao do envio

## 4) Arquitetura e componentes

- **Camadas envolvidas:** Server Actions, servicos de auth, DB, integracao externa.
- **Componentes/servicos principais:**
  - `src/lib/auth/whatsapp.ts`
  - `src/lib/auth/mfa.ts`
  - `src/lib/auth/device.ts`
  - `src/lib/actions/auth.ts`
  - `src/app/verify-mfa/page.tsx`
  - `src/app/verify-mfa/mfa-form.tsx`
- **Dependencias internas:** `otp_codes`, `whatsapp_messages`, `audit_logs`, `user_profiles`.
- **Dependencias externas:** endpoint de WhatsApp provider Z-API (`send-text`).
- **Decisoes arquiteturais relevantes:**
  - persistir envio antes da chamada externa para garantir rastreabilidade
  - manter mock mode para ambientes sem credenciais
  - fallback para SMS quando WhatsApp estiver indisponivel

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/verify-mfa/page.tsx`, `src/app/verify-mfa/mfa-form.tsx`
- **Acoes de servidor:** `src/lib/actions/auth.ts`
- **Servicos:** `src/lib/auth/whatsapp.ts`, `src/lib/auth/providers/z-api.ts`, `src/lib/auth/mfa.ts`, `src/lib/auth/device.ts`, `src/lib/auth/sms.ts`
- **Schemas/tipos:** `src/types/database.ts`
- **Migrations/policies:** contratos refletidos em `src/types/database.ts` (tabela `whatsapp_messages` e enums de WhatsApp)

## 6) Dados e contratos

- **Entidades/tabelas principais:** `whatsapp_messages`, `otp_codes`, `audit_logs`, `user_profiles`.
- **Campos criticos:**
  - `whatsapp_messages.status`
  - `whatsapp_messages.provider_message_id`
  - `whatsapp_messages.error_message`
  - `whatsapp_messages.template_type`
  - `otp_codes.channel`
- **Regras de validacao:**
  - template deve existir no catalogo local
  - numero e sanitizado antes do envio
  - evento de auditoria de OTP precisa mascarar telefone
- **Contratos de API/eventos:**
  - `queueWhatsAppMessage`, `sendOtpViaWhatsApp`, `sendNewDeviceAlert`, `sendCountryChangeAlert`
  - eventos `auth.otp_sent` em `audit_logs`
- **Regras de autorizacao (RLS/permissoes):**
  - envio e update de mensagens via `createAdminClient` no backend

## 7) Seguranca e conformidade

- **Dados sensiveis envolvidos:** numero de telefone, codigo OTP, contexto de dispositivo/localizacao.
- **Controles aplicados:**
  - mascaramento de telefone em logs
  - envio de OTP separado por finalidade (`mfa` e `recovery`)
  - fallback de canal para reduzir indisponibilidade operacional
- **Riscos atuais:**
  - drift de contrato da Z-API pode quebrar envio se endpoint/payload mudar sem versionamento
  - retries agressivos podem gerar duplicidade operacional em incidentes de rede
  - mock mode em ambiente nao controlado pode esconder indisponibilidade de provider
- **Mitigacoes recomendadas:**
  - manter adapter unico (`src/lib/auth/providers/z-api.ts`) como ponto oficial de contrato
  - limitar retry a erros transitorios e registrar classificacao de erro no log
  - em producao, tratar credenciais ausentes como erro operacional com fallback seguro

## 8) Observabilidade e operacao

- **Logs importantes:**
  - `Failed to send WhatsApp message via Z-API`
  - `Z-API transient error, retrying`
  - `[MOCK] Z-API message would be sent`
  - `auth.otp_sent` em `audit_logs`
- **Metricas-chave:**
  - taxa de envio com sucesso por tipo de template
  - volume de fallback para SMS
  - distribuicao de falhas por categoria (rede, auth, template)
- **Alertas necessarios:**
  - aumento de `failed` em `whatsapp_messages`
  - queda brusca de envios `sent`
  - crescimento anormal de fallback para SMS
- **Runbook basico (falhas comuns + acao):**
  - validar credenciais e endpoint do provedor
  - confirmar status de mock/production via `getWhatsAppStatus`
  - checar registro em `whatsapp_messages` e trilha em `audit_logs`

## 9) Qualidade e testes

- **Testes unitarios existentes:** cobertura de UI em `src/app/verify-mfa/__tests__/mfa-form.test.tsx`.
- **Testes de integracao existentes:** nao identificado teste dedicado para provider WhatsApp.
- **Cenarios criticos sem cobertura:**
  - integracao end-to-end com ambiente Z-API real
  - observabilidade com alta concorrencia de retries
- **Plano minimo de teste manual:**
  - autenticar com canal WhatsApp em ambiente com mock habilitado
  - autenticar em ambiente com provider real configurado
  - forcar falha de API e validar fallback para SMS
  - validar persistencia correta em `whatsapp_messages`

## 10) Backlog do modulo

- **Divida tecnica:** consolidar testes de contrato com payload real da Z-API em ambiente homologado.
- **Melhorias de curto prazo:**
  - adicionar testes de contrato com fixture de resposta real da Z-API
  - incluir monitoramento de taxa de retry por template/tipo de mensagem
  - padronizar dashboard operacional de erros por `errorCode`
- **Melhorias de medio prazo:**
  - fila assincrona com retentativa automatica por prioridade de mensagem
  - dashboard operacional de entrega por canal/template
- **Riscos bloqueantes e plano de resolucao:**
  - **Issue:** dependencia de contrato externo sem adapter dedicado.
  - **Solucao recomendada:** encapsular integracao Z-API em camada unica de provider.
  - **Justificativa:** reduz acoplamento e simplifica manutencao/migracao futura.
  - **Urgencia:** alta.

## 11) Checklist de pronto

- [ ] Escopo funcional validado com negocio.
- [x] Contrato de provider Z-API formalizado.
- [x] Testes minimos de envio/fallback implementados.
- [ ] Observabilidade e alertas definidos para operacao.
- [ ] Documentacao tecnica atualizada.

## 12) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-03-30 | Criar modulo dedicado de Z-API | Separar governanca do canal WhatsApp no dominio de auth | Facilita evolucao segura da integracao |

## Evidencias usadas para este modulo

- `src/lib/auth/whatsapp.ts`
- `src/lib/auth/providers/z-api.ts`
- `src/lib/auth/mfa.ts`
- `src/lib/auth/sms.ts`
- `src/lib/auth/device.ts`
- `src/lib/actions/auth.ts`
- `src/app/verify-mfa/page.tsx`
- `src/app/verify-mfa/mfa-form.tsx`
- `src/app/verify-mfa/__tests__/mfa-form.test.tsx`
- `src/lib/auth/providers/__tests__/z-api.test.ts`
- `src/types/database.ts`
