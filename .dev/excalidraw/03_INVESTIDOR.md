# Mary — Jornada Completa do Usuário: INVESTIDOR

## Perfil
Fundo de Private Equity, Corporate, Family Office ou investidor individual que busca oportunidades de investimento ou aquisição de empresas (ativos). Utiliza a plataforma para descobrir, filtrar e acompanhar oportunidades qualificadas com base em suas teses de investimento.

---

## ETAPA 1 — Seleção de Perfil (Site Público)

**Rota:** `/` ou landing page pública

### Tela
- Apresentação da plataforma
- Botão CTA: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar inúmeros Ativos qualificados."*
- Ao clicar, usuário seleciona seu perfil: **Ativo / Investidor / Advisor**

---

## ETAPA 2 — Pré-Cadastro

**Rota:** `/onboarding/investor/pre-registration`

### Campos
- Nome completo (nome real)
- Nome da empresa / fundo
- Email
- Senha

### Comportamento
- Auto-save a cada campo preenchido
- Todos os campos com tooltip
- Nota no topo:
  > "Sistema salva dados automaticamente após inseri-los, sem precisar usar botões de Salvar."

### CTA
- Botão: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar inúmeros Ativos qualificados."*

---

## ETAPA 3 — Onboarding (`/onboarding/investor`) ⭐ CRÍTICO

> O onboarding do Investidor tem 2 passos. O objetivo principal é configurar a **primeira Tese de Investimento**, que será usada para filtrar os ativos no Radar.

### Layout padrão do onboarding
- Header: `Mary | Início > Onboarding > Passo X`
- Mary AI disponível no header: `Mary AI ▼`
- Menu lateral esquerdo: `[ Radar ] [ Teses ] [ Feed ] [ Projetos ]`
- Indicador de progresso: `[ Passo 1 ] [ Passo 2 ]`
- Rodapé: nome real do usuário + nome da empresa + `+ Convidar membro`

---

### Passo 1 — Crie sua Primeira Tese de Investimento

**Título:** "Crie sua primeira Tese de Investimento"

**Nota UX:**
- Após o onboarding, a aba chama-se `[ Selecionar teses ▼ ]`, mas vai direto para Tese 1 por padrão
- Nome das teses é definido pelo próprio investidor

**Tooltip geral do passo:**
> "Você poderá cadastrar outras teses de investimento depois, não se preocupe."

**Campos:**

| Campo | Tipo | Tooltip |
|---|---|---|
| Nome da tese | Text | Ex: "Edtechs", "Fintechs Series A" |
| Descrição da tese | Textarea | "Descreva sua tese de modo que os Ativos possam entender seus critérios macro. Esta descrição é fundamental para promover o melhor match entre empresas e investidores." |
| Setores-alvo de investimento | Multi-select | "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match." |
| Público-alvo da empresa-alvo | Select/text | Tipo de cliente que a empresa-alvo deve ter (B2B, B2C, etc.) |
| Regiões prioritárias de investimento | Select em 2 passos | Continente → Países |
| ROB mínimo (últimos 12 meses) | Moeda | Receita Operacional Bruta mínima |
| ROB máximo (últimos 12 meses) | Moeda | Receita Operacional Bruta máxima |
| EBITDA % mínimo | Percentual | — |
| Cheque mínimo | Moeda | Valor mínimo que o investidor está disposto a aportar |
| Cheque máximo | Moeda | Valor máximo que o investidor está disposto a aportar |

**Nota sobre campos auto-filled:**
> "Por padrão, campos auto-filled devemos deixar editáveis para o usuário poder corrigir ou deixar a seu gosto."

**Mary AI — mensagem contextual após preenchimento:**
> "Com base nas informações fornecidas, identificamos ativos potencialmente compatíveis com seu perfil. Continue para refinar sua tese de investimento."

**CTA:** `[ > Passo 2 ]`

---

### Passo 2 — Refine sua Primeira Tese de Investimento

**Título:** "Refine sua primeira tese de investimentos"

**Nota de privacidade (exibida no topo):**
> "Não se preocupe! Esses dados nunca são exibidos publicamente. Apenas usuários cadastrados na Mary, após NDA assinado e autorizados, poderão visualizar os detalhes completos."

**Campos adicionais de refinamento:**

| Campo | Tipo | Tooltip |
|---|---|---|
| Estágio da empresa-alvo | Multi-select | Seed, Série A, Série B, Growth, Late Stage, Lucrativa, etc. |
| Tipo de operação preferida | Multi-select | Participação minoritária, majoritária, venda integral, etc. |
| Critérios de exclusão | Textarea | Setores, perfis ou características que o investidor NÃO quer |
| Informações adicionais | Textarea | Qualquer critério complementar |

**Ao finalizar:**
- Tela de sucesso:
  > "Cadastro finalizado com sucesso. Seu perfil e tese foram configurados e protegidos na Mary. Agora você já pode acessar e ver seu Radar de Oportunidades."
- Botão: `[ Ver meu Radar ]`
- Redirecionamento automático para o **Radar**

---

## ÁREA LOGADA — Layout padrão do Investidor

### Header
```
Mary | Início > [página atual]                    Mary AI ▼
```

### Menu lateral
```
[ Radar ]
[ Teses ]
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

## TELA: Radar de Oportunidades

**Rota:** `/investidor/oportunidades`

### Descrição
O Radar mostra ativos (oportunidades de investimento) **anonimizados** e filtrados pela tese de investimento ativa. O investidor navega por cards de oportunidades sem saber o nome real da empresa até assinar o NDA.

### Controles da tela
```
[ Radar ] [ Teses ] [ Feed ] [ Projetos ]
[ Tese 1 ▼ ]     MRS Mínimo   0 ————————— 100    [ + Convidar Ativo ]
```

| Controle | Descrição |
|---|---|
| `[ Selecionar teses ▼ ]` | Seleciona qual tese de investimento filtrar. Primeira tese ativa por padrão após onboarding. |
| `MRS Mínimo` slider | Investidor pode mexer na chave para filtrar ativos pelo MRS mínimo (0 a 100) |
| `[ + Convidar Ativo ]` | Convida uma empresa que o investidor conhece para se cadastrar no Radar |

**Nota de produto — ponto importante:**
> A primeira tese de investimentos cadastrada deve vir **selecionada por padrão** no Radar de oportunidades, a fim de mostrar os ativos com match corretamente.

### Cards de oportunidades
- Oportunidades **anonimizadas** — investidor vê informações básicas sem nome real
- Informações básicas visíveis para ajudar a avaliar o match
- Botão **`Ver Detalhes`** em cada card

### Card especial no final da grid
> "Conhece uma empresa? Convide para o Radar."
- Funciona como CTA contextual dentro dos resultados
- Estimula deal flow próprio do investidor

---

### Modal: Ver Detalhes de uma Oportunidade

Ao clicar em "Ver Detalhes", abre modal com mais informações do ativo. Existem **3 cenários possíveis**:

---

#### Cenário 1 — Ativo Pré-Cadastrado (lista fria)

**Situação:** Empresa foi adicionada pela Mary AI via scraping (nome, site, email), mas ainda não entrou formalmente na plataforma.

**O que aparece:**
- Teaser "básico" gerado automaticamente pela Mary AI com dados públicos
- Mensagem na tela:
  > "Esta empresa ainda não possui Readiness Score calculado."

**CTA único:** `[ Acompanhar este Ativo ]`

**O que acontece ao clicar:**
1. Email automático enviado ao ativo:
   > "Há um novo investidor interessado em sua empresa. Se for do seu interesse, cadastre sua empresa na Mary gratuitamente e comece a se preparar para um possível investimento."
2. O ativo começa a aparecer no menu **Feed** do investidor (Atualizações)
3. Se o ativo se cadastrar, o card evolui automaticamente para o Cenário 2

---

#### Cenário 2 — Ativo Cadastrado na Mary

**Situação:** Empresa se cadastrou formalmente na Mary. Tem MRS calculado.

**O que aparece:**
- Teaser mais completo (com mais informações de base)
- MRS do ativo exibido
- Badge identificando que tem MRS

**CTAs variam de acordo com sub-cenário:**

**Cenário 2.1 — Ativo tem Advisor:**
- `[ Acompanhar este Ativo ]`
- `[ Contatar Advisor ]`

**Cenário 2.2 — Ativo não tem Advisor:**
- `[ Acompanhar este Ativo ]`
- `[ Contatar Empresa ]`

**O que acontece ao "Acompanhar":**
- Ativo começa a aparecer no menu **Feed** (Atualizações)
- Email automático da Mary AI notifica o ativo sobre o interesse

---

#### Sobre o Teaser (exibido no modal)

O Teaser é o documento anonimizado do ativo. Estrutura básica:
```
Capa
  - Descrição da empresa
  - Segmento e tempo de operação
  - Faturamento e posicionamento de mercado

Mercado
  - Informações sobre o mercado-alvo

Detalhes
  - Objetivo da operação (captação/venda)
  - Prazo esperado

Dados
  - KPIs e métricas principais (número de clientes, crescimento, etc.)
```

---

### Fluxo: Investidor Convida Ativo Externo

> O investidor está no Radar, vê oportunidades filtradas pela tese, mas conhece empresas que **não estão na base**. Isso é extremamente comum em M&A — o investidor tem deal flow próprio (eventos, indicações, mercado).

**Fluxo:**
```
Radar → Ver Detalhes → CTA: [ Enviar Convite para o Ativo ]
```

**Nota de produto:**
> Do ponto de vista M&A, o mínimo necessário para a Mary AI gerar um teaser básico e enviar um convite qualificado:
> - Mary AI scrapes o website e gera um card de pré-cadastro (Cenário 1)
> - O ativo aparece no Radar do investidor com badge "Pré-cadastro" e teaser básico
> - Um e-mail de convite é enviado ao ativo

---

## TELA: Teses de Investimento

**Rota:** `/investidor/teses`

### Header
```
Mary | Início > Teses                    Mary AI ▼
[ Radar ] [ Teses ] [ Feed ] [ Projetos ]
[ + Nova Tese ]   [ Edtechs ]   [ Fintechs ]   [ Tese 3 ]
```

### Aba por tese — campos exibidos

```
Nome da Tese: Edtechs
Editada em 06/03/2026, às 14:35h, por Username.

Campos do onboarding do Investidor (todos editáveis):

Setores-alvo de Investimento:
Público-alvo da empresa-alvo:
Regiões prioritárias de investimento:
Detalhes da Tese:
ROB mínimo (últimos 12 meses):
ROB máximo (últimos 12 meses):
EBITDA % mínimo:
Cheque mínimo:
Cheque máximo:
```

### Botões
- `Share` — compartilhar tese com equipe
- `Aprovar` — pedir revisão/aprovação de alguém
- `Editar` — edição direta

> **Nota UX:** Refinar a experiência dos 3 botões (Share, Aprovar, Editar).

---

## TELA: Feed / Atualizações

**Rota:** `/investidor/atualizacoes`

### Descrição
Feed com as movimentações de todos os ativos que o investidor está acompanhando, em uma única página consolidada.

### Controles
```
[ Radar ] [ Teses ] [ Feed ] [ Projetos ]
[ Todos ]   [ Selecione um projeto ▼ ]     [ + Convidar Ativo ]
```

| Controle | Descrição |
|---|---|
| `[ Todos ]` | Exibe atualizações de todos os ativos seguidos |
| `[ Selecione um projeto ▼ ]` | Filtra por um ativo específico |
| `[ + Convidar Ativo ]` | Convida nova empresa para o Radar |

### Conteúdo do Feed
- Movimentações e atualizações internas na Mary
- Atualizações no MRS dos ativos acompanhados
- Documentos novos adicionados pelos ativos
- Notificações de progresso no pipeline

### Mary AI no Feed
- Sempre disponível no canto inferior direito
- Acesso contextual ao banco de dados do cliente
- Base de conhecimento externa de FAQ da plataforma

### Nota de produto — ideia futura
> Mary AI pode popular as atualizações com informações externas de mercado via API de ferramenta de clippings.

### Email semanal automático
- Enviado para o investidor com resumo de movimentações dos ativos que segue
- Objetivo: manter engajamento

---

## TELA: Projetos

**Rota:** `/investidor/projetos`

### Descrição
Visão de todos os projetos de ativos em que o investidor está envolvido. A "home" dos Projetos é o **kanban**.

### Controles
```
[ Radar ] [ Teses ] [ Feed ] [ Projetos ]
[ Todos ]   [ Busca ]                      [ + Convidar Ativo ]
```

- Campo de busca: **busca semântica** para nomes de projetos, empresas, segmentos, etc.
- Clicar no card de um projeto → leva direto para o **Resumo do projeto**

---

### Tela: Resumo do Projeto (visão do investidor)

**Rota:** `/investidor/projetos > [projeto] > Resumo`

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
| Visibilidade do projeto | Radar Mary |

**Abas disponíveis para o investidor:**
```
[ Resumo ]   [ MRS ]   [ + Info ]
```

> O investidor acessa o projeto de forma **sequencial e progressiva** — cada aba vai se desbloqueando conforme o avanço do processo.

---

### Tela: MRS do Projeto (visão do investidor)

**Rota:** `/investidor/projetos > [projeto] > MRS`

**Comportamento de liberação progressiva:**

| Evento | O que é liberado |
|---|---|
| Investidor assina NDA | Passos 1 e 2 do MRS |
| Passos 3 e 4 | Desativados até assinatura do NBO |
| Investidor assina NBO | Passos 3 e 4 do MRS liberados |
| Investidor assina SPA | Sistema automaticamente muda status para "Fechado" |

**Nota de produto:**
> Após NDA assinado, sistema libera Passos 1 e 2 do MRS para Investidor. Passo 3 e 4 ficam desativados enquanto Investidor não assinar NBO. Após NBO assinada, sistema libera Passos 3 e 4.

---

### Tela: + Info do Projeto (visão do investidor)

**Rota:** `/investidor/projetos > [projeto] > + Info`

**Conteúdo:**
- Q&As do investidor com o ativo
- Documentos adicionais compartilhados
- Materiais específicos do processo de M&A

---

## Fluxos Cruzados (Investidor ↔ outros usuários)

### Investidor recebe convite de Advisor
- Advisor identifica investidores aderentes às teses dos seus clientes (ativos)
- Para encontrar investidores aderentes, é necessário que os ativos estejam cadastrados na Mary

### Investidor convida Ativo externo
1. Acessa Radar → `[ + Convidar Ativo ]`
2. Informa nome da empresa, email e CNPJ
3. Mary AI busca na base — se não encontrar, envia pedido de cadastro para o ativo
4. Ativo recebe email de convite e pode se cadastrar
5. Ao se cadastrar, o card do ativo evolui de Cenário 1 para Cenário 2 no Radar do investidor
6. Ativo é automaticamente adicionado à lista de Atualizações (Feed) do investidor

### Investidor acompanha um ativo
1. Clica "Acompanhar este Ativo" no modal Ver Detalhes
2. Ativo começa a aparecer no Feed do investidor
3. Sistema envia email automático ao ativo informando o interesse
