# Product Backlog v3.0 — MVP Reconciliado

Data base: 02/04/2026
Base de referência: `.dev/production/PRD-v3.0-RECONCILIADO.md`, `.dev/excalidraw/` (00_INDEX a 05_SHARED_MODULES)
Status: Documento canônico de backlog (fonte oficial)

> GOVERNANCA: este é o backlog oficial do projeto. O arquivo `BACKLOG-V3.md` na raiz é apenas ponte histórica/de referência.

---

## 1) Resumo do escopo

- **Realinhar implementação ao Excalidraw** (fonte de verdade aprovada pelo cliente) antes de expandir escopo.
- Corrigir divergências críticas identificadas na reconciliação campo a campo (PRD v3.0).
- Preservar e reaproveitar infraestrutura sólida já entregue (auth, multi-tenant, RLS, MRS, Tese CRUD, pipeline base).
- Entregar E0 (realinhamento) como pré-requisito para liberação de parcelas.
- Retomar épicos pendentes (E5-E8) somente após E0 concluído.

### Hierarquia de precedência

1. **Excalidraw** (`.dev/excalidraw/`) — fonte de verdade visual e funcional
2. **PRD v3.0** (`.dev/production/PRD-v3.0-RECONCILIADO.md`) — contrato executável
3. **PRD v2.2** (`.dev/production/1-PRD.md`) — referência histórica, não mais normativo
4. **Código atual** — baseline a ser reconciliada

---

## 2) Premissas e lacunas

### Premissas

- Excalidraw é a especificação aprovada pelo cliente e fonte de verdade do produto.
- PRD v3.0 traduz o Excalidraw em contrato executável campo a campo.
- Infraestrutura existente (auth, multi-tenant, RLS, Supabase) não precisa ser reconstruída.
- Componentes reutilizáveis já existem: GeographySelector, ShareholderEditor, StepIndicator, SectorMultiSelect, UsdCurrencyInput, MultiSelectDropdown.
- Entregas de E0 devem ser cirúrgicas e de alta visibilidade para recuperar confiança do cliente.

### Lacunas críticas abertas

- Assinatura eletrônica no MVP (decisão pendente — T7.1).
- Limite inicial de upload por arquivo (baseline pendente — T7.2).
- Calibragem fina de pesos do MRS após telemetria inicial.
- Definição do provider de Mary AI sidebar (modelo, contexto por tela).

---

## 3) Diagnóstico da reconciliação

| Indicador | Quantidade |
|-----------|-----------|
| ✅ IMPLEMENTADO (aderente ao Excalidraw) | 10 |
| ⚠️ PARCIAL (existe mas diverge) | 19 |
| ❌ AUSENTE (não implementado) | 25 |
| 🔄 REQUER REFATORAÇÃO (fundamentalmente diferente) | 6 |

**Divergências críticas (visíveis ao cliente):**
- Onboarding Ativo: 5 passos genéricos vs 4 passos M&A (17+ campos ausentes)
- Tese Investidor: ROB confundida com Cheque, campos faltantes
- Pipeline: 5 marcos vs 12 fases do Excalidraw
- Mary AI: página separada vs sidebar contextual

**O que está sólido:**
- Auth + multi-tenant + RLS
- MRS (4 passos, score normativo, gates NDA/NBO)
- Tese CRUD com UI guiada
- Pipeline base funcional (precisa expansão)
- Componentes reutilizáveis

---

## 4) Legenda

- Prioridade: `P0` (crítico), `P1` (alto), `P2` (médio), `P3` (pós-MVP).
- Tipo: `ÉPICO`, `HISTÓRIA`, `TAREFA`, `BUG`, `DÉBITO_TÉCNICO`.
- Estimativa: `XS`, `S`, `M`, `L`, `XL`.
- Status de reconciliação: `✅` aderente, `⚠️` parcial, `❌` ausente, `🔄` requer refatoração.

---

## 5) Backlog priorizado

### [P0] [ÉPICO] E0 — Realinhamento Excalidraw (NOVO — PRIORIDADE MÁXIMA)

- **Descrição:** Refatorar implementação para aderir ao Excalidraw como fonte de verdade. Corrige as divergências críticas identificadas na reconciliação campo a campo.
- **Valor de negócio:** Recuperar confiança do cliente. Liberar parcelas (R$5.000/entrega). Garantir que produto entregue = produto esperado.
- **Critérios de aceite:** Cada história tem spec individual em `.dev/specs/`. Validação campo a campo contra Excalidraw.
- **Dependências:** Nenhuma (é o primeiro a ser executado).
- **Estimativa:** XL
- **Risco:** Alto
- **Status:** Em andamento (02/04/2026)

#### [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw) 🔄

- **Descrição:** Substituir os 5 passos genéricos atuais pelos 4 passos M&A definidos no Excalidraw (`02_ATIVO.md`).
- **Passos Excalidraw:**
  - Passo 1: Dados da Empresa (CNPJ, razão social, nome fantasia, descrição, modelo negócio, sede, ano fundação, nº funcionários, setor)
  - Passo 2: Dados de Matching (objetivo do projeto com opções dinâmicas, ROB, EBITDA%, participação ofertada, valor alvo, estágio)
  - Passo 3: Equipe (sócios com %, advisors vinculados, convite de membros)
  - Passo 4: Codinome (nome fictício para o projeto, gerado por Mary AI ou manual)
- **Campos a implementar:** 17+ campos M&A específicos (vs campos genéricos atuais).
- **Componentes reutilizáveis:** GeographySelector, SectorMultiSelect, ShareholderEditor, StepIndicator, UsdCurrencyInput.
- **Impacto no código:**
  - `src/components/onboarding/OnboardingWizard.tsx` — reestruturar steps
  - `src/components/onboarding/ProfileDetailsForm.tsx` — campos M&A
  - `src/types/onboarding.ts` — novo contrato de steps
  - `src/lib/actions/onboarding.ts` — server actions
  - Schema Supabase: `organizations.onboarding_data` JSON
- **Critérios de aceite:** Onboarding em 4 passos conforme Excalidraw, campo a campo, com tooltips e auto-save. Pós-onboarding: Mary AI gera dossiê automaticamente.
- **Spec:** `.dev/specs/H0.1-ONBOARDING-ATIVO/INDEX.md`
- **Estimativa:** L
- **Risco:** Alto (impacto visual máximo para o cliente)
- **Dependências:** Nenhuma
- **Status:** Implementado tecnicamente (04/04/2026) + gaps P4 fechados em D0-B (05/04/2026), aguardando aceite funcional final de produto.
- **Evidências técnicas:** novos steps `asset_company_data`, `asset_matching_data`, `asset_team`, `asset_codename` em tipos/actions/UI, migration Supabase dedicada e testes de ordem/transição atualizados.
- **Evidências P4 (05/04/2026):**
  - Conclusão visual final movida para pós-termos (`terms_acceptance`) com modal/CTA `Ver meu MRS`.
  - Redirect final do ativo para `/${orgSlug}/mrs`.
  - Seed automático de projeto no `completeOnboarding` para refletir codinome no menu lateral quando não houver projeto ativo.
  - Ajuste de label dinâmico da sidebar para priorizar `projects.name || projects.codename` com fallback em `onboarding_data.assetCodenameData.codename`.
  - Testes atualizados: `AssetCodenameStep.test.tsx` + suíte `onboarding.test.ts` aprovadas.

#### [P0] [HISTÓRIA] H0.2 — Complementar Campos da Tese de Investimento ⚠️

- **Descrição:** Adicionar campos faltantes na tese conforme Excalidraw (`03_INVESTIDOR.md`).
- **Campos a adicionar:**
  - ROB min/max (separado de cheque/ticket — hoje confundidos)
  - EBITDA% mínimo
  - Público-alvo da empresa-alvo (B2B, B2C, B2B2C, etc.)
  - Tipo de operação (Compra majoritária, Minoritária, Buyout, etc.)
  - Critérios de exclusão (o que o investidor NÃO quer)
- **Impacto no código:**
  - `src/components/thesis/ThesisManager.tsx` — novos campos no wizard 3-step
  - `src/types/thesis.ts` — expandir ThesisCriteria
  - `src/lib/actions/thesis.ts` — validações
  - `src/lib/actions/radar.ts` + `src/lib/radar/score.ts` — matching com novos critérios
  - Supabase `investment_theses.criteria` JSON — sem migration SQL (schema flexível)
- **Critérios de aceite:** Todos os campos do Excalidraw Passos 1-2 do onboarding investidor presentes e funcionais. ROB separado de ticket/cheque.
- **Spec:** `.dev/specs/H0.2-TESE-INVESTIDOR.md`
- **Estimativa:** M
- **Risco:** Médio
- **Dependências:** Nenhuma
- **Status:** Implementado tecnicamente + gaps G1/G2/G3/G4 e item 3.10 fechados em 05/04/2026, aguardando aceite funcional final de produto.
- **Evidências técnicas (05/04/2026):**
  - `ThesisCriteria` expandido com `targetAudience`, `robMin/robMax`, `ebitdaPercentMin`, `operationType`, `exclusionCriteria`, `additionalInfo`.
  - Wizard da tese reorganizado em 3 etapas com novos campos, labels de cheque e tooltips em todos os campos.
  - `normalizeCriteria()` atualizado para validar novos arrays, números, faixas e campos textuais.
  - Matching do radar atualizado para ROB, EBITDA, público-alvo e tipo de operação com fallback seguro para dados ausentes.
  - Testes unitários de tese/radar atualizados e build de validação executado.
  - G2: mapeamento canônico de `operationType` para objetivo do ativo (`sale/fundraising/other`) aplicado no score.
  - G3: score do radar normalizado com teto de 100 para manter consistência de UX/threshold.
  - G1: auto-save de edição de tese com debounce, retry leve e feedback visual de estado (salvando/salvo/erro).
  - 3.10: tooltip do campo `Regioes prioritarias` validado no passo 2 (create/edit) sem regressão visual.
  - G4: nota de privacidade canônica adicionada no topo do passo 2 em create/edit, alinhada ao Excalidraw.

#### [P0] [HISTÓRIA] H0.3 — Expandir Pipeline de 5 para 12 Fases 🔄

- **Descrição:** Expandir os 5 marcos atuais (`teaser/nda/nbo/spa/closed_lost`) para as 12 fases do Excalidraw (`05_SHARED_MODULES.md`).
- **12 fases Excalidraw:**
  1. Teaser Enviado
  2. NDA
  3. Screening
  4. CIM/DFs Entregues
  5. IoI (Indication of Interest)
  6. Management Meetings
  7. DD (Due Diligence) / SPA
  8. NBO (Non-Binding Offer)
  9. Signing
  10. CPs (Condições Precedentes)
  11. Closing
  12. Disclosure
  - Fases especiais: Fechado, Perdido (saída lateral de qualquer fase)
- **Impacto no código:**
  - `src/types/database.ts` — enum de status expandido
  - `src/types/projects.ts` — constantes de pipeline
  - `src/app/(protected)/[orgSlug]/pipeline/page.tsx` — kanban 12 colunas
  - `src/lib/actions/projects.ts` — matriz de transição expandida
  - Migration Supabase: migrar dados de 5 para 12 fases
- **Critérios de aceite:** Kanban com 12 colunas + Fechado/Perdido. Cards de investidores arrastáveis. Histórico de transição preservado. Gates condicionais por fase.
- **Spec:** `.dev/specs/H0.3-PIPELINE-12-FASES.md`
- **Estimativa:** M
- **Risco:** Médio (migração de dados existentes)
- **Dependências:** Nenhuma
- **Status:** Implementado e revalidado em 05/04/2026 (**APROVADO**, sem ressalvas)
- **Evidências técnicas (05/04/2026):**
  - Runtime/chunks estabilizado (`/login` e `/` sem 500) após ajuste i18n em `src/i18n/request.ts`
  - Contrato central de status em `src/lib/projects/status-flow.ts` consumido por actions e cliente
  - Migration H0.3 criada/aplicada: `supabase/migrations/20260405124000_h03_pipeline_12_fases.sql`
  - Fechamento de auditoria/histórico: `supabase/migrations/20260406113000_h03_finalize_audit_and_history.sql`
  - Checklist final: `.dev/validations/H0.3-CHECKLIST-VALIDACAO.md`
  - Evidências de execução: `.dev/validations/evidence/H0.3/RUN-2026-04-05.md`
  - Screenshots Browser MCP:
    - `.dev/validations/evidence/H0.3/01-pipeline-12-colunas-rerun.png`
    - `.dev/validations/evidence/H0.3/06-dragdrop-screening-teaser-rerun.png`
    - `.dev/validations/evidence/H0.3/09-tooltip-pipeline-h03.png`
    - `.dev/validations/evidence/H0.3/12-72-transicao-invalida-bloqueio.png`
  - Gate NDA (`10.1`) consolidado por evidência visual + SQL (`pos_exists=1`, `neg_exists=0`).
- **Risco residual + mitigação recomendada:**
  - Dependência operacional do `user-Playwright` para regressões E2E futuras.
    **Mitigação:** manter fallback `cursor-ide-browser` + checklist SQL auditável até restabelecer estabilidade do MCP Playwright.

#### [P1] [HISTÓRIA] H0.4 — Implementar Breadcrumbs Globais ❌

- **Descrição:** Componente de breadcrumb em todas as telas conforme regras globais do Excalidraw (`01_GLOBAL_RULES.md`).
- **Regras:**
  - Sempre indicar caminho completo no topo da tela
  - Passos anteriores são clicáveis
  - Página atual visível mas sem link
  - Exemplos: `Início > Onboarding > Passo 1`, `Início > Tiger > Investidores`
- **Impacto no código:**
  - Novo componente: `src/components/shared/Breadcrumb.tsx`
  - Integração no layout: `src/app/(protected)/[orgSlug]/layout.tsx`
- **Critérios de aceite:** Breadcrumb visível em todas as telas protegidas. Navegação funcional. Responsivo.
- **Spec:** `.dev/specs/H0.4-BREADCRUMBS.md`
- **Estimativa:** S
- **Risco:** Baixo
- **Dependências:** Nenhuma

#### [P1] [HISTÓRIA] H0.5 — Transformar Mary AI de Página para Sidebar 🔄

- **Descrição:** Mary AI deve funcionar como sidebar contextual que empurra conteúdo para a esquerda (benchmark: Evernote), conforme Excalidraw (`01_GLOBAL_RULES.md`).
- **Comportamento:**
  - Botão sempre visível no header
  - Ao abrir: sidebar empurra conteúdo (não overlay)
  - Contextual: sabe em qual tela o usuário está
  - Saudação: "Prazer, sou a Mary AI. Estarei sempre aqui!"
  - Prompt contextual com CTAs por perfil
  - Disclaimer no rodapé do chat
  - MVP: assistente apenas (consulta, responde, sugere — não executa)
- **Impacto no código:**
  - `src/components/mary-ai/MaryAiQuickChatSheet.tsx` — refatorar de drawer para sidebar push
  - `src/components/navigation/Sidebar.tsx` — coordenar com sidebar Mary AI
  - Layout global: ajustar grid para acomodar push
- **Critérios de aceite:** Mary AI como sidebar que empurra conteúdo. Contextual por tela. CTAs por perfil.
- **Spec:** `.dev/specs/H0.5-MARY-AI-SIDEBAR.md`
- **Estimativa:** L
- **Risco:** Médio (refatoração de layout)
- **Dependências:** Nenhuma

#### [P1] [HISTÓRIA] H0.6 — Padronizar Auto-save e Tooltips em Todas as Telas ⚠️

- **Descrição:** Hook `useAutoSave` reutilizável com feedback visual + tooltips em todos os campos com texto do Excalidraw.
- **Status:** Implementação técnica executada em 06/04/2026 + rodada de correções de blockers aplicada. Aguardando revalidação funcional E2E final para fechamento.
- **Auto-save:**
  - Hook existente: `src/components/onboarding/hooks/useAutoSave.ts` (debounce 2000ms, localStorage)
  - Ação: extrair para `src/hooks/useAutoSave.ts`, trocar localStorage por Supabase, adicionar feedback visual (check ✓ ou texto verde)
- **Tooltips:**
  - Texto de cada tooltip está nos arquivos Excalidraw (02-05)
  - Ação: implementar tooltip em cada campo, usando texto do Excalidraw
- **Critérios de aceite:** Todos os formulários com auto-save + feedback visual. Todos os campos com tooltip conforme Excalidraw.
- **Spec:** `.dev/specs/H0.6-AUTOSAVE-TOOLTIPS.md`
- **Estimativa:** M
- **Risco:** Baixo
- **Dependências:** Nenhuma

#### [P1] [HISTÓRIA] H0.7 — Ajustar Menus Laterais por Perfil ⚠️

- **Descrição:** Reordenar e ajustar menus conforme Excalidraw (divergência de ordem e nomenclatura).
- **Status:** Implementado e revalidado tecnicamente em 04/04/2026 (N1). Aguardando aceite N2/N3.
- **Menu por perfil (Excalidraw):**
  - Investidor: Radar → Teses → Feed → Projetos
  - Ativo: MRS → Radar → Feed → [Codinome do projeto] (nome dinâmico)
  - Advisor: Radar → Perfil → Feed → Projetos
- **Divergência atual:** Ordem diferente para investidor; menu ativo usa "Projeto" estático ao invés de codinome dinâmico.
- **Impacto no código:**
  - `src/components/navigation/Sidebar.tsx` — reordenar items por perfil
  - Lógica de codinome: buscar `projects.codename` para label do menu ativo
- **Critérios de aceite:** Menus na ordem do Excalidraw. Codinome dinâmico no menu ativo.
- **Spec:** `.dev/specs/H0.7-MENU-LATERAL.md`
- **Estimativa:** S
- **Risco:** Baixo
- **Dependências:** Nenhuma

#### [P1] [BUG] B0.8 — Tornar fluxo multi-organização acessível na navegação

- **Descrição:** Corrigir lacuna de UX no `OrgSwitcher`: com apenas 1 organização, o usuário não vê caminho para criar nova organização nem para entender a troca de organização ativa.
- **Problema observado:** O CTA de "Nova organização" fica dentro do dropdown, mas o dropdown só abre quando `organizations.length > 1`. Na prática, com 1 org não existe caminho visível no sidebar para escalar para multi-org.
- **Valor de negócio:** Habilita self-service de crescimento da conta sem depender de URL manual; viabiliza validação e uso real do cenário multi-organização (org ativa + codinome dinâmico).
- **Impacto no código:**
  - `src/components/navigation/OrgSwitcher.tsx` — exibir CTA "Nova organização" também no estado de 1 organização e manter affordance de troca quando houver múltiplas.
  - `src/components/navigation/Sidebar.tsx` (se necessário) — reforçar navegação para gestão de organizações sem depender de digitação de URL.
  - `src/app/dashboard/organizations/page.tsx` — garantir ponto de entrada consistente para criação/gestão de organizações.
- **Critérios de aceite:**
  - Usuário com 1 organização visualiza CTA navegável para criar nova organização (sem digitar URL).
  - Após criar 2ª organização, `OrgSwitcher` permite alternar organização ativa.
  - Troca de org ativa atualiza o label dinâmico do item final do menu de Ativo (`projects.codename` da org ativa).
  - Quando a org ativa não tiver projeto, o item final do menu de Ativo exibe `Novo Projeto`.
  - Fluxo de Investidor e Advisor não sofre regressão de navegação.
- **Estimativa:** S
- **Risco:** Médio
- **Dependências:** H0.7 (base de ordem/label dinâmico já aplicada)

---

### ✅ [P0] [ÉPICO] E1 — Fundação de Navegação (CONCLUÍDO)

- **Descrição:** Alinhar menus, rotas e nomenclaturas por perfil ao PRD v2.2.
- **Status:** Concluído em 24/03/2026
- **Nota de reconciliação:** ⚠️ Ajustes necessários na ordem do menu investidor e codinome dinâmico no menu ativo. Coberto por H0.7.
- **Evidências:** menus atualizados por perfil; rotas canônicas; checklist em `.dev/production/validate/CHECKLIST_VALIDACAO_MANUAL_E1.md`.

#### ✅ [P0] [BUG] B1.1 — Corrigir divergência de nomenclatura de menu/rotas

- **Status:** Concluído em 24/03/2026
- **Evidências:** labels harmonizadas em `.dev/production/29-PADRAO-E1-NAVEGACAO-EXCALIDRAW.md`.

---

### ✅ [P0] [ÉPICO] E2 — Onboarding Investidor em 2 Etapas (CONCLUÍDO — base)

- **Descrição:** Simplificar fluxo para reduzir tempo até valor.
- **Status:** Concluído em 26/03/2026
- **Nota de reconciliação:** ⚠️ Base funcional OK. Campos ROB, EBITDA%, tipo operação e critérios exclusão faltantes na tese. Coberto por H0.2.
- **Evidências:** jornada de entrada via H2.1 + H2.2; contratos em `.dev/production/done/`.

#### ✅ H2.1 — Tese com CRUD mínimo | Concluído 26/03/2026
#### ✅ B2.1.1 — Remover JSON técnico da tese | Concluído 29/03/2026
#### ✅ B2.1.2 — Corrigir overflow da modal multistep | Concluído 29/03/2026
#### ✅ B2.1.3 — Corrigir drift PGRST205 | Concluído 29/03/2026
#### ✅ H2.2 — Radar por tese com CTAs | Concluído 26/03/2026

---

### ✅ [P0] [ÉPICO] E3 — MRS Canônico (CONCLUÍDO — aderente)

- **Descrição:** Implementar módulo MRS no formato normativo.
- **Status:** Concluído em 26/03/2026
- **Nota de reconciliação:** ✅ Bem alinhado ao Excalidraw. Sem ação imediata.
- **Evidências:** `.dev/production/done/10-SPEC-GAP4-MRS-CANONICO.md`; testes em `src/lib/readiness/__tests__/mrs.test.ts`.

#### ✅ H3.1 — Rota MRS e estrutura por passos | Concluído 26/03/2026
#### ✅ H3.2 — Status, prioridade, score e gates | Concluído 26/03/2026
#### ✅ H3.3 — Upload múltiplo e metadados | Concluído 26/03/2026

---

### ✅ [P0] [ÉPICO] E4 — Projetos com Marcos Jurídicos (CONCLUÍDO — base)

- **Descrição:** Alinhar pipeline aos marcos normativos e condicionar projeto ao NDA.
- **Status:** Concluído em 26/03/2026
- **Nota de reconciliação:** 🔄 Pipeline precisa expandir de 5 para 12 fases. Coberto por H0.3.
- **Evidências:** implementação em `src/lib/actions/projects.ts`; migration E4 aplicada.
- **Staging Gate:** NO-GO temporário (26/03/2026) — pendência de smoke E2E.
- **Produção Gate:** NO-GO temporário (26/03/2026) — pendência de smoke funcional.

#### ✅ B4.1 — Corrigir taxonomia de estágios | Concluído 26/03/2026
#### ✅ H4.2 — Gate de criação de projeto por NDA | Concluído 26/03/2026

---

### [P0] [ÉPICO] E5 — Feed, Alertas e Recorrência

- **Descrição:** Criar feed cronológico com eventos relevantes e lembretes iniciais.
- **Valor de negócio:** Aumenta recorrência e reduz abandono.
- **Critérios de aceite:** Feed ativo para Investidor e Ativo com mínimo de 3 tipos de evento.
- **Dependências:** E0 concluído (para que o feed reflita a estrutura reconciliada)
- **Estimativa:** L
- **Risco:** Médio
- **Status:** Pendente

#### [P1] [HISTÓRIA] H5.1 — Preferências de notificação e digest semanal

- **Estimativa:** M
- **Dependências:** E5

---

### [P1] [ÉPICO] E6 — IA Assistiva com Aprovação Humana

- **Descrição:** Implementar pipeline assistivo para teaser/valuation/deck sem autopublicação.
- **Valor de negócio:** Acelera produção mantendo controle humano.
- **Critérios de aceite:** Fluxo `rascunho → revisão → aprovado → publicado`.
- **Dependências:** E0 (H0.5 impacta a implementação — Mary AI sidebar), E3, E4
- **Estimativa:** XL
- **Risco:** Alto
- **Status:** Pendente

#### [P1] [DÉBITO_TÉCNICO] D6.1 — Trava técnica de autopublicação

- **Estimativa:** S

---

### [P1] [ÉPICO] E7 — Hardening de Segurança e Ingestão Documental

- **Descrição:** Reforçar ownership/membership em actions sensíveis e ampliar mitigação de prompt injection.
- **Valor de negócio:** Protege dados multi-tenant e governança de IA.
- **Dependências:** E3, E6
- **Estimativa:** L
- **Risco:** Alto
- **Status:** Pendente

#### [P0] [TAREFA] T7.1 — Decidir assinatura eletrônica no MVP

- **Estimativa:** XS
- **Risco:** Alto
- **Status:** Pendente (decisão formal necessária)

#### [P0] [TAREFA] T7.2 — Definir política inicial de upload

- **Estimativa:** XS
- **Risco:** Alto
- **Status:** Pendente (baseline necessária)

---

### [P2] [ÉPICO] E8 — Advisor (Escopo Parcial MVP)

- **Descrição:** Concluir jornada mínima operacional do advisor conforme Excalidraw (`04_ADVISOR.md`).
- **Valor de negócio:** Cobre necessidade de fluxo híbrido sem inflar escopo.
- **Critérios de aceite:** Onboarding em 2 passos (Perfil de Atuação + Quem já assessora) e fluxo mínimo habilitado.
- **Dependências:** E0 concluído
- **Estimativa:** M
- **Risco:** Médio
- **Status:** Pendente

---

### [P3] [ÉPICO] E9 — Pós-MVP Planejado

- **Descrição:** Organizar evoluções fora do recorte da release.
- **Dependências:** Gate MVP aprovado
- **Estimativa:** XL
- **Status:** Backlog futuro

Itens previstos:
- Benchmark setorial ativo no MRS
- Mensageria interna completa (Mary Messaging System)
- Automações autônomas de IA (Mary AI v2 — executa ações)
- VDR completo (2 camadas conforme Excalidraw)
- Geração automática de documentos pós-onboarding
- Chat interno completo
- Expansão de módulos secundários

---

~~### [P0] [ÉPICO] E10 — Context Engineering Excalidraw x Frontend~~

**Status:** SUBSUMIDO pelo PRD v3.0 Reconciliado.
O trabalho de E10 (inventário, matriz de conformidade, piloto) foi absorvido pelo processo de reconciliação que gerou o PRD v3.0. Os gaps identificados em E10 agora estão formalizados como histórias de E0.
**Artefatos preservados para referência:** `.dev/production/24-AUDIT-EXCALIDRAW-FRONTEND-INVENTARIO.md`, `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md`.

---

## 6) Plano por fases

### Fase 0 — Realinhamento (Sprint atual)

**Foco:** E0 — Corrigir divergências críticas Excalidraw vs implementação.
**Resultado esperado:** Produto visual alinhado ao que cliente esperava. Parcelas liberadas.

Sprint imediato (libera parcela):
1. **H0.1** — Refatorar Onboarding Ativo (impacto visual máximo)
2. **H0.7** — Ajustar menus por perfil (rápido, visível)
3. **H0.4** — Breadcrumbs globais (rápido, visível)

Sprint seguinte:
4. **H0.2** — Complementar tese investidor
5. **H0.3** — Expandir pipeline 5→12 fases
6. **H0.6** — Auto-save e tooltips

Sprint posterior:
7. **H0.5** — Mary AI sidebar

### Fase 1 — Consolidação MVP (Sprint +2)

- E5 (Feed, alertas e recorrência)
- T7.1 (decisão assinatura eletrônica) + T7.2 (política upload)
- Resultado esperado: recorrência de uso ativa, decisões pendentes fechadas.

### Fase 2 — IA e Segurança (Sprint +3)

- E6 (IA assistiva com aprovação humana)
- E7 (Hardening de segurança)
- Resultado esperado: governança de IA e segurança multi-tenant consolidadas.

### Fase 3 — Advisor + Evolução (Sprint