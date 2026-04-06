# Modulo Collaboration - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Collaboration & Convites
- **Owner tecnico:** Time Access & Collaboration (confirmar)
- **Owner de negocio:** Produto Operacional (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-25

## 2) Objetivo de negocio

- **Problema que resolve:** permitir colaboracao controlada em nivel de organizacao e projeto.
- **Publico/area impactada:** owners/admins, membros internos e convidados.
- **Valor esperado:** acelerar entrada de colaboradores sem comprometer seguranca.
- **Nao objetivos:** chat interno em tempo real (pos-MVP).

## 3) Escopo funcional

- **Entradas principais:** email do convidado, papel desejado, projeto/alvo.
- **Processamentos-chave:** criar convite, validar expiracao, aceitar/recusar, registrar auditoria e notificar.
- **Saidas/entregaveis:** membership em org/projeto e historico de convite.
- **Fluxo principal:** owner/admin envia convite -> convidado aceita -> acesso liberado.
- **Fluxos alternativos:** convite expirado, email divergente, usuario ja membro.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** Server Actions, Email, Notificacoes, DB.
- **Componentes/servicos principais:**
  - `src/lib/actions/invites.ts`
  - `src/lib/actions/project-invites.ts`
  - `src/components/projects/ProjectInvitesList.tsx`
  - `src/lib/actions/notifications.ts`
- **Dependencias internas:** `organization_invites`, `organization_members`, `project_invites`, `project_members`, `audit_logs`.
- **Dependencias externas:** supabase auth admin API + envio de e-mail.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/invite/project/[token]/page.tsx`, fluxos de settings/projeto.
- **Componentes UI:** `src/components/projects/ProjectInvitesList.tsx`
- **Acoes de servidor:** `src/lib/actions/invites.ts`, `src/lib/actions/project-invites.ts`
- **Tipos:** `src/types/database.ts`, `src/types/projects.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** convites e memberships de org/projeto.
- **Campos criticos:** `email`, `role`, `token`, `expires_at`, `invited_by`.
- **Regras de validacao:** email valido, anti-duplicidade, limite de pendentes, bloqueio de auto-convite.
- **Contratos de API/eventos:** create/accept/cancel/resend invite + notificacoes.
- **Regras de autorizacao:** apenas papeis permitidos enviam convite.

## 7) Seguranca e conformidade

- **Risco atual:** inconsistencias entre regras de convite de org e de projeto.
- **Mitigacao recomendada:** contrato unificado de convite com validacoes comuns.
- **Urgencia:** media-alta.

## 8) Backlog do modulo

- Consolidar experiencia unica de convites no UI.
- Expandir testes para expiracao, aceite e revogacao em ambos os niveis.
- Integrar trilha de auditoria em dashboards operacionais.

## Evidencias usadas para este modulo

- `src/lib/actions/invites.ts`
- `src/lib/actions/project-invites.ts`
- `src/components/projects/ProjectInvitesList.tsx`
- `src/lib/actions/notifications.ts`
