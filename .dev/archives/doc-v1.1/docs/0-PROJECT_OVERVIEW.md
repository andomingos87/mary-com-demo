# 🚀 Mary - Plataforma Inteligente de Ecossistema M&A

## Sumário
- [Visão Geral](#visão-geral)
- [Missão e Propósito](#missão-e-propósito)
- [Diferenciais Competitivos](#diferenciais-competitivos)
- [Modelo de Negócio](#modelo-de-negócio)
- [Arquitetura de Perfis](#arquitetura-de-perfis)
- [Mary Taxonomy](#mary-taxonomy)
- [Modelo de Validação L1/L2/L3](#modelo-de-validação-l1l2l3)
- [Funcionalidades MVP v1.0](#funcionalidades-mvp-v10)
- [Jornadas de Usuário](#jornadas-de-usuário)
- [Fluxos de Onboarding e Verificação](#fluxos-de-onboarding-e-verificação)
- [Stack Tecnológica](#stack-tecnológica)
- [Métricas de Sucesso](#métricas-de-sucesso)

---

## Visão Geral

**Mary** é uma **plataforma inteligente de ecossistema M&A (Fusões e Aquisições)** que revoluciona o mercado brasileiro de investimentos e transações corporativas. A plataforma atua como um **hub unificado** que conecta e acelera relacionamentos entre:

- 💼 **Investidores** (PE, VC, Family Offices, Corporates, Angels, CVC, etc.)
- 🏢 **Empresas/Ativos** (empresas em processos de venda, captação ou fusões)
- 🎯 **Advisors** (bancos de investimento, consultorias M&A, boutiques)
- 👤 **Agentes** (profissionais que monetizam redes de contatos)

A Mary transforma processos tradicionalmente fragmentados em operações **estruturadas, eficientes e transparentes**.

---

## Missão e Propósito

A Mary nasce para resolver a **fragmentação crônica do mercado de M&A**, onde:

| Problema Atual | Solução Mary |
|----------------|--------------|
| Busca por oportunidades depende de networking informal | Matching automatizado baseado em teses de investimento |
| Dados circulam em planilhas soltas e desorganizadas | Dados estruturados, padronizados e validados em camadas |
| Triagem subjetiva e ineficiente | Algoritmo de matching com score explicável |
| Negociação truncada e demorada | Pipeline digital com CTAs e notificações automáticas |
| Maioria dos deals não acontece | Qualificação e preparação automatizada de ativos |

**Conceito Central:** A plataforma atua como **"ecossistema digital"**, organizando dados, clarificando intenções e qualificando conexões através de tecnologia, inteligência de mercado e processos estruturados.

---

## Diferenciais Competitivos

### 1. Abordagem Sistêmica
- Não apenas acelera a ponta final do processo
- **Trabalha na origem**: preparação e direcionamento estratégico
- **Estrutura, qualifica e conecta** de forma integrada

### 2. Dados Estruturados
- **Padronização** de informações empresariais via Mary Taxonomy
- **Comparabilidade** entre oportunidades
- **Redução de assimetria** informacional

### 3. Curadoria Inteligente
- **Qualidade sobre quantidade** nas conexões
- **Filtros sofisticados** de compatibilidade
- **Redução de deal flow** não qualificado

### 4. Transparência e Confiança
- **Visibilidade completa** do processo
- **Auditoria** de todas as interações
- **Compliance** integrado
- **Confidencialidade extrema** em todas as instâncias

### 5. Pilar Unificador
> **"Dados Vivos, Automáticos, Estruturados e Confiáveis"** através do modelo L1/L2/L3 com Mary Taxonomy e matching inteligente.

---

## Modelo de Negócio

### Estrutura de Receita

| Tipo | Descrição |
|------|-----------|
| **Freemium** | Funcionalidades básicas gratuitas |
| **Planos Premium** | Acesso a funcionalidades avançadas |
| **Success Fees** | Comissões sobre transações fechadas |
| **Service Marketplace** | Taxa sobre serviços conectados |

### Monetização por Perfil

| Perfil | Modelo |
|--------|--------|
| **Investidores** | Acesso premium a deal flow qualificado |
| **Ativos** | Só paga no sucesso; ferramentas de preparação e exposição |
| **Advisors** | Eficiência operacional e gestão de mandatos |
| **Agentes** | Monetização estruturada de network |

---

## Arquitetura de Perfis

### 💼 Área do Investidor (`/:investorname/*`)

**Perfis suportados:** Private Equity (PE), Venture Capital (VC), Family Offices (FO), Corporate, Angels, CVC, Venture Builder, Sovereigns, Pension Funds, Search Funds, Aceleradoras, Incubadoras.

```
/:investorname/                    → Dashboard Principal
├── thesis                         → Teses de Investimento (criar/gerenciar)
│   └── thesis/:thesisId           → Detalhes de Tese Específica
├── opportunities                  → Radar de Oportunidades (matching automático)
├── pipeline                       → Pipeline de projetos (Teaser → Closing)
├── mary-ai-private                → Assistente IA especializada em M&A
├── tasks (TBD)                    → Gestão de tarefas global
├── inbox (TBD)                    → Central de Comunicação
├── documents (TBD)                → Gestão de documentos (NDA, Q&A, etc.)
├── signatures (TBD)               → Assinaturas digitais (Clicksign)
├── profile                        → Perfil do Investidor
└── settings                       → Configurações da conta
```

**Etapas do Pipeline Investidor:**
`Teaser → NDA → Pré-DD → IoI → Management Meetings → NBO → DD/SPA → Signing → CP's → Closing → Disclosure → Declinado`

---

### 🏢 Área da Empresa/Ativo (`/:assetname/*`)

```
/:assetname/                       → Dashboard Empresa
├── assetvdr                       → Virtual Data Room Institucional
├── financials                     → Demonstrações Financeiras (IA padroniza)
├── banking (TBD)                  → Integração Bancária (Open Banking)
├── cap-table                      → Gestão de Cap Table
├── kpis                           → Gestão de KPIs
├── readiness                      → Mary Readiness Score®
├── projects                       → Hub de Projetos (venda, captação, fusão)
│   └── projects/:codename/
│       ├── overview               → Overview do Projeto
│       ├── teaser                 → Teaser (geração IA)
│       ├── valuation              → Valuation (múltiplos automáticos)
│       ├── cim                    → Confidential Info Memo
│       ├── investors              → Lista de Investidores (matching reverso)
│       │   └── :investorname/vdr  → VDR por Investidor (isolado)
│       └── pipeline               → Pipeline do Projeto
├── mary-ai-private                → Assistente IA
├── profile                        → Perfil do Ativo
└── settings                       → Configurações
```

---

### 🎯 Área do Advisor (`/advisor/*`)

**Perfis:** Bancos de investimento, consultorias M&A, boutiques, escritórios de advocacia/contabilidade, auditorias.

```
/advisor/                          → Dashboard Advisor
├── projects                       → Lista de Projetos (visualização contextual)
├── mary-ai-private                → Assistente IA
├── tasks (TBD)                    → Gestão de tarefas
├── inbox (TBD)                    → Central de Comunicação
├── fees (TBD)                     → Acompanhamento de comissões
├── profile                        → Perfil do Advisor
└── settings                       → Configurações
```

**Importante:** Advisor tem acesso contextual limitado (sell-side OU buy-side, **nunca ambos** no mesmo projeto).

---

### 👤 Área do Agente (`/agent/*`) - TBD

Profissionais que monetizam redes de contatos e indicações (a ser desenvolvido em v1.5).

---

### 🏢 Mary Admin (`/admin/*`)

```
/admin/                            → Dashboard Interno
├── support                        → Gestão de tickets
├── users                          → Lista de usuários
├── mary-ai-public                 → Monitoramento IA pública
├── mary-ai-private                → Monitoramento IA privada
├── contracts (TBD)                → Contratos e Faturamento
├── logs (TBD)                     → Logs de acesso e auditoria
└── bi (TBD)                       → Business Intelligence
```

---

## Mary Taxonomy

**MAICS (Mary Industry Classification Standard)** - Sistema proprietário de classificação setorial.

### Estrutura Hierárquica

- **Level 1:** Macrosetor (12 categorias)
- **Level 2:** Setor
- **Level 3:** Subsetor
- Equivalências: `naics_codes[]`, `cnae_codes[]`

### Os 12 Macrosetores

| Código | Macrosetor |
|--------|------------|
| 01 | 🏦 Financial & Professional Services |
| 02 | 💻 Technology & Digital Infrastructure |
| 03 | 🌿 Energy, Utilities & Sustainability |
| 04 | 🏭 Industrial, Manufacturing & Engineering |
| 05 | 🚚 Logistics, Supply Chain & Mobility |
| 06 | 🏪 Retail, Consumer & E-Commerce |
| 07 | 🏥 Healthcare, Pharma & Life Sciences |
| 08 | 🏫 Education, Training & Human Capital |
| 09 | 🏘️ Real Estate, Construction & Infrastructure |
| 10 | 📡 Media, Telecom & Entertainment |
| 11 | 🌱 Agriculture, Food & Agritech |
| 12 | 🎯 Public, Nonprofit & Impact |

### Uso na Plataforma

- **Matching AI:** Embeddings e filtros operam sobre `mary_taxonomy.code`
- **Interoperabilidade:** CNPJ → `cnae_principal` → mapeamento para `mary_code`
- **Relatórios:** Dashboards usam `mary_code` como eixo primário
- **Flexibilidade:** Schema aberto para evolução

---

## Modelo de Validação L1/L2/L3

Sistema de **três níveis de verificação** de dados e documentos, inspirado em controles de auditoria e due diligence estruturada.

### Níveis de Validação

| Nível | Quem Executa | O que Valida | Confiança |
|-------|--------------|--------------|-----------|
| **L1 – Origem** | Empresa/Sócios | Dados originais (autodeclaração) | Baixa / "Raw" |
| **L2 – Revisão** | Advisor/Analista | Coerência, formatação, completude | Média / "Curated" |
| **L3 – Auditoria** | Auditor/Compliance | Checagem formal documental | Alta / "Verified" |

### Pesos no Mary Readiness Score®

| Nível | Peso |
|-------|------|
| L1 | 0.3 |
| L2 | 0.7 |
| L3 | 1.0 |

### Rastreabilidade de Dados

Cada dado possui metadados completos:
- `submitted_by`
- `validated_by`
- `audited_by`
- `hash_original`
- `hash_reviewed`
- `timestamp`

### Impacto nas Análises

- **Matching:** Ativos com ≥70% dados L2+ ganham prioridade
- **Filtros:** "Exibir apenas dados L2+" ou "Somente L3 verificados"
- **Alertas:** IA emite alertas de gaps em níveis de validação

---

## Funcionalidades MVP v1.0

### ✅ Incluídos no MVP

| Perfil | Funcionalidades |
|--------|-----------------|
| **Investidor** | Thesis → Matching → Pipeline → VDR |
| **Ativo** | Setup → Projeto → Teaser → Negociação |
| **Advisor** | Acesso contextual limitado (sell-side OU buy-side) |

### ❌ Excluídos do MVP

- **Agente** (v1.5)
- Todas as funcionalidades marcadas como **TBD**
- Signatures nativo (solução externa + upload no MVP)
- Smart contracts, PMI, BI, Marketplace, Rankings, Deals Club

---

## Jornadas de Usuário

### Journey 1: Investidor → Deal Flow Qualificado

```
Onboarding → Thesis Creation → Automated Radar → Pipeline Management → Deal Closing
```

**Algoritmo de Matching (Score 0-100):**

| Critério | Peso |
|----------|------|
| Fit setorial/modelo | 40% |
| Tamanho/ticket | 20% |
| Geografia | 10% |
| Objetivo vs. tese | 10% |
| Readiness/cobertura L2+ | 20% |

**Etapas do Pipeline:**
1. **Teaser** → CTA: "Assinar NDA"
2. **NDA** → Gatilho: Upload NDA assinado
3. **Pré-DD** → CTA: "Indicar Interesse"
4. **IoI** → Gatilho: Upload IoI assinada
5. **Management Meetings** → CTA: "Avançar para NBO"
6. **NBO** → Gatilho: Upload NBO assinada
7. **DD/SPA** → CTA: "Avançar para Signing"
8. **Signing** → Gatilho: Upload SPA assinado
9. **CP's** → CTA: "CP's Concluídas"
10. **Closing** → Gatilho: "Closing Concluído"
11. **Disclosure** → CTA: "Deal Divulgado"
12. **Declinado** → CTA: "Recusar"

---

### Journey 2: Ativo → Exposição Qualificada

```
Onboarding → Data Structuring → Project Creation → AI Content → Investor Matching → Deal Management
```

**Geração Automática com IA:**
- **Teaser:** Formato chat scrollável com dados estruturados
- **Valuation:** Múltiplos automáticos + metodologia explicada
- **CIM:** Documento completo baseado no Asset VDR

---

### Journey 3: Advisor → Curadoria L2 e Eficiência

```
Authorization → Conflict Check → Project Access → L2 Validation → Collaborative Management
```

**Conflict Prevention:** Sistema impede acesso a ambos os lados do mesmo projeto.

---

## Fluxos de Onboarding e Verificação

### Gate de Elegibilidade (Investidores e Advisors)

**Critérios mínimos:**
- ≥ 2 deals nos últimos 3 anos
- ≥ 5 anos de experiência em M&A
- Valor mínimo acumulado: ≥ USD 20k (Investidor Individual) / ≥ USD 100k (Advisor)

### Estados de Verificação

| Status | Acesso |
|--------|--------|
| `pending` | Onboarding completo, modo leitura-only |
| `verified` + `completed` | Acesso total ao dashboard |
| `rejected` | Modo "observador/candidate" + appeal |

### Verificação Híbrida

1. **Automática (score):** Análise de deals, URLs, reputação de domínio
2. **Manual (amostragem):** SLA 48h para casos com score médio/baixo

### Política de Slug

- **Reserva:** No callback (privado, não indexado)
- **Congelamento:** Após `verified + completed` (torna público)
- **Herança:** Novos membros de organização verificada herdam status (mesmo domínio)

---

## Stack Tecnológica

### Princípios de Desenvolvimento

| Aspecto | Requisito |
|---------|-----------|
| **Rotas** | 100% EN-US |
| **Conteúdo** | PT-BR (com suporte i18n) |
| **Moeda** | USD (rótulos e formatos) |
| **UX** | Minimalista, intuitivo, filtráveis |

### Banco de Dados (Supabase)

**Tabelas principais:**
- `companies`
- `documents`
- `data_points`
- `validations`
- `users`
- `mary_taxonomy`

### Mary AI

- **Mary AI Public:** Assistente na área pública (pré-login)
- **Mary AI Private:** Assistente contextual na área logada
- **Características:** Segurança extrema, responde apenas ao que o usuário tem permissão

---

## Métricas de Sucesso

### Investidor
| Métrica | Meta |
|---------|------|
| Time to first qualified lead | < 7 dias |
| Match accuracy | > 70% teasers → NDA |
| Pipeline velocity | 4x faster vs. tradicional |

### Ativo
| Métrica | Meta |
|---------|------|
| Setup to first interest | < 14 dias |
| Readiness improvement | 80% melhoram MRS em 30 dias |
| Qualified interest rate | > 60% teaser → NDA |

### Advisor
| Métrica | Meta |
|---------|------|
| Operational efficiency | 50% redução tarefas admin |
| Data quality | 90% L2 validation em 30 dias |
| Deal velocity | 3x faster closure |

---

## Impacto no Mercado

### Para o Ecossistema M&A
- **Democratização** do acesso a oportunidades
- **Profissionalização** de processos informais
- **Aceleração de 4x** no fechamento de deals
- **Redução de custos** operacionais
- **Economia real** ao integrar dezenas de ferramentas

### Visão de Futuro

> Mary posiciona-se como um **"Ecossistema global de M&A"**, evoluindo para se tornar a infraestrutura digital fundamental para todas as transações corporativas no Brasil e no mundo.

**Objetivo final:** Transformar o M&A de um mercado analógico, fragmentado e ineficiente em um ecossistema digital, estruturado e altamente eficaz.

---

## Próximos Passos

### Fase 1: Especificação Detalhada
1. Database Schema com Supabase
2. Mary Taxonomy completa
3. Algoritmo de Matching
4. Matriz RBAC (permissões granulares)

### Fase 2: Wireframes Core
1. Onboarding flows
2. Main dashboards
3. Pipeline interfaces
4. VDR structure

### Fase 3: Integração Mary AI
1. Context isolation
2. RAG implementation
3. Security guardrails

---

## Documentação Relacionada

| Documento | Localização |
|-----------|-------------|
| Arquitetura Mestre v2 | `devdocs/Documentos Leonardo/` |
| Escopo MVP v1.0 | `devdocs/Documentos Leonardo/` |
| Fluxos de Onboarding | `devdocs/Documentos Leonardo/` |
| Mary Taxonomy v1 | `devdocs/Documentos Leonardo/` |
| Modelo L1/L2/L3 | `devdocs/Documentos Leonardo/` |
| Escopo Contratual | `devdocs/Documentos MVP/` |

---

*Última atualização: Dezembro 2024*
*Versão: MVP v1.0*

