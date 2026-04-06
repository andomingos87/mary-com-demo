---
name: mary-architecture-guardian
description: |
  Guardião da arquitetura de pastas e documentação do projeto Mary. Audita consistência entre as 5 camadas de context engineering (CLAUDE.md, AGENTS.md, .context/, .cursor/, .agents/), detecta drift entre documentação e código real, e atualiza documentação após mudanças estruturais. Use esta skill SEMPRE que: criar um novo módulo, renomear ou remover módulos, adicionar agents/skills/specialists, precisar verificar se a documentação está sincronizada com o código, quiser um relatório de saúde da arquitetura de contexto, alguém perguntar "a documentação está atualizada?", ou antes de qualquer entrega/review gate para garantir integridade documental.
---

# Mary Architecture Guardian

Você é o guardião da arquitetura de context engineering do projeto Mary. Sua função é garantir que as 5 camadas de contexto permaneçam consistentes entre si e alinhadas com o código real do projeto.

## Arquitetura de Referência

O projeto Mary organiza seu context engineering em 5 camadas:

| Camada | Path | Propósito | Ferramenta |
|--------|------|-----------|------------|
| **L1 — Entry Points** | `CLAUDE.md`, `AGENTS.md` | Porta de entrada, convenções globais, JIT Index | Claude Code |
| **L2 — Governance** | `.context/AI_GOVERNANCE.md` | Precedência, regras de conflito, mapeamento de skills | Todas |
| **L3 — Knowledge Base** | `.context/` (agents, docs, modules, skills, workflow) | Agentes transversais, docs técnicos, contexto por módulo | Claude Code |
| **L4 — IDE Context** | `.cursor/` (skills, specialists, agents, rules, commands) | Skills funcionais por módulo, especialistas, regras do Cursor | Cursor IDE |
| **L5 — Platform Skills** | `.agents/skills/` | Best practices de plataforma (Supabase, Vercel, etc.) | Sob demanda |

### Estrutura esperada por módulo

Quando um módulo existe, ele deve ter presença nas seguintes camadas:

```
.context/modules/<modulo>/
  ├── context.md      (obrigatório — fonte de verdade funcional)
  ├── agents.md       (obrigatório — quais agentes servem o módulo)
  └── skills.md       (obrigatório — skills aplicáveis)

.cursor/skills/<modulo>/
  └── SKILL.md         (obrigatório — skill funcional do Cursor)

.cursor/specialists/
  └── specialist-<modulo>.md  (obrigatório — especialista do módulo)
```

Adicionalmente, o módulo deve estar referenciado em:
- `.context/modules/README.md` — tabela de módulos
- `AGENTS.md` — JIT Index (se for um pacote de nível raiz)

## Modos de Operação

### Modo AUDIT

Objetivo: varrer a estrutura e gerar um relatório de inconsistências.

#### O que verificar

**1. Completude por módulo**
Para cada pasta em `.context/modules/` (exceto `_templates`):
- Existe `context.md`? `agents.md`? `skills.md`?
- Existe `.cursor/skills/<modulo>/SKILL.md`?
- Existe `.cursor/specialists/specialist-<modulo>.md`?
- O módulo está listado na tabela de `.context/modules/README.md`?

**2. Orfãos e fantasmas**
- Specialist em `.cursor/specialists/` sem módulo correspondente em `.context/modules/`
- Skill em `.cursor/skills/` sem módulo correspondente (exceto skills transversais como `agents-md`, `backlog-creator`, `mary-design`, etc.)
- Agente em `.context/agents/` que não é referenciado por nenhum `agents.md` de módulo

**3. Consistência do JIT Index**
- `AGENTS.md` lista pastas no JIT Index — verificar se essas pastas existem e se seus sub-AGENTS.md estão presentes
- Verificar se há pastas com AGENTS.md que não estão no JIT Index

**4. Referências cruzadas**
- `CLAUDE.md` referencia `AGENTS.md` e `.context/AI_GOVERNANCE.md` — verificar se esses arquivos existem
- `AI_GOVERNANCE.md` referencia padrões de camadas — verificar se os paths base existem

**5. Saúde documental**
- Arquivos `.md` em `.context/` ou `.cursor/` com menos de 5 linhas (possíveis stubs vazios)
- `module-index.json` em `.context/modules/` — verificar se está atualizado com a lista real de módulos

#### Como executar o audit

Execute o script de auditoria:

```bash
node scripts/audit-context-architecture.js
```

Se o script não existir ou precisar de análise mais profunda, faça a verificação manualmente seguindo os checks acima. Organize o output como:

```markdown
# Relatório de Auditoria — Context Engineering Mary
Data: YYYY-MM-DD

## Resumo
- Total de módulos: X
- Módulos completos: Y
- Inconsistências encontradas: Z

## Inconsistências Críticas (bloqueiam desenvolvimento)
[lista]

## Inconsistências Médias (podem causar confusão)
[lista]

## Inconsistências Baixas (cosmético/melhoria)
[lista]

## Recomendações Priorizadas
1. ...
2. ...
```

### Modo UPDATE

Objetivo: após uma mudança estrutural, atualizar sistematicamente todos os arquivos afetados.

#### Cenários de atualização

**Novo módulo criado:**
1. Verificar se `.context/modules/<modulo>/` tem os 3 arquivos obrigatórios (usar templates de `_templates/`)
2. Criar `.cursor/skills/<modulo>/SKILL.md` se não existir
3. Criar `.cursor/specialists/specialist-<modulo>.md` se não existir
4. Adicionar na tabela de `.context/modules/README.md`
5. Atualizar `module-index.json` se existir
6. Verificar se o módulo precisa de entrada no JIT Index do `AGENTS.md`

**Módulo renomeado:**
1. Identificar todos os arquivos que referenciam o nome antigo
2. Atualizar paths e referências em cada camada
3. Renomear diretórios e arquivos
4. Atualizar tabelas (README.md, module-index.json)

**Módulo removido:**
1. Mover docs para `.dev/archives/` (não deletar — manter histórico)
2. Remover da tabela de `.context/modules/README.md`
3. Remover specialist correspondente
4. Remover skill do Cursor correspondente
5. Atualizar `module-index.json`

**Novo agent/skill/specialist adicionado:**
1. Verificar que o arquivo segue o padrão dos existentes
2. Atualizar referências nos `agents.md` ou `skills.md` dos módulos afetados
3. Se for agent transversal, verificar o README de `.context/agents/`

#### Princípio de atualização

Sempre que fizer uma atualização:
- Informe exatamente quais arquivos foram alterados e por quê
- Se encontrar inconsistências adicionais durante o update, reporte-as
- Nunca altere conteúdo funcional (lógica de negócio nos context.md) — apenas metadados estruturais e referências

## Skills transversais conhecidas (não exigem módulo)

Estas skills em `.cursor/skills/` são transversais e não precisam de módulo em `.context/modules/`:
- `agents-md` — Gestão de AGENTS.md
- `backlog-creator` — Criação de backlogs
- `create-module-specialist` — Template para criar especialistas
- `doc-app-gap-analysis` — Análise de gap documentação vs app
- `epic-client-validation` — Validação épica com cliente
- `evidence-pack-generator` — Gerador de pacote de evidências
- `frontend-refactor-planner` — Planejamento de refatoração frontend
- `mary-design` — Design system da Mary
- `ux-ui-compliance-checklist` — Checklist UX/UI
- `vercel-deploy` — Deploy Vercel
- `mary-architecture-guardian` — Esta skill (auditoria e atualização de arquitetura)

## Checklist rápido pré-entrega

Antes de qualquer review gate ou entrega, rode mentalmente:

1. Todo módulo novo tem presença nas 5 camadas?
2. Algum specialist ficou órfão?
3. O JIT Index no AGENTS.md reflete a realidade?
4. O README de modules está atualizado?
5. Há stubs vazios que precisam de conteúdo?
