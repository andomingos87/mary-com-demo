# Modules Context - Mary

Documentacao estruturada por modulo para acelerar analise, implementacao e handoff entre agentes e pessoas no projeto Mary.

## Modulos

| Modulo | Status | Descricao | Path |
|--------|--------|-----------|------|
| [Foundation Common](./foundation-common/) | em desenvolvimento | Auth, org, permissoes, navegacao, auditoria | `foundation-common/` |
| [Onboarding](./onboarding/) | estavel | Fluxo de onboarding de usuario/org | `onboarding/` |
| [Projects](./projects/) | em desenvolvimento | Gestao de deals/projetos | `projects/` |
| [Thesis](./thesis/) | em desenvolvimento | Tese de investimento | `thesis/` |
| [Radar](./radar/) | em desenvolvimento | Descoberta e matching | `radar/` |
| [Radar Score](./radar-score/) | em desenvolvimento | Score de aderencia e ranking do Radar | `radar-score/` |
| [Radar Teaser](./radar-teaser/) | em desenvolvimento | Preview pre-NDA e CTA de teaser | `radar-teaser/` |
| [Radar NDA](./radar-nda/) | em desenvolvimento | Solicitacao de NDA, status e notificacao | `radar-nda/` |
| [Radar Follow](./radar-follow/) | em desenvolvimento | Follow de oportunidades e sinal de interesse | `radar-follow/` |
| [Feed](./feed/) | em desenvolvimento | Eventos e recorrencia | `feed/` |
| [MRS](./mrs/) | implementado (MVP) | M&A Readiness Score | `mrs/` |
| [Mais Infos (VDR)](./mais-infos/) | em desenvolvimento | Data room virtual | `mais-infos/` |
| [Collaboration](./collaboration/) | em desenvolvimento | Convites e colaboracao | `collaboration/` |
| [Mary AI](./mary-ai/) | em desenvolvimento | Assistente AI | `mary-ai/` |
| [Settings/Admin](./settings-admin/) | em desenvolvimento | Configuracoes e administracao | `settings-admin/` |
| [Dashboard Frontend](./dashboard-frontend/) | em desenvolvimento | Frontend dos dashboards por perfil e navegacao inicial | `dashboard-frontend/` |
| [Z-API](./z-api/) | em desenvolvimento | Integracao WhatsApp para OTP e alertas de seguranca | `z-api/` |
| [Excalidraw Front Alignment](./excalidraw-front-alignment/) | em desenvolvimento | Alinhamento doc Excalidraw vs frontend com auditoria, matriz e plano de refatoracao | `excalidraw-front-alignment/` |

## Estrutura por Modulo

Cada pasta de modulo contem:

| Arquivo | Conteudo |
|---------|----------|
| `context.md` | Fonte de verdade do modulo (12 secoes: identificacao, objetivo, escopo, arquitetura, codigo, dados, seguranca, observabilidade, qualidade, backlog, checklist, historico) |
| `agents.md` | Agentes relevantes de `.context/agents/` com nivel (Primary/Secondary/On-demand) e quando usar |
| `skills.md` | Skills internas (`.context/skills/`) e externas (`.agents/skills/`) aplicaveis com cenarios de ativacao |

## Templates

Para criar um novo modulo:

1. Copie o template de [_templates/module-context-guide.md](./_templates/module-context-guide.md)
2. Crie a pasta `<nome-do-modulo>/` e salve como `context.md`
3. Crie `agents.md` e `skills.md` seguindo o padrao dos modulos existentes
4. Adicione o modulo na tabela acima

Instrucoes detalhadas de criacao de especialista: [_templates/create-module-specialist.md](./_templates/create-module-specialist.md)

## Governanca obrigatoria por modulo

Para qualquer demanda funcional de modulo:

1. consultar `.context/modules/<modulo>/context.md`
2. consultar `.context/modules/<modulo>/agents.md` para acionar agentes adequados
3. consultar `.context/modules/<modulo>/skills.md` para ativar skills relevantes
4. carregar `.cursor/skills/<modulo>/SKILL.md` se existir
5. usar `specialist-<modulo>` se existir
6. responder com evidencias concretas de codigo

Para regras de precedencia com demandas transversais, consultar `.context/AI_GOVERNANCE.md`.

## Regras rapidas

- Escreva de forma objetiva.
- Referencie arquivos com paths reais do projeto.
- Sempre inclua riscos, dependencias e criterios de pronto.
- Atualize apos mudancas relevantes no modulo.
