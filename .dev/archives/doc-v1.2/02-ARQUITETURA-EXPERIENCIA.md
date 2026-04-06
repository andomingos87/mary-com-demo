# 02 — Arquitetura de Experiência

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Produto + Design + Engenharia Frontend

---

## 1. Princípios de UX (pós-pivot)

| Princípio | Descrição |
|-----------|-----------|
| **Leveza** | Menos campos, menos controles secundários, mais clareza |
| **Espelhamento** | Ativo e Investidor com estruturas similares para consistência |
| **Progressão** | Usuário sente evolução (score, status, itens concluídos) |
| **Plataforma viva** | Feed, alertas e lembretes para engajamento contínuo |
| **IA colaborativa** | Painel contextual que sugere sem executar automaticamente |

### Decisões de UX do pivot

- Redução de densidade visual e cognitiva
- Remoção de campos e colunas secundárias no MVP
- Componentes limpos e consistentes (cards, radar, botões, tabela hierárquica, dropzone)
- Status e prioridade indicados por cores e estados claros

---

## 2. Estrutura de Navegação

### Layout base

- **Sidebar fixa** (esquerda, 70px) + **Header** com breadcrumb
- **Botão Mary AI** destacado, abrindo painel lateral que empurra a área de trabalho

### Menus principais (espelhados entre Ativo e Investidor)

| Menu | Ativo | Investidor |
|------|-------|------------|
| **Tese/MRS** | Market Readiness Score | Teses de Investimento |
| **Radar** | Investidores aderentes | Ativos aderentes |
| **Feed** | Atualizações de investidores | Atualizações de ativos seguidos |
| **Projetos** | Gestão de processos de venda/captação | Pipeline de deals |

### Menus secundários

- Perfil e configurações
- Faturamento
- Equipe (gestão de membros/convites)
- Ajuda

---

## 3. MRS — Market Readiness Score (núcleo do Ativo)

O MRS é o pilar central da experiência do perfil Ativo na nova fase.

### 3.1 O que é

Índice proprietário (0-100) que mede a prontidão de um ativo para processos de captação e M&A. Avaliação contínua pela Mary AI conforme documentos são submetidos.

### 3.2 Problema que resolve

Empresas não sabem quais documentos são esperados por investidores. A lista bruta de ~180 itens de due diligence é esmagadora. O MRS transforma isso em uma experiência progressiva.

### 3.3 Estrutura por passos de criticidade

| Passo | Cor | Criticidade | Descrição |
|-------|-----|------------|-----------|
| Passo 1 | Azul (`bg-blue-600`) | Básico | Itens simples para início rápido (Fundamentos, Institucional, Comercial) |
| Passo 2 | Vermelho (`bg-red-500`) | Crítico | Documentos indispensáveis para análise de investimento (Financeiro, Projeções) |
| Passo 3 | Âmbar (`bg-amber-500`) | Importante | Complementares relevantes (Jurídicos) |
| Passo 4 | Verde (`bg-green-500`) | Desejável | Diferenciais e materiais adicionais (Operações, Planejamento) |

### 3.4 Pontuação no MVP

Regra simplificada:
- **Tem/não tem** documento
- **Peso por criticidade** do passo (passos críticos impactam mais)
- Sofisticação de scoring fica para fases posteriores

### 3.5 Componentes da interface

#### Score Cards (3 cards em grid)

| Card | Conteúdo | Estado |
|------|----------|--------|
| Score Total Mary | `X/100` + Progress bar | Ativo |
| Benchmark do Setor | `X/100` (opacidade 30%) | Desabilitado — badge "Em breve" |
| Status Global | Indicador âmbar + `X itens do total de 180` | Ativo |

#### Radar Chart

Gráfico de radar (Recharts) com **8 eixos temáticos** (escala 0-5):
Fundamentos, Financeiro, Comercial, Operações, Pessoas, Jurídicos, Planejamento, Adicionais.

Legenda térmica:
- `0-2` → Crítico (vermelho)
- `3-4` → Parcial (âmbar)
- `5` → Completo (verde)

#### Tabela hierárquica (3 níveis)

**Nível 1 — Barra Mãe de Tema:** Barra colapsável com contador `{completed}/{total}`

**Nível 2 — Linhas de Item:** Colunas ordenáveis: Subtema, Item/Documento, Data de Upload, Status, Responsável, Comentários

**Nível 3 — DropZone:** Área expandida com drag-and-drop para upload. Ao soltar arquivo, Mary AI analisa automaticamente.

### 3.6 Fluxo do usuário

```
Acessa /ativo/rs
  → Visualiza Score Total (35/100)
    → Analisa Radar Chart por eixo
      → Seleciona Passo (1-4)
        → Expande Tema (barra mãe)
          → Visualiza itens pendentes
            → Expande item → Upload via DropZone
              → Mary AI analisa → Status e score atualizam
```

### 3.7 Relação com outras funcionalidades

| Funcionalidade | Relação com MRS |
|----------------|----------------|
| **Radar de Investidores** | Score MRS é critério de filtro no matching |
| **VDR** | Documentos do MRS alimentam o data room virtual |
| **Pipeline** | Score MRS pode ser requisito para avançar fases |
| **Matching** | Readiness ≥ 70% dá prioridade no matching engine |

### 3.8 Regra de acesso por etapa (gates)

- **NDA assinado:** libera visualização dos passos 1 e 2 do MRS para o investidor do projeto.
- **NBO assinado:** libera visualização dos passos 3 e 4.
- **Sem NDA/NBO:** investidor acessa apenas teaser e visão resumida permitida.

---

## 4. Jornada do Investidor

### 4.1 Onboarding simplificado (2 etapas)

| Etapa | Conteúdo |
|-------|----------|
| **Etapa 1** | Criação da tese de investimento (setores, ticket, geografia, objetivos) |
| **Etapa 2** | Dados financeiros essenciais |

Impacto: entrada rápida no sistema, menor abandono.

### 4.2 Tese

- Tela inicial após onboarding
- Exibição da tese criada com abas clicáveis
- Ações: compartilhar, aprovar, editar
- Múltiplas teses por organização (ativo/inativo)

### 4.3 Radar

- Seleciona tese e visualiza ativos aderentes (ordenados por score)
- Ajuste de filtros e volume
- Ação de detalhe abre painel/modal com 3 caminhos:
  1. Ver Teaser
  2. Assinar NDA
  3. Acompanhar ativo (follow/favorito)

### 4.4 Feed

- Atualizações dos ativos seguidos
- Estilo rede profissional, com gatilhos de evolução
- Reforça efeito de rede e incentiva evolução do MRS

### 4.5 Projetos (Kanban)

- Kanban controlado pelo investidor (lado buy-side)
- Projeto de negociação evolui por marcos essenciais:
  - Teaser visualizado
  - NDA assinado
  - NBO assinado
  - SPA assinado
  - Fechado/Perdido
- Cada card abre a instância específica do projeto

### 4.6 Fluxo completo

```
Onboarding (2 etapas)
  → Tese de investimento
    → Radar (matching automático)
      → Ver Teaser
        → Assinar NDA
          → Acessa DR espelhado
            → Pipeline (kanban)
              → Deal Closing
```

---

## 5. Jornada do Ativo

### 5.1 MRS como tela inicial

Após onboarding, o ativo cai diretamente no MRS. A progressão por passos orienta o preenchimento de documentos.

### 5.2 Radar do Ativo

- Exibe investidores aderentes ao projeto/empresa
- Permite ver detalhes e acionar convites
- Compartilha lógica estrutural do radar do investidor

### 5.3 Feed do Ativo

- Acompanha movimento de investidores
- Gera engajamento, contexto de mercado e senso de tração

### 5.4 Projeto do Ativo

- **Aba Resumo:** status, responsável, dados base
- **Aba Investidores:** tabela com etapa, tempo desde NDA, temperatura, visualizações no MRS
- **Aba Documentos Legais:** NDA, NBO, SPA
- **Aba Mais Infos:** data room complementar para diligências extras e Q&A
- Comunicação: acionamento de e-mail externo (sem chat interno no MVP)

### 5.5 Teaser, Valuation e Deck (com IA)

Mesmo padrão de tela para os 3 artefatos:
1. IA gera versão inicial baseada no contexto
2. Revisão humana obrigatória
3. Edição manual
4. Aprovação e publicação

### 5.6 Fluxo completo

```
Onboarding
  → MRS (preparação por passos)
    → Readiness ≥ 70%
      → Gera Teaser (IA + revisão humana)
        → Publica Teaser
          → Matching Engine calcula scores
            → Radar mostra investidores aderentes
              → NDA → Pipeline → Deal
```

### 5.7 Mais Infos (data room complementar)

- Reúne materiais fora da taxonomia padrão do MRS.
- Principais usos: dossiê, solicitações adicionais de diligência e respostas de Q&A.
- Compartilhamento granular por item:
  - visível para um investidor específico; ou
  - visível para todos os investidores autorizados no projeto.

---

## 6. Jornada do Advisor

```
Autorização + Conflict Check
  → Acesso contextual ao projeto (sell-side OU buy-side, nunca ambos)
    → Validação L2 de dados/documentos no VDR
      → Responde Q&A de investidores
        → Acompanha Pipeline
          → Gestão colaborativa do deal
```

Regra crítica: sistema impede acesso a ambos os lados do mesmo projeto.

---

## 7. Design System (resumo)

### Cores da marca

| Cor | Hex | Uso |
|-----|-----|-----|
| White | `#FFFFFF` | Backgrounds |
| Anti-flash White | `#F4F4F5` | Cards, containers |
| Platinum | `#E4E4E7` | Bordas |
| Eerie Black | `#18181B` | Textos, títulos |
| Burgundy | `#6F1822` | CTAs, FAB Mary AI |

### Cores térmicas (status e score)

| Contexto | Vermelho | Âmbar | Verde |
|----------|----------|-------|-------|
| Badges | `bg-red-100 text-red-700` | `bg-amber-100 text-amber-700` | `bg-green-100 text-green-700` |
| Score radar | 0-2 Crítico | 3-4 Parcial | 5 Completo |

### Tokens do design system

- Backgrounds: `bg-muted/30`, `bg-muted/20`, `bg-muted/40`
- Textos: `text-foreground`, `text-muted-foreground`
- Bordas: `border-border`
- Cor primária: `hsl(var(--primary))`

### Convenções

| Aspecto | Regra |
|---------|-------|
| Rotas | 100% EN-US |
| Conteúdo | PT-BR (com suporte i18n) |
| Moeda | USD (rótulos e formatos) |
| UX | Minimalista, intuitivo, filtrável |
| Dark mode | Não no MVP |
| Mobile | Mobile-first, responsivo |
| Acessibilidade | WCAG AA |
