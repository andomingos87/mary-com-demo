# Análise: Marcar H0.1 como Concluído — Dry Run

## Resumo Executivo

A tarefa solicita marcar a história H0.1 como concluída no backlog do projeto Mary AI Platform. Este documento apresenta a análise completa em modo "dry run" (sem executar mudanças reais), indicando **exatamente o que seria alterado** e em quais arquivos.

---

## 1. Contexto do H0.1

### Definição
- **ID:** H0.1
- **Título:** Refatorar Onboarding do Ativo (4 passos Excalidraw)
- **Épico:** E0 — Realinhamento Excalidraw
- **Prioridade:** P0 (crítico)
- **Status Atual:** 🔄 (Em andamento / Requer refatoração)
- **Estimativa:** L
- **Risco:** Alto

### Localização da Definição
- **Spec formal:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/specs/H0.1-ONBOARDING-ATIVO.md`
- **Backlog oficial:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md` (linhas 92-112)
- **PRD v3.0:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/PRD-v3.0-RECONCILIADO.md`

---

## 2. Descoberta: Onde o Status é Rastreado

Após análise dos arquivos de documentação, identifiquei que **não existe um arquivo centralizado de "status tracking"** no formato tradicional (planilha, JSON, YAML, etc.).

Em vez disso, o status está **embutido no próprio backlog markdown** com dois indicadores:

### 2.1 Indicador de Status Atual (Emoji)
**Localização:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`, linha 92

```markdown
#### [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw) 🔄
```

O emoji `🔄` significa **"Requer refatoração"** (conforme legenda na linha 76).

**Opções de status no projeto:**
- `✅` = IMPLEMENTADO (aderente ao Excalidraw)
- `⚠️` = PARCIAL (existe mas diverge)
- `❌` = AUSENTE (não implementado)
- `🔄` = REQUER REFATORAÇÃO (fundamentalmente diferente)

### 2.2 Campo `Status` (quando presente)
Alguns épicos possuem seção `Status` explícita. Exemplo:

```markdown
#### [P0] [ÉPICO] E0 — Realinhamento Excalidraw (NOVO — PRIORIDADE MÁXIMA)
...
- **Status:** Em andamento (02/04/2026)
```

**Nota:** H0.1 não possui um campo `Status` formal na seção de definição. O status é comunicado apenas pelo emoji.

---

## 3. Análise: Padrão de Marcação de "Concluído"

Consultando exemplos de histórias concluídas no backlog (E1, E2, E3, E4), identifiquei o padrão:

### Padrão para Épicos Concluídos
```markdown
### ✅ [P0] [ÉPICO] E1 — Fundação de Navegação (CONCLUÍDO)

- **Descrição:** Alinhar menus, rotas e nomenclaturas por perfil ao PRD v2.2.
- **Status:** Concluído em 24/03/2026
- **Nota de reconciliação:** ⚠️ Ajustes necessários...
- **Evidências:** menus atualizados...
```

**Padrão observado:**
1. Emoji `✅` no início da linha de título
2. Palavra-chave `(CONCLUÍDO)` no título
3. Campo `Status: Concluído em [data]`
4. Seção `Evidências:` listando artefatos produzidos

### Padrão para Histórias Concluídas
```markdown
#### ✅ H2.1 — Tese com CRUD mínimo | Concluído 26/03/2026
```

**Padrão mais simples:** `✅ [ID] — [Título] | Concluído [data]`

---

## 4. Dry Run: Mudanças Necessárias

### 4.1 Arquivo Principal: `6-PRODUCT_BACKLOG_PRIORIZADO.md`

#### Localização exata da mudança
**Arquivo:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
**Seção:** E0 — Realinhamento Excalidraw
**Linhas:** 92-112

#### Mudança 1: Atualizar título de H0.1
**De:**
```markdown
#### [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw) 🔄
```

**Para:**
```markdown
#### ✅ [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw) (CONCLUÍDO)
```

**Justificativa:** Adicionar emoji `✅` no início e palavra-chave `(CONCLUÍDO)` para deixar clara a conclusão.

#### Mudança 2: Adicionar campo Status
**Inserir após a linha de descrição (logo após o travessão de "Descrição"):**

```markdown
- **Status:** Concluído em 03/04/2026
```

**Localização:** Antes ou após a linha "**Descrição:**" (sugestão: após, para manter estrutura ordenada).

#### Mudança 3: Adicionar seção Evidências
**Inserir ao final do bloco de H0.1 (após a linha "**Dependências:**"):**

```markdown
- **Evidências:**
  - Spec completo em `.dev/specs/H0.1-ONBOARDING-ATIVO.md` — 497 linhas, critérios de aceite detalhados
  - Componentes listados: 7 reusos + 11 novos
  - Schema de dados (AssetOnboardingData) especificado
  - Plano de migração de dados para organizações existentes
  - Testes (unitários, integração, aceite) mapeados
```

---

### 4.2 Arquivo Secundário: `PRD-v3.0-RECONCILIADO.md`

**Análise:** Este arquivo também contém referência a H0.1 (seção "Prioridades do Realinhamento").

#### Busca para confirmar localização
```bash
grep -n "H0.1" /sessions/clever-charming-gates/mnt/project_mary/.dev/production/PRD-v3.0-RECONCILIADO.md
```

**Resultado esperado:** Uma ou mais linhas mencionando H0.1, provavelmente em lista de prioridades ou no roadmap.

#### Mudança sugerida (se aplicável)
Se houver referência como:
```markdown
1. H0.1 — Refatorar Onboarding Ativo (impacto visual máximo para o cliente)
```

Seria mantida como está (não requer mudança, pois este é apenas um roadmap referencial).

**Nota:** Se houver seção de "Status" no PRD v3.0, seria adequado adicionar nota:
```markdown
**Status (03/04/2026):** ✅ Concluído — Spec totalmente detalhada, implementação pronta para execução.
```

---

## 5. Critério de Aceite para Marcar Concluído

Analisando a spec H0.1 (seção 9), o item está **pronto para ser marcado como concluído quando:**

- [x] Spec H0.1 está completa (497 linhas, todas as seções preenchidas)
- [x] Arquitetura da solução está definida (4 steps, tipos, tipos de dados)
- [x] Componentes mapeados (7 reusos + 11 novos)
- [x] Server actions especificadas
- [x] Schema de dados desenhado
- [x] Testes listados (unitários, integração, aceite)
- [x] Riscos e mitigações documentadas
- [x] Estimativa: L (Large)

**Status de H0.1:**
- **Especificação:** ✅ 100% concluída
- **Implementação:** ❓ Não verificada neste escopo
- **Testes:** ❓ Não verificados neste escopo

**Interpretação:** Se a tarefa é marcar a **especificação/planejamento** como concluído (não a implementação), então **SIM, pode ser marcado como concluído**.

---

## 6. Impacto de Marcar H0.1 como Concluído

### 6.1 Impacto Direto
- Sinaliza ao time que a **fase de especificação** de H0.1 está 100% pronta
- Libera bloqueadores de comunicação com cliente (esperado)
- Permite início de desenvolvimento com confiança (todos os requisitos estão claros)

### 6.2 Impacto Indireto
- Incrementa visibilidade de progresso do épico E0 (Realinhamento Excalidraw)
- Pode liberar parcelas de pagamento (segundo o contrato, R$5.000/entrega)
- Sinaliza que H0.2, H0.3 e demais histórias de E0 podem prosseguir

### 6.3 Potencial Confusão
⚠️ **Atenção:** Se "concluído" for interpretado como "implementado em produção", então H0.1 **NÃO deve ser marcado ainda**.

**Recomendação:** Adicionar campo `Status de Implementação` ou `Implementation Status` se necessário clarificar. Exemplo:

```markdown
- **Status da Especificação:** ✅ Concluído em 03/04/2026
- **Status da Implementação:** ⏳ Pendente
```

---

## 7. Checklist de Mudanças a Executar

### Mudanças Obrigatórias

- [ ] **Arquivo 1:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
  - [ ] Linha 92: Adicionar `✅` antes de `[P0]` e `(CONCLUÍDO)` após título
  - [ ] Após linha 94 (após Descrição): Inserir `- **Status:** Concluído em 03/04/2026`
  - [ ] Após linha 112 (após Dependências): Inserir seção `- **Evidências:**` com 4-5 bullet points

### Mudanças Opcionais (Recomendadas)

- [ ] **Arquivo 2:** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/PRD-v3.0-RECONCILIADO.md`
  - [ ] Localize menção a H0.1 e adicione nota de status (se aplicável)

- [ ] **Arquivo 3 (Novo):** `/sessions/clever-charming-gates/mnt/project_mary/.dev/production/done/31-SPEC-H0.1-ONBOARDING-ATIVO.md`
  - [ ] Mover/copiar spec H0.1 para pasta `done` com novo nome seguindo padrão numérico

---

## 8. Estrutura Sugerida para Seção Completa (Pós-Mudança)

```markdown
#### ✅ [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw) (CONCLUÍDO)

- **Descrição:** Substituir os 5 passos genéricos atuais pelos 4 passos M&A definidos no Excalidraw (`02_ATIVO.md`).
- **Status:** Concluído em 03/04/2026
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
- **Spec:** `.dev/specs/H0.1-ONBOARDING-ATIVO.md`
- **Estimativa:** L
- **Risco:** Alto (impacto visual máximo para o cliente)
- **Dependências:** Nenhuma
- **Evidências:**
  - Spec completo: 497 linhas com 12 seções cobrindo objetivo, diagnóstico, arquitetura, componentes, layout, backend, migrações, testes, riscos e estimativas
  - 4 steps Excalidraw mapeados com 17+ campos M&A específicos
  - Componentes reusos: 7 existentes + 11 novos especificados
  - Schema de dados (AssetOnboardingData) desenhado em TypeScript
  - Plano de migração para organizações existentes
  - Testes: 20 casos de aceite mapeados campo a campo contra Excalidraw
  - Riscos documentados com mitigações
```

---

## 9. Recomendações Finais

### 9.1 Antes de Executar
1. **Confirmar com stakeholder** se "concluído" refere-se à especificação ou implementação
2. **Revisar PRD v3.0** para verificar se há outro local onde H0.1 precisa ser atualizado
3. **Consultar AGENTS.md** para verificar se há procedimento padrão de marcação no projeto

### 9.2 Após Marcar Concluído
1. **Atualizar rastreamento visual** em qualquer dashboard/kanban do cliente (se aplicável)
2. **Comunicar ao cliente** que especificação de H0.1 está 100% pronta
3. **Iniciar execução** de H0.1 no sprint seguinte (se ainda não iniciado)
4. **Revisar E0** para verificar status das demais histórias (H0.2, H0.3, H0.4, etc.)

### 9.3 Governança
- Manter histórico de datas de conclusão (como feito em E1-E4)
- Preservar spec original em `.dev/specs/` para referência futura
- Considerar criar índice de "Épicos Concluídos" se não existir

---

## 10. Conclusão

**H0.1 está pronto para ser marcado como concluído em relação à especificação.**

Mudanças necessárias são cirúrgicas e bem-definidas:
1. Adicionar `✅` e `(CONCLUÍDO)` no título
2. Adicionar campo `Status: Concluído em 03/04/2026`
3. Adicionar seção `Evidências` com referência à spec

**Nenhum arquivo de código fonte precisa ser modificado** — apenas documentação de backlog.

