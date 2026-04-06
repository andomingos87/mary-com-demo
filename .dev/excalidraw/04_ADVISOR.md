# Mary — Jornada Completa do Usuário: ADVISOR

## Perfil
Boutique de M&A, assessor financeiro, advisor independente ou consultoria especializada. Representa ativos (empresas) perante investidores, ajuda na preparação dos processos de M&A e faz a intermediação entre as partes.

**Tooltip de perfil de atuação:**
> "Perfil de atuação são as práticas e teses que os advisors definem de acordo com sua estratégia de mercado. Ex: Uma boutique de M&A pode atuar com empresas de pequeno porte no segmento de tecnologia, outras podem atender apenas empresas de grande porte industriais, e assim por diante. A conta de um advisor pode abranger diversas teses e perfis de atuação."

---

## ETAPA 1 — Seleção de Perfil (Site Público)

**Rota:** `/` ou landing page pública

### Tela
- Apresentação da plataforma
- Botão CTA: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar Ativos e Investidores qualificados."*
- Copy alternativo para Advisors:
  > "Assessor, seja protagonista da nova era do mercado de M&A."
- Ao clicar, usuário seleciona seu perfil: **Ativo / Investidor / Advisor**

---

## ETAPA 2 — Pré-Cadastro

**Rota:** `/register/advisor` (rota pública: `/advise`)

### Campos
- Nome completo (nome real)
- Nome da empresa / boutique
- Email
- Senha
- Tipo de atuação (ADD para MVP): Contabilidade, Planejamento Financeiro, Conselheiro(a)

### Comportamento
- Auto-save a cada campo preenchido
- Todos os campos com tooltip
- Nota de produto: adicionar campos de Contabilidade, Planejamento Financeiro, Conselheiro(a) como opções de tipo de atuação

### CTA
- Botão: `[ Comece agora ]`

---

## ETAPA 3 — Onboarding (`/onboarding/advisor`) ⭐ CRÍTICO

> O onboarding do Advisor tem 2 passos. O objetivo é definir o perfil de atuação e vincular ativos que já assessora.

### Layout padrão do onboarding
- Header: `Mary | Início > Onboarding > Passo X`
- Mary AI disponível no header: `Mary AI ▼`
- Menu lateral esquerdo: `[ Radar ] [ Perfil ] [ Feed ] [ Projetos ]`
- Indicador de progresso: `[ Passo 1 ] [ Passo 2 ]`
- Rodapé: nome real do usuário + nome da empresa + `+ Convidar membro`

---

### Passo 1 — Defina seu Perfil de Atuação

**Título:** "Defina seu Perfil de Atuação"

**Tooltip geral do passo:**
> "Você poderá cadastrar outros perfis de atuação depois, não se preocupe."

**Campos:**

| Campo | Tipo | Tooltip |
|---|---|---|
| Nome real do responsável | Text (auto-filled do cadastro, editável) | — |
| Nome da empresa/boutique | Text (auto-filled do cadastro, editável) | — |
| Descrição do perfil de atuação | Textarea | "Descreva sua tese de modo que os Ativos e Investidores possam entender seus critérios de atuação. Esta descrição é fundamental para promover o melhor match entre advisors, empresas e investidores." |
| Setores-alvo de atuação | Multi-select | "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match." |
| Regiões de atuação | Select em 2 passos | Continente → Países |
| Porte das empresas-alvo | Select | Pequeno, Médio, Grande porte |
| Tipo de operação preferida | Multi-select | M&A sell-side, M&A buy-side, Captação, Reestruturação, etc. |

**Nota sobre campos auto-filled:**
> "Por padrão, campos auto-filled devemos deixar editáveis para o usuário poder corrigir ou deixar a seu gosto."

**Tooltip adicional para setores:**
> "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match."

**Mary AI — mensagem contextual após preenchimento:**
> "Com base nas informações fornecidas, identificamos ativos e investidores potencialmente compatíveis com seu perfil. Continue para refinar seu perfil de atuação."

**CTA:** `[ > Passo 2 ]`

---

### Passo 2 — Quem Você Já Assessora?

**Título:** "Quem você já assessora?"

**Nota de privacidade (exibida no topo):**
> "Não se preocupe! Esses dados nunca são exibidos publicamente. Apenas usuários cadastrados na Mary, após NDA assinado e autorizados, poderão visualizar os detalhes completos."

**Campos:**

| Campo | Tipo | Observação |
|---|---|---|
| Ativos que já assessora | Lista de empresas | Nome da empresa, email do responsável, CNPJ |
| Convidar membro | Input + botão | Adicionar membros da sua equipe |

**Pergunta contextual:**
> "Gostaria de contatar possíveis Ativos (empresas) ou Investidores, interessados em contratar Advisors?"

- `[ Sim ]` → sistema registra intenção e habilita leads de captação
- `[ Não ]` → segue sem essa funcionalidade

**Nota de produto — vínculo automático:**
> "Ao se cadastrar com seu convite, o Ativo será automaticamente vinculado à sua conta de Advisor. Após esta etapa, você poderá acessar a área de membros autorizados e incluir novos Investidores."

**Ao finalizar:**
- Botão: `[ Concluir cadastro ]`
- Redirecionamento automático para **Radar**

---

## ÁREA LOGADA — Layout padrão do Advisor

### Header
```
Mary | Início > [página atual]                    Mary AI ▼
```

### Menu lateral
```
[ Radar ]
[ Perfil ]
[ Feed ]
[ Projetos ]
```

### Rodapé / Perfil
```
[Nome Real]
[Company Name]
+ Convidar membro
```

---

## TELA: Radar de Oportunidades (Leads)

**Rota:** `/advisor/radar`

### Descrição
O Radar do Advisor tem a mesma lógica e estrutura do Radar em Ativos e Investidores, mas com duas abas especiais que representam os dois lados do negócio do Advisor.

### Controles da tela
```
[ Radar ] [ Perfil ] [ Feed ] [ Projetos ]
[ Leads Sell Side ]   [ + Investidores ]
```

### Tooltips das abas

**`[ Leads Sell Side ]`:**
> "Gerar, encontrar Ativos para fechar novos mandatos."

**`[ + Investidores ]`:**
> "Screening, long list para encontrar mais Investidores aderentes e qualificados para adquirir ou investir em seus clientes (Empresas/Ativos)."

---

### Aba: Leads Sell Side

**Descrição:** Encontrar ativos (empresas) para fechar novos mandatos como advisor.

**Exibe:** Cards de oportunidades de ativos que podem precisar de assessoria, filtrados pelo perfil de atuação do advisor.

**CTAs ao ver detalhes:**
- `[ Ver Teaser ]` → abre modal com o teaser do ativo (anonimizado)
- `[ Ofertar Serviços ]` → sistema envia email automático ao responsável do Ativo

**O que acontece ao clicar `[ Ofertar Serviços ]`:**
- Sistema envia email para o responsável do Ativo com link do perfil do Advisor
- Mensagem Mary padrão:
  > "Olá [Fulano], o(a) advisor [Zezito] da [NOME DA EMPRESA DO ADVISOR] encontrou o perfil da [EMPRESA/ATIVO] na Mary e gostaria de ofertar seus serviços. Abaixo o email dele para que possa fazer contato direto, apresentar seu projeto e solicitar uma proposta. A Mary deseja boa sorte e bons negócios. Qualquer dúvida, só entrar em contato conosco."

---

### Aba: + Investidores

**Descrição:** Screening e long list para encontrar investidores aderentes e qualificados para adquirir ou investir nos ativos que o advisor representa.

**Nota de produto:**
> "Para encontrar Investidores aderentes à tese dos seus clientes (Ativos), é necessário que estes se cadastrem na Mary."

**Fluxo:**
```
Radar > novo lead > envia proposta > assina contrato > envia pedido acesso
```

**Alternativa para cadastrar ativo de fora:**
```
Projetos > + Novo Projeto > Nome, email e CNPJ > Mary busca na base > se não tiver, envia pedido de cadastro para o Ativo
```

---

## TELA: Perfil de Atuação

**Rota:** `/advisor/perfil`

### Header
```
Mary | Início > Perfil                    Mary AI ▼
[ Radar ] [ Perfil ] [ Feed ] [ Projetos ]
[ + Nova Atuação ]   [ Atuação 1 ]   [ Atuação 2 ]
```

### Comportamento
- Advisor pode ter **múltiplos perfis de atuação** (ex: uma tese para tech, outra para industrial)
- Cada perfil/atuação é uma aba separada
- `[ + Nova Atuação ]` cria nova aba e novo perfil

### Conteúdo de cada aba de atuação

```
Perfil de Atuação 1
Editada em 06/03/2026, às 14:35h, por Username.

[Todos os campos do onboarding do Advisor, editáveis]

Campos:
- Descrição do perfil
- Setores-alvo
- Regiões
- Porte das empresas-alvo
- Tipo de operação preferida
- Etc.
```

**Tooltip do perfil:**
> "Perfil de atuação são as práticas e teses que os advisors definem de acordo com sua estratégia de mercado."

**Nota de produto:**
> "Nome da Atuação pode ser editável."

### Botões disponíveis
- `Share` — compartilhar perfil com equipe (abre modal)
- `Aprovar` — pedir revisão/aprovação (abre modal)
- `Editar` — edição direta do perfil

> **Nota UX:** Refinar a experiência dos 3 botões (Share, Aprovar, Editar).

---

## TELA: Feed

**Rota:** `/advisor/feed`

### Descrição
Atualizações de projetos, ativos e investidores que o advisor segue ou gerencia.

### Controles
```
[ Radar ] [ Perfil ] [ Feed ] [ Projetos ]
[ Todos ]   [ Selecione um Ativo ou Investidor ▼ ]
```

### Conteúdo do Feed
- Movimentações de projetos dos clientes (ativos)
- Atualizações de investidores que segue
- Alertas de novos leads
- Notificações de progresso no pipeline

### Email semanal automático
- Enviado ao advisor com resumo de movimentações dos projetos, ativos e investidores que segue
- Objetivo: manter engajamento

---

## TELA: Projetos — Visão do Portfólio

**Rota:** `/advisor/projetos`

### Descrição
Visão consolidada do portfólio de clientes (ativos) do advisor. Lista todos os projetos que o advisor gerencia.

### Controles
```
[ Radar ] [ Perfil ] [ Feed ] [ Projetos ]
[ + Novo Projeto ]   [ Todos ]   [ Busca ]
```

### Tabela de projetos

| Coluna | Exemplo |
|---|---|
| Projeto | Projeto A (clicável) |
| Responsável | João Silva |
| Etapa | NBO |
| Tipo | Sell Side / Buy Side |
| Enviar Email | ✉ |

**Exemplos de linha:**
```
Projeto A  | João Silva  | NBO  | Sell Side  | ✉
Projeto B  | Ana Costa   | NDA  | Sell Side  | ✉
Projeto C  | Pedro Melo  | NDA  | Buy Side   | ✉
```

**Nota de produto:**
> Nome do Projeto é clicável. Quando clica, leva direto para o Resumo do projeto, pois já tem acesso.

---

### Fluxo: + Novo Projeto

**Fluxo completo:**
```
Projetos > [ + Novo Projeto ] > Nome, email e CNPJ > 
  ↓
Mary busca na base:
  - Se encontrar → vincula o ativo ao projeto do advisor automaticamente
  - Se não encontrar → envia pedido de cadastro para o ativo
```

**Ao se cadastrar com o convite do advisor:**
- O ativo é **automaticamente vinculado** à conta do advisor
- Advisor pode acessar a área de membros autorizados
- Advisor pode incluir novos investidores no projeto

---

### Tela: Resumo do Projeto (visão do advisor)

**Rota:** `/advisor/projetos > [projeto] > Resumo`

**Breadcrumb:** `Início > Projetos > Tiger > Resumo`

**Campos exibidos:**

| Campo | Exemplo |
|---|---|
| Nome do projeto | Projeto Tiger |
| Início do projeto | 10/01/2026 |
| Responsável | Fulano |
| Tipo de deal | Venda Integral ou Captação |
| Valor alvo | R$ 100M |
| Participação alvo | 100% |
| Advisors do projeto | Pessoa 1 — Nome, celular, email, função/cargo |
| Visibilidade | Radar Mary |

**Abas disponíveis para o advisor:**
```
[ Resumo ]   [ MRS ]   [ + Info ]
```

---

## Permissões do Advisor dentro de um Projeto de Ativo

> **Default da plataforma:** O Advisor tem **permissão total para edição** dos projetos dos clientes (ativos).

| Ação | Advisor pode? |
|---|---|
| Visualizar todos os dados do projeto | ✅ Sim |
| Editar todos os campos do projeto | ✅ Sim |
| Editar Teaser, Valuation, Deck/CIM | ✅ Sim |
| Adicionar documentos ao VDR | ✅ Sim |
| Convidar investidores | ✅ Sim |
| Editar permissões administrativas do cliente | ❌ Não |
| Editar faturamento da conta do cliente | ❌ Não |

---

## Fluxos Cruzados (Advisor ↔ outros usuários)

### Advisor convida Ativo externo
1. Acessa `Projetos > [ + Novo Projeto ]`
2. Informa nome, email e CNPJ da empresa
3. Mary busca na base — se não encontrar, envia pedido de cadastro
4. Ativo recebe email de convite
5. Ao se cadastrar com o convite, é vinculado automaticamente ao advisor

### Advisor oferta serviços para Ativo via Radar
1. Acessa Radar → aba `[ Leads Sell Side ]`
2. Encontra ativo de interesse
3. Clica `[ Ver Teaser ]` para avaliar
4. Clica `[ Ofertar Serviços ]`
5. Sistema envia email automático ao responsável do ativo

### Advisor inclui Investidor no projeto de um cliente
1. Acessa projeto do cliente → aba `[ Investidores ]`
2. Clica `[ + Convidar Investidores ]`
3. Busca investidor na base ou convida externamente
4. Investidor convidado recebe acesso progressivo conforme avanço do pipeline

### Advisor vincula conta com Ativo já cadastrado
1. Ativo recebe convite com link especial do advisor
2. Ao se cadastrar, vínculo é criado automaticamente
3. Advisor passa a ter acesso total ao projeto do ativo
4. Advisor pode incluir membros e investidores no projeto
