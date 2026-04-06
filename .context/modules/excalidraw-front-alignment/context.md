# Modulo Excalidraw Front Alignment - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Excalidraw Front Alignment
- **Owner tecnico:** Frontend Lead (confirmar owner nominal)
- **Owner de negocio:** Produto (confirmar owner nominal)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-04-01

## 2) Objetivo de negocio

- **Problema que resolve:** reduzir drift entre contrato funcional (Excalidraw) e frontend implementado.
- **Publico/area impactada:** times de frontend, produto, QA e validacao de cliente.
- **Valor esperado:** acelerar refatoracao orientada por evidencias, diminuir retrabalho e aumentar previsibilidade de entrega.
- **Nao objetivos (fora de escopo):** redefinir PRD inteiro, mudar arquitetura backend ou schema por este modulo.

## 3) Escopo funcional

- **Entradas principais:** docs em `.dev/excalidraw/*`, backlog em `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`, codigo frontend em `src/app` e `src/components`.
- **Processamentos-chave:** inventario, matriz de conformidade, auditoria por jornada/perfil, proposta de refatoracao por prioridade.
- **Saidas/entregaveis:** plano de atualizacao frontend, lista de gaps priorizados, evidencias por requisito.
- **Fluxo principal (happy path):**
  1. mapear requisito funcional na doc;
  2. localizar implementacao atual;
  3. classificar `OK/PARCIAL/GAP`;
  4. gerar recomendacao e backlog de ajuste.
- **Fluxos alternativos/erros:** doc ambigua, rota equivalente nao obvia, funcionalidade em placeholder.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** documentacao, navegacao frontend, componentes de formulario, componentes de dominio.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/**`
  - `src/app/(protected)/advisor/**`
  - `src/components/navigation/**`
  - `src/components/onboarding/**`
  - `src/components/projects/**`
  - `src/components/mary-ai/**`
- **Dependencias internas:** `.context/modules/*`, `.cursor/skills/*`, `.cursor/specialists/*`.
- **Dependencias externas:** nenhuma obrigatoria para operacao base deste modulo.
- **Decisoes arquiteturais relevantes:** manter arquitetura `/{orgSlug}` e mapear equivalencias funcionais sem quebrar navegacao vigente.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/**`, `src/app/onboarding/**`
- **Componentes UI:** `src/components/navigation/**`, `src/components/onboarding/**`, `src/components/projects/**`, `src/components/mary-ai/**`
- **Acoes de servidor:** `src/lib/actions/navigation.ts`
- **Schemas/tipos:** `src/types/navigation.ts`, `src/types/database.ts`
- **Migrations/policies:** nao aplicavel por padrao

## 6) Dados e contratos

- **Entidades/tabelas principais:** `organizations`, `organization_members`, `projects`
- **Campos criticos:** `profile_type`, `verification_status`, `onboarding_step`, `codename`, `status`
- **Regras de validacao:** acesso por perfil e org ativa, gate de onboarding completo, gating parcial por fase em modulos especificos.
- **Contratos de API/eventos:** contrato de navegacao e validacao de rota em `src/lib/actions/navigation.ts`.
- **Regras de autorizacao (RLS/permissoes):** definidas por membership e perfil.

## 7) Seguranca e conformidade

- **Dados sensiveis envolvidos:** dados de organizacao, dados de projeto e acesso a documentos (VDR).
- **Controles aplicados:** verificacao de sessao, validacao de membership e perfil, controle de acesso por rota.
- **Riscos atuais:** gaps de jornada e regras globais inconsistentes (auto-save/tooltips) podem gerar erro operacional.
- **Mitigacoes recomendadas:** checklist de conformidade por tela e gate formal antes de liberar refatoracoes amplas.

## 8) Observabilidade e operacao

- **Logs importantes:** erros em `navigation.ts`, falhas de query em paginas server-side, fallbacks no radar.
- **Metricas-chave:** cobertura de requisitos `OK/PARCIAL/GAP`, quantidade de gaps P0/P1 fechados por sprint.
- **Alertas necessarios:** aumento de regressao em navegacao por perfil e quebra de rota em fluxos criticos.
- **Runbook basico (falhas comuns + acao):**
  1. validar requisito na doc;
  2. confirmar evidencia no app;
  3. classificar gap e risco;
  4. abrir item no backlog com dono e prazo.

## 9) Qualidade e testes

- **Testes unitarios existentes:** cobertura distribuida por modulo, sem suite unica de aderencia Excalidraw.
- **Testes de integracao existentes:** parciais por dominio.
- **Cenarios criticos sem cobertura:** validacao automatizada de conformidade doc->rota->componente.
- **Plano minimo de teste manual:** smoke por perfil em onboarding, radar, projetos e feed.

## 10) Backlog do modulo

- **Divida tecnica:** falta de padrao global para auto-save e tooltip em formularios.
- **Melhorias de curto prazo:** fechar gaps S0/S1 da matriz canonica.
- **Melhorias de medio prazo:** consolidar checklist semiautomatico por rota.
- **Riscos bloqueantes e plano de resolucao:**
  - risco: refatorar sem baseline validado por perfil;
  - resolucao recomendada: aplicar piloto e gate formal antes de escala;
  - justificativa: reduz regressao em fluxos de negocio;
  - urgencia: alta.

## 11) Checklist de pronto

- [ ] Inventario e matriz canonica atualizados.
- [ ] Gaps S0/S1 com owner e prioridade.
- [ ] Sub-agents e skills do modulo documentados.
- [ ] Piloto validado e gate de revisao executado.
- [ ] Rastreabilidade atualizada no backlog e changelog.

## 12) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-04-01 | Criado modulo de alinhamento Excalidraw x Frontend | Necessidade de context engineering para auditoria/refatoracao | Estrutura governada para comparar doc vs app e priorizar ajustes |

## Evidencias usadas para este modulo

- `.dev/excalidraw/00_INDEX.md`
- `.dev/excalidraw/01_GLOBAL_RULES.md`
- `.dev/excalidraw/02_ATIVO.md`
- `.dev/excalidraw/03_INVESTIDOR.md`
- `.dev/excalidraw/04_ADVISOR.md`
- `.dev/excalidraw/05_SHARED_MODULES.md`
- `.dev/production/24-AUDIT-EXCALIDRAW-FRONTEND-INVENTARIO.md`
- `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md`
