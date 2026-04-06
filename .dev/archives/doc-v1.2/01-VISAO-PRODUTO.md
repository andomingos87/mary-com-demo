# 01 — Visão de Produto

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Todos os stakeholders

---

## 1. O que é a Mary

**Mary** é uma plataforma inteligente de ecossistema M&A (Fusões e Aquisições) que atua como hub unificado para conectar e acelerar relacionamentos entre três perfis principais:

| Perfil | Descrição | Papel na plataforma |
|--------|-----------|-------------------|
| **Investidor** | PE, VC, Family Offices, Corporates, Angels, CVC, Venture Builder, Sovereigns, Pension Funds, Search Funds, Aceleradoras, Incubadoras | Define teses de investimento e encontra oportunidades qualificadas via matching automático |
| **Ativo (Empresa)** | Empresas em processos de venda, captação ou fusão | Estrutura dados, prepara documentação (MRS), expõe-se a investidores qualificados |
| **Advisor** | Bancos de investimento, consultorias M&A, boutiques, escritórios de advocacia/contabilidade | Curadoria de dados (validação L2), acompanhamento de deals, gestão contextual |
| **Agente** *(v1.5)* | Profissionais que monetizam redes de contatos | Indicações estruturadas e monetização de network |

---

## 2. Problema que Resolve

O mercado de M&A no Brasil é fragmentado, informal e ineficiente:

| Problema | Impacto | Solução Mary |
|----------|---------|-------------|
| Busca por oportunidades depende de networking informal | Investidores perdem deals relevantes | Matching automatizado baseado em teses de investimento |
| Dados circulam em planilhas e e-mails | Informação desorganizada e inconsistente | Dados estruturados via Mary Taxonomy (MAICS) |
| Triagem subjetiva e manual | Alta taxa de deals que não acontecem | Score de matching explicável (0-100) |
| Empresas não sabem o que investidores esperam | Processos longos e negociações desfavoráveis | MRS orienta preparação por etapas progressivas |
| Negociação truncada e demorada | Pipeline sem visibilidade | Pipeline digital espelhado com marcos claros |

---

## 3. Proposta de Valor

> **"Dados Vivos, Automáticos, Estruturados e Confiáveis"**

### Pilares

1. **Dados estruturados** — Padronização via MAICS com comparabilidade entre oportunidades
2. **Qualificação progressiva** — MRS mede e orienta prontidão do ativo por etapas
3. **Matching inteligente** — Algoritmo determinístico com score explicável
4. **Transparência** — Auditoria completa de interações, validação em camadas (L1/L2/L3)
5. **IA como copiloto** — Sugestões contextuais, geração assistida de documentos, sem execução automática

---

## 4. Diferenciais Competitivos

### 4.1 Abordagem Sistêmica

Não apenas acelera a ponta final do processo. Trabalha na **origem**: preparação, direcionamento estratégico, estruturação e qualificação integrada.

### 4.2 MRS (Market Readiness Score)

Índice proprietário que mede prontidão do ativo para M&A. Transforma a lista de 180 itens de due diligence em uma experiência progressiva e orientada por passos de criticidade.

### 4.3 Experiências Espelhadas

Ativo e Investidor operam em estruturas similares (Tese/Radar/Feed/Projetos), reduzindo fricção de aprendizado e custo de desenvolvimento.

### 4.4 Plataforma Viva

Feed de atualizações, alertas, lembretes e nudges contextuais para manter engajamento contínuo pós-onboarding.

### 4.5 Curadoria em Camadas

Modelo L1/L2/L3 com rastreabilidade completa:

| Nível | Quem executa | O que valida | Confiança | Peso no score |
|-------|-------------|-------------|-----------|---------------|
| **L1 — Origem** | Empresa/Sócios | Autodeclaração | Baixa | 0.3 |
| **L2 — Revisão** | Advisor/Analista | Coerência, formatação, completude | Média | 0.7 |
| **L3 — Auditoria** | Auditor/Compliance | Checagem formal documental | Alta | 1.0 |

---

## 5. Modelo de Negócio

### 5.1 Estrutura de Planos

| Plano | Descrição | Limitações |
|-------|-----------|------------|
| **Free** | Funcionalidades básicas | 1 projeto ativo |
| **Pro** | Funcionalidades intermediárias | Conforme tabela de preços |
| **Premium** | Acesso completo | Conforme tabela de preços |

### 5.2 Monetização por Perfil

| Perfil | Modelo |
|--------|--------|
| **Investidor** | Acesso premium a deal flow qualificado |
| **Ativo** | Só paga no sucesso; ferramentas de preparação e exposição |
| **Advisor** | Eficiência operacional e gestão de mandatos |

### 5.3 Success Fee

- Percentual variável por tipo de transação
- Cobrado do Ativo (sell-side)
- Rastreamento via Pipeline + Closing confirmado
- Split com Advisors/Agentes: não na V1

### 5.4 Pagamentos

- Gateway: **Stripe**
- Recorrência: assinaturas
- Métodos: cartão de crédito
- Cobrança: por conta/organização
- Nota fiscal: não automática no MVP

---

## 6. Mary Taxonomy (MAICS)

**MAICS (Mary Industry Classification Standard)** — Sistema proprietário de classificação setorial.

### Estrutura hierárquica

- **Level 1:** Macrosetor (12 categorias)
- **Level 2:** Setor
- **Level 3:** Subsetor
- **Equivalências:** `naics_codes[]`, `cnae_codes[]`

### Os 12 Macrosetores

| Código | Macrosetor |
|--------|------------|
| 01 | Financial & Professional Services |
| 02 | Technology & Digital Infrastructure |
| 03 | Energy, Utilities & Sustainability |
| 04 | Industrial, Manufacturing & Engineering |
| 05 | Logistics, Supply Chain & Mobility |
| 06 | Retail, Consumer & E-Commerce |
| 07 | Healthcare, Pharma & Life Sciences |
| 08 | Education, Training & Human Capital |
| 09 | Real Estate, Construction & Infrastructure |
| 10 | Media, Telecom & Entertainment |
| 11 | Agriculture, Food & Agritech |
| 12 | Public, Nonprofit & Impact |

### Uso na plataforma

- **Matching:** Embeddings e filtros operam sobre `mary_taxonomy.code`
- **Interoperabilidade:** CNPJ → `cnae_principal` → mapeamento para `mary_code`
- **Relatórios:** Dashboards usam `mary_code` como eixo primário

---

## 7. Métricas de Sucesso

### Investidor

| Métrica | Meta |
|---------|------|
| Time to first qualified lead | < 7 dias |
| Match accuracy | > 70% teasers → NDA |
| Pipeline velocity | 4x mais rápido que processo tradicional |

### Ativo

| Métrica | Meta |
|---------|------|
| Setup to first interest | < 14 dias |
| Readiness improvement | 80% melhoram MRS em 30 dias |
| Qualified interest rate | > 60% teaser → NDA |

### Advisor

| Métrica | Meta |
|---------|------|
| Operational efficiency | 50% redução de tarefas administrativas |
| Data quality | 90% validação L2 em 30 dias |
| Deal velocity | 3x mais rápido no fechamento |

---

## 8. Impacto no Mercado

- **Democratização** do acesso a oportunidades de M&A
- **Profissionalização** de processos hoje informais
- **Aceleração de 4x** no fechamento de deals
- **Redução de custos** operacionais
- **Economia real** ao unificar dezenas de ferramentas fragmentadas

### Visão de futuro

> Mary posiciona-se como um ecossistema global de M&A, evoluindo para se tornar a infraestrutura digital fundamental para transações corporativas no Brasil e no mundo.
