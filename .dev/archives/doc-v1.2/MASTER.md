# Mary AI Platform — Documento Master do Projeto

> **Versão:** 2.0 (pós-pivot)
> **Data:** Março 2026
> **Status:** MVP em desenvolvimento
> **Stakeholders:** Anderson (TI), Cassio (Produto), Leonardo (Negócio)

---

## Resumo Executivo

**Mary** é uma plataforma inteligente de ecossistema M&A (Fusões e Aquisições) que conecta Investidores, Empresas/Ativos e Advisors em um hub unificado. A plataforma resolve a fragmentação crônica do mercado brasileiro de M&A com dados estruturados, matching inteligente e processos digitais.

O projeto está organizado em **3 marcos contratuais**:

| Marco | Escopo | Status | Pagamento |
|-------|--------|--------|-----------|
| Marco 1 | Fundação, Auth, Onboarding | ✅ ~95% concluído | 20% |
| Marco 2 | Projetos, VDR, Thesis, Matching | ⚠️ ~55% em progresso | 20% |
| Marco 3 | Pipeline, IA, Monetização, Go-live | ❌ ~5% não iniciado | 20% |

**Pagamento inicial:** 40% na assinatura do contrato (já recebido).

---

## Contexto Histórico

### Origem (Dez 2024 – Fev 2026)

O projeto nasceu como uma plataforma robusta com escopo amplo: autenticação MFA via WhatsApp, RBAC granular, VDR completo, Matching Engine, Pipeline Kanban espelhado, Mary AI com RAG e geração de documentos, pagamentos via Stripe.

O Marco 1 (Fases 0-3) foi concluído com sucesso:
- Infraestrutura Next.js + Supabase + Vercel configurada
- Autenticação com MFA, sessão única, rate limiting
- Organizações com RBAC (Owner/Admin/Member/Viewer)
- Onboarding automatizado com enrichment (BrasilAPI, Jina.ai, CVM, OpenAI)
- Rotas base do PRD implementadas

O Marco 2 avançou parcialmente:
- Projetos do Ativo + Taxonomia MAICS + Readiness Score ✅
- VDR Core (37 componentes, ~50 server actions) ✅
- VDR Investidor, NDA, Teaser, Thesis, Matching ❌

### Pivot (Março 2026)

Em 07/03/2026, uma call de alinhamento redirecionou o produto:

- **De:** MVP robusto e denso → **Para:** MVP leve, com valor imediato
- **De:** VDR genérico como centro → **Para:** MRS (Market Readiness Score) como núcleo do Ativo
- **De:** Experiências distintas por perfil → **Para:** Experiências espelhadas (Ativo ≈ Investidor)
- **De:** IA como executor automático → **Para:** IA como copiloto contextual
- **De:** Onboarding de 5 etapas → **Para:** Onboarding de 2 etapas

A decisão preserva o escopo contratual mas simplifica a execução para acelerar entrega e adoção.

---

### Complemento de alinhamento (14/03/2026)

A call de 14/03 consolidou decisões adicionais do MVP:

- **Kanban do Investidor:** controle pelo lado buy-side, com marcos essenciais por projeto.
- **Gates de acesso do MRS:** NDA assinado libera passos 1 e 2; NBO assinado libera passos 3 e 4.
- **Mais Infos:** módulo complementar ao MRS para dossiê, diligências extras e Q&A com compartilhamento granular.
- **Upload no MVP:** foco em formatos textuais (PDF, DOC/DOCX, XLS/XLSX, TXT); mídia não estruturada (áudio/vídeo/imagem) fora do foco inicial.
- **Assinatura eletrônica:** decisão congelada para kickoff: fluxo manual com trilha auditável no P0; integração mínima fica para P1.
- **Cadência de execução:** referência de 4 semanas para versão funcional ponta a ponta + até 1 semana de refino.

---

## Princípios da Fase Atual

1. **Leveza no MVP** — menos campos, menos fricção, mais clareza
2. **Essencial primeiro** — entregar o mínimo que gera valor real, expandir por demanda validada
3. **Experiências espelhadas** — Ativo e Investidor com lógica similar (reduz custo de desenvolvimento)
4. **Plataforma viva** — feed, alertas, lembretes para engajamento contínuo
5. **IA colaborativa** — recomenda e contextualiza; usuário decide e edita

---

## Índice de Documentos

| # | Documento | Conteúdo | Público-alvo |
|---|-----------|----------|-------------|
| 01 | [Visão de Produto](./01-VISAO-PRODUTO.md) | O que é, problema, proposta de valor, modelo de negócio, métricas | Todos |
| 02 | [Arquitetura de Experiência](./02-ARQUITETURA-EXPERIENCIA.md) | UX, navegação, MRS, jornadas por perfil, feed, design system | Produto + Design |
| 03 | [Especificação Funcional](./03-ESPECIFICACAO-FUNCIONAL.md) | Módulos detalhados: Auth, VDR, Matching, Pipeline, IA, Pagamentos | Produto + Engenharia |
| 04 | [Arquitetura Técnica](./04-ARQUITETURA-TECNICA.md) | Stack, modelo de dados, RLS, APIs, integrações | Engenharia |
| 05 | [Execução e Roadmap](./05-EXECUCAO-ROADMAP.md) | Marcos contratuais, backlog, status, priorização | Gestão + Engenharia |
| 06 | [Regras e Decisões](./06-REGRAS-DECISOES.md) | Regras de negócio, decisões do pivot, pendências, riscos | Todos |
| 07 | [Glossário](./07-GLOSSARIO.md) | Definição dos termos de negócio e operação | Todos |
| 08 | [Perfis](./08-PERFIS.md) | Perfis de usuário, responsabilidades e jornadas resumidas | Produto + Negócio |
| 09 | [Matriz de Rastreabilidade](./09-MATRIZ-RASTREABILIDADE.md) | Mapeamento objetivo -> requisito -> técnico -> teste -> evidência | Produto + Engenharia + QA |
| 10 | [Relatório de Prontidão](./10-RELATORIO-PRONTIDAO-KICKOFF.md) | Decisão go/no-go, gate formal e plano de execução auditável | Stakeholders |
| 11 | [Aderência MCP Supabase](./11-RELATORIO-ADERENCIA-MCP-SUPABASE.md) | Diagnóstico doc x banco com evidências reais do ambiente Supabase | Tech Lead + Engenharia + Segurança |
| 12 | [Contrato Técnico RPC M2](./12-CONTRATO-TECNICO-RPC-M2.md) | Contrato canônico de funções/RPC para integração backend/frontend no M2 | Backend + Frontend + QA |
| 13 | [Revisão Estratégica de Readiness](./13-RELATORIO-REVISAO-ESTRATEGICA-READINESS.md) | Parecer consolidado de prontidão com evidência MCP e plano de execução por gate | Stakeholders + Tech Lead |
| 14 | [Matriz de Reaproveitamento v1 -> v2](./14-MATRIZ-REAPROVEITAMENTO-V1-PARA-V2.md) | Template de triagem KEEP/ADAPT/DROP para reuso seletivo de system design e Supabase | Tech Lead + Frontend + Backend |

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **MAICS** | Mary Industry Classification Standard — taxonomia proprietária de 12 macrosetores |
| **MRS** | Market Readiness Score — índice de prontidão do ativo (0-100) |
| **L1/L2/L3** (ou N1/N2/N3) | Níveis de validação de dados: Origem → Revisão → Auditoria |
| **VDR** | Virtual Data Room — repositório seguro de documentos do projeto |
| **DR Espelhado** | Cópia do VDR acessível ao investidor após NDA assinado |
| **Teaser** | Visão resumida pré-NDA do projeto (empresa em sigilo) |
| **NDA** | Non-Disclosure Agreement — acordo de confidencialidade |
| **NBO** | Non-Binding Offer — oferta não-vinculante |
| **IOI** | Indication of Interest — indicação de interesse |
| **SPA** | Share Purchase Agreement — contrato de compra e venda |
| **DD** | Due Diligence — processo de investigação do ativo |
| **CIM** | Confidential Information Memorandum |
| **RBAC** | Role-Based Access Control |
| **RLS** | Row-Level Security (Supabase/PostgreSQL) |
| **RAG** | Retrieval-Augmented Generation (estratégia de IA) |

---

## Stack Tecnológica (resumo)

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) |
| Deploy | Vercel (região São Paulo) |
| IA | OpenAI (principal) + OpenRouter (fallback: Claude, Gemini) |
| Pagamentos | Stripe |
| Notificações | Brevo (e-mail) + WhatsApp Business API |
| Versionamento | GitHub |

---

## Documentação Relacionada (legado e pivot)

| Pasta | Conteúdo | Status |
|-------|----------|--------|
| `.dev_legacy/docs/` | Documentação original (PRD, requisitos, plano de desenvolvimento, backlog) | Referência histórica |
| `.dev_legacy/docs/docs_escopo_contrato/` | Escopo contratual, Anexo I (detalhado), Anexo II (marcos) | Vigente |
| `.dev_legacy/docs/docs_leonardo/` | Arquitetura mestre, fluxos de onboarding, taxonomia | Referência histórica |
| `.dev_pivot/` | Call de pivot, mudanças consolidadas, MRS spec, plano de documentação | Vigente |
| `.dev/doc-v1.2/` (este diretório) | **Documentação consolidada pós-pivot** | **Fonte de verdade atual** |

---

## Status de prontidão para kickoff

- **Decisão atual (documental):** `GO CONDICIONAL` para execução do caminho crítico do Marco 2.
- **Gate obrigatório:** itens `P0-BLOQUEANTE` da [Matriz de Rastreabilidade](./09-MATRIZ-RASTREABILIDADE.md) com evidência técnica.
- **Relatório executivo:** [10-RELATORIO-PRONTIDAO-KICKOFF.md](./10-RELATORIO-PRONTIDAO-KICKOFF.md).
- **Validação técnica via MCP:** [11-RELATORIO-ADERENCIA-MCP-SUPABASE.md](./11-RELATORIO-ADERENCIA-MCP-SUPABASE.md) com status `GO CONDICIONAL` após convergência S0/S1.
- **Parecer estratégico consolidado:** [13-RELATORIO-REVISAO-ESTRATEGICA-READINESS.md](./13-RELATORIO-REVISAO-ESTRATEGICA-READINESS.md) com recomendação `GO CONDICIONAL CONTROLADO`.

---

*Este documento é a porta de entrada para toda a documentação do projeto Mary. Consulte os subdocumentos linkados para detalhes específicos.*
