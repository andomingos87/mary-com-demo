# AI Governance - Mary

## Objetivo
- Definir ordem obrigatoria de consulta para reduzir ambiguidade entre contexto de modulo, skills, specialists e agents transversais.
- Garantir respostas auditaveis, baseadas em evidencias de codigo e documentacao.

## Regra de precedencia (obrigatoria)

### Cenario A - Demanda funcional de modulo
Use esta ordem sem excecao:
1. `.context/modules/<modulo>/context.md`
2. `.cursor/skills/<modulo>/SKILL.md`
3. `.cursor/specialists/specialist-<modulo>.md`
4. Evidenciar com arquivos reais do projeto

### Cenario B - Demanda transversal (arquitetura, performance, seguranca, refactor, revisao)
1. Identificar playbook em `.context/agents/*.md`
2. Aplicar o agent transversal apropriado
3. Se houver impacto em modulo funcional, voltar ao Cenario A para validacao final

## Regra em caso de conflito
- Se houver conflito entre orientacao transversal e contrato de modulo, prevalece o contrato funcional documentado do modulo.
- Se o contrato do modulo estiver incompleto, registrar lacuna e escalar para spec em `.dev/production`.

## Excecoes permitidas
- Excecao so e valida quando:
  - o modulo ainda nao existe em `.context/modules`, ou
  - a demanda e puramente transversal sem impacto funcional direto.
- Mesmo em excecao, deve haver evidencia concreta de arquivos analisados.

## Padrao minimo de resposta
- Informar quais fontes foram usadas.
- Citar caminhos de arquivo relevantes.
- Declarar riscos e mitigacao quando houver bloqueios.
- Evitar suposicao quando houver evidencia disponivel.

## Mapeamento de skills por ferramenta

Cada ferramenta consome uma camada especifica de skills. Nao misture as camadas.

| Camada | Ferramenta | Quando usar |
|--------|------------|-------------|
| `.context/skills/<skill>/SKILL.md` | Claude Code (claude.ai/code) | Tarefas transversais: code-review, test-generation, refactoring, bug-investigation, security-audit, commit-message, pr-review, api-design, documentation, feature-breakdown |
| `.cursor/skills/<modulo>/SKILL.md` | Cursor IDE | Demandas funcionais por modulo do produto: onboarding, radar, mrs, thesis, projects, etc. Sempre carregar apos `.context/modules/<modulo>/context.md` |
| `.agents/skills/<skill>/SKILL.md` | Qualquer ferramenta (sob demanda) | Referencia tecnica de plataforma: Supabase/Postgres best practices, Vercel/React best practices. Carregar explicitamente quando a demanda envolver otimizacao de banco ou deploy |

### Regra de ativacao de skills

1. **Demanda de modulo** (Cenario A): carregar `.cursor/skills/<modulo>/SKILL.md`
2. **Demanda transversal** (Cenario B): carregar `.context/skills/<skill>/SKILL.md`
3. **Demanda de infraestrutura** (banco, deploy): carregar `.agents/skills/<skill>/SKILL.md`
4. Em caso de duvida: prefira `.context/skills/` — e a camada mais generica e sempre valida.

## Governanca operacional
- Dono recomendado: arquitetura/plataforma.
- Revisao periodica: a cada ciclo de backlog ou quando novo modulo for criado.
- Toda criacao de modulo novo deve atualizar:
  - `.context/modules/<modulo>/context.md`
  - `.cursor/skills/<modulo>/SKILL.md`
  - `.cursor/specialists/specialist-<modulo>.md`
