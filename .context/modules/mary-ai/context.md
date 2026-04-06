# Modulo Mary AI - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Mary AI
- **Owner tecnico:** Time AI Platform (confirmar)
- **Owner de negocio:** Produto Core (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-25

## 2) Objetivo de negocio

- **Problema que resolve:** apoiar o usuario com assistencia contextual durante a jornada de M&A.
- **Publico/area impactada:** investor, asset e advisor.
- **Valor esperado:** acelerar tomada de decisao e producao de artefatos com supervisao humana.
- **Nao objetivos:** automacao autonoma e publicacao automatica no MVP.

## 3) Escopo funcional

- **Entradas principais:** perfil da org, contexto da tela, pergunta do usuario.
- **Processamentos-chave:** montar UX do chat privado e sugestoes por perfil.
- **Saidas/entregaveis:** interface de chat contextual e sugestoes iniciais.
- **Fluxo principal:** abrir `mary-ai-private` -> visualizar contexto -> iniciar conversa.
- **Fluxos alternativos:** conta em analise entra em read-only.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, auth/perfil, integracao AI (evolutiva).
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/mary-ai-private/page.tsx`
  - `src/app/(protected)/advisor/mary-ai-private/page.tsx`
  - `src/types/navigation.ts`
- **Dependencias internas:** contextos de org/perfil e navegacao.
- **Decisoes arquiteturais relevantes:** tela dedicada por perfil com comportamento semelhante.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/mary-ai-private/page.tsx`, `src/app/(protected)/advisor/mary-ai-private/page.tsx`
- **Acoes de servidor:** contexto de acesso via navegacao/auth.
- **Tipos:** `src/types/navigation.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** ainda sem contrato consolidado de historico de conversa no escopo atual.
- **Campos criticos:** perfil, verificacao da org e read-only.
- **Regras de validacao:** acesso condicionado por autenticacao e status da org.
- **Contratos de API/eventos:** MVP atual prioriza UI e guardrails.

## 7) Seguranca e conformidade

- **Risco atual:** ausencia de camada explicita de guardrails por acao (publicar/editar/aprovar) no codigo atual.
- **Mitigacao recomendada:** contrato de IA assistiva com aprovacao humana obrigatoria.
- **Urgencia:** alta.

## 8) Backlog do modulo

- Integrar geracao assistida de teaser, valuation e deck com fluxo revisar/editar/aprovar.
- Implementar bloqueios explicitos para impedir alteracao automatica de status final.
- Instrumentar metrica de diferenca IA x validacao humana.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/mary-ai-private/page.tsx`
- `src/app/(protected)/advisor/mary-ai-private/page.tsx`
- `src/types/navigation.ts`
