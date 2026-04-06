# Modulo Feed - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Feed
- **Owner tecnico:** Time Engagement (confirmar)
- **Owner de negocio:** Produto Growth (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-25

## 2) Objetivo de negocio

- **Problema que resolve:** manter a plataforma viva com eventos relevantes e notificacoes.
- **Publico/area impactada:** investor e asset.
- **Valor esperado:** aumentar recorrencia semanal e retomada de fluxo.
- **Nao objetivos:** mensageria em tempo real completa no MVP.

## 3) Escopo funcional

- **Entradas principais:** eventos do sistema, notificacoes por usuario, perfil da org.
- **Processamentos-chave:** listagem cronologica, contagem de nao lidas, marcar leitura.
- **Saidas/entregaveis:** tela de feed + dropdown de notificacoes no header.
- **Fluxo principal:** abrir feed -> ver timeline; abrir sino -> ver notificacoes.
- **Fluxos alternativos:** perfil indevido redireciona; sem eventos mostra estado vazio.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, Realtime, DB.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/feed/page.tsx`
  - `src/components/notifications/NotificationBell.tsx`
  - `src/lib/actions/notifications.ts`
  - `src/types/notifications.ts`
- **Dependencias internas:** tabela `notifications`.
- **Dependencias externas:** Supabase realtime.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/feed/page.tsx`
- **Componentes UI:** `src/components/notifications/**`
- **Acoes de servidor:** `src/lib/actions/notifications.ts`
- **Tipos:** `src/types/notifications.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `notifications`.
- **Campos criticos:** `user_id`, `type`, `title`, `data`, `read_at`, `action_url`.
- **Regras de validacao:** usuario autenticado so acessa as proprias notificacoes.
- **Contratos de API/eventos:** `getNotifications`, `markAsRead`, `markAllAsRead`, `getUnreadCount`.

## 7) Seguranca e conformidade

- **Risco atual:** feed de pagina ainda com placeholder sem eventos reais do dominio.
- **Mitigacao recomendada:** consolidar catalogo de eventos e integrar com projetos/MRS.
- **Urgencia:** alta para recorrencia.

## 8) Backlog do modulo

- Conectar eventos de status de projeto e marcos de deal no feed principal.
- Adicionar lembretes/nudges com cadencia configuravel.
- Criar digest semanal por e-mail alinhado ao PRD.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/feed/page.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/lib/actions/notifications.ts`
- `src/types/notifications.ts`
