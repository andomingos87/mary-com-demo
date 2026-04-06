# Relatório de Auditoria — Context Engineering Mary
Data: 2026-04-03

## Resumo
- Total de módulos: 19
- Módulos completos (5 camadas): 18
- Inconsistências encontradas: 35
  - Críticas: 0
  - Médias: 6
  - Baixas: 29

## Inconsistências Críticas (bloqueiam desenvolvimento)

Nenhuma encontrada.

## Inconsistências Médias (podem causar confusão)

- **Módulo "auth" não está na tabela de .context/modules/README.md**
  - Fix: Adicionar linha na tabela com status e descrição
- **"ajustes_cliente\AGENTS.md" existe mas não está no JIT Index do AGENTS.md**
  - Fix: Adicionar ao JIT Index ou remover se desnecessário
- **"scripts\AGENTS.md" existe mas não está no JIT Index do AGENTS.md**
  - Fix: Adicionar ao JIT Index ou remover se desnecessário
- **"src\AGENTS.md" existe mas não está no JIT Index do AGENTS.md**
  - Fix: Adicionar ao JIT Index ou remover se desnecessário
- **"supabase\AGENTS.md" existe mas não está no JIT Index do AGENTS.md**
  - Fix: Adicionar ao JIT Index ou remover se desnecessário
- **Módulo "auth" existe no filesystem mas não está em module-index.json**
  - Fix: Adicionar ao module-index.json

## Inconsistências Baixas (cosmético/melhoria)

- **Agent "documentation-writer.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "feature-developer.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "forms-spec-enforcer.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "frontend-auditor.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "mary-ai-integration-agent.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "mobile-specialist.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "performance-optimizer.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "refactoring-specialist.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "role-journey-agent.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **Agent "ux-consistency-agent.md" em .context/agents/ não referenciado por nenhum módulo**
  - Fix: Verificar se o agent é usado ou pode ser removido
- **".cursor\commands\ai-context-mcp.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\bug-chat.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\bugfixer-abraangente-user.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\chat-response.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\commit-groups.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\commit-n-push.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\context-plan.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\context.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\context7-mcp.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\dont-execute.md" tem apenas 2 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\dont-fix.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\execute.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\explain.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\nothing.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\playwright-mcp.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\preflight.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\recruit.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\short.md" tem apenas 1 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário
- **".cursor\commands\supabase-mcp.md" tem apenas 2 linhas (possível stub vazio)**
  - Fix: Preencher conteúdo ou remover se desnecessário

## Recomendações Priorizadas

1. Adicionar linha na tabela com status e descrição — (auth)
2. Adicionar ao JIT Index ou remover se desnecessário — (ajustes_cliente\AGENTS.md)
3. Adicionar ao JIT Index ou remover se desnecessário — (scripts\AGENTS.md)
