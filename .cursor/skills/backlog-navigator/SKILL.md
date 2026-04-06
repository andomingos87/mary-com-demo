---
name: backlog-navigator
description: Consulta o backlog v3 do projeto, valida o estado atual de cada etapa, indica a proxima etapa logica e atualiza status de historias/epicos quando o usuario confirma conclusao. Use sempre que o usuario perguntar "qual a proxima etapa", "o que falta fazer", "onde estamos no backlog", "qual o status de E0/H0.x", "marca H0.x como concluido", "atualiza status", "proxima historia", "o que priorizar agora", "estamos em dia com o backlog", ou qualquer variacao sobre progresso, sequenciamento ou atualizacao de status no backlog do projeto Mary.
---

# Backlog Navigator

## Por que esta skill existe

O projeto Mary tem um backlog extenso e estruturado (epicos E0-E9, historias H0.x-H8.x, tarefas, bugs) com dependencias, prioridades e fases bem definidas. Sem um ponto unico de consulta, eh facil perder de vista onde o projeto esta e qual o proximo passo com maior impacto. Esta skill resolve isso: ela le o backlog, cruza com evidencias reais do codigo e specs, e te diz exatamente onde voce esta e para onde ir.

## Fontes de verdade (em ordem de precedencia)

1. **Backlog oficial:** `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
2. **Specs por historia:** `.dev/specs/H0.x-*.md`
3. **Validacoes de cliente:** `.dev/production/client-validation/Ex-VALIDACAO-*.md`
4. **Artefatos concluidos:** `.dev/production/done/`
5. **PRD v3.0:** `.dev/production/PRD-v3.0-RECONCILIADO.md`

Sempre comece lendo o backlog oficial (fonte 1). As outras fontes sao consultadas sob demanda para validar status.

## Capacidades

Esta skill opera em dois modos:

### Modo 1: Consulta e Recomendacao

Quando o usuario pergunta sobre status ou proxima etapa:

1. **Ler o backlog completo** — carregar `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
2. **Montar mapa de estado** — para cada epico e historia, registrar:
   - Status declarado no backlog (Concluido, Em andamento, Pendente)
   - Prioridade (P0 > P1 > P2 > P3)
   - Dependencias
   - Fase do plano de execucao (Fase 0, 1, 2, 3, 4)
3. **Validar etapa atual** — para historias marcadas "Em andamento":
   - Verificar se a spec existe em `.dev/specs/`
   - Verificar se os arquivos de codigo listados na historia foram modificados recentemente (git log)
   - Verificar se ha validacao de cliente correspondente
4. **Identificar proxima etapa** seguindo esta logica:
   - Completar primeiro o que esta "Em andamento"
   - Depois: proximo item P0 sem dependencia bloqueante
   - Depois: proximo item P1 cuja dependencia ja esta concluida
   - Dentro da mesma prioridade: seguir a ordem do plano de fases
   - Desempate: menor estimativa primeiro (quick wins antes de itens L/XL)
5. **Apresentar resultado** com esta estrutura:
   - **Onde estamos:** resumo do estado atual (o que esta concluido, o que esta em andamento)
   - **Proxima etapa recomendada:** historia/tarefa especifica com justificativa
   - **Depois disso:** as 2-3 etapas seguintes na sequencia
   - **Blockers/riscos:** qualquer dependencia nao resolvida ou decisao pendente

### Modo 2: Atualizacao de Status

Quando o usuario pede para marcar algo como concluido ou atualizar status:

1. **Confirmar o item** — identificar exatamente qual historia/epico/tarefa
2. **Validar evidencia** antes de marcar como concluido:
   - A spec existe e foi atendida?
   - Os arquivos de codigo impactados foram modificados?
   - Ha bugs abertos relacionados?
   - Se o item tem sub-historias, todas estao concluidas?
3. **Atualizar o backlog** — editar `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`:
   - Adicionar `✅` e data de conclusao
   - Formato: `#### ✅ H0.x — Titulo | Concluido DD/MM/AAAA`
   - Se um epico teve todas as historias concluidas, marcar o epico tambem
4. **Verificar impacto em cascata**:
   - Alguma historia pendente tinha dependencia neste item? Se sim, informar que agora esta desbloqueada
   - O epico pai pode ser marcado como concluido?
5. **Recomendar proxima etapa** — apos atualizar, automaticamente executar o Modo 1

## Regras de seguranca

- Nunca marcar como concluido sem que o usuario confirme explicitamente
- Quando a validacao de evidencia falhar (ex: spec nao encontrada, codigo nao modificado), informar o usuario e pedir confirmacao antes de prosseguir
- Preservar todo o conteudo existente do backlog ao editar — so alterar o item especifico
- Manter backup mental: ao editar, mostrar ao usuario o antes/depois da linha alterada

## Formato de resposta

Responder sempre em portugues brasileiro, de forma concisa e direta. Usar esta estrutura:

```
## Status Atual do Backlog

**Fase ativa:** [Fase 0/1/2/3/4]
**Epico em foco:** [Ex — Nome]
**Progresso do epico:** [X de Y historias concluidas]

### Em andamento
- [H0.x] Titulo — [observacao sobre estado]

### Proxima etapa recomendada
**[H0.x] Titulo**
- Por que agora: [justificativa baseada em prioridade + dependencias + impacto]
- Estimativa: [XS/S/M/L/XL]
- Spec: [caminho se existir, ou "spec pendente"]
- Arquivos impactados: [lista dos principais]

### Sequencia apos isso
1. [H0.x] Titulo — [razao]
2. [H0.x] Titulo — [razao]

### Blockers / Decisoes pendentes
- [se houver]
```

## Exemplo de interacao

**Usuario:** "qual a proxima etapa?"

**Skill le o backlog, verifica git log, e responde:**

> ## Status Atual do Backlog
> **Fase ativa:** Fase 0 — Realinhamento Excalidraw
> **Epico em foco:** E0 — Realinhamento Excalidraw
> **Progresso:** 0 de 7 historias concluidas (+ 1 bug)
>
> ### Em andamento
> - Nenhuma historia marcada como em andamento especificamente
>
> ### Proxima etapa recomendada
> **[H0.1] Refatorar Onboarding do Ativo (4 passos Excalidraw)**
> - Por que agora: P0, sem dependencias, maior impacto visual para o cliente, listada como primeira no sprint imediato
> - Estimativa: L
> - Spec: `.dev/specs/H0.1-ONBOARDING-ATIVO.md`
> - Arquivos: OnboardingWizard.tsx, ProfileDetailsForm.tsx, onboarding.ts
>
> ### Sequencia apos isso
> 1. [H0.7] Ajustar menus por perfil — rapido, visivel, mesmo sprint
> 2. [H0.4] Breadcrumbs globais — rapido, visivel, mesmo sprint
>
> ### Blockers
> - T7.1 (assinatura eletronica) e T7.2 (politica upload) continuam pendentes de decisao

## Notas sobre integracao

- Esta skill complementa `backlog-creator` (que cria backlogs) e `epic-client-validation` (que gera documentos de validacao para o cliente)
- Quando o usuario completar E0 inteiro, sugerir rodar `epic-client-validation` para gerar o documento de validacao antes de apresentar ao cliente
- Se o usuario pedir para criar novas historias ou repriorizar, encaminhar para `backlog-creator`
