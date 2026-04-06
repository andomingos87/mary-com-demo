# Modulo Mais Infos - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Mais Infos (Data Room Complementar)
- **Owner tecnico:** Time VDR/Docs (confirmar)
- **Owner de negocio:** Produto Ativo (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-25

## 2) Objetivo de negocio

- **Problema que resolve:** centralizar informacoes complementares fora do checklist principal.
- **Publico/area impactada:** ativos, investidores convidados e advisors.
- **Valor esperado:** acelerar diligencia complementar e reduzir friccao de troca de informacao.
- **Nao objetivos:** substituir totalmente o MRS.

## 3) Escopo funcional

- **Entradas principais:** documentos, links, comentarios/Q&A e permissoes de acesso.
- **Processamentos-chave:** upload/gestao de documentos, compartilhamento e acompanhamento de engajamento.
- **Saidas/entregaveis:** workspace VDR por projeto com painel de documentos e Q&A.
- **Fluxo principal:** abrir VDR do projeto -> visualizar/adicionar evidencias -> responder perguntas.
- **Fluxos alternativos:** acesso externo read-only, expiracao de links, restricoes por papel.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, DB, permissionamento.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/projects/[codename]/vdr/VdrPageClient.tsx`
  - `src/components/vdr/**`
  - `src/lib/actions/vdr-*`
  - `src/lib/actions/vdr-qa.ts`
- **Dependencias internas:** `vdr_documents`, `vdr_links`, `vdr_access_logs`, `projects`.
- **Decisoes arquiteturais relevantes:** acesso externo controlado com modo read-only.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/projects/[codename]/vdr/**`, `src/app/vdr/share/[token]/**`
- **Componentes UI:** `src/components/vdr/**`
- **Acoes de servidor:** `src/lib/actions/vdr-documents.ts`, `src/lib/actions/vdr-links.ts`, `src/lib/actions/vdr-qa.ts`
- **Schemas/tipos:** `src/types/vdr.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** documentos, pastas, links, comentarios/Q&A, acessos.
- **Campos criticos:** status do documento, validacoes n1/n2/n3, permissoes e expirações.
- **Regras de validacao:** trilha de validacao e trilha de acesso por usuario/perfil.
- **Contratos de API/eventos:** listagem/edicao, compartilhamento por link e painel de Q&A.

## 7) Seguranca e conformidade

- **Risco atual:** configuracoes de compartilhamento granular ainda precisam de alinhamento fino com PRD.
- **Mitigacao recomendada:** padrao unico de policy por tipo de acesso (interno, externo, link).
- **Urgencia:** alta.

## 8) Backlog do modulo

- Alinhar nomenclatura e fronteira entre MRS e Mais Infos no UX.
- Consolidar regras de compartilhamento por investidor/grupo.
- Ampliar cobertura de testes para acessos externos e Q&A.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/projects/[codename]/vdr/VdrPageClient.tsx`
- `src/components/vdr/VdrQaPanel.tsx`
- `src/lib/actions/vdr-qa.ts`
- `src/lib/actions/vdr-links.ts`
- `src/lib/actions/vdr-documents.ts`
