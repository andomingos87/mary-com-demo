# Guia de Implementação — Fluxo Chat > Plan > Agent

Guia prático para implementar histórias do E0 usando Claude Code e/ou Cursor com máxima eficiência.

## Governança documental (canônica)

- Índice mestre de documentação: `DOCS.md` (raiz)
- Backlog oficial: `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
- Specs oficiais: `.dev/specs/`
- PRD oficial: `.dev/production/PRD-v3.0-RECONCILIADO.md`
- Arquivos da raiz fora de `DOCS.md`/`README.md`/`AGENTS.md` não são fonte de verdade.

---

## 1. Claude Code vs Cursor — Quando usar cada um

### Arquitetura fundamental

As duas ferramentas têm filosofias diferentes:

**Claude Code** é um agente de terminal (CLI-first). Opera com contexto consistente de 200K tokens, executa tarefas multi-step autonomamente, e tem acesso direto ao sistema de arquivos e terminal. Pensa em "execução profunda" — você descreve o que quer, ele planeja e faz.

**Cursor** é um editor inteligente (IDE-first). Interface visual tipo VS Code, modo Agent com capacidade de editar múltiplos arquivos e rodar terminal, mas otimizado para velocidade de edição. Pensa em "velocidade de iteração" — você vê o código enquanto ele muda.

### Dados técnicos comparativos

| Aspecto | Claude Code | Cursor |
|---------|------------|--------|
| Contexto | 200K tokens consistente | 128K normal, 200K max mode (pode truncar para manter velocidade) |
| Eficiência de tokens | ~5.5x menos tokens que Cursor para mesma tarefa (benchmark independente) | Mais tokens por tarefa, compensado por velocidade de UI |
| Retrabalho | ~30% menos code rework (benchmark) | Mais iterações menores |
| Interface | Terminal + VS Code extension | IDE visual (fork VS Code) |
| Plan mode | Nativo (Shift+Tab ou `--permission-mode plan`) | Não tem equivalente formal — usa chat |
| Subagents | Nativos, paralelos, com worktrees isolados | Não tem equivalente |
| Preço | Consumo por tokens (plano Max/Pro) | Sistema de créditos (varia por modelo usado) |

Fonte: [Render blog benchmark](https://render.com/blog/ai-coding-agents-benchmark), [Documentação oficial Claude Code](https://code.claude.com/docs/en/common-workflows)

### Quando usar cada um

**Use Claude Code quando:**
- Tarefa pode ser decomposta e descrita claramente (specs prontas como as nossas)
- Refatoração multi-arquivo (ex: H0.1 — muda types, components, actions, migration)
- Precisa de plan mode formal antes de executar
- Quer rodar tarefas em paralelo (subagents com worktrees)
- Tarefa é "execute isso e me entregue pronto"

**Use Cursor quando:**
- Quer ver o código mudando em tempo real
- Está fazendo ajustes finos visuais/CSS (ex: parte do H0.7 — reordenar menu)
- Precisa navegar pelo código enquanto itera
- Tarefa é "vamos construir isso juntos, eu guiando"

**Para o projeto Mary (recomendação):**
- **Claude Code** para H0.1, H0.2, H0.3 (refatorações estruturais com spec clara)
- **Cursor** para H0.4, H0.7 (ajustes menores e visuais)
- **Qualquer um** para H0.5, H0.6 (médios — depende da sua preferência)

---

## 2. O Fluxo: Chat > Plan > Agent

### Por que esse fluxo?

A regra de ouro: **se você consegue descrever o diff em uma frase, pule o plan. Se não consegue, planeje primeiro.** (Recomendação da própria Anthropic.)

O plan mode previne que o agente gaste 20 minutos resolvendo o problema errado com confiança. O custo do plan é real (tempo), mas economiza retrabalho.

### Fase 1 — Chat (entender)

**Objetivo:** Validar que o agente entendeu o escopo antes de qualquer código.

**O que acontece:** Agente lê arquivos, faz perguntas, reporta riscos. Modo read-only natural (você não pede pra ele fazer nada ainda).

**Duração:** 2-5 minutos.

**Como fazer no Claude Code:**
```bash
# Iniciar sessão nomeada (facilita retomar depois)
claude -n h07-menus
```

**Como fazer no Cursor:**
Abrir o chat (Cmd+L ou Ctrl+L), usar o modo normal.

### Fase 2 — Plan (planejar)

**Objetivo:** Obter um plano de execução revisável antes de qualquer edição.

**O que acontece:** Agente analisa codebase com operações read-only, lista arquivos que vai tocar, descreve mudanças, pede confirmação.

**Duração:** 3-8 minutos.

**Como fazer no Claude Code:**
```
# Shift+Tab duas vezes para entrar em plan mode
# Ou iniciar direto:
claude --permission-mode plan -n h07-menus-plan
```

O plan mode no Claude Code é formal — ele NÃO pode editar arquivos, NÃO pode rodar comandos. Só lê, pesquisa e pergunta. Quando aceita o plano (Enter), a sessão ganha nome automatico baseado no conteúdo.

**Dica avançada:** `Ctrl+G` abre o plano no seu editor de texto, onde você pode editar diretamente antes do Claude prosseguir.

**Como fazer no Cursor:**
Cursor não tem plan mode formal. Alternativa:
```
Antes de fazer qualquer mudança, analise o código e me apresente um plano.
Liste cada arquivo que vai tocar, na ordem, e o que muda em cada um.
NÃO edite nada ainda.
```

**Comando recomendado no fluxo deste repositório:**

- Após fechar checklist/decisão da fase Chat, executar `/convertToPlan` para gerar plano executável padronizado.
- Implementar somente após o plano existir, estar revisado e com todos os `todos` criados.

### Fase 3 — Agent (executar)

**Objetivo:** Executar o plano aprovado com checkpoints.

**O que acontece:** Agente edita arquivos, roda comandos, testa. Você monitora.

**Duração:** Varia (5 min para H0.7, 30+ min para H0.1).

**Como fazer no Claude Code:**
```
# Sair do plan mode (Shift+Tab de volta)
# Ou continuar a sessão:
claude --continue
```

**Como fazer no Cursor:**
Usar modo Agent (Cmd+I ou Ctrl+I), colar o prompt de execução.

---

## 3. Templates de Prompt por Fase

### Template genérico

```
=== FASE 1 (Chat) ===
Leia a spec em .dev/specs/{SPEC_FILE}.
Depois leia os arquivos atuais: {LISTA_ARQUIVOS}.
Me diga:
1. O que precisa mudar
2. O que pode ser reusado
3. Riscos que você vê

=== FASE 2 (Plan) ===
Crie um plano de implementação para {HISTÓRIA} baseado na spec.
Liste cada arquivo que vai tocar, na ordem, e o que muda em cada um.
Inclua checkpoints de build/teste entre etapas.

=== FASE 3 (Agent) ===
Execute o plano que criamos para {HISTÓRIA}.
Siga a ordem definida.
Após cada arquivo modificado, rode {COMANDO_BUILD} para garantir que não quebrou.
Use design tokens do projeto (bg-primary, text-foreground). Nunca hardcode cores.
Use alias @/ para imports.
```

---

## 4. Prompts Específicos para Cada História do E0

### H0.7 — Ajustar Menus por Perfil (S — comece por aqui)

**Chat:**
```
Leia a spec em .dev/specs/H0.7-MENU-LATERAL.md.
Depois leia o código atual em src/components/navigation/Sidebar.tsx.
Me diga:
1. Como os menu items estão organizados hoje por perfil
2. Qual a divergência exata vs o que a spec pede
3. Se há algum risco de regressão
```

**Plan:**
```
Crie um plano de implementação para H0.7.
O objetivo é reordenar os menus conforme Excalidraw:
- Investidor: Radar → Teses → Feed → Projetos
- Ativo: MRS → Radar → Feed → [Codinome dinâmico]
- Advisor: Radar → Perfil → Feed → Projetos
Liste cada mudança em ordem, com checkpoint de build entre elas.
```

**Agent:**
```
Execute o plano para H0.7.
Modifique src/components/navigation/Sidebar.tsx conforme planejado.
Para o codinome dinâmico do Ativo, busque projects.codename da org ativa.
Após a mudança, rode npm run build para validar.
Use @/ para imports. Siga design tokens do globals.css.
```

---

### H0.4 — Breadcrumbs Globais (S)

**Chat:**
```
Leia a spec em .dev/specs/H0.4-BREADCRUMBS.md.
Depois leia o layout protegido em src/app/(protected)/[orgSlug]/layout.tsx.
Me diga como você implementaria o breadcrumb: componente novo, integração no layout, e como cada page informaria seus items.
```

**Plan:**
```
Crie um plano para implementar H0.4 (Breadcrumbs globais).
O componente deve:
- Mostrar caminho completo no topo (ex: Início > Onboarding > Passo 1)
- Links clicáveis exceto página atual
- Integrar no layout protegido
Liste arquivos a criar e modificar, na ordem.
```

**Agent:**
```
Execute o plano para H0.4.
Crie src/components/shared/Breadcrumb.tsx e integre no layout.
Use design tokens (text-foreground, bg-background). Font DM Sans (não sobrescreva).
Rode npm run build após cada arquivo.
```

---

### H0.1 — Onboarding Ativo (L — quebrar em sub-sessões)

**Sub-sessão 1: Types e roteamento**

Chat:
```
Leia a spec completa em .dev/specs/H0.1-ONBOARDING-ATIVO/INDEX.md, seções 3.1 a 3.3.
Depois leia src/types/onboarding.ts e src/types/database.ts.
Me diga como você adicionaria os novos step types (asset_company_data, asset_matching_data, asset_team, asset_codename) sem quebrar o fluxo de investidor e advisor.
```

Plan:
```
Plano para H0.1 sub-sessão 1 (types e roteamento):
1. Adicionar novos step types em database.ts
2. Criar ASSET_STEP_ORDER e ASSET_WIZARD_STEPS em onboarding.ts
3. Atualizar getNextStep/getPreviousStep para asset flow condicional
4. Atualizar calculateProgress para 4 passos visíveis do asset
NÃO toque nos componentes. Apenas types e lógica.
```

Agent:
```
Execute o plano para H0.1 sub-sessão 1.
Modifique apenas src/types/database.ts e src/types/onboarding.ts.
Garanta que STEP_ORDER do investidor e advisor NÃO muda.
Rode npm run build e npm run test após as mudanças.
```

**Sub-sessão 2: Passo 1 componente**

Chat:
```
Leia .dev/specs/H0.1-ONBOARDING-ATIVO/INDEX.md seção 3.3 (schema) e P1-DADOS.md (sub-opções do objetivo).
Depois leia .dev/excalidraw/02_ATIVO.md, seção "Passo 1 — Dados da Empresa".
Leia src/components/onboarding/OnboardingWizard.tsx para entender o orquestrador.
Me diga como estruturar o AssetCompanyDataStep.tsx reusando GeographySelector e SectorMultiSelect.
```

Plan:
```
Plano para H0.1 sub-sessão 2 (Passo 1):
Criar AssetCompanyDataStep.tsx com os 7 campos do Excalidraw.
Incluir ProjectObjectiveSelector com sub-opções dinâmicas.
Incluir BusinessModelSelector (B2B/B2C/B2B2C/B2G).
Reusar GeographySelector e SectorMultiSelect.
Auto-save e tooltips em cada campo.
Integrar no OnboardingWizard.
```

Agent:
```
Execute o plano para H0.1 Passo 1.
Crie src/components/onboarding/steps/asset/AssetCompanyDataStep.tsx.
Crie sub-componentes em src/components/onboarding/components/ conforme spec.
Tooltips com textos exatos do Excalidraw (02_ATIVO.md Passo 1).
Integre no OnboardingWizard.tsx para o step 'asset_company_data'.
Rode npm run build após cada componente.
```

**Sub-sessão 3: Passo 2 componente** (mesmo padrão — dados de matching)

**Sub-sessão 4: Passos 3-4 componentes** (equipe + codinome)

**Sub-sessão 5: Migration e testes**

---

### H0.2 — Tese Investidor (M)

**Chat:**
```
Leia a spec em .dev/specs/H0.2-TESE-INVESTIDOR.md.
Depois leia src/types/thesis.ts e src/components/thesis/ThesisManager.tsx.
Me diga:
1. Como ThesisCriteria está hoje
2. O que precisa expandir
3. Se a reorganização dos 3 steps do wizard faz sentido
```

**Plan:**
```
Plano para H0.2:
1. Expandir ThesisCriteria em thesis.ts (robMin, robMax, ebitdaPercentMin, targetAudience, operationType, exclusionCriteria, additionalInfo)
2. Reorganizar steps do ThesisManager wizard conforme spec seção 5.3
3. Corrigir labels: "Ticket" → "Cheque"
4. Adicionar tooltips do Excalidraw
5. Atualizar matching em radar.ts
6. Testes
```

**Agent:**
```
Execute o plano para H0.2.
Expanda ThesisCriteria, reorganize o wizard, corrija labels.
ROB e Cheque são conceitos DIFERENTES (ver spec seção 3 "Diferenciação ROB vs Cheque").
Rode npm run build entre etapas.
```

---

### H0.3 — Pipeline 12 fases (M)

**Chat:**
```
Leia a spec em .dev/specs/H0.3-PIPELINE-12-FASES.md.
Depois leia src/types/database.ts (enum project_status), src/app/(protected)/[orgSlug]/pipeline/page.tsx e src/lib/actions/projects.ts.
Me diga:
1. Estado atual do enum e kanban
2. Riscos da migration spa → dd_spa
3. Como implementar scroll horizontal para 12 colunas
```

**Plan e Agent:** (seguir mesmo padrão)

---

### H0.6 — Auto-save e Tooltips (M)

**Chat:**
```
Leia a spec em .dev/specs/H0.6-AUTOSAVE-TOOLTIPS.md.
Depois leia src/components/onboarding/hooks/useAutoSave.ts (hook atual).
Me diga:
1. O que o hook faz hoje (localStorage, debounce)
2. O que precisa mudar (Supabase, feedback visual)
3. Quantas telas precisam ser atualizadas
```

---

### H0.5 — Mary AI Sidebar (L — quebrar como H0.1)

**Sub-sessão 1:** Context provider + layout grid
**Sub-sessão 2:** Refatorar MaryAiQuickChatSheet → MaryAiSidebar
**Sub-sessão 3:** CTAs contextuais por perfil/tela
**Sub-sessão 4:** Testes e polish

---

## 5. Dicas Avançadas

### Para Claude Code

- **Nomear sessões:** `claude -n h01-passo1` — facilita retomar com `claude --resume h01-passo1`
- **Referência com @:** `Analise @src/types/onboarding.ts` — injeta o arquivo direto no contexto
- **Subagents paralelos:** Para H0.1, pode rodar Passo 1 e Passo 2 em worktrees separados simultaneamente
- **Esforço:** Use `/effort high` para tarefas complexas como H0.1, `/effort low` para H0.7

### Para Cursor

- **Rules file:** Adicionar ao `.cursorrules`:
```
Ao implementar qualquer história do E0:
1. Leia primeiro a spec em .dev/specs/
2. Leia o Excalidraw correspondente em .dev/excalidraw/
3. Hierarquia: Excalidraw > Spec > PRD > Código
4. Use @/ para imports
5. Design tokens do globals.css (nunca hardcode cores)
6. Font DM Sans (nunca sobrescreva)
7. Sombras: shadow-card, shadow-elegant, shadow-glow
8. Border radius: rounded-lg (8px)
```

- **Contexto no chat:** Antes de pedir algo, abra os arquivos relevantes em tabs. O Cursor usa tabs abertas como contexto adicional.
- **@ references:** Use `@file` para incluir arquivos específicos na mensagem.

### Para ambos

- **Build após cada mudança:** Sempre inclua "rode npm run build" no prompt de execução.
- **Uma coisa por vez:** Não peça H0.1 inteiro de uma vez. Quebre.