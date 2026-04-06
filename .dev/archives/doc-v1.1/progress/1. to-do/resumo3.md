# ETAPA 2 — Backlog Técnico + Fluxo Operacional

| Campo       | Valor                                       |
|-------------|---------------------------------------------|
| **Projeto** | Mary                                        |
| **Base**    | Call – Mary – 28                             |
| **Escopo**  | Estrutura executável (ainda sem código)      |
| **Status**  | To-do                                        |

---

## Índice

1. [Visão de Alto Nível](#1-visão-de-alto-nível)
2. [Fluxo Operacional Completo](#2-fluxo-operacional-completo)
3. [Backlog Técnico por Camada](#3-backlog-técnico-por-camada)
   - 3.1 [Camada 1 — Plataforma (Core)](#31-camada-1--plataforma-core)
   - 3.2 [Camada 2 — IA / Dados](#32-camada-2--ia--dados)
   - 3.3 [Camada 3 — Produto (Features)](#33-camada-3--produto-features)
   - 3.4 [Camada 4 — Escala & Custo](#34-camada-4--escala--custo)
4. [Separação de Responsabilidades](#4-separação-de-responsabilidades)
5. [Decisões Consolidadas](#5-decisões-consolidadas)
6. [Próxima Etapa](#6-próxima-etapa--etapa-3)

---

## 1. Visão de Alto Nível

A Mary passa a operar com **dois planos simultâneos**:

| Plano                          | Característica                  | Quem interage       |
|--------------------------------|---------------------------------|---------------------|
| **Plano 1 — Plataforma**      | Rápido, estável, barato         | Usuário diretamente |
| **Plano 2 — IA / Dados**      | Pesado, assíncrono, escalável   | Background (invisível ao usuário) |

---

## 2. Fluxo Operacional Completo

Visão sequencial do ciclo de vida desde o onboarding até o consumo de dados enriquecidos.

### Etapa 1 — Onboarding da Empresa (Plataforma)

**Input mínimo do usuário:**

| Campo                  | Obrigatório |
|------------------------|:-----------:|
| CNPJ                   | Sim         |
| Nome da empresa        | Sim         |
| Contatos               | Sim         |
| LinkedIn               | Sim         |
| Website                | Sim         |
| Estrutura societária   | Sim         |

**Resultado:**
- Empresa criada no banco principal com UUID único
- Onboarding finalizado sem bloqueio

---

### Etapa 2 — Disparo Automático (Evento)

**Trigger:** `company_onboarding_completed`

| Ação automática                                  | Detalhe                          |
|--------------------------------------------------|----------------------------------|
| Enfileirar job de IA                             | Processamento assíncrono         |
| Registrar status `dossier_pending`               | Rastreável internamente          |
| Usuário segue usando a plataforma normalmente    | Sem bloqueio na UX               |

---

### Etapa 3 — Coleta Externa de Dados (IA)

**Fontes de dados:**
- Website (crawl completo)
- LinkedIn
- Conteúdo público na web
- Notícias e entrevistas
- Plataformas de reputação (reviews, empregos)

**Ferramentas:**
- Notebook LM / IA de navegação
- Scraping assistido por LLM
- Busca profunda (deep search)

---

### Etapa 4 — Geração do Dossiê

Documento único e estruturado contendo:

| Seção do Dossiê               | Descrição                               |
|-------------------------------|-----------------------------------------|
| Contexto institucional        | Quem é a empresa, missão, visão         |
| Histórico público             | Marcos, notícias, trajetória            |
| Indicadores operacionais      | Métricas inferidas de fontes públicas   |
| Reputação de mercado          | Reviews, employer branding, percepção   |
| Sinais positivos e negativos  | Alertas e destaques                     |
| Dados comerciais implícitos   | Estimativas de mercado e posicionamento |

**Status resultante:** `dossier_generated`

---

### Etapa 5 — Armazenamento (Banco IA)

- Dossiê salvo no **Banco 2 (IA/Dados)**, separado do banco principal
- Indexado por UUID da empresa
- Preparado para RAG (Retrieval-Augmented Generation)

---

### Etapa 6 — Consumo do Dossiê (Produto)

O dossiê alimenta automaticamente as features da plataforma com campos **pré-preenchidos**:

| Feature                      | Como usa o dossiê                          |
|------------------------------|--------------------------------------------|
| Radar de oportunidades       | Matching inteligente baseado em perfil     |
| Matching com investidores    | Cruzamento de teses × perfil da empresa    |
| Criação de projetos          | Dados base preenchidos                     |
| Teaser                       | Resumo executivo gerado                    |
| InfoMemo                     | Documento detalhado pré-montado            |
| Evaluation                   | Indicadores e análise pré-carregados       |
| Simulações financeiras       | Dados implícitos alimentam modelos         |

---

## 3. Backlog Técnico por Camada

### 3.1 Camada 1 — Plataforma (Core)

| ID   | Item                                      | Descrição                                                                 |
|------|-------------------------------------------|---------------------------------------------------------------------------|
| P1   | Evento de Finalização de Onboarding       | Emitir evento confiável com payload: `company_id` (UUID), tipo de ativo, timestamp |
| P2   | Status de Processamento de IA             | Estados: `pending` → `processing` → `ready` / `error`. Visível internamente ou no admin |
| P3   | Integração UUID ↔ Banco IA               | Plataforma não acessa dados pesados; apenas referencia UUID. Comunicação sempre pull (nunca push) |

---

### 3.2 Camada 2 — IA / Dados

| ID   | Item                                      | Descrição                                                                 |
|------|-------------------------------------------|---------------------------------------------------------------------------|
| I1   | Pipeline de Coleta Externa                | Orquestrar buscas (Website, LinkedIn, Web) e normalizar conteúdo bruto    |
| I2   | Prompt de Geração de Dossiê              | Prompt único e versionado. Entrada: conteúdo coletado. Saída: documento estruturado (Markdown/JSON híbrido) |
| I3   | Armazenamento Inteligente                 | Banco separado, estruturado para RAG, versionamento e atualizações futuras |
| I4   | Atualização Assíncrona                    | Dossiê pode ser regerado, atualizado ou expandido sem impacto na plataforma |

---

### 3.3 Camada 3 — Produto (Features)

| ID   | Item                                      | Descrição                                                                 |
|------|-------------------------------------------|---------------------------------------------------------------------------|
| F1   | Data Room Automático                      | Dossiê aparece como documento-base (somente leitura + anotações)          |
| F2   | Pré-preenchimento Inteligente             | Teaser, InfoMemo, Evaluation, Valuation inicial — campos abertos apenas para ajustes estratégicos |
| F3   | Radar de Oportunidades                    | IA cruza perfil da empresa × perfil de investidores e sugere matches com explicação |

---

### 3.4 Camada 4 — Escala & Custo

| ID   | Item                                      | Descrição                                                                 |
|------|-------------------------------------------|---------------------------------------------------------------------------|
| S1   | Isolamento de Carga                       | IA não roda no banco principal — evita latência, escalonamento forçado e upgrade prematuro de plano |
| S2   | Teste de Estresse Programado              | Simular 1k / 3k / 10k onboardings. Medir custo, tempo e gargalos         |
| S3   | Estratégia de Migração                    | Banco IA pode migrar (ex: Supabase → AWS) sem afetar a plataforma        |

---

## 4. Separação de Responsabilidades

| Domínio        | Responsabilidades                                                      |
|----------------|------------------------------------------------------------------------|
| **Plataforma** | UX, Onboarding, Fluxos, Projetos, Usuários, Controle de acesso        |
| **IA**         | Pesquisa, Análise, Geração de documentos, Simulações, Enriquecimento  |
| **Dados**      | Persistência, Versionamento, RAG, Performance, Custo                   |

---

## 5. Decisões Consolidadas

| #  | Decisão                                                  |
|----|----------------------------------------------------------|
| 1  | Dossiê é o **ativo central** de todo o sistema           |
| 2  | IA **nunca bloqueia** o usuário                          |
| 3  | Arquitetura **desacoplada** é obrigatória                |
| 4  | **UUID** é o elo de ligação entre Plataforma e IA        |
| 5  | MVP já nasce **escalável**                               |

---

## 6. Próxima Etapa — Etapa 3

Na Etapa 3, serão definidos:

| Entregável                                       | Descrição                                            |
|--------------------------------------------------|------------------------------------------------------|
| Estrutura do dossiê (schema)                     | Formato e campos do documento gerado pela IA         |
| Prompt base oficial                              | Prompt versionado para geração do dossiê             |
| Contrato de dados Plataforma ↔ IA               | Interface e formato de comunicação entre os dois planos |
