# .dev/docs/

## Identidade do pacote
- Documentação centralizada do projeto (funcional, técnica, contratual e de planejamento)
- Conteúdo em Markdown e protótipos em `.dev/docs/doc-web`
- Histórico e especificações do MVP, arquitetura e requisitos

## Setup e execução
- Sem build específico; edite arquivos Markdown/HTML/TXT diretamente

## Padrões e convenções
- Escreva em português claro e objetivo
- Prefira links internos relativos entre documentos
- Mantenha a organização de diretórios: `docs_escopo_contrato` para documentos legais/contratuais e `docs_leonardo` para especificações originais
- A documentação de design e protótipos de tela ficam em `.dev/docs/doc-web`

## Arquivos chave
- `.dev/docs/0-PRD.md` (Product Requirements Document)
- `.dev/docs/1-REQUIREMENTS_ANALYSIS.md` (Análise de Requisitos)
- `.dev/docs/2-DEVELOPMENT_PLAN.md` (Plano de Desenvolvimento)
- `.dev/docs/PROJECT_OVERVIEW.md` (Visão Geral do Projeto)
- `.dev/docs/BACKLOG.md` (Backlog do MVP)

## Diretórios
- `.dev/docs/docs_escopo_contrato/`: Escopo contratual e anexos com os marcos de entrega
- `.dev/docs/docs_leonardo/`: Arquitetura mestre, fluxos de onboarding, modelo de validação e taxonomia
- `.dev/docs/doc-web/`: Documentação de UI em HTML/CSS/JS (design tokens, telas, etc)

## JIT Index
- Buscar no Plano de Desenvolvimento: `rg -i "termo" .dev/docs/2-DEVELOPMENT_PLAN.md`
- Buscar em Documentos Originais: `rg -i "termo" .dev/docs/docs_leonardo`
- Buscar no Escopo Contratual: `rg -i "termo" .dev/docs/docs_escopo_contrato`

## Pre-PR
- Verifique links relativos e imagens embutidas
- Garanta que novas decisões arquiteturais sejam refletidas nos arquivos principais
