# Mary — Jornada Completa do Usuário: ATIVO

## Perfil
Empresa (startup, PME ou grande empresa) que busca **captação de investimento** ou **venda integral/parcial**. Representada por seus sócios, CFO ou equipe de M&A, e frequentemente assessorada por um Advisor.

---

## ETAPA 1 — Seleção de Perfil (Site Público)

**Rota:** `/` ou landing page pública

### Tela
- Apresentação da plataforma
- Botão CTA: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar os melhores investidores do Brasil."*
- Ao clicar, usuário seleciona seu perfil: **Ativo / Investidor / Advisor**

---

## ETAPA 2 — Pré-Cadastro

**Rota:** `/register/asset`

### Campos
- Nome completo (nome real)
- Nome da empresa
- Email
- CNPJ (opcional neste momento, usado para busca na base)
- Senha

### Comportamento
- Sistema verifica se a empresa já existe na base
- Se não existir, cria registro novo
- Auto-save a cada campo preenchido
- Todos os campos com tooltip

### CTA
- Botão: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar os melhores investidores do Brasil."*

### Nota técnica
- Sistema salva dados automaticamente após inserção, sem botões de salvar
- Dar feedback visual claro (check ou texto em verde) que cada dado foi salvo

---

## ETAPA 3 — Onboarding (`/onboarding/asset`) ⭐ CRÍTICO

> O onboarding do Ativo é o mais longo e crítico da plataforma. Tem 4 passos. Dados coletados aqui alimentam o matching com investidores, o MRS e a geração de documentos pela Mary AI.

### Layout padrão do onboarding
- Header: `Mary | Início > Onboarding > Passo X`
- Mary AI disponível no header: `Mary AI ▼`
- Menu lateral esquerdo: `[ MRS ] [ Radar ] [ Feed ]`
- Indicador de progresso: `[ Passo 1 ] [ Passo 2 ] [ Passo 3 ] [ Passo 4 ]`
- Rodapé: nome real do usuário + nome da empresa + `+ Convidar membro`

---

### Passo 1 — Dados da Empresa

**Título:** "Conte-nos um pouco sobre sua empresa."

**Campos:**

| Campo | Tipo | Tooltip |
|---|---|---|
| Nome real do responsável | Text (auto-filled do cadastro, editável) | — |
| Nome da empresa | Text (auto-filled do cadastro, editável) | — |
| Descrição da empresa | Textarea longa | "Descreva sua empresa de modo que os investidores possam entender seu negócio sob o ponto de vista de suas teses de investimento. Esta descrição é fundamental para promover o melhor match entre empresas e investidores." |
| Objetivo do projeto | Select | Ver opções abaixo |
| Modelo de negócio | Multi-select | — |
| Setor de atuação | Multi-select | "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match." |
| Regiões de atuação | Select em 2 passos | "2 passos: mostra continentes primeiro, depois países do continente selecionado. Opção de selecionar todos os países de um continente." |

**Opções do campo "Objetivo do projeto":**

*Se CAPTAÇÃO DE INVESTIMENTO selecionada:*
| Opção | Tooltip |
|---|---|
| Expansão e Crescimento | Financiar abertura de novas filiais, expansão geográfica ou aumento de capacidade produtiva. |
| Desenvolvimento de Produtos/Inovação | Investir em P&D, lançar novas tecnologias ou inovar no mercado. |
| Capital de Giro (Working Capital) | Reforçar o caixa para cobrir despesas operacionais, aumentar estoques ou suportar crescimento rápido. |
| Marketing e Vendas | Financiar campanhas de branding, aquisição de clientes e expansão da equipe comercial. |
| Atração de Talentos | Contratar mão de obra qualificada para posições chave. |
| Fortalecimento da Estrutura | Melhorar a governança e a tecnologia interna da empresa. |

*Se VENDA INTEGRAL selecionada:*
| Opção | Tooltip |
|---|---|
| Retirada de Capital (Cashing Out) | Realizar o lucro após anos de trabalho duro, convertendo o valor da empresa em liquidez pessoal. |
| Mudança de Estilo de Vida ou Cansaço (Burnout) | Desejo de se aposentar, passar mais tempo com a família ou reduzir o estresse. |
| Falta de Sucessão | Ausência de herdeiros ou gestores preparados para assumir o negócio. |
| Novas Oportunidades | Vender para investir em outro setor, iniciar um novo negócio ou buscar novos desafios. |
| Disputas de Sócios | Conflitos entre parceiros de negócios que tornam a operação inviável. |
| Riscos de Mercado/Mudanças | Antecipar-se a mudanças no setor (disrupção tecnológica) ou dificuldades financeiras. |
| Proposta Irrecusável | Receber uma oferta estratégica de um concorrente ou fundo de investimento. |

**Opções do campo "Modelo de negócio":**
- B2B (Business to Business)
- B2C (Business to Consumer)
- B2B2C (Business to Business to Consumer)
- B2G (Business to Government)

**Mary AI — mensagem contextual após preenchimento:**
> "Com base nas informações fornecidas, identificamos investidores potencialmente compatíveis com seu perfil. Continue para refinar seu perfil e se preparar."

**CTA:** `[ > Passo 2 ]`

---

### Passo 2 — Dados Mínimos para Matching

**Título:** "Forneça alguns dados mínimos para matching"

**Nota de privacidade (exibida no topo da tela):**
> "Não se preocupe! Esses dados nunca são exibidos publicamente. Apenas investidores com tese compatível, após NDA assinado e autorizados, poderão visualizar os detalhes completos."

**Campos:**

| Campo | Tipo | Observação |
|---|---|---|
| Receita Operacional Bruta (ROB) — últimos 12 meses | Número/moeda | Dado financeiro sensível |
| EBITDA % | Número/percentual | Dado financeiro sensível |
| Número de funcionários | Número | — |
| Ano de fundação | Ano | — |
| Localização da sede | Select (cidade/estado) | — |
| Participação ofertada | Percentual | % que o ativo está disposto a vender/diluir |
| Valor alvo | Moeda | Valor esperado da operação |

> Todos os campos com tooltips explicativas.

**CTA:** `[ > Passo 3 ]`

---

### Passo 3 — Quem Está ao Seu Lado Nessa Jornada?

**Rota de referência:** `#heading=h.y34jx1jojoco`

**Título:** "Quem está ao seu lado nessa jornada?"

**Campos:**

| Campo | Tipo | Observação |
|---|---|---|
| Sócios da empresa | Lista de membros | Nome, email, função/cargo de cada sócio |
| Advisors do projeto | Lista de membros | Nome, email, empresa, função |
| Convidar membro | Input + botão | Adicionar novos membros ao projeto |

**Tooltip para campo de Advisors:**
> "A Mary pode te ajudar com isso, enviando seu contato para advisors da nossa rede que possuam match potencial com seu negócio. Você não tem nenhum compromisso de atender ou contratar nenhum deles, isso fica a seu critério."

**CTA:** `[ > Passo 4 ]`

---

### Passo 4 — Codinome do Projeto (Confidencialidade)

**Título:** "Último passo para sua segurança e confidencialidade"

**Subtítulo:**
> "Agora vamos criar um codinome para o seu projeto de captação ou venda."

**Explicação:**
> "Você pode criar seu próprio codinome ou pedir para a Mary sugerir um automaticamente."

**Tooltip do campo codinome:**
> "Essa é uma prática comum no mercado para proteger a confidencialidade da sua empresa. Quando investidores encontrarem seu projeto na Mary, eles verão apenas esse codinome, nunca o nome ou dados sensíveis da empresa. Os investidores só terão acesso aos dados da sua empresa após assinatura do NDA. Fique tranquilo! Você controla e ajusta Quem, Como e Quando acessar os dados da sua empresa e do seu projeto."

**Campos:**

| Campo | Tipo | Observação |
|---|---|---|
| Codinome do projeto | Text | Ex: "Projeto Tiger". Aparece no Radar em lugar do nome real. |
| Sugestão automática | Botão | Mary AI sugere um codinome automaticamente |

**Nota de produto:**
- A partir daqui, o codinome começa a aparecer no menu lateral: `[ Projeto Tiger ]`

**CTA:** `[ Concluir cadastro ]`

**Após concluir:**
- Modal animado de parabéns e boas-vindas
- Mensagem:
  > "Cadastro finalizado com sucesso. Seu projeto foi configurado e protegido na Mary. Agora você já pode acessar e ver seu Market Readiness Score (MRS)."
- Redirecionamento automático para: **MRS**
- Botão: `[ Ver meu MRS ]`

---

### Pós-Onboarding — Mary AI (automático)

Imediatamente após o onboarding, a Mary AI executa em background:

1. Coleta todos os campos preenchidos
2. Executa agente "deep research" para levantar informações públicas sobre o ativo (site, notícias, LinkedIn, etc.)
3. Gera automaticamente:
   - **Dossiê da empresa**: resumo executivo, pontos de destaque, SWOT, timeline
   - **MRS inicial**: score baseado nos documentos e informações disponíveis
   - **Primeira versão do Teaser**: documento anonimizado de apresentação
4. Dossiê alocado no VDR em Q&As — funciona como base para RAG do ativo

**Nota técnica:**
> Após finalizar o Onboarding, o Radar do Ativo já tem condições de filtrar Investidores que tenham tese aderente ao projeto recém criado. Ex: "5 investidores encontrados".

---

## ÁREA LOGADA — Layout padrão do Ativo

### Header
```
Mary | Início > [página atual]                    Mary AI ▼
```

### Menu lateral
```
[ MRS ]
[ Radar ]
[ Feed ]
[ Projeto Tiger ▼ ]   ← codinome do projeto ativo
```

### Rodapé / Perfil
```
[Nome Real]
[Company Name]
+ Convidar membro
```

---

## TELA: MRS — Market Readiness Score

**Rota:** `/ativo/rs`

### Descrição
Score de 0 a 100 que reflete a maturidade do ativo para um processo de M&A. Calculado com base nos documentos enviados para o VDR.

### Componentes da tela
- Score atual em destaque (ex: 45)
- Breakdown por categoria (passos 1 a 4)
- Indicação de quais documentos faltam para aumentar o score
- Botão: `Share`

### Notas técnicas críticas
- Definir **tamanho máximo** para upload dos arquivos
- Definir **formatos de arquivos permitidos**
- Mary AI precisa interpretar os arquivos para ter dados para o cálculo

---

## TELA: Radar de Investidores

**Rota:** `/ativo/radar`

### Descrição
Lista de investidores com tese compatível com o perfil do ativo. Oportunidade de enviar o Teaser e iniciar o processo de M&A.

### Filtros e controles
- `[ Projeto Tiger ▼ ]` — seletor de projeto ativo
- `MRS Atual: 45` — exibido ao lado do nome do projeto
- `[ + Convidar Investidores ]` — botão fixo (estimula efeito de rede)
- `[ Todos ] [ Selecione um investidor ▼ ]` — filtro por investidor específico

### Tabela de investidores

| Coluna | Descrição |
|---|---|
| Investor | Nome do investidor (clicável → perfil) |
| Tipo | Private Equity / Corporate / Individual |
| Sobre | Descrição textual do investidor |
| Aquisições e Investimentos | Lista de investimentos anteriores |
| Racional Estratégico | Texto da tese do investidor |
| Contato | Nome do responsável |
| Responde | Frequência de resposta (Sempre / Frequentemente / Ocasionalmente / Raramente / Nunca) |
| 💬 | Chat direto |
| ✉️ | Email |

### CTA por investidor: Ver Detalhes
Ao clicar em "Ver Detalhes" de um investidor, abre modal com:

- `[ Ver Perfil ]` → abre modal com perfil completo do investidor
- `[ Enviar Teaser ]` → modal com área de texto para mensagem personalizada + envio do link do Teaser

**Nota sobre envio em massa (futuro próximo):**
> Envio de teaser 1:1 é o padrão do MVP. Evoluir para envio em massa: checkbox em cada card de investidor → selecionar múltiplos → enviar teaser único para todos os selecionados.

### Email semanal automático
- Enviado para os investidores sobre movimentações do ativo
- Objetivo: manter engajamento

---

## TELA: Feed

**Rota:** `/ativo/feed`

### Descrição
Atualizações e atividades relacionadas ao projeto. Movimentações dos investidores no pipeline.

### Filtros
- `[ Todos ]`
- `[ Selecione um investidor ▼ ]`

---

## TELA: Projeto Tiger — Área do Projeto

**Rota:** `/ativo/projects/:codename`

### Header do projeto
```
Mary | Início > Tiger > [aba ativa]                    Mary AI ▼
Menu: [ MRS ] [ Radar ] [ Feed ] [ Projeto Tiger ▼ ]
Abas: [ Resumo ] [ Investidores ] [ Teaser ] [ Valuation ] [ Deck/CIM ] [ + Info ]
Botão fixo: [ + Convidar Investidores ]
```

---

### Aba: Resumo

**Rota:** `/ativo/projects/:codename/overview`

**Campos exibidos:**

| Campo | Valor exemplo |
|---|---|
| Nome do projeto | Projeto Tiger |
| Início do projeto | 10/01/2026 |
| Responsável | Fulano |
| Tipo de deal | Venda Integral ou Captação |
| Valor alvo | R$ 100M |
| Participação alvo | 100% |
| Advisors do projeto | Pessoa 1 — Nome, celular, email, função/cargo |
| Visibilidade | Radar Mary |

**Nota:** Ao lado do resumo, mini-dashboard com indicadores de gatilhos/status do projeto.

**Botões disponíveis:**
- `Share` — compartilhar com a equipe (abre modal com seleção de membros ou campo nome + email)
- `Editar` — abre modo de edição direta

---

### Aba: Investidores

**Rota:** `/ativo/projects/:codename/investors`

**Subtítulo dinâmico:**
```
Investidores: [ Seguindo: 15 ] [ Teaser: 8 ] [ NDA: 5 ] [ NBO: 2 ] [ SPA: 0 ]
```

**Filtros:** Investidor ▼ | Responsável ▼ | Etapa ▼ | Tempo NDA ▼ | Temperatura ▼

**Tabela:**

| Coluna | Descrição |
|---|---|
| Investidor | Nome (clicável → volta ao Radar e perfil) |
| Responsável | Nome do responsável pelo investidor |
| Etapa | NBO / NDA / Teaser / etc. |
| Tempo NDA | Ex: 4d / 90d / 14d |
| Temperatura | Número de visualizações do MRS (ex: 3 visualizações MRS) |
| Legal Docs | Links para NDA / NBO / SPA |
| Enviar Email | ✉ |

**Exemplos de linha:**
```
BTG Pactual    | João Silva  | NBO  | 4d   | 3 visualizações MRS  | NDA / NBO / SPA | ✉
Vinci Partners | Ana Costa   | NDA  | 90d  | 12 visualizações MRS | NDA / NBO / SPA | ✉
Advent Intl.   | Pedro Melo  | NDA  | 14d  | 0 visualizações MRS  | NDA / NBO / SPA | ✉
```

---

### Aba: Teaser

**Rota:** `/ativo/projects/:codename` (aba Teaser)

### Aba: Valuation

**Rota:** `/ativo/projects/:codename` (aba Valuation)

### Aba: Deck/CIM

**Rota:** `/ativo/projects/:codename` (aba Deck/CIM)

> **Teaser, Valuation e Deck/CIM seguem a mesma lógica de tela.** O que muda é o prompt enviado para a Mary AI e o conteúdo gerado.

**Comportamento padrão das 3 abas:**

1. Mary AI gera a **primeira versão automaticamente** com base nos dados do onboarding
2. Cabeçalho do documento:
   > "Versão 1.0 — versão inicial foi gerada automaticamente pela Mary AI. Edite à vontade. Salvamento automático."
3. Usuário pode interagir no chat para refinar
4. Ao final do chat, Mary AI pergunta se deseja **aprovar** a versão
5. Se aprovada → vira versão final + alimenta o RAG da empresa
6. Todos os arquivos anexados no chat → entram automaticamente para o VDR

**Botões disponíveis:**
- `Share` — compartilhar com equipe (abre modal)
- `Aprovar` — aprovar versão atual (abre modal para selecionar revisores)
- `Editar` — abre doc, liga cursor, edição direta

> **Nota UX:** Refinar a experiência dos 3 botões (Share, Aprovar, Editar). Pensar numa melhor experiência dessas 3 ações.

---

### Aba: + Info (VDR Complementar)

**Tooltip:**
> "+ Info: Informações adicionais sobre a empresa e projeto. Inclui Q&As de investidores, documentos personalizados, materiais específicos de M&A ou qualquer outra solicitação adicional ao MRS. É um VDR complementar, auxiliar dentro do contexto do projeto."

**Conteúdo:**
- Q&As de investidores
- Documentos extras enviados
- Materiais específicos de M&A
- Solicitações adicionais além do MRS

---

## TELA: VDR — Virtual Data Room

**Rota:** `/assets/vdr`

### Estrutura

**1. PRÉ-DD / PREPARAÇÃO**
- Pasta padrão criada automaticamente ao criar a empresa
- As subpastas e arquivos são a **base do MRS**
- Itens colapsáveis em árvore com indent por nível (UX/UI)

**2. DUE DILIGENCE**
- Estrutura de pastas **livremente editável**
- Sócios e Advisors podem fazer upload de itens adicionais para atender demandas específicas de cada investidor
- Compartilhado apenas após investidor entrar na fase de DD

### Colunas da tabela VDR
```
✓ | ID | Solicitações | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Comentários | Prioridade | Status | Responsável | Revisor | Flags | Arquivos | Tags | Risco | Data Início | Prazo | Últ. Atualização | ⋮
```

### Controles
- `Busca` — busca de documentos
- `Filtros` — filtros por coluna
- `Ações em massa` — ações em lote
- `Permissões` — controle de acesso
- `Notificações` — alertas de atividade
- `+ Documentos` — adicionar novos documentos

---

## TELA: Configurações

**Rota:** `/ativo/configuracoes`

### Header
```
Admin Ativo
Mary | Início > Configurações                    Mary AI ▼
Menu: [ MRS ] [ Radar ] [ Feed ] [ Projeto Tiger ▼ ]
Abas: [ Conta ] [ Faturamento ] [ Equipe ]
```

### Aba: Conta
- Informações da conta
- Configurações de segurança
- Backups
- Logs de atividade

### Aba: Faturamento
- Plano atual
- Histórico de pagamentos
- Dados de cobrança

### Aba: Equipe
- Membros com acesso à conta
- Permissões por membro
- Convite de novos membros

---

## Fluxos Cruzados (Ativo ↔ outros usuários)

### Ativo recebe convite de Investidor
1. Investidor clica "Acompanhar este Ativo" no Radar
2. Sistema envia email automático ao ativo:
   > "Há um novo investidor interessado em sua empresa. Se for do seu interesse, cadastre sua empresa na Mary gratuitamente e comece a se preparar para um possível investimento."
3. Ativo cadastra-se (se não cadastrado) ou visualiza o interesse no Feed

### Ativo recebe convite de Advisor
1. Advisor clica `[ Ofertar Serviços ]` no Radar de Leads
2. Sistema envia email ao responsável do Ativo com link do perfil do Advisor:
   > "Olá [Fulano], o(a) advisor [Zezito] da [NOME DA EMPRESA DO ADVISOR] encontrou o perfil da [EMPRESA/ATIVO] na Mary e gostaria de ofertar seus serviços. Abaixo o email dele para que possa fazer contato direto, apresentar seu projeto e solicitar uma proposta. A Mary deseja boa sorte e bons negócios."

### Ativo recebe convite de novo membro
- Botão `+ Convidar membro` disponível em todas as telas do projeto
- Abre campo de nome + email para convite
