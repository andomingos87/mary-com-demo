# Registro de Mudancas - Contexto Radar (2026-03-29)

## Objetivo

Consolidar as mudancas de engenharia de contexto para os subdominios `radar-score`, `radar-teaser` e `radar-nda`, com rastreabilidade por arquivo.

## Mudancas aplicadas

| Arquivo | Mudanca aplicada | Motivo | Evidencia de codigo associada |
|--------|-------------------|--------|-------------------------------|
| `.context/modules/radar-score/context.md` | Criado contexto de score do Radar | Separar contrato de score do modulo Radar principal | `src/lib/radar/score.ts`, `src/lib/actions/radar.ts` |
| `.context/modules/radar-score/agents.md` | Criado mapa de agentes para score | Melhorar acionamento de especialistas por capacidade | `src/lib/actions/__tests__/radar.test.ts` |
| `.context/modules/radar-score/skills.md` | Criado mapa de skills para score | Padronizar descoberta e abordagem de mudancas | `src/types/radar.ts` |
| `.context/modules/radar-teaser/context.md` | Criado contexto de teaser pre-NDA | Formalizar regras de preview e CTA | `src/components/radar/OpportunitiesList.tsx` |
| `.context/modules/radar-teaser/agents.md` | Criado mapa de agentes para teaser | Cobrir UX e seguranca de dados exibidos | `src/lib/actions/radar.ts` |
| `.context/modules/radar-teaser/skills.md` | Criado mapa de skills para teaser | Guiar evolucao e testes do fluxo teaser | `src/types/radar.ts` |
| `.context/modules/radar-nda/context.md` | Criado contexto de solicitacao de NDA | Formalizar fluxo de request/status/notificacao | `src/lib/actions/radar.ts`, `supabase/migrations/20260326110000_create_radar_cta_tables.sql` |
| `.context/modules/radar-nda/agents.md` | Criado mapa de agentes para NDA | Cobrir backend, banco e seguranca | `supabase/migrations/20260326110000_create_radar_cta_tables.sql` |
| `.context/modules/radar-nda/skills.md` | Criado mapa de skills para NDA | Guiar mudancas de autorizacao e testes | `src/components/radar/OpportunitiesList.tsx` |
| `.context/modules/radar/context.md` | Atualizado como orquestrador com referencias cruzadas | Eliminar ambiguidade e centralizar governanca do Radar | `src/lib/actions/radar.ts`, `src/lib/radar/score.ts` |
| `.context/modules/radar/agents.md` | Atualizado com foco em CTAs e referencias de submodulo | Melhorar roteamento por capacidade | `src/lib/actions/radar.ts` |
| `.context/modules/radar/skills.md` | Atualizado com `security-audit` e referencias de submodulo | Cobrir seguranca e descoberta consistente | `src/components/radar/OpportunitiesList.tsx` |
| `.context/modules/README.md` | Adicionados 3 novos modulos Radar | Tornar modulo descobrivel no indice principal | N/A (indice de contexto) |
| `.cursor/skills/radar-score/SKILL.md` | Skill criada | Governanca dedicada para score | `.context/modules/radar-score/context.md` |
| `.cursor/skills/radar-teaser/SKILL.md` | Skill criada | Governanca dedicada para teaser | `.context/modules/radar-teaser/context.md` |
| `.cursor/skills/radar-nda/SKILL.md` | Skill criada | Governanca dedicada para NDA | `.context/modules/radar-nda/context.md` |
| `.cursor/skills/radar/SKILL.md` | Atualizada com delegacao para subskills | Definir fronteira entre Radar orquestrador e subcapacidades | `.cursor/skills/radar-score/SKILL.md` |
| `.cursor/specialists/specialist-radar-score.md` | Especialista criado | Especializacao de score/ranking | `.context/modules/radar-score/context.md` |
| `.cursor/specialists/specialist-radar-teaser.md` | Especialista criado | Especializacao de teaser/pre-NDA | `.context/modules/radar-teaser/context.md` |
| `.cursor/specialists/specialist-radar-nda.md` | Especialista criado | Especializacao de NDA/status | `.context/modules/radar-nda/context.md` |
| `.cursor/specialists/specialist-radar.md` | Atualizado com delegacao por capacidade | Evitar analise monolitica no Radar | `.cursor/specialists/specialist-radar-score.md` |
| `.cursor/specialists/index.md` | Novos especialistas + path de governanca corrigido | Descoberta correta e padrao de path unico | `.context/modules/<modulo>/context.md` |
| `.context/AI_GOVERNANCE.md` | Path de modulo corrigido para formato em pasta | Remover divergencia de padrao legado | `.context/modules/<modulo>/context.md` |
| `.context/docs/project-overview.md` | Incluido dominio Radar discovery | Atualizar visao de produto/engenharia | `src/lib/actions/radar.ts` |
| `.context/docs/architecture.md` | Incluido dominio Radar na arquitetura | Atualizar bounded context e camada de servicos | `src/lib/radar/score.ts` |
| `.context/docs/data-flow.md` | Incluida secao de fluxo Thesis -> Score -> Teaser -> NDA | Documentar fluxo ponta a ponta | `src/components/radar/OpportunitiesList.tsx` |
| `.context/docs/glossary.md` | Incluidos termos Radar Score, Teaser, NDA Request | Alinhar vocabulario funcional e tecnico | `src/types/radar.ts` |

## Resultado esperado

- Governanca de contexto consistente e auditavel para Radar.
- Melhor separacao de responsabilidades entre orquestracao (Radar) e capacidades (Score/Teaser/NDA).
- Menor risco de respostas genericas em demandas de Radar.
