# Mary — MVP Final: Índice Geral

## O que é a Mary

Plataforma de M&A que conecta três perfis de usuários:
- **Ativo**: empresa que busca captação de investimento ou venda integral
- **Investidor**: fundo, corporate, individual que busca oportunidades de investimento/aquisição
- **Advisor**: boutique de M&A ou assessor que representa ativos perante investidores

A **Mary AI** é uma assistente contextual presente em todas as telas. No MVP ela é **assistente, não executora** — consulta bases de dados, responde perguntas, sugere ações, resume e explica. Na v2 poderá executar ações.

---

## Arquivos desta documentação

| Arquivo | Conteúdo |
|---|---|
| `00_INDEX.md` | Este arquivo — visão geral, glossário, rotas |
| `01_GLOBAL_RULES.md` | Regras globais da plataforma (UX, auto-save, Mary AI, mensageria, NDA) |
| `02_ATIVO.md` | Jornada completa do usuário Ativo, campo a campo |
| `03_INVESTIDOR.md` | Jornada completa do usuário Investidor, campo a campo |
| `04_ADVISOR.md` | Jornada completa do usuário Advisor, campo a campo |
| `05_SHARED_MODULES.md` | Módulos compartilhados: Radar, MRS, VDR, Pipeline M&A |

---

## Arquitetura de Rotas

### Públicas
```
/                          → landing page
/register/asset            → pré-cadastro Ativo
/register/investor         → pré-cadastro Investidor
/register/advisor          → pré-cadastro Advisor (rota /advise)
/onboarding/asset          → onboarding Ativo
/onboarding/investor/pre-registration → onboarding Investidor
```

### Ativo (autenticado)
```
/ativo/rs                          → MRS (Market Readiness Score)
/ativo/radar                       → Radar de Investidores
/ativo/feed                        → Feed de atividades
/ativo/projects/:codename          → Visão geral do projeto
/ativo/projects/:codename/overview → Resumo do projeto
/ativo/projects/:codename/pipeline → Pipeline de investidores (kanban)
/ativo/projects/:codename/investors → Lista de investidores
/ativo/solicitacoes                → Solicitações do VDR
/assets/vdr                        → Virtual Data Room
```

### Investidor (autenticado)
```
/investidor/oportunidades     → Radar de oportunidades (ativos)
/investidor/atualizacoes      → Feed de ativos seguidos
/investidor/projetos          → Projetos em andamento (kanban)
```

### Advisor (autenticado)
```
/advisor/radar        → Radar (Leads Sell Side + Investidores)
/advisor/perfil       → Perfis de atuação
/advisor/feed         → Feed de projetos/ativos/investidores
/advisor/projetos     → Portfólio de clientes
```

---

## Glossário

| Termo | Definição |
|---|---|
| **Ativo** | Empresa que busca investimento ou venda |
| **Investidor** | Fundo, corporate ou individual comprador |
| **Advisor** | Boutique de M&A ou assessor financeiro |
| **MRS** | Market Readiness Score — score 0 a 100 de maturidade do ativo para um processo de M&A |
| **Codinome** | Nome fictício do projeto do ativo para preservar confidencialidade no Radar (ex: Projeto Tiger) |
| **Teaser** | Documento de apresentação anonimizado do ativo, gerado pela Mary AI |
| **CIM / Infomemo** | Confidential Information Memorandum — documento detalhado pós-NDA |
| **NDA** | Non-Disclosure Agreement — acordo de confidencialidade |
| **NBO** | Non-Binding Offer — oferta não vinculante |
| **IoI** | Indication of Interest |
| **SPA** | Share Purchase Agreement — contrato de compra e venda |
| **DD** | Due Diligence |
| **VDR** | Virtual Data Room — repositório de documentos do processo |
| **Tese de Investimento** | Critérios e preferências de um investidor para alocação de capital |
| **Pipeline M&A** | Funil de avanço do processo entre ativo e investidor |
| **RAG** | Retrieval-Augmented Generation — base de conhecimento da empresa usada pela Mary AI |

---

## Pipeline M&A — Fases (em ordem)

```
Screening → Teaser → NDA → CIM / DFs → IoI → Management Meetings → NBO → DD / SPA → Signing → CPs → Closing → Disclosure
```

---

## Regras de Privacidade e Visibilidade de Projetos

| Modo | Quem vê |
|---|---|
| **Privado** | Apenas equipe interna + advisors autorizados. Não aparece em nenhum radar. |
| **Restrito** | Investidores específicos via link de convite. Não aparece no Radar geral. |
| **Radar Mary** | Publicado no Radar geral dentro da Mary. Nunca fora do ambiente da plataforma. |

> Todos os modos exigem cadastro e login para acesso.

---

## Referência Lovable

- Ativo: `https://lovable.dev/projects/c530d764-a559-4d71-bfcb-44ad09309b47`
- Investidor: `https://lovable.dev/projects/c530d764-a559-4d71-bfcb-44ad09309b47`
- Copys de referência (Advisors): `https://lovable.dev/projects/3cf9915e-bbaf-40cb-a348-761b65e23c4f`
