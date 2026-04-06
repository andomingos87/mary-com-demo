---
name: backlog-creator
description: Cria backlog de produto priorizado a partir de PRD, ideia, problema ou contexto técnico. Estrutura em épicos, histórias e tarefas, com critérios de aceite, dependências, risco e plano por fases. Use quando o usuário pedir backlog, priorização, roadmap, quebra de escopo, planejamento de MVP, ou organização de entregas.
---

# Backlog Creator

## Objetivo

Transformar contexto de produto em backlog claro, priorizado e executável.

## Quando usar

Use esta skill quando houver pedidos como:
- "crie um backlog"
- "quebre esse PRD em tarefas"
- "priorize o roadmap"
- "organize MVP e fases"

## Workflow

1. **Coletar contexto**
   - Ler os arquivos citados pelo usuário.
   - Se necessário, usar contexto do repositório para entender domínio e restrições.

2. **Validar lacunas críticas**
   - Se faltar informação que impeça decisão, fazer no máximo 5 perguntas objetivas.
   - Se der para seguir com premissas razoáveis, continuar e explicitar as premissas.

3. **Estruturar backlog**
   - Organizar em `Épicos -> Histórias -> Tarefas técnicas`.
   - Incluir `BUG` e `DÉBITO TÉCNICO` quando aplicável.

4. **Priorizar**
   - Usar `P0, P1, P2, P3` com foco em valor de negócio, risco e dependências.
   - Evitar backlog inflado; manter escopo orientado a resultado.

5. **Planejar execução**
   - Separar em fases: MVP, evoluções e escala/otimização.
   - Propor ordem de execução de curto prazo.

## Formato de saída

Responder em Markdown com as seções:

### 1) Resumo do escopo
- 3 a 6 bullets com objetivo, público e resultado esperado.

### 2) Premissas e lacunas
- Premissas assumidas.
- Dúvidas em aberto com impacto potencial.

### 3) Backlog priorizado
Para cada item, usar:

`[PRIORIDADE] [TIPO] Título curto`
- **Descrição:** ...
- **Valor de negócio:** ...
- **Critérios de aceite:** ...
- **Dependências:** ...
- **Estimativa:** XS / S / M / L / XL
- **Risco:** Baixo / Médio / Alto

Onde:
- **PRIORIDADE:** P0, P1, P2, P3
- **TIPO:** ÉPICO, HISTÓRIA, TAREFA, BUG, DÉBITO TÉCNICO

### 4) Plano de execução por fases
- **Fase 1 (MVP)**
- **Fase 2 (Evoluções)**
- **Fase 3 (Escala/Otimização)**

### 5) Ordem sugerida (próximos 14 dias)
- Lista objetiva do que entra primeiro.

## Regras de qualidade

- Não usar itens vagos como "melhorar sistema".
- Cada história precisa ser verificável por critério de aceite.
- Sinalizar blockers com solução recomendada.
- Explicar prioridade em termos de impacto e risco, de forma curta.
