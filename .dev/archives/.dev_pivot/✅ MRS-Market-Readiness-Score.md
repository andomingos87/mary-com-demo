# Market Readiness Score (MRS®)

> Documentação completa da funcionalidade MRS — rota `/ativo/rs`  
> Última atualização: 2026-03-11

---

## Índice

1. [Visão de Produto](#1-visão-de-produto)
2. [Componentes da Interface](#2-componentes-da-interface)
3. [Hierarquia da Tabela (3 Níveis)](#3-hierarquia-da-tabela-3-níveis)
4. [Dados e Estados](#4-dados-e-estados)
5. [Integração Mary AI](#5-integração-mary-ai)
6. [Arquitetura Técnica](#6-arquitetura-técnica)
7. [Paleta de Cores e Design System](#7-paleta-de-cores-e-design-system)
8. [Relação com Outras Funcionalidades](#8-relação-com-outras-funcionalidades)

---

## 1. Visão de Produto

### O que é o MRS

O **Market Readiness Score** é um índice proprietário que mede a prontidão de um ativo (empresa) para processos de captação de investimento e M&A. Ele avalia, de forma contínua e automatizada pela Mary AI, o quão preparado o ativo está para enfrentar uma due diligence e apresentar-se de forma competitiva a investidores.

### Problema que resolve

Empresas que buscam captação ou venda frequentemente não sabem quais documentos e informações são esperados por investidores. Isso gera:

- Processos de M&A mais longos e custosos
- Perda de oportunidades por falta de prontidão
- Negociações desfavoráveis por gaps de informação
- Surpresas durante a due diligence

### Público-alvo

- **Sócios e gestores** de empresas preparando-se para captação/M&A
- **CFOs e controllers** responsáveis pela documentação financeira
- **Advisors** acompanhando o progresso de seus clientes

### Proposta de valor

| Benefício | Descrição |
|---|---|
| Avaliação contínua | Mary AI monitora e atualiza o score conforme documentos são subidos |
| Visão clara de gaps | Identificação precisa de documentos faltantes por categoria |
| Priorização inteligente | Itens críticos destacados com urgência e responsáveis definidos |
| Benchmark setorial | Comparação com empresas similares do mesmo setor (em desenvolvimento) |

### Fluxo do usuário

```
Acessa /ativo/rs
  → Visualiza Score Total consolidado (35/100)
    → Analisa Radar Chart por eixo temático
      → Seleciona um Passo (1-4) via botões coloridos
        → Expande Tema (barra mãe colapsável)
          → Visualiza itens/documentos pendentes
            → Expande item individual
              → Faz upload via DropZone
                → Mary AI analisa automaticamente
                  → Status e score atualizam
```

---

## 2. Componentes da Interface

### 2.1 Header

- **Título**: "Market Readiness Score (MRS)"
- **Descrição**: "Índice de prontidão do ativo para processos de captação e M&A. Avaliação contínua por Mary AI."

### 2.2 Score Cards (3 cards em grid)

| Card | Conteúdo | Estado Atual |
|---|---|---|
| **Score Total Mary** | `35/100` + Progress bar (35%) | Ativo, ícone `BarChart3` |
| **Benchmark do Setor** | `58/100` (opacidade 30%, não-clicável) | Desabilitado, badge "Em breve" |
| **Status Global** | Indicador âmbar "Em Preparação" + "15 itens do total de 180" | Ativo, ícone `AlertCircle` |

**Detalhes técnicos dos cards:**
- Background: `bg-muted/30`
- Borda: `border-border`
- Score Total usa `<Progress value={35} />` do shadcn
- Benchmark tem `opacity-30` e `pointer-events-none` sobre os valores

### 2.3 Radar Chart

Gráfico de radar (Recharts `RadarChart`) com **8 eixos temáticos**, escala de 0 a 5:

| Eixo | Score Mock |
|---|---|
| Fundamentos | 3 |
| Financeiro | 2 |
| Comercial | 4 |
| Operações | 5 |
| Pessoas | 5 |
| Jurídicos | 2 |
| Planejamento | 2 |
| Adicionais | 1 |

**Legenda térmica:**
- 🔴 `0-2` → Crítico (vermelho)
- 🟡 `3-4` → Parcial (âmbar)
- 🟢 `5` → Completo (verde)

**Dimensões:** Container de 320px de altura, radar com `outerRadius="70%"`

### 2.4 Botões de Passo

4 botões em grid `grid-cols-4`, cada um com cor sólida e comportamento toggle:

| Passo | Cor de fundo | Ring (ativo) |
|---|---|---|
| Passo 1 | `bg-blue-600 text-white` | `ring-blue-600` |
| Passo 2 | `bg-red-500 text-white` | `ring-red-500` |
| Passo 3 | `bg-amber-500 text-white` | `ring-amber-500` |
| Passo 4 | `bg-green-500 text-white` | `ring-green-500` |

**Comportamento:** Clicar ativa/desativa o passo. Apenas um passo pode estar ativo por vez. Ativação adiciona `ring-2 ring-offset-2`. Quando nenhum passo está selecionado, a tabela não é renderizada.

### 2.5 Tabela de Itens Acionáveis (MRSStepTable)

Componente central da página. Renderizado apenas quando um passo está selecionado. Detalhado na seção 3.

---

## 3. Hierarquia da Tabela (3 Níveis)

A tabela utiliza uma hierarquia de três níveis para organizar os documentos:

### Nível 1: Barra Mãe de Tema

```
┌─────────────────────────────────────────────────────────────┐
│ ▶ Fundamentos                                        2 / 4 │
└─────────────────────────────────────────────────────────────┘
```

- **Componente:** `TemaGroupSection`
- **Visual:** Barra horizontal clicável que colapsa/expande os itens do tema
- **Contador:** `{completed} / {total}` — quantos documentos estão com status "Completo"
- **Background:** `bg-[hsl(var(--card))]` com hover `bg-muted/60`
- **Ícone:** `ChevronRight` que rotaciona 90° quando expandido
- **Estado inicial:** Expandido (`open = true`)

### Nível 2: Linhas de Item/Documento

Quando a barra mãe está expandida, exibe um sub-header com colunas ordenáveis e as linhas de dados.

**Colunas:**

| # | Coluna | Chave de Sort | Largura |
|---|---|---|---|
| 0 | (chevron) | — | `w-8` |
| 1 | Subtema | `subtema` | auto |
| 2 | Item / Documento | `documento` | auto |
| 3 | Data de Upload | `data_upload` | auto |
| 4 | Status | `status` | auto |
| 5 | Responsável | `responsavel` | auto |
| 6 | Comentários | `comentarios` | auto |

**Ordenação:**
- Cada coluna é clicável para ordenar (asc → desc → asc...)
- Ícones: `ArrowUpDown` (inativo), `ArrowUp` (asc), `ArrowDown` (desc)
- A ordenação é feita dentro de cada grupo de tema, não globalmente
- Status ordena por: Pendente (0) → Parcial (1) → Completo (2) → N/A (3)

**Célula "Item / Documento":**
- Exibe o nome do documento + `InfoTooltip` com explicação detalhada do que é esperado

### Nível 3: DropZone (Área expandida)

```
┌─────────────────────────────────────────────────────────────┐
│   📄 Nenhum arquivo enviado ainda                          │
│   ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│   │  ⬆ Arraste um arquivo aqui para análise da Mary AI  │  │
│   └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Ativação:** Clicar na linha do item (nível 2) expande uma área abaixo com `colSpan={7}`
- **Conteúdo:**
  - Indicador de arquivos enviados (atualmente: "Nenhum arquivo enviado ainda")
  - DropZone para drag-and-drop de arquivos
- **Feedback:** Ao soltar um arquivo, exibe toast: "📄 Arquivo recebido — Mary AI está analisando o documento para '{nome}'"
- **Visual:** Background `bg-muted/20`, borda tracejada (`border-dashed`), cor muda para `border-primary` ao arrastar sobre

---

## 4. Dados e Estados

### Status possíveis

| Status | Label | Cor Badge | Semântica |
|---|---|---|---|
| `pendente` | Pendente | `bg-red-100 text-red-700 border-red-200` | Documento não enviado |
| `parcial` | Parcial | `bg-amber-100 text-amber-700 border-amber-200` | Enviado mas incompleto ou com ressalvas |
| `completo` | Completo | `bg-green-100 text-green-700 border-green-200` | Documento aceito e validado |
| `na` | N/A | `bg-muted text-muted-foreground border-border` | Não aplicável ao ativo |

### Prioridades

| Prioridade | Label | Cor | Contexto |
|---|---|---|---|
| `critica` | Crítica | Vermelho | Documentos indispensáveis para qualquer processo de M&A |
| `alta` | Alta | Âmbar | Documentos fortemente recomendados |
| `media` | Média | Azul | Documentos complementares e diferenciais |

### Responsáveis típicos

- **Sócio** — Documentos estratégicos e institucionais
- **Advogado** — Documentos jurídicos, contratos, certidões
- **Contador** — Demonstrações financeiras, balanços, DRE
- **Comercial** — Catálogos, listas de clientes, dados comerciais
- **Mary AI** — Documentos que a plataforma pode gerar/auxiliar (Teaser, Projeções, CIM)

### Dados mock por Passo

**Passo 1 (Azul):** Fundamentos, Institucional, Comercial
- Dossiê Completo, Organograma Societário, Apresentação Corporativa, Catálogo de Produtos/Serviços

**Passo 2 (Vermelho):** Financeiro, Projeções
- DRE Últimos 3 Anos, Balanço Patrimonial Auditado, EBITDA Normalizado (36m), Projeções Financeiras (3-5 anos)

**Passo 3 (Âmbar):** Jurídicos
- Certidões de Regularidade, Licenças e Alvarás, Acordo de Sócios, Contrato Social Consolidado

**Passo 4 (Verde):** Operações, Planejamento, Adicionais
- Lista Top 20 Clientes, Processos Operacionais, Plano Estratégico, Teaser Executivo

---

## 5. Integração Mary AI

### FAB (Floating Action Button)

- **Posição:** Fixo no canto inferior direito (`fixed bottom-6 right-6`)
- **Visual:** Círculo 56px (`w-14 h-14`), cor burgundy `#6F1822`
- **Ícone:** Logo Mary AI (`/lovable-uploads/a04f829e-ca99-4b77-8261-7e8ca5db8080.png`), com `brightness-0 invert` para ficar branco
- **Ação:** Abre `MaryAIChatSheet` (side sheet) para suporte contextual

### Análise automática via DropZone

Quando o usuário arrasta um arquivo para a DropZone:
1. Toast de feedback imediato: "📄 Arquivo recebido"
2. Descrição: "Mary AI está analisando o documento para '{título do item}'"
3. (Futuro) Mary AI valida o conteúdo, extrai informações e atualiza o status do item

### Itens gerados por Mary AI

Alguns documentos são de responsabilidade da Mary AI (responsável = "Mary AI"), como:
- Teaser Executivo
- Projeções Financeiras
- CIM (Confidential Information Memorandum)

---

## 6. Arquitetura Técnica

### Rota e Layout

```
/ativo/rs → ReadinessScore.tsx
```

- **Autenticação:** `useAuth()` hook — redireciona para `/login` se não autenticado
- **Layout:** `AssetSidebar` (70px fixo à esquerda) + conteúdo principal com `max-w-6xl mx-auto`
- **Scroll:** `window.scrollTo(0, 0)` no mount

### Árvore de Componentes

```
ReadinessScore.tsx
├── AssetSidebar
├── MRSScoreCards
│   ├── Card (Score Total) → Progress
│   ├── Card (Benchmark) → Badge "Em breve"
│   └── Card (Status Global)
├── MRSRadarChart
│   └── Recharts: RadarChart → PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
├── Step Buttons (inline, 4 botões)
├── MRSStepTable (condicional: quando activeStep != null)
│   └── TemaGroupSection (para cada tema)
│       ├── Barra Mãe (colapsável)
│       ├── SortableSubHead (colunas ordenáveis)
│       └── ItemRow (para cada item)
│           └── DropZone (expandível)
├── MRSFolderTree (componente alternativo, disponível mas não usado na rota atual)
│   └── Collapsible folders com DropZone por item
├── MRSValidation (placeholder, retorna null)
└── MaryFAB
    └── MaryAIChatSheet
```

### Componentes — Arquivos

| Componente | Arquivo | Descrição |
|---|---|---|
| `ReadinessScore` | `src/pages/ativo/ReadinessScore.tsx` | Página principal |
| `MRSScoreCards` | `src/components/mrs/MRSScoreCards.tsx` | 3 cards de resumo |
| `MRSRadarChart` | `src/components/mrs/MRSRadarChart.tsx` | Gráfico radar 8 eixos |
| `MRSStepTable` | `src/components/mrs/MRSStepTable.tsx` | Tabela hierárquica (principal) |
| `MRSFolderTree` | `src/components/mrs/MRSFolderTree.tsx` | Árvore de pastas alternativa |
| `MRSValidation` | `src/components/mrs/MRSValidation.tsx` | Placeholder (retorna `undefined`) |
| `MaryFAB` | `src/components/investor/MaryFAB.tsx` | Botão flutuante Mary AI |
| `MaryAIChatSheet` | `src/components/chat/MaryAIChatSheet.tsx` | Side sheet de chat |

### Dependências de Terceiros

| Biblioteca | Uso |
|---|---|
| **Recharts** | `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`, `ResponsiveContainer` |
| **Radix UI** | `Collapsible` (MRSFolderTree), `Badge`, `Progress` |
| **shadcn/ui** | `Table`, `Card`, `Badge`, `Progress`, `InfoTooltip` |
| **Lucide React** | Ícones: `BarChart3`, `TrendingUp`, `AlertCircle`, `ChevronRight`, `Upload`, `FileText`, `ArrowUpDown`, etc. |

### Estado Local

| Estado | Componente | Tipo | Descrição |
|---|---|---|---|
| `activeStep` | `ReadinessScore` | `number \| null` | Passo selecionado (1-4) ou null |
| `sortKey` | `MRSStepTable` | `SortKey \| null` | Coluna atualmente ordenada |
| `sortDir` | `MRSStepTable` | `"asc" \| "desc"` | Direção da ordenação |
| `open` | `TemaGroupSection` | `boolean` | Estado colapsado/expandido da barra mãe |
| `open` | `ItemRow` | `boolean` | Estado expandido da DropZone por item |
| `over` | `DropZone` | `boolean` | Drag hover state |

### Dados Mock

Os dados estão hardcoded no componente `MRSStepTable` como `stepData: Record<number, StepItem[]>`. Cada `StepItem` contém:

```typescript
interface StepItem {
  id: string;
  tema: string;        // Agrupador de nível 1
  subtema: string;     // Classificação secundária
  documento: string;   // Nome do documento
  explicacao: string;  // Tooltip com descrição detalhada
  prioridade: Prioridade;
  status: Status;
  responsavel: string;
  prazo: string;
  comentarios: string;
  data_upload?: string;
}
```

---

## 7. Paleta de Cores e Design System

### Cores da Marca (Mary)

| Cor | Hex | Uso |
|---|---|---|
| White | `#FFFFFF` | Backgrounds |
| Anti-flash White | `#F4F4F5` | Cards, badges, containers (`bg-muted/30`) |
| Platinum | `#E4E4E7` | Bordas (`border-border`) |
| Eerie Black | `#18181B` | Textos, títulos, ícones |
| Burgundy | `#6F1822` | CTAs, FAB Mary AI |

### Cores Térmicas (Status e Score)

| Contexto | Vermelho | Âmbar | Verde |
|---|---|---|---|
| Badges de Status | `bg-red-100 text-red-700` | `bg-amber-100 text-amber-700` | `bg-green-100 text-green-700` |
| Score do Radar | 0-2 = Crítico | 3-4 = Parcial | 5 = Completo |
| Indicador Global | — | Bolinha âmbar `bg-amber-500` | — |

### Cores dos Botões de Passo

| Passo | Background | Ring (ativo) |
|---|---|---|
| 1 | `bg-blue-600` | `ring-blue-600` |
| 2 | `bg-red-500` | `ring-red-500` |
| 3 | `bg-amber-500` | `ring-amber-500` |
| 4 | `bg-green-500` | `ring-green-500` |

### Tokens do Design System

- Backgrounds de containers: `bg-muted/30`, `bg-muted/20`, `bg-muted/40`
- Textos primários: `text-foreground`
- Textos secundários: `text-muted-foreground`
- Bordas: `border-border`
- Cor primária (radar, DropZone hover): `hsl(var(--primary))`

---

## 8. Relação com Outras Funcionalidades

### → Radar de Investidores (`/ativo/radar`)

O score MRS é utilizado como **critério de filtro** no Radar de Investidores. Investidores podem definir um `readiness_score_min` em suas teses de investimento, e o Radar cruza esse requisito com o score MRS do ativo para determinar compatibilidade.

**Impacto:** Um score MRS alto melhora a posição do ativo nos resultados do matching com investidores.

### → Solicitações dos Investidores (`/ativo/solicitacoes`)

A página de Solicitações **reutiliza a mesma estrutura de tabela** do MRS (hierarquia de 3 níveis, DropZone, sub-headers ordenáveis), com as seguintes diferenças:

| Aspecto | MRS (`/ativo/rs`) | Solicitações (`/ativo/solicitacoes`) |
|---|---|---|
| Temas | 8 eixos temáticos por passo | "M&A Docs" e "Documentos Adicionais" |
| Coluna 6 | Comentários | Compartilhado com (seletor de visibilidade) |
| Propósito | Preparação interna | Atendimento a demandas de investidores |

### → VDR (Virtual Data Room)

Os documentos uploadeados via MRS alimentam o **data room virtual** do ativo. A tabela `asset_vdr_items` no Supabase armazena os metadados de cada documento, e a tabela `asset_vdr_nodes` registra os arquivos efetivamente enviados.

**Fluxo futuro:** MRS → Upload → Mary AI valida → Documento disponível no VDR → Advisor/Investidor acessa via `vdr_access`.

### → Pipeline de Investidores

O score MRS pode influenciar a progressão de investidores no pipeline. Investidores em fases mais avançadas (pós-NDA) podem exigir um score MRS mínimo para prosseguir.

---

## Apêndice: Componente MRSFolderTree

Além da `MRSStepTable`, existe um componente alternativo `MRSFolderTree` que apresenta os itens em formato de **árvore de pastas** usando Radix `Collapsible`. Este componente:

- Organiza por 7 pastas temáticas (Fundamentos, Financeiro, Operações, Capital Humano, Jurídico, Planejamento, M&A Docs)
- Cada pasta mostra prioridade (badge), score por eixo (X/5) e itens com DropZone individual
- Indica quais itens têm suporte de Mary AI (ícone `Bot`)
- Não está atualmente na rota `/ativo/rs` mas está disponível como componente importável

---

*Documento gerado para uso interno das equipes de Produto e Engenharia da Mary.*
