# Modulo Settings Admin - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Settings/Admin
- **Owner tecnico:** Time Platform Operations (confirmar)
- **Owner de negocio:** Operacoes e Suporte (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-25

## 2) Objetivo de negocio

- **Problema que resolve:** oferecer controle basico de equipe, notificacoes, seguranca e configuracoes da organizacao.
- **Publico/area impactada:** owner/admin e membros com acesso permitido.
- **Valor esperado:** reduzir dependencia de suporte para operacoes administrativas comuns.
- **Nao objetivos:** billing completo de producao no MVP atual.

## 3) Escopo funcional

- **Entradas principais:** org ativa, membership e status de verificacao.
- **Processamentos-chave:** leitura de membros e exibicao de secoes administrativas.
- **Saidas/entregaveis:** tela de configuracoes por org.
- **Fluxo principal:** abrir `/{orgSlug}/settings` e gerenciar opcoes permitidas.
- **Fluxos alternativos:** modo leitura durante verificacao pendente.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, DB, auth/permissoes.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/settings/page.tsx`
  - `src/lib/actions/navigation.ts`
- **Dependencias internas:** `organizations`, `organization_members`.
- **Decisoes arquiteturais relevantes:** acoes sensiveis condicionadas por role e status da conta.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/settings/page.tsx`, `src/app/(protected)/admin/dashboard/page.tsx`
- **Acoes de servidor:** leitura de contexto de org/membership.
- **Tipos:** `src/types/navigation.ts`, `src/types/database.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `organizations`, `organization_members`.
- **Campos criticos:** `role`, `verification_status`.
- **Regras de validacao:** owner/admin possuem acoes ampliadas, owner controla zona de perigo.
- **Contratos de API/eventos:** contratos administrativos ainda parcialmente em placeholder.

## 7) Seguranca e conformidade

- **Risco atual:** parte das funcoes de configuracao ainda no estado visual (sem persistencia real).
- **Mitigacao recomendada:** priorizar convites e papeis primeiro; ativar demais blocos por fase.
- **Urgencia:** media.

## 8) Backlog do modulo

- Implementar gestao real de membros direto em settings.
- Conectar preferencias de notificacao com persistencia.
- Revisar operacoes destrutivas com dupla confirmacao e auditoria reforcada.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/settings/page.tsx`
- `src/app/(protected)/admin/dashboard/page.tsx`
- `src/lib/actions/navigation.ts`
