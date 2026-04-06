# O que está bloqueando o progresso do projeto Mary AI Platform?

**Data da análise:** 03/04/2026
**Fonte:** Backlog v3.0 Reconciliado + validações de cliente + referências técnicas
**Método:** Skill backlog-navigator — Modo 1 (Consulta e Recomendação)

---

## Sumário Executivo

O projeto Mary tem **6 blockers críticos e 2 decisões pendentes** que impedem ou reduzem a velocidade de entrega:

1. **Divergência Excalidraw vs implementação** — cliente reportou desalinhamento severo (Gap crítico)
2. **H0.1 não iniciada** — onboarding do Ativo (4 passos M&A) — P0 de maior impacto visual
3. **Decisão T7.1 pendente** — assinatura eletrônica no MVP (bloqueia E7)
4. **Decisão T7.2 pendente** — política de upload (bloqueia MRS e E6)
5. **Parcelas de receita travadas** — R$5.000 por entrega dependem de E0 alinhado
6. **E5-E8 congelados** — dependem de E0 concluído para iniciar
7. **Histórico de validação E4 com smoke descoberto** — fluxo E2E não estava em produção gate até 31/03
8. **Mary AI sidebar ainda não construída** — H0.5 estimada em L, impacto no design global

---

## 1. Blockers por severidade

### BLOCKER A: Divergência Excalidraw vs Implementação (CRÍTICO — CLIENTE REPORTADO)

**Status:** Identificado em 01/04/2026 pelo cliente Leonardo Grisotto
**Impacto:** 2-3 parcelas de R$5.000 travadas, cliente insatisfeito, perda de confiança
**Causa raiz:** Cadeia de produção (call → transcrição → PRD v2.2 → código) perdeu fidelidade ao Excalidraw (fonte de verdade visual)

#### Diagnóstico (reconciliação campo a campo)

| Dimensão | Status | Impacto |
|----------|--------|--------|
| Onboarding Ativo | 🔄 Requer refatoração | MÁXIMO — cliente vê 5 passos genéricos vs 4 passos M&A esperados |
| Tese Investidor | ⚠️ Parcial | ALTO — ROB confundido com cheque, campos EBITDA/exclusão/operação ausentes |
| Pipeline | 🔄 Requer refatoração | ALTO — 5 marcos vs 12 fases esperadas |
| Mary AI | 🔄 Requer refatoração | MÉDIO-ALTO — página separada vs sidebar contextual |
| Regras globais (breadcrumb/tooltip/auto-save) | ⚠️ Parcial | MÉDIO — falta padronização |
| Menus por perfil | ⚠️ Parcial | MÉDIO — ordem diverge, codinome não dinâmico |

**Reconciliação oficial:** Tabela em `.dev/production/PRD-v3.0-RECONCILIADO.md` com status ✅/⚠️/❌/🔄 para cada componente.

**Documento de referência:** `MAPEAMENTO_EXCALIDRAW_VS_IMPLEMENTACAO.docx` (gerado em `.dev/`)

---

### BLOCKER B: H0.1 (Refatorar Onboarding do Ativo) — NÃO INICIADA

**Status:** Pendente (não começou)
**Estimativa:** L (8-13 dias)
**Prioridade:** P0 (primeira no sprint de realinhamento)
**Impacto:** Visibilidade máxima para o cliente — deve ser primeira entrega de E0

#### O que falta

Transformar fluxo atual de **5 passos genéricos**:
```
CNPJ → Enriquecimento → Confirmação → Detalhes → Termos → MFA
```

Para **4 passos M&A conforme Excalidraw** (`02_ATIVO.md`):
```
Passo 1: Dados da Empresa (CNPJ, razão social, modelo negócio, setor, regiões, nº funcionários, ano fundação)
Passo 2: Dados de Matching (objetivo do projeto, ROB, EBITDA%, participação ofertada, valor alvo, estágio)
Passo 3: Equipe (sócios com %, advisors, convites)
Passo 4: Codinome (gerado por Mary AI ou manual)
```

#### Campos a implementar

**17+ campos M&A novos ou refatorados:**
- NOVO: modelo de negócio (multi-select B2B/B2C/B2B2C/B2G)
- NOVO: regiões de atuação (usar GeographySelector)
- NOVO: nº funcionários
- NOVO: ano de fundação (do CNPJ)
- REFATORAR: setor (single → multi-select)
- REFATORAR: EBITDA (valor absoluto → %)
- NOVO: participação ofertada (%)
- NOVO: valor alvo (usar UsdCurrencyInput)
- NOVO: advisors do projeto (lista + convite)
- NOVO: codinome do projeto (geração/manual)
- AJUSTAR: Sócios (tornar editável com ShareholderEditor)

#### Arquivos impactados

- `src/components/onboarding/OnboardingWizard.tsx` — reestruturar steps
- `src/components/onboarding/ProfileDetailsForm.tsx` — campos M&A
- `src/types/onboarding.ts` — novo contrato
- `src/lib/actions/onboarding.ts` — server actions
- Schema Supabase: `organizations.onboarding_data` JSON
- Spec: `.dev/specs/H0.1-ONBOARDING-ATIVO.md` (81 linhas, completa)

#### Razão do bloqueio

Cliente vê na UI o produto não corresponder ao Excalidraw na primeira jornada (onboarding). Sem H0.1 concluída, qualquer validação posterior fica comprometida.

---

### BLOCKER C: T7.1 — Decidir Assinatura Eletrônica no MVP (PENDÊNCIA FORMAL)

**Status:** Pendente (sem decisão oficial)
**Prioridade:** P0
**Estimativa:** XS (1-2 horas para decisão + implementação se SIM)
**Risco:** Alto (impacta segurança jurídica de NDAs e contratos)

#### O que é

Definir se a plataforma MVP terá suporte a **assinatura eletrônica** (ex.: Clicksign, DocuSign) ou se apenas rastreará "aprovação" no NDA sem assinatura jurídica.

#### Cenários

| Cenário | Decisão | Impacto |
|---------|---------|--------|
| SIM — integrar Clicksign/DocuSign no MVP | Implementar antes de E7 | Reforça confiança jurídica, adiciona ~5-10 dias de dev, exige integração + webhook |
| NÃO — apenas "aprovação" sem assinatura física | Usar flag `approved` em `nda_requests` | Mais rápido, mas risco jurídico: cliente pode questionar se "aprovado" = assinado |

#### Por que bloqueia

E7 (Hardening de Segurança) não pode ser concluída sem decidir se há responsabilidade de assinatura eletrônica. RLS policies e governança de dados dependem disso.

#### Referências

- PRD v2.2 menciona "opção em avaliação: integrar assinatura eletrônica"
- Backlog marca como "decisão pendente"
- Sem decisão, H7.1 (implementação) não pode começar

---

### BLOCKER D: T7.2 — Definir Política Inicial de Upload (PENDÊNCIA FORMAL)

**Status:** Pendente (sem baseline)
**Prioridade:** P0
**Estimativa:** XS (1-2 horas para decisão)
**Risco:** Alto (impacta UX de MRS e segurança de dados)

#### O que é

Definir **limite máximo de upload por arquivo** no MRS (Módulo de Readiness). Hoje não há baseline.

#### Variáveis para decidir

| Variável | Opções | Impacto |
|----------|--------|--------|
| Tamanho máximo por arquivo | 5 MB / 10 MB / 25 MB / 50 MB | Determina UX (popup de erro vs fluxo tranquilo) |
| Formatos permitidos | PDF, XLSX, DOCX, PPT (padrão) | Segurança (bloquear executáveis) |
| Limite de arquivos por item MRS | 1 / 5 / 10 / ilimitado | UX de organização |
| Armazenamento total por organização | 1 GB / 5 GB / 10 GB | Custo Supabase, escalabilidade |

#### Por que bloqueia

- MRS está concluído funcionalmente (E3), mas sem política de upload, a experiência é incompleta
- E6 (IA assistiva) precisa saber o que pode ou não ingestar (tamanho/formato)
- Sem baseline, usuários em produção não sabem o que podem fazer

#### Referências

- PRD v2.2: "política inicial de upload: [em definição]"
- Backlog: "baseline necessária"
- Nenhum documento define limites oficialmente

---

### BLOCKER E: E5-E8 Congelados (Dependência em Cascata)

**Status:** Aguardando E0 concluído
**Estimativa de E0:** 4-5 sprints até concluir (H0.1-H0.7 + B0.8)
**Impacto:** Roadmap posterior inteiro travado

#### Dependências bloqueantes

| Épico | Status | Bloqueador |
|-------|--------|-----------|
| E5 (Feed, Alertas) | Pendente | E0 (para refletir estrutura reconciliada) |
| E6 (IA Assistiva) | Pendente | E0 (H0.5 — Mary AI sidebar deve estar pronta); E3, E4 |
| E7 (Hardening) | Pendente | E3, E6, **T7.1**, **T7.2** |
| E8 (Advisor) | Pendente | E0 (para padronizar UX de onboarding) |

**Resultado:** Nenhuma story de E5-E8 pode ser iniciada até E0 ter ~70% concluído.

#### Cronograma impacto

- Fase 0 (E0): Sprints 1-2 (realinhamento)
- Fase 1 (E5 + decisões): Sprint 3
- Fase 2 (E6 + E7): Sprint 4-5
- Fase 3 (E8): Sprint 6+

Sem E0, tudo atrasa 4-5 sprints.

---

### BLOCKER F: Parcelas de Cliente Travadas

**Status:** Ativo
**Valor bloqueado:** R$5.000 × 2-3 = R$10.000-R$15.000
**Condição de liberação:** Cada épico de E0 (realinhamento) validado com cliente

#### Estrutura de pagamento

Segundo backlog:
- H0.1 concluída + cliente valida = R$5.000
- H0.2-H0.3 concluídas + cliente valida = R$5.000
- H0.5-H0.6-H0.7 concluídas + cliente valida = R$5.000

**Entrega oficial:** Via skill `epic-client-validation` que gera documento de validação pré-cliente.

#### Por que bloqueia

Cliente não libera parcelas sem evidência de que o código entregue corresponde ao Excalidraw. Sem essa validação, fluxo de caixa fica comprometido.

---

### BLOCKER G: H0.5 (Mary AI Sidebar) — REFATORAÇÃO GLOBAL

**Status:** Pendente (não iniciada)
**Estimativa:** L (8-13 dias)
**Prioridade:** P1 (mas deve estar pronta antes de E6)
**Impacto:** Design global — afeta layout de todas as telas

#### O que falta

Transformar Mary AI de **página separada** para **sidebar contextual que empurra conteúdo** (benchmark: Evernote).

#### Comportamento esperado

```
[Header com botão Mary AI] → Click → Sidebar abre (empurra conteúdo à esquerda)
- Saudação: "Prazer, sou a Mary AI. Estarei sempre aqui!"
- Prompts contextuais por tela (diferentes para Ativo/Investidor)
- CTAs por perfil (sugerir ações relevantes)
- Chat apenas (não executa ações no MVP v3.0)
- Disclaimer no rodapé
```

#### Arquivos impactados

- `src/components/mary-ai/MaryAiQuickChatSheet.tsx` — refatorar drawer para sidebar
- `src/components/navigation/Sidebar.tsx` — coordenar espaço
- Layout global: ajustar grid (adicionar `transition-smooth` 300ms)

#### Por que bloqueia

Layout de todas as telas atual foi pensado para Mary AI em página. Sem H0.5, H0.6 e posterior ficam visualmente incompletas. E6 (IA assistiva) depende de Mary AI sidebar estar estável.

---

### BLOCKER H: Smoke E2E de E4 Descoberto em Produção (Histórico)

**Status:** Tratado, mas deixa risco de regressão
**Data:** 31/03/2026
**Impacto:** Fluxo de pipeline não estava sendo testado em produção gate até então

#### O que aconteceu

Validação E4 (Projetos com Marcos Jurídicos) revelou que:
- Fluxo de criação de projeto bloqueado por NDA não estava em homologação/produção gate até 31/03
- Smoke E2E de MFA + pipeline não cobria cenários de gate de NDA
- Erro de provider (Z-API WhatsApp token) só foi descoberto em validação manual

#### Ações corretivas aplicadas

- ✅ Gate NDA refinado para usar NDA aprovado mais recente
- ✅ Controle de transição de estágio incluído no detalhe do projeto
- ✅ Provider Z-API ajustado com fallback seguro

#### Risco remanescente

Sem automação de teste E2E para o fluxo E4 (NDA → criação projeto → transição estágio), regressões em provider MFA ou gates podem passar despercebidas.

---

## 2. Decisões Pendentes (Não são código, mas bloqueiam)

### Decisão 1: Escopo de Assinatura Eletrônica (T7.1)

**Pergunta:** MVP com assinatura eletrônica integrada ou apenas rastreamento de "aprovação"?

**Recomendação:** **SIM — integrar Clicksign no MVP**
- Razão: Cliente em M&A espera rigor jurídico desde o MVP. NDAs "aprovados" sem assinatura eletrônica causam fricção legal.
- Custo: +5-10 dias de dev (integração + webhook + retry logic)
- Retorno: Confiança do cliente, produto mais defensável legalmente
- Alternativa: Usar fallback de assinatura manual (botão PDF + email) se timing apertar

**Dono:** PM (Leonardo Grisotto) + Legal
**Prazo:** Decidir até fim do sprint atual (03/04)

---

### Decisão 2: Política de Upload (T7.2)

**Pergunta:** Qual o limite de upload por arquivo e total por org?

**Recomendação:** **25 MB por arquivo, máx 5 arquivos por item MRS, 10 GB por org**
- Razão: Suporta PDF, XLSX, DOCX de due diligence típicos; bloqueia vídeos/executáveis
- Custo de Supabase: ~R$100/mês por org (estimado)
- UX: Sem popup de erro na maioria dos casos reais; espaço suficiente para ~200 itens de MRS por org

**Alternativa:** 10 MB se quiser ser mais conservador (menos custo, mais fricção para PDFs grandes)

**Dono:** PM + DevOps (custo/escalabilidade)
**Prazo:** Decidir até 05/04 (antes de E6 entrar em dev)

---

## 3. Impacto na Sequência de Execução

### Ordem Recomendada (Seguindo Skill Backlog-Navigator)

#### Sprint Atual (Fase 0.1 — Realinhamento, Parcela 1)

**Objetivo:** Entrega visual para cliente, liberar primeira parcela

1. **H0.1** — Refatorar Onboarding Ativo (4 passos M&A) — **P0, L, COMECE AGORA**
   - Por que agora: Maior impacto visual; cliente vê diferença imediatamente
   - Bloqueador: Nenhum
   - Evidência de conclusão: Onboarding em 4 passos conforme `.dev/specs/H0.1-ONBOARDING-ATIVO.md`
   - Validação cliente: Gerar com `epic-client-validation` skill

2. **H0.7** — Ajustar Menus por Perfil — **P1, S, faça logo após H0.1 inicial**
   - Por que: Rápido, visível, melhora UX de navegação
   - Bloqueador: Nenhum
   - Estimativa: 2-3 dias

3. **H0.4** — Breadcrumbs Globais — **P1, S, faça em paralelo**
   - Por que: Rápido, visível, melhora compreensão de navegação
   - Bloqueador: Nenhum
   - Estimativa: 2-3 dias

**Resultado esperado:** Cliente valida H0.1 + H0.7 + H0.4 = primeira parcela liberada

---

#### Sprint +1 (Fase 0.2 — Realinhamento, Parcela 2)

4. **H0.2** — Complementar Tese Investidor (campos ROB, EBITDA%, operação) — **P0, M, CRITICAL PATH**
   - Dependências: Nenhuma
   - Bloqueador: T7.1 + T7.2 NÃO bloqueiam isso; faça agora
   - Estimativa: 5-8 dias

5. **H0.3** — Expandir Pipeline 5→12 Fases — **P0, M, CRITICAL PATH**
   - Dependências: Nenhuma (migração de dados incluída em spec)
   - Estimativa: 5-8 dias

6. **H0.6** — Auto-save + Tooltips Padronizados — **P1, M, SUPORTE**
   - Dependências: Nenhuma
   - Estimativa: 5-7 dias

**Resultado esperado:** Cliente valida H0.2 + H0.3 + H0.6 = segunda parcela liberada

**BLOQUEADOR AQUI:** Precisam decidir T7.1 e T7.2 antes de H0.2 entrar em QA (decisão pode impactar campos de tese)

---

#### Sprint +2 (Fase 0.3 — Realinhamento, Parcela 3)

7. **H0.5** — Mary AI Sidebar — **P1, L, CRÍTICO PARA E6**
   - Dependências: Nenhuma técnicas, mas H0.6 deve estar pronta antes (tooltips + auto-save globais)
   - Bloqueador: Nenhum
   - Estimativa: 8-13 dias

8. **B0.8** — Multi-organização Acessível (OrgSwitcher) — **P1, S, SUPORTE**
   - Dependências: H0.7 (menu base pronto)
   - Estimativa: 3-5 dias

**Resultado esperado:** Cliente valida H0.5 + B0.8 = terceira parcela liberada, E0 95% concluído

---

#### Sprint +3 (Fase 1 — Consolidação MVP)

E0 está concluído. Pode iniciar:
- **E5** — Feed, Alertas e Recorrência (**P0, L**)
- **T7.1** — Implementar assinatura eletrônica (se SIM na decisão)
- **T7.2** — Implementar política de upload

---

## 4. Riscos Remanescentes e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Cliente rejeita H0.1 (ainda não "perfeito" ao Excalidraw) | Média | Alto | Validar campo a campo ANTES de marcar como pronto. Usar `.dev/specs/H0.1` como checklist. |
| T7.1/T7.2 não são decididas até Sprint +1 | Média | Alto | Agendar decisão formal com PM + Legal + DevOps até 05/04. Ter opções pre-analisadas. |
| Mudança de escopo em H0.1 (cliente pede novo campo mid-sprint) | Média | Alto | Congelar escopo de H0.1 em `.dev/specs/` e respeitar backlog de "mudanças futuras". |
| Regressão em E4 gate (provider MFA falha novamente) | Baixa | Médio | Aumentar cobertura de teste E2E. Monitorar provider em produção. Alertar se falhas. |
| H0.5 (Mary AI sidebar) refatoração é mais complexa que estimado | Média | Alto | Começar H0.5 com spike de 2-3 dias. Se spike mostrar +5 dias, replanejar E6. |

---

## 5. Quadro de Comando — O que Fazer Agora

### HOJE (03/04)

- [ ] Agendar reunião com cliente (Leonardo Grisotto) para validar que H0.1-H0.7-H0.4 cobrem os gaps críticos reportados em 01/04
- [ ] Começar H0.1 (Onboarding Ativo) — time de dev dedicado
- [ ] Revisar `.dev/specs/H0.1-ONBOARDING-ATIVO.md` com time (spec está completa)

### AMANHÃ (04/04)

- [ ] Começar H0.7 (Menus) e H0.4 (Breadcrumbs) em paralelo — quick wins
- [ ] Revisar PRD v3.0 com PM + cliente para alinhamento de expectativas
- [ ] Preparar lista de decisão para T7.1 + T7.2 (3 opções cada, com prós/contras)

### QUINTA (05/04)

- [ ] Decisão oficial de T7.1 (assinatura eletrônica) — registrar em .dev/decisions/
- [ ] Decisão oficial de T7.2 (política upload) — registrar em .dev/decisions/
- [ ] H0.1 deve estar em ~40% de conclusão (Passo 1 + Passo 2 implementados)

### SEMANA PRÓXIMA

- [ ] H0.1 em QA e validação de cliente
- [ ] H0.2 + H0.3 iniciadas em paralelo
- [ ] Documentar lições de reconciliação Excalidraw para próximos épicos

---

## 6. Referências

**Documentos chave bloqueadores:**
- `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md` — backlog oficial (fonte 1 da skill)
- `.dev/production/PRD-v3.0-RECONCILIADO.md` — contrato executável (hierarquia #2)
- `.dev/excalidraw/02_ATIVO.md` — especificação visual do onboarding (fonte #1 primária)
- `.dev/specs/H0.1-ONBOARDING-ATIVO.md` — spec técnica completa de H0.1
- `.dev/production/client-validation/E4-VALIDACAO-ERROS-2026-03-31.md` — histórico de descobertas de bloqueadores

**Documentos de decisão pendente:**
- T7.1 — nenhum documento existe; precisa ser criado em `.dev/decisions/T7.1-ASSINATURA-ELETRONICA.md`
- T7.2 — nenhum documento existe; precisa ser criado em `.dev/decisions/T7.2-POLITICA-UPLOAD.md`

**Skills relacionadas:**
- `epic-client-validation` — para gerar documento de validação com cliente após H0.1 concluída
- `backlog-creator` — para repriorizar se novos bloqueadores surgirem

---

## Conclusão

O projeto está bloqueado por **falta de realinhamento ao Excalidraw** reportado pelo cliente. A solução é clara: executar E0 (7 histórias + 1 bug) em 3 sprints, começando por H0.1 hoje. Duas decisões (T7.1 e T7.2) precisam ser formalizadas até quinta-feira para não bloquear H0.2 em QA.

Sem essas ações, projeto continua com risco de novo rejeição de cliente e atraso de 6-8 semanas no roadmap posterior (E5-E8).
