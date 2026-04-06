# Product Backlog Priorizado - MVP v2.2

Data base: 24/03/2026  
Base de referencia: `.dev/production/1-PRD.md`, `.dev/production/2-REVIEW_GATE_PRD_PIVOT.md`, `.dev/production/5-PRD_IMPLEMENTATION_AUDIT.md`

---

## 1) Resumo do escopo

- Fechar gaps criticos de aderencia do PRD v2.2 antes de expandir escopo.
- Entregar fluxos centrais do MVP: Investidor (onboarding 2 etapas) e Ativo (MRS canonico).
- Estabelecer recorrencia com Feed, alertas e lembretes.
- Garantir governanca de IA com aprovacao humana obrigatoria.
- Preservar seguranca multi-tenant e rastreabilidade de decisao.

---

## 2) Premissas e lacunas

Premissas:

- PRD v2.2 e o documento canonico de produto.
- Gate de implementacao parte de baseline reprovada e precisa ser fechado por fases.
- Prioridade da release e aderencia funcional, nao refinamento estetico.

Lacunas criticas abertas:

- Assinatura eletronica no MVP (decisao pendente).
- Limite inicial de upload por arquivo (baseline pendente).
- Calibragem fina de pesos do MRS apos telemetria inicial.

---

## 3) Backlog priorizado

Legenda:

- Prioridade: `P0` (critico), `P1` (alto), `P2` (medio), `P3` (pos-MVP).
- Tipo: `EPICO`, `HISTORIA`, `TAREFA`, `BUG`, `DEBITO_TECNICO`.
- Estimativa: `XS`, `S`, `M`, `L`, `XL`.

### ✅ [P0] [EPICO] E1 - Fundacao de navegacao aderente ao PRD

- **Descricao:** alinhar menus, rotas e nomenclaturas por perfil ao PRD v2.2.
- **Valor de negocio:** destrava os fluxos centrais e reduz ambiguidade de produto.
- **Criterios de aceite:** Investidor com `Tese/Radar/Feed/Projetos`; Ativo com `MRS/Radar/Feed/Projeto`; acesso por perfil preservado.
- **Dependencias:** PRD v2.2 consolidado.
- **Estimativa:** M
- **Risco:** Medio
- **Status:** Concluido em 24/03/2026
- **Evidencias:** menus atualizados por perfil (`thesis/radar/feed/projetos` para Investidor e `mrs/radar/feed/projeto` para Ativo); rotas canonicas adicionadas com compatibilidade de rotas legadas preservada; checklist de validacao em `.dev/production/validate/CHECKLIST_VALIDACAO_MANUAL_E1.md`; padrao canonico formalizado em `.dev/production/29-PADRAO-E1-NAVEGACAO-EXCALIDRAW.md`; validacao cliente consolidada em `.dev/production/client-validation/E1-VALIDACAO-CLIENTE-NAVEGACAO.md`.

#### ✅ [P0] [BUG] B1.1 - Corrigir divergencia de nomenclatura de menu/rotas

- **Descricao:** remover labels/rotas legadas divergentes do PRD.
- **Valor de negocio:** reduz retrabalho e erro de navegacao.
- **Criterios de aceite:** menus e rotas principais sem conflitos de naming.
- **Dependencias:** E1
- **Estimativa:** S
- **Risco:** Baixo
- **Status:** Concluido em 24/03/2026
- **Evidencias:** labels de menu harmonizadas para PRD (`Tese/Radar/Feed/Projetos` e `MRS/Radar/Feed/Projeto`) e rotas principais padronizadas; checklist de validacao em `.dev/production/validate/CHECKLIST_VALIDACAO_MANUAL_E1.md`; rastreabilidade de padronizacao em `.dev/production/29-PADRAO-E1-NAVEGACAO-EXCALIDRAW.md`.

### ✅ [P0] [EPICO] E2 - Onboarding Investidor em 2 etapas

- **Descricao:** simplificar fluxo para reduzir tempo ate valor.
- **Valor de negocio:** melhora adocao inicial.
- **Criterios de aceite:** fluxo completo em 2 etapas + direcionamento para Tese.
- **Dependencias:** E1
- **Estimativa:** L
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** jornada de entrada orientada por tese ativa concluida via H2.1 + H2.2; contratos e validacoes em `.dev/production/done/7-SPEC-GAP2-TESE-CRUD.md`, `.dev/production/done/8-SPEC-GAP3-RADAR-POR-TESE.md` e `.dev/production/done/9-SPEC-PRE-GAP3-TESE-ATIVA.md`.

#### ✅ [P1] [HISTORIA] H2.1 - Tese com CRUD minimo

- **Descricao:** criar, editar e ativar tese de investimento.
- **Valor de negocio:** habilita matching util no Radar.
- **Criterios de aceite:** CRUD funcional de tese com tese ativa por investidor.
- **Dependencias:** E2
- **Estimativa:** M
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** CRUD e contrato de tese ativa em `src/lib/actions/thesis.ts` (`listTheses/createThesis/updateThesis/activateThesis/getActiveThesis`), UI em `src/app/(protected)/[orgSlug]/thesis/page.tsx`, persistencia em `supabase/migrations/20260325120000_create_investment_theses.sql` e testes em `src/lib/actions/__tests__/thesis.test.ts`.

#### ✅ [P1] [BUG] B2.1.1 - Remover JSON tecnico da criacao/edicao de tese

- **Descricao:** substituir campo JSON bruto por formulario guiado no modal de tese.
- **Valor de negocio:** reduzir friccao para usuario nao tecnico e aumentar taxa de conclusao do cadastro de tese.
- **Criterios de aceite:** usuario cria/edita tese por campos guiados (setores, geografia, estagio, ticket) sem editar JSON manual.
- **Dependencias:** H2.1
- **Estimativa:** S
- **Risco:** Baixo
- **Status:** Concluido em 29/03/2026
- **Evidencias:** UI guiada com reuso de onboarding em `src/components/thesis/ThesisManager.tsx` (setores multi-select, geografia com `GeographySelector`, estagios multi-select dropdown e ticket com mascara USD), componentes compartilhados em `src/components/shared/*`, validacoes amigaveis em `src/lib/actions/thesis.ts`, cobertura em `src/lib/actions/__tests__/thesis.test.ts` e checklist cliente atualizado em `.dev/production/client-validation/E2-VALIDACAO-CLIENTE-ONBOARDING-INVESTIDOR.md`.

#### ✅ [P1] [BUG] B2.1.2 - Corrigir overflow da modal de tese com fluxo multistep

- **Descricao:** resolver corte de topo/base da modal de tese e transformar criacao/edicao em formulario por etapas.
- **Valor de negocio:** melhora usabilidade em telas menores, reduz abandono e garante acesso aos botoes de acao.
- **Criterios de aceite:** modal com altura limitada e scroll interno, passos com navegacao `Voltar/Proximo/Salvar`, reuso de componentes de filtros/ticket e contrato `ThesisCriteria` preservado.
- **Dependencias:** B2.1.1
- **Estimativa:** S
- **Risco:** Medio
- **Status:** Concluido em 29/03/2026
- **Evidencias:** modal multistep com `ScrollArea` e `max-height` em `src/components/thesis/ThesisManager.tsx`; steps na ordem `nome/resumo/setores -> geografia -> estagios/ticket/ativa` com persistencia ao voltar/avancar; stepper numerado reutilizando `src/components/onboarding/StepIndicator.tsx`; regex USD centralizada em `src/lib/format/currency.ts` e aplicada via `src/components/shared/UsdCurrencyInput.tsx`; CRUD e serializacao mantidos; testes `src/lib/actions/__tests__/thesis.test.ts` passando; checklist cliente atualizado em `.dev/production/client-validation/E2-VALIDACAO-CLIENTE-ONBOARDING-INVESTIDOR.md`.

#### ✅ [P1] [BUG] B2.1.3 - Corrigir drift de schema da tese no ambiente (PGRST205)

- **Descricao:** resolver incompatibilidade de ambiente entre `investment_theses` (contrato atual do app) e `investor_theses` (legado no banco), que bloqueava fluxo de tese/radar.
- **Valor de negocio:** restabelecer operacao do CRUD de tese e carregamento de radar para investidor sem erro tecnico.
- **Criterios de aceite:** `investment_theses` presente no schema `public`, requests para `/rest/v1/investment_theses` com `200`, e smoke tecnico de create/edit/activate sem `PGRST205`.
- **Dependencias:** H2.1
- **Estimativa:** XS
- **Risco:** Medio
- **Status:** Concluido em 29/03/2026
- **Evidencias:** diagnostico e correcao via MCP Supabase (`list_tables`, `list_migrations`, `apply_migration`, `execute_sql`); migration `create_investment_theses_canonic` aplicada; politicas/indices de `investment_theses` validados; logs de API com chamadas `investment_theses` em `200`; registro funcional em `.dev/production/client-validation/E1-VALIDACAO-CLIENTE-NAVEGACAO.md` e `.dev/production/client-validation/E2-VALIDACAO-CLIENTE-ONBOARDING-INVESTIDOR.md`.

#### ✅ [P1] [HISTORIA] H2.2 - Radar por tese com CTAs

- **Descricao:** listar ativos por aderencia de tese com teaser/NDA/follow.
- **Valor de negocio:** entrega primeiro valor real no lado investidor.
- **Criterios de aceite:** listagem por tese ativa, codinome e CTAs funcionais.
- **Dependencias:** H2.1
- **Estimativa:** XL
- **Risco:** Alto
- **Status:** Concluido em 26/03/2026
- **Evidencias:** matching MVP + listagem real + CTAs teaser/NDA/follow em `src/lib/actions/radar.ts` e `src/app/(protected)/[orgSlug]/opportunities/page.tsx`; persistencia em `supabase/migrations/20260326110000_create_radar_cta_tables.sql`; testes em `src/lib/actions/__tests__/radar.test.ts`.

### ✅ [P0] [EPICO] E3 - MRS canonico (nucleo do Ativo)

- **Descricao:** implementar modulo MRS no formato normativo do PRD.
- **Valor de negocio:** entrega o nucleo do MVP do lado ativo.
- **Criterios de aceite:** rota dedicada, passos 1-4, score normativo e regras de gate por etapa.
- **Dependencias:** E1
- **Estimativa:** XL
- **Risco:** Alto
- **Status:** Implementado e validado (26/03/2026)
- **Evidencias:** `.dev/production/done/10-SPEC-GAP4-MRS-CANONICO.md`; `.dev/production/done/11-CHECKLIST-VALIDACAO-MRS.md`; implementacao em `src/app/(protected)/[orgSlug]/mrs/page.tsx`, `src/components/mrs/MrsWorkspace.tsx`, `src/lib/readiness/mrs.ts` e `src/lib/actions/readiness.ts`; testes em `src/lib/readiness/__tests__/mrs.test.ts`.

#### [P0] [HISTORIA] H3.1 - Rota MRS e estrutura por passos

- **Descricao:** habilitar modulo dedicado de MRS com arvore tema/subtema/item.
- **Valor de negocio:** organiza jornada de prontidao.
- **Criterios de aceite:** MRS acessivel e navegavel por 4 passos.
- **Dependencias:** E3
- **Estimativa:** L
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** rota MRS dedicada e navegacao por 4 passos em `src/app/(protected)/[orgSlug]/mrs/page.tsx` e `src/components/mrs/MrsWorkspace.tsx`.

#### [P0] [HISTORIA] H3.2 - Status, prioridade, score e gates NDA/NBO

- **Descricao:** aplicar contrato funcional do MRS (`pendente/parcial/completo/na`, `critica/alta/media`, score e gating).
- **Valor de negocio:** elimina ambiguidade e aumenta confianca operacional.
- **Criterios de aceite:** score por passo/total conforme PRD; gates funcionando por etapa de deal.
- **Dependencias:** H3.1
- **Estimativa:** XL
- **Risco:** Alto
- **Status:** Concluido em 26/03/2026
- **Evidencias:** motor canonico de score/gates em `src/lib/readiness/mrs.ts`; persistencia e auditoria em `src/lib/actions/readiness.ts`; cobertura em `src/lib/readiness/__tests__/mrs.test.ts`.

#### [P0] [HISTORIA] H3.3 - Upload multiplo e metadados no contexto MRS

- **Descricao:** anexar multiplos arquivos por item com status/responsavel/comentarios/ultimo upload.
- **Valor de negocio:** viabiliza uso real de diligencia no MRS.
- **Criterios de aceite:** upload e metadados operacionais por item ativos.
- **Dependencias:** H3.1
- **Estimativa:** L
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** contrato de upload multiplo e metadados por item via `addMrsItemFileAction` em `src/lib/actions/readiness.ts` e UI operacional em `src/components/mrs/MrsWorkspace.tsx`.

### [P0] [EPICO] E4 - Projetos com marcos juridicos MVP

- **Descricao:** alinhar pipeline aos marcos normativos do PRD e condicionar projeto ao NDA.
- **Valor de negocio:** garante acompanhamento de deal no recorte MVP.
- **Criterios de aceite:** marcos `Teaser/NDA/NBO/SPA/Fechado-Perdido`; criacao de projeto apos NDA.
- **Dependencias:** E1
- **Estimativa:** L
- **Risco:** Alto
- **Status:** Concluido em 26/03/2026
- **Evidencias:** implementação em `src/lib/actions/projects.ts`, `src/types/database.ts`, `src/types/projects.ts`, `src/app/(protected)/[orgSlug]/pipeline/page.tsx`; migration em `supabase/migrations/20260326153000_e4_project_status_gate_audit.sql`; gate de implementação em `.dev/production/17-REVIEW-GATE-E4-IMPLEMENTACAO.md`.
- **Staging Gate:** NO-GO temporario em 26/03/2026 por falta de smoke E2E autenticado (detalhes em `.dev/production/19-RUNBOOK-STAGING-E4-EXECUCAO.md`).
- **Producao Gate:** NO-GO temporario em 26/03/2026 por pendencia de smoke funcional autenticado e ausencia de eventos E4 em `audit_logs` no momento da validacao (detalhes em `.dev/production/20-RUNBOOK-PRODUCAO-E4-ANTI-DRIFT-EXECUCAO.md`).

#### [P0] [BUG] B4.1 - Corrigir taxonomia de estagios do pipeline

- **Descricao:** substituir estagios legados por marcos do PRD.
- **Valor de negocio:** remove divergencia critica de produto.
- **Criterios de aceite:** pipeline usa somente marcos do PRD.
- **Dependencias:** E4
- **Estimativa:** M
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** taxonomia canônica aplicada em `src/types/database.ts` e `src/types/projects.ts`; pipeline atualizado em `src/app/(protected)/[orgSlug]/pipeline/page.tsx`; cobertura ajustada em `src/lib/actions/__tests__/radar.test.ts`.

#### [P0] [HISTORIA] H4.2 - Gate de criacao de projeto por NDA

- **Descricao:** impedir criacao de projeto antes da assinatura de NDA.
- **Valor de negocio:** reforca coerencia juridica e operacional.
- **Criterios de aceite:** projeto nao nasce sem NDA; trilha de auditoria minima registrada.
- **Dependencias:** B4.1
- **Estimativa:** M
- **Risco:** Medio
- **Status:** Concluido em 26/03/2026
- **Evidencias:** gate NDA e matriz de transição implementados em `src/lib/actions/projects.ts`; eventos de auditoria E4 e migração em `supabase/migrations/20260326153000_e4_project_status_gate_audit.sql`; validação em `.dev/production/18-SUPABASE-VALIDACAO-E4.md`.

### [P0] [EPICO] E5 - Feed, alertas e recorrencia

- **Descricao:** criar feed cronologico com eventos relevantes e lembretes iniciais.
- **Valor de negocio:** aumenta recorrencia e reduz abandono.
- **Criterios de aceite:** feed ativo para Investidor e Ativo com minimo de 3 tipos de evento.
- **Dependencias:** E1
- **Estimativa:** L
- **Risco:** Medio

#### [P1] [HISTORIA] H5.1 - Preferencias de notificacao e digest semanal

- **Descricao:** ativar configuracoes minimas de alertas e resumo semanal.
- **Valor de negocio:** melhora continuidade operacional.
- **Criterios de aceite:** preferencias funcionais + digest semanal inicial.
- **Dependencias:** E5
- **Estimativa:** M
- **Risco:** Medio

### [P1] [EPICO] E6 - IA assistiva com aprovacao humana

- **Descricao:** implementar pipeline assistivo para teaser/valuation/deck sem autopublicacao.
- **Valor de negocio:** acelera producao mantendo controle humano.
- **Criterios de aceite:** fluxo `rascunho -> revisao -> aprovado -> publicado`.
- **Dependencias:** E4, E3
- **Estimativa:** XL
- **Risco:** Alto

#### [P1] [DEBITO_TECNICO] D6.1 - Trava tecnica de autopublicacao

- **Descricao:** impedir publicacao automatica de artefatos por IA.
- **Valor de negocio:** reduz risco juridico/reputacional.
- **Criterios de aceite:** publicacao somente com aprovacao explicita de usuario.
- **Dependencias:** E6
- **Estimativa:** S
- **Risco:** Medio

### [P1] [EPICO] E7 - Hardening de seguranca e ingestao documental

- **Descricao:** reforcar ownership/membership em actions sensiveis e ampliar mitigacao de prompt injection.
- **Valor de negocio:** protege dados multi-tenant e governanca de IA.
- **Criterios de aceite:** validacoes de seguranca em operacoes criticas e sanitizacao ampliada.
- **Dependencias:** E3, E6
- **Estimativa:** L
- **Risco:** Alto

#### [P0] [TAREFA] T7.1 - Decidir assinatura eletronica no MVP

- **Descricao:** aprovar ou adiar integracao juridica no recorte da release.
- **Valor de negocio:** reduz risco de fluxo NDA/NBO/SPA.
- **Criterios de aceite:** decisao formal registrada com owner/prazo.
- **Dependencias:** nenhuma
- **Estimativa:** XS
- **Risco:** Alto

#### [P0] [TAREFA] T7.2 - Definir politica inicial de upload

- **Descricao:** definir formatos e limite por arquivo para baseline.
- **Valor de negocio:** evita falhas de UX/ingestao e retrabalho.
- **Criterios de aceite:** baseline de upload publicada e aplicada.
- **Dependencias:** nenhuma
- **Estimativa:** XS
- **Risco:** Alto

### [P2] [EPICO] E8 - Advisor (escopo parcial MVP)

- **Descricao:** concluir jornada minima operacional do advisor.
- **Valor de negocio:** cobre necessidade de fluxo hibrido sem inflar escopo.
- **Criterios de aceite:** onboarding em 2 passos e fluxo minimo de atendimento habilitado.
- **Dependencias:** E1
- **Estimativa:** M
- **Risco:** Medio

### [P3] [EPICO] E9 - Pos-MVP planejado

- **Descricao:** organizar evolucoes fora do recorte da release.
- **Valor de negocio:** protege foco do MVP e preserva visao de evolucao.
- **Criterios de aceite:** backlog pos-MVP priorizado e rastreavel.
- **Dependencias:** gate MVP aprovado
- **Estimativa:** XL
- **Risco:** Medio

Itens previstos:

- benchmark setorial ativo no MRS;
- mensageria interna completa;
- automacoes autonomas de IA;
- expansao de pipeline e modulos secundarios.

### [P0] [EPICO] E10 - Context Engineering Excalidraw x Frontend

- **Descricao:** operacionalizar a comparacao entre documentacao Excalidraw e frontend real para guiar refatoracao por prioridade.
- **Valor de negocio:** reduz drift funcional, acelera execucao e melhora previsibilidade de entrega com cliente.
- **Criterios de aceite:** inventario, matriz canonica, sub-agents/skills, piloto e gate formal publicados com rastreabilidade no backlog.
- **Dependencias:** E1, E2, E3 (baseline de navegacao/onboarding/mrs)
- **Estimativa:** M
- **Risco:** Medio
- **Status:** Em andamento (01/04/2026)
- **Evidencias:** `.dev/production/24-AUDIT-EXCALIDRAW-FRONTEND-INVENTARIO.md`, `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md`, `.dev/production/26-PILOTO-CONTEXT-ENGINEERING-ONBOARDING-ATIVO-RADAR-INVESTIDOR.md`, `.dev/production/27-REVIEW-GATE-CONTEXT-ENGINEERING-FRONTEND.md`.

#### [P0] [HISTORIA] H10.1 - Fechar gaps S0/S1 do piloto

- **Descricao:** atacar os gaps criticos identificados em Onboarding Ativo e Radar Investidor.
- **Valor de negocio:** remove bloqueios de aderencia funcional mais graves.
- **Criterios de aceite:** itens `PILOT-A1`, `PILOT-A2`, `PILOT-A4`, `PILOT-B3` resolvidos e validados.
- **Dependencias:** E10
- **Estimativa:** L
- **Risco:** Alto
- **Owner:** frontend-specialist
- **Data-alvo:** sprint atual (a definir data exata apos kickoff)
- **Status:** Aguardando kickoff de execucao

#### [P1] [HISTORIA] H10.2 - Padronizar regras globais de UX/formularios

- **Descricao:** padronizar auto-save, tooltip e consistencia de navegacao conforme regras globais.
- **Valor de negocio:** melhora usabilidade e reduz inconsistencias entre perfis/telas.
- **Criterios de aceite:** checklist de conformidade aplicado em onboarding, radar, projetos e feed.
- **Dependencias:** H10.1
- **Estimativa:** M
- **Risco:** Medio

#### [P1] [TAREFA] T10.3 - Formalizar ownership de gaps e ciclo de evidencias

- **Descricao:** garantir dono/prazo para cada gap critico e consolidar evidencias por sprint.
- **Valor de negocio:** evita backlog sem execucao e melhora governanca.
- **Criterios de aceite:** todos gaps S0/S1 com owner, data-alvo e status no backlog.
- **Dependencias:** E10
- **Estimativa:** S
- **Risco:** Baixo
- **Owner:** documentation-writer
- **Data-alvo:** sprint atual (executar apos H10.1 iniciar)
- **Status:** Aguardando kickoff de execucao

---

## 4) Plano por fases

### Fase 1 (MVP - Sprint +1)

- E1, E2, E4, E5 + T7.1 + T7.2.
- Resultado esperado: remover reprovacoes criticas do gate e estabilizar fluxos de entrada/recorrencia.

### Fase 2 (MVP - Sprint +2)

- E3, E6, E7.
- Resultado esperado: consolidar nucleo MRS, governanca IA e hardening de seguranca.

### Fase 3 (Evolucoes)

- E8 (advisor parcial final) + refinamentos de notificacao/operacao.

### Fase 4 (Escala/otimizacao)

- E9 (pos-MVP).

---

## 5) Ordem sugerida (proximos 14 dias)

1. Fechar `T7.1` (assinatura eletronica) e `T7.2` (politica de upload).
2. Entregar E1 (navegacao aderente ao PRD).
3. Entregar E2 (onboarding investidor 2 etapas) e estabilizar entrada em tese.
4. Entregar E4 (pipeline normativo + gate NDA).
5. Entregar E5 (feed MVP com minimo de 3 eventos).
6. Preparar kickoff tecnico de E3 para Sprint +2 (MRS canonico).

---

## 6) Criterio de gate de implementacao

- Aprova somente com 100% dos itens criticos (`P0`) com evidencia funcional e teste minimo.
- Reprova se houver qualquer gap critico sem mitigacao formal aprovada.

---

## 7) Rastreabilidade

Documentos a atualizar apos cada ciclo:

- `.dev/production/2-REVIEW_GATE_PRD_PIVOT.md`
- `.dev/production/3-DEVELOPMENT_PLAN.md`
- `.dev/production/4-CHANGELOG-PIVOT-07-03.md`
- `.dev/production/5-PRD_IMPLEMENTATION_AUDIT.md` (quando houver nova medicao)
