# PRD v3.0 — Mary Platform (MVP Reconciliado)
## Plataforma de ecossistema M&A orientada a execução

---

## 0. Informações do documento

| Campo | Valor |
|-------|-------|
| Produto | Mary Platform |
| Versão | MVP v3.0 (Reconciliado — Excalidraw como fonte primária) |
| Status | Em desenvolvimento |
| Data base | 01/04/2026 |
| Fonte primária | `.dev/excalidraw/` (00_INDEX a 05_SHARED_MODULES) |
| Fonte secundária | `.dev/production/1-PRD.md` (PRD v2.2) |
| Mapeamento de divergência | `.dev/MAPEAMENTO_EXCALIDRAW_VS_IMPLEMENTACAO.docx` |
| Documento canônico | Este arquivo (`.dev/production/PRD-v3.0-RECONCILIADO.md`) |

### Propósito deste documento

Este PRD substitui o PRD v2.2 como fonte de verdade funcional. Foi criado a partir de uma reconciliação campo a campo entre o Excalidraw (especificação visual aprovada pelo cliente) e a implementação atual. Cada seção indica explicitamente o status de aderência:

| Indicador | Significado |
|-----------|-------------|
| ✅ IMPLEMENTADO | Funcionalidade implementada e aderente ao Excalidraw |
| ⚠️ PARCIAL | Existe implementação mas diverge do Excalidraw — precisa de ajuste |
| ❌ AUSENTE | Não implementado — precisa ser construído |
| 🔄 REQUER REFATORAÇÃO | Implementado de forma fundamentalmente diferente — precisa ser refeito |

### Causa raiz da divergência

A cadeia de produção anterior foi: Call → Transcrição → PRD v2.2 → Épicos → Código. O Excalidraw nunca foi convertido em spec técnica executável. Resultado: o PRD v2.2 e os Épicos E1-E4 foram internamente consistentes, mas divergentes do que o cliente esperava (representado no Excalidraw).

### Hierarquia de precedência (a partir de agora)

1. **Excalidraw** (`.dev/excalidraw/`) — fonte de verdade visual e funcional
2. **Este PRD v3.0** — contrato executável derivado do Excalidraw
3. **PRD v2.2** — referência histórica, não mais normativo
4. **Código atual** — baseline de implementação a ser reconciliada

---

## 1. Visão geral do produto

Mary é uma plataforma B2B para o ecossistema de M&A (Mergers & Acquisitions) que conecta três perfis de usuários:

- **Ativo**: empresa (startup, PME ou grande empresa) que busca captação de investimento ou venda integral/parcial
- **Investidor**: fundo de Private Equity, Corporate, Family Office ou individual que busca oportunidades de investimento/aquisição
- **Advisor**: boutique de M&A, assessor financeiro ou consultoria especializada que representa ativos perante investidores

A **Mary AI** é uma assistente contextual presente em todas as telas. No MVP ela é **assistente, não executora** — consulta bases de dados, responde perguntas, sugere ações, resume e explica. Na v2 poderá executar ações.

**Stack técnico:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Vercel (São Paulo).

**Multi-tenant:** rotas via `[orgSlug]` em `src/app/(protected)/`. Três tipos de perfil: `investor`, `asset`, `advisor`.

---

## 2. Princípios de produto (mantidos do PRD v2.2 + Excalidraw)

- MVP com leveza: menos campos, menos fricção, mais clareza.
- Menos é mais: começar pelo essencial e expandir por demanda real.
- Experiência espelhada: estruturas similares entre perfis para reduzir custo e acelerar entrega.
- Plataforma viva: feed, alertas e lembretes desde o início.
- IA colaborativa: recomenda e contextualiza, usuário revisa e decide.
- Salvar automático sempre — sem botões "Salvar" em nenhum campo da plataforma.
- Tooltips de apoio em todos os campos para reduzir erro de preenchimento.
- Entregas em ciclos curtos: desenvolve → aprova → desenvolve → aprova.

---

## 3. Regras globais da plataforma

> Fonte: `01_GLOBAL_RULES.md`

### 3.1 Auto-save ⚠️ PARCIAL

**Especificação Excalidraw:** Todo campo da plataforma salva automaticamente ao ser preenchido ou alterado — sem botões "Salvar". Ao salvar, exibir feedback visual sutil: check (✓) ou texto em verde indicando que o dado foi salvo. Campos auto-filled pelo sistema devem permanecer editáveis.

**Status atual:** Implementado parcialmente em alguns formulários. Falta padronizar em todas as telas.

**Ação necessária:** Criar hook `useAutoSave` reutilizável e aplicar em todos os formulários da plataforma.

### 3.2 Tooltips ⚠️ PARCIAL

**Especificação Excalidraw:** Todos os campos devem ter tooltips claras e objetivas, especialmente em contexto de M&A onde a terminologia pode ser técnica. Tooltips específicas por campo definidas em cada arquivo de jornada.

**Status atual:** Parcialmente implementado. Muitos campos ainda sem tooltip.

**Ação necessária:** Implementar tooltips em todos os campos conforme especificado campo a campo nos arquivos de jornada.

### 3.3 Breadcrumbs ❌ AUSENTE

**Especificação Excalidraw:** Sempre indicar o caminho completo de navegação no topo da tela. Passos/páginas anteriores são clicáveis. A página atual é exibida mas não tem link.

Exemplos:
- `Início > Onboarding > Passo 1`
- `Início > Tiger > Investidores`
- `Início > Projetos > Tiger > MRS`

**Ação necessária:** Implementar componente `Breadcrumb` global e integrar em todas as telas.

### 3.4 Mary AI — Sidebar Global 🔄 REQUER REFATORAÇÃO

**Especificação Excalidraw:**
- Botão da Mary AI sempre visível no canto da tela (padrão: canto inferior direito ou no header como `Mary AI ▼`)
- Ao acionar, a sidebar **empurra e espreme** o conteúdo principal para a esquerda (benchmark: Evernote)
- A sidebar é **contextual** — sabe em qual tela o usuário está e adapta sugestões

**Capacidades MVP (assistente apenas — não executa):**
- Consultar bases de dados da plataforma
- Responder perguntas sobre o projeto, processo de M&A, documentos
- Conferir e revisar documentos
- Sugerir ajustes e melhorias
- Resumir informações
- Explicar termos e etapas do processo
- **Não executa nada diretamente** — sugere que o usuário realize a ação

**Saudação inicial:** `"Prazer, sou a Mary AI. Estarei sempre aqui!"`

**Prompt contextual de boas-vindas:**
```
Olá [Username], vamos começar?

Como posso te ajudar?

[ O que a Mary AI pode fazer? ]
[ Pergunte sobre este projeto ]      ← para Ativo
[ Pergunte sobre um projeto ]        ← para Investidor
[ Suba Q&As e obtenha respostas ]
[ Convide investidores para seu projeto ]  ← para Ativo
[ Convide novos Ativos ]                   ← para Investidor
```

**Disclaimer obrigatório (rodapé do chat):**
```
A Mary AI pode cometer erros. A Mary não usa dados da "[Nome da Empresa]" para treinar os modelos.
```

**Geração automática de documentos (pós-onboarding do Ativo):**
1. Coleta todos os campos preenchidos como base
2. Executa agente "deep research" para levantar informações públicas sobre o ativo
3. Gera automaticamente: Dossiê da empresa (resumo executivo, SWOT, pontos de destaque, timeline), MRS inicial, Primeira versão do Teaser, Primeira versão do Overview
4. Dossiê alimenta o RAG do ativo e é alocado no VDR em Q&As

**Fluxo de aprovação de documentos gerados:**
1. Mary AI gera primeira versão de cada documento
2. Usuário pode interagir no chat para refinar
3. Ao final de cada conversa, Mary AI pergunta: **"Deseja aprovar esta versão?"**
4. Se aprovada: vira versão final + alimenta o RAG
5. Todos os arquivos anexados no chat entram automaticamente no VDR

**Status atual:** Mary AI implementada como página separada. Falta transformar em sidebar que empurra conteúdo e adicionar contextualidade por tela.

### 3.5 Sistema de Mensageria Automática ❌ AUSENTE

**Especificação Excalidraw:** Todas as mensagens automáticas, modais, tooltips e triggers devem ser gerenciadas em uma **única tabela central no banco de dados** — o "Mary Messaging System". Isso garante governança, facilita manutenção e permite evolução sem que mensagens fiquem espalhadas no código.

**Categorias a centralizar:** Mensagens de onboarding, emails automáticos (convites, notificações, alertas), modais de boas-vindas, tooltips de campos, alertas in-app, mensagens da Mary AI (templates), triggers de engajamento.

### 3.6 NDA e Controle de Acesso ✅ IMPLEMENTADO (base)

**Especificação Excalidraw:** Dados financeiros e sensíveis nunca exibidos publicamente. Apenas usuários cadastrados, após NDA assinado e autorizados, visualizam detalhes completos. O ativo controla quem, como e quando acessa os dados. Investidores veem apenas o codinome até assinarem NDA.

**Liberação progressiva do MRS:**

| Evento | O que é liberado |
|--------|------------------|
| Investidor assina NDA | Passos 1 e 2 do MRS |
| Investidor assina NBO | Passos 3 e 4 do MRS |
| Investidor assina SPA | Status automático: Fechado |

### 3.7 Navegação por Abas ✅ IMPLEMENTADO

Ao clicar em uma aba ou menu, o sistema negrita e sublinha o item ativo.

### 3.8 Seleção de Regiões (campo global) ✅ IMPLEMENTADO

Seleção em 2 passos: mostra continentes primeiro, depois países do continente selecionado. Opção de selecionar todos os países de um continente.

### 3.9 Campos de Setor (campo global) ✅ IMPLEMENTADO

Permite multisseleção. Tooltip: "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match."

### 3.10 Permissões de Advisor ❌ AUSENTE

Por padrão, Advisor tem permissão total de edição dos projetos dos seus clientes (Ativos). Exceção: não pode editar permissões administrativas do cliente.

### 3.11 Vínculo Automático Advisor ↔ Ativo ❌ AUSENTE

Quando um Ativo se cadastra através de convite do Advisor, é automaticamente vinculado à conta do Advisor.

### 3.12 Compartilhamento de Projetos ❌ AUSENTE

| Modo | Comportamento |
|------|---------------|
| **Privado** | Projeto não aparece em nenhum radar. Apenas equipe + advisors autorizados. |
| **Restrito** | Compartilhável com investidores específicos via link de convite. Não aparece no Radar. |
| **Radar Mary** | Publicado no Radar geral da Mary. Nunca fora do ambiente da plataforma. |

---

## 4. Arquitetura de rotas

> Fonte: `00_INDEX.md`

### 4.1 Rotas públicas ⚠️ PARCIAL

| Rota (Excalidraw) | Status |
|--------------------|--------|
| `/` — landing page | ✅ |
| `/register/asset` — pré-cadastro Ativo | ⚠️ Existe mas difere |
| `/register/investor` — pré-cadastro Investidor | ⚠️ Existe mas difere |
| `/register/advisor` (rota `/advise`) — pré-cadastro Advisor | ❌ |
| `/onboarding/asset` — onboarding Ativo | 🔄 Existe mas estrutura diverge |
| `/onboarding/investor/pre-registration` — onboarding Investidor | ⚠️ |

### 4.2 Rotas autenticadas — Ativo ⚠️ PARCIAL

| Rota (Excalidraw) | Rota atual | Status |
|--------------------|-----------|--------|
| `/ativo/rs` — MRS | `/[orgSlug]/mrs` | ✅ Funcional, rota diferente |
| `/ativo/radar` — Radar de Investidores | `/[orgSlug]/radar` | ⚠️ |
| `/ativo/feed` — Feed | `/[orgSlug]/feed` | ⚠️ |
| `/ativo/projects/:codename` — Projeto | `/[orgSlug]/pipeline` | ⚠️ |
| `/ativo/projects/:codename/overview` — Resumo | — | ❌ |
| `/ativo/projects/:codename/pipeline` — Pipeline kanban | — | ⚠️ |
| `/ativo/projects/:codename/investors` — Investidores | — | ❌ |
| `/ativo/solicitacoes` — Solicitações VDR | — | ❌ |
| `/assets/vdr` — Virtual Data Room | — | ❌ |

**Nota sobre rotas:** A implementação usa `[orgSlug]` para multi-tenant. Isso é funcionalmente correto e pode ser mantido. O importante é que a **estrutura de navegação e as telas** correspondam ao Excalidraw, não necessariamente os paths literais.

### 4.3 Rotas autenticadas — Investidor ⚠️ PARCIAL

| Rota (Excalidraw) | Rota atual | Status |
|--------------------|-----------|--------|
| `/investidor/oportunidades` — Radar | `/[orgSlug]/opportunities` | ✅ Funcional |
| `/investidor/atualizacoes` — Feed | `/[orgSlug]/feed` | ⚠️ |
| `/investidor/projetos` — Projetos kanban | `/[orgSlug]/pipeline` | ⚠️ |
| `/investidor/teses` — Teses | `/[orgSlug]/thesis` | ✅ |

### 4.4 Rotas autenticadas — Advisor ❌ AUSENTE (majoritariamente)

| Rota (Excalidraw) | Status |
|--------------------|--------|
| `/advisor/radar` — Radar (Leads + Investidores) | ❌ |
| `/advisor/perfil` — Perfis de atuação | ❌ |
| `/advisor/feed` — Feed | ❌ |
| `/advisor/projetos` — Portfólio | ❌ |

### 4.5 Menu lateral por perfil 🔄 REQUER AJUSTE

**Excalidraw define menus distintos por perfil:**

| Perfil | Menu lateral (Excalidraw) | Menu atual | Status |
|--------|---------------------------|------------|--------|
| Ativo | `MRS / Radar / Feed / Projeto Tiger ▼` | `MRS / Radar / Feed / Projeto` | ⚠️ Falta codinome dinâmico |
| Investidor | `Radar / Teses / Feed / Projetos` | `Tese / Radar / Feed / Projetos` | ⚠️ Ordem e naming diferem |
| Advisor | `Radar / Perfil / Feed / Projetos` | — | ❌ |

---

## 5. Jornada do Ativo

> Fonte: `02_ATIVO.md`

### 5.1 Etapa 1 — Seleção de perfil (Site Público) ✅ IMPLEMENTADO

- Apresentação da plataforma
- CTA: `[ Comece agora ]`
- Copy: *"Você está a um passo de acessar os melhores investidores do Brasil."*
- Seleção de perfil: Ativo / Investidor / Advisor

### 5.2 Etapa 2 — Pré-Cadastro (`/register/asset`) ⚠️ PARCIAL

**Campos (Excalidraw):**

| Campo | Tipo | Status |
|-------|------|--------|
| Nome completo (nome real) | Text | ✅ |
| Nome da empresa | Text | ✅ |
| Email | Text | ✅ |
| CNPJ (opcional, usado para busca na base) | Text | ⚠️ Existe mas obrigatório na impl. |
| Senha | Password | ✅ |

**Comportamento:** Sistema verifica se empresa já existe na base. Auto-save a cada campo. Todos com tooltip.

### 5.3 Etapa 3 — Onboarding (`/onboarding/asset`) 🔄 REQUER REFATORAÇÃO COMPLETA

> **DIVERGÊNCIA CRÍTICA** — Esta é a maior divergência entre Excalidraw e implementação.

**Excalidraw:** 4 passos focados em M&A

| Passo | Título | Conteúdo |
|-------|--------|----------|
| 1 | Dados da Empresa | Descrição, objetivo, modelo de negócio, setor, regiões |
| 2 | Dados Mínimos para Matching | ROB, EBITDA%, funcionários, fundação, sede, participação ofertada, valor alvo |
| 3 | Equipe | Sócios, advisors, convidar membros |
| 4 | Codinome do Projeto | Codinome + sugestão automática Mary AI |

**Implementação atual:** 5 passos genéricos: CNPJ → Confirm → Details → Eligibility → Terms

**Status:** 🔄 REQUER REFATORAÇÃO COMPLETA

#### Passo 1 — Dados da Empresa

**Título:** "Conte-nos um pouco sobre sua empresa."

**Layout padrão do onboarding:**
- Header: `Mary | Início > Onboarding > Passo X`
- Mary AI disponível no header: `Mary AI ▼`
- Menu lateral esquerdo: `[ MRS ] [ Radar ] [ Feed ]`
- Indicador de progresso: `[ Passo 1 ] [ Passo 2 ] [ Passo 3 ] [ Passo 4 ]`
- Rodapé: nome real do usuário + nome da empresa + `+ Convidar membro`

**Campos obrigatórios:**

| Campo | Tipo | Tooltip | Status impl. |
|-------|------|---------|-------------|
| Nome real do responsável | Text (auto-filled do cadastro, editável) | — | ❌ |
| Nome da empresa | Text (auto-filled do cadastro, editável) | — | ⚠️ |
| Descrição da empresa | Textarea longa | "Descreva sua empresa de modo que os investidores possam entender seu negócio sob o ponto de vista de suas teses de investimento. Esta descrição é fundamental para promover o melhor match entre empresas e investidores." | ❌ |
| Objetivo do projeto | Select (dinâmico) | Ver opções abaixo | ❌ |
| Modelo de negócio | Multi-select (B2B, B2C, B2B2C, B2G) | — | ❌ |
| Setor de atuação | Multi-select | "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match." | ⚠️ Existe no contexto errado |
| Regiões de atuação | Select em 2 passos (continente → países) | — | ⚠️ Existe no contexto errado |

**Opções dinâmicas do campo "Objetivo do projeto":**

*Se CAPTAÇÃO DE INVESTIMENTO:*
- Expansão e Crescimento — "Financiar abertura de novas filiais, expansão geográfica ou aumento de capacidade produtiva."
- Desenvolvimento de Produtos/Inovação — "Investir em P&D, lançar novas tecnologias ou inovar no mercado."
- Capital de Giro (Working Capital) — "Reforçar o caixa para cobrir despesas operacionais, aumentar estoques ou suportar crescimento rápido."
- Marketing e Vendas — "Financiar campanhas de branding, aquisição de clientes e expansão da equipe comercial."
- Atração de Talentos — "Contratar mão de obra qualificada para posições chave."
- Fortalecimento da Estrutura — "Melhorar a governança e a tecnologia interna da empresa."

*Se VENDA INTEGRAL:*
- Retirada de Capital (Cashing Out) — "Realizar o lucro após anos de trabalho duro, convertendo o valor da empresa em liquidez pessoal."
- Mudança de Estilo de Vida ou Cansaço (Burnout) — "Desejo de se aposentar, passar mais tempo com a família ou reduzir o estresse."
- Falta de Sucessão — "Ausência de herdeiros ou gestores preparados para assumir o negócio."
- Novas Oportunidades — "Vender para investir em outro setor, iniciar um novo negócio ou buscar novos desafios."
- Disputas de Sócios — "Conflitos entre parceiros de negócios que tornam a operação inviável."
- Riscos de Mercado/Mudanças — "Antecipar-se a mudanças no setor (disrupção tecnológica) ou dificuldades financeiras."
- Proposta Irrecusável — "Receber uma oferta estratégica de um concorrente ou fundo de investimento."

**Mary AI — mensagem contextual após preenchimento:**
> "Com base nas informações fornecidas, identificamos investidores potencialmente compatíveis com seu perfil. Continue para refinar seu perfil e se preparar."

**CTA:** `[ > Passo 2 ]`

#### Passo 2 — Dados Mínimos para Matching

**Título:** "Forneça alguns dados mínimos para matching"

**Nota de privacidade (exibida no topo):**
> "Não se preocupe! Esses dados nunca são exibidos publicamente. Apenas investidores com tese compatível, após NDA assinado e autorizados, poderão visualizar os detalhes completos."

**Campos obrigatórios:**

| Campo | Tipo | Tooltip | Status impl. |
|-------|------|---------|-------------|
| ROB — últimos 12 meses | Número/moeda | Dado financeiro sensível | ❌ |
| EBITDA % | Número/percentual | Dado financeiro sensível | ❌ |
| Número de funcionários | Número | — | ❌ |
| Ano de fundação | Ano | — | ❌ |
| Localização da sede | Select (cidade/estado) | — | ❌ |
| Participação ofertada | Percentual | "% que o ativo está disposto a vender/diluir" | ❌ |
| Valor alvo | Moeda | "Valor esperado da operação" | ❌ |

**CTA:** `[ > Passo 3 ]`

#### Passo 3 — Quem Está ao Seu Lado Nessa Jornada?

**Título:** "Quem está ao seu lado nessa jornada?"

**Campos:**

| Campo | Tipo | Status impl. |
|-------|------|-------------|
| Sócios da empresa | Lista de membros (nome, email, cargo) | ❌ |
| Advisors do projeto | Lista de membros (nome, email, empresa, função) | ❌ |
| Convidar membro | Input + botão | ❌ |

**Tooltip para Advisors:**
> "A Mary pode te ajudar com isso, enviando seu contato para advisors da nossa rede que possuam match potencial com seu negócio. Você não tem nenhum compromisso de atender ou contratar nenhum deles, isso fica a seu critério."

**CTA:** `[ > Passo 4 ]`

#### Passo 4 — Codinome do Projeto (Confidencialidade)

**Título:** "Último passo para sua segurança e confidencialidade"
**Subtítulo:** "Agora vamos criar um codinome para o seu projeto de captação ou venda."

**Campos:**

| Campo | Tipo | Status impl. |
|-------|------|-------------|
| Codinome do projeto | Text (ex: "Projeto Tiger") | ❌ |
| Sugestão automática | Botão (Mary AI sugere) | ❌ |

**Tooltip:**
> "Essa é uma prática comum no mercado para proteger a confidencialidade da sua empresa. Quando investidores encontrarem seu projeto na Mary, eles verão apenas esse codinome, nunca o nome ou dados sensíveis da empresa."

**CTA:** `[ Concluir cadastro ]`

**Após concluir:**
- Modal animado de parabéns e boas-vindas
- Mensagem: "Cadastro finalizado com sucesso. Seu projeto foi configurado e protegido na Mary. Agora você já pode acessar e ver seu Market Readiness Score (MRS)."
- Redirecionamento automático para MRS
- Botão: `[ Ver meu MRS ]`

#### Pós-Onboarding — Mary AI (automático)

Imediatamente após o onboarding, a Mary AI executa em background:
1. Coleta todos os campos preenchidos
2. Executa agente "deep research" para levantar informações públicas (site, notícias, LinkedIn)
3. Gera automaticamente: Dossiê da empresa, MRS inicial, Primeira versão do Teaser
4. Dossiê alocado no VDR em Q&As — funciona como base para RAG do ativo
5. Radar do Ativo já tem condições de filtrar Investidores com tese aderente

### 5.4 Área Logada — Layout padrão do Ativo ⚠️ PARCIAL

**Header:** `Mary | Início > [página atual]     Mary AI ▼`

**Menu lateral:**
```
[ MRS ]
[ Radar ]
[ Feed ]
[ Projeto Tiger ▼ ]   ← codinome do projeto ativo
```

**Rodapé:**
```
[Nome Real]
[Company Name]
+ Convidar membro
```

### 5.5 Tela: MRS — Market Readiness Score ✅ IMPLEMENTADO (base sólida)

**Rota:** `/ativo/rs` (impl: `/[orgSlug]/mrs`)

Score de 0 a 100. Estrutura em 4 passos. Contrato funcional de score definido no PRD v2.2 e implementado. Status oficiais: pendente, parcial, completo, na. Prioridades: crítica, alta, média.

**Notas técnicas pendentes:**
- ❌ Definir tamanho máximo para upload
- ❌ Definir formatos permitidos
- ❌ Mary AI interpretar arquivos para cálculo

### 5.6 Tela: Radar de Investidores ⚠️ PARCIAL

**Rota:** `/ativo/radar` (impl: `/[orgSlug]/radar`)

**Filtros e controles (Excalidraw):**
- `[ Projeto Tiger ▼ ]` — seletor de projeto ativo ❌
- `MRS Atual: 45` — exibido ao lado do nome ❌
- `[ + Convidar Investidores ]` — botão fixo ❌
- `[ Todos ] [ Selecione um investidor ▼ ]` — filtro ❌

**Tabela de investidores — colunas (Excalidraw):**

| Coluna | Status impl. |
|--------|-------------|
| Investor (nome clicável → perfil) | ⚠️ |
| Tipo (PE / Corporate / Individual) | ❌ |
| Sobre (descrição textual) | ❌ |
| Aquisições e Investimentos | ❌ |
| Racional Estratégico | ❌ |
| Contato (responsável) | ❌ |
| Responde (frequência: Sempre/Frequentemente/Ocasionalmente/Raramente/Nunca) | ❌ |
| 💬 Chat direto | ❌ (pós-MVP) |
| ✉️ Email | ❌ |

**CTA por investidor: Ver Detalhes** → modal com `[ Ver Perfil ]` e `[ Enviar Teaser ]`

### 5.7 Tela: Feed ⚠️ PARCIAL

**Rota:** `/ativo/feed` (impl: `/[orgSlug]/feed`)

Atualizações e atividades do projeto. Filtros: `[ Todos ]` `[ Selecione um investidor ▼ ]`

### 5.8 Tela: Projeto — Área do Projeto ❌ AUSENTE (majoritariamente)

**Rota:** `/ativo/projects/:codename`

**Header do projeto:**
```
Mary | Início > Tiger > [aba ativa]     Mary AI ▼
Menu: [ MRS ] [ Radar ] [ Feed ] [ Projeto Tiger ▼ ]
Abas: [ Resumo ] [ Investidores ] [ Teaser ] [ Valuation ] [ Deck/CIM ] [ + Info ]
Botão fixo: [ + Convidar Investidores ]
```

#### Aba: Resumo ❌ AUSENTE

| Campo | Valor exemplo |
|-------|--------------|
| Nome do projeto | Projeto Tiger |
| Início do projeto | 10/01/2026 |
| Responsável | Fulano |
| Tipo de deal | Venda Integral ou Captação |
| Valor alvo | R$ 100M |
| Participação alvo | 100% |
| Advisors do projeto | Pessoa 1 — Nome, celular, email, função/cargo |
| Visibilidade | Radar Mary |

Botões: `Share`, `Editar`

#### Aba: Investidores ❌ AUSENTE

Subtítulo dinâmico: `Investidores: [ Seguindo: 15 ] [ Teaser: 8 ] [ NDA: 5 ] [ NBO: 2 ] [ SPA: 0 ]`

Filtros: Investidor ▼ | Responsável ▼ | Etapa ▼ | Tempo NDA ▼ | Temperatura ▼

Tabela com colunas: Investidor, Responsável, Etapa, Tempo NDA, Temperatura (visualizações MRS), Legal Docs (NDA/NBO/SPA), Email

#### Aba: Teaser / Valuation / Deck-CIM ❌ AUSENTE

Padrão de tela único para os 3. Mary AI gera primeira versão. Cabeçalho: "Versão 1.0 — gerada automaticamente pela Mary AI. Edite à vontade. Salvamento automático."

Botões: `Share`, `Aprovar`, `Editar`

#### Aba: + Info (VDR Complementar) ❌ AUSENTE

Q&As de investidores, documentos extras, materiais M&A, solicitações adicionais.

### 5.9 Tela: VDR — Virtual Data Room ❌ AUSENTE

**Rota:** `/assets/vdr`

Estrutura em 2 camadas: PRÉ-DD/PREPARAÇÃO (base do MRS, criada automaticamente) e DUE DILIGENCE (editável, compartilhada após fase de DD).

### 5.10 Tela: Configurações ❌ AUSENTE

Abas: Conta, Faturamento, Equipe.

---

## 6. Jornada do Investidor

> Fonte: `03_INVESTIDOR.md`

### 6.1 Etapa 1 — Seleção de perfil ✅ IMPLEMENTADO

CTA: `[ Comece agora ]`. Copy: *"Você está a um passo de acessar inúmeros Ativos qualificados."*

### 6.2 Etapa 2 — Pré-Cadastro ⚠️ PARCIAL

**Campos (Excalidraw):**

| Campo | Status impl. |
|-------|-------------|
| Nome completo | ✅ |
| Nome da empresa/fundo | ✅ |
| Email | ✅ |
| Senha | ✅ |

### 6.3 Etapa 3 — Onboarding (2 passos) ⚠️ PARCIAL

**Layout:** Header + Mary AI + Menu lateral `[ Radar ] [ Teses ] [ Feed ] [ Projetos ]` + Indicador de progresso `[ Passo 1 ] [ Passo 2 ]`

#### Passo 1 — Crie sua Primeira Tese de Investimento

**Título:** "Crie sua primeira Tese de Investimento"
**Tooltip geral:** "Você poderá cadastrar outras teses de investimento depois, não se preocupe."

**Campos:**

| Campo | Tipo | Tooltip | Status impl. |
|-------|------|---------|-------------|
| Nome da tese | Text | Ex: "Edtechs", "Fintechs Series A" | ✅ |
| Descrição da tese | Textarea | "Descreva sua tese de modo que os Ativos possam entender seus critérios macro." | ⚠️ |
| Setores-alvo | Multi-select | "Você pode selecionar múltiplos setores." | ✅ |
| Público-alvo da empresa-alvo | Select/text | Tipo de cliente (B2B, B2C, etc.) | ❌ |
| Regiões prioritárias | Select em 2 passos | Continente → Países | ✅ |
| ROB mínimo (últimos 12 meses) | Moeda | — | ❌ (confundido com ticketMin) |
| ROB máximo (últimos 12 meses) | Moeda | — | ❌ (confundido com ticketMax) |
| EBITDA % mínimo | Percentual | — | ❌ |
| Cheque mínimo | Moeda | Valor mínimo a aportar | ⚠️ (existe como ticketMin) |
| Cheque máximo | Moeda | Valor máximo a aportar | ⚠️ (existe como ticketMax) |

**DIVERGÊNCIA IMPORTANTE:** Na implementação, `ticketMin/ticketMax` foram usados tanto para ROB quanto para Cheque. No Excalidraw são campos separados: ROB (receita da empresa-alvo) ≠ Cheque (valor que o investidor aporta).

#### Passo 2 — Refine sua Primeira Tese de Investimento

**Título:** "Refine sua primeira tese de investimentos"

**Campos adicionais:**

| Campo | Tipo | Tooltip | Status impl. |
|-------|------|---------|-------------|
| Estágio da empresa-alvo | Multi-select | Seed, Série A, B, Growth, Late Stage, Lucrativa | ✅ |
| Tipo de operação preferida | Multi-select | Participação minoritária, majoritária, venda integral | ❌ |
| Critérios de exclusão | Textarea | Setores/perfis que NÃO quer | ❌ |
| Informações adicionais | Textarea | Critério complementar | ❌ |

**Ao finalizar:** Tela de sucesso → `[ Ver meu Radar ]` → Redirecionamento para Radar.

### 6.4 Área Logada — Layout ⚠️ PARCIAL

**Menu lateral (Excalidraw):** `Radar / Teses / Feed / Projetos`
**Menu lateral (atual):** `Tese / Radar / Feed / Projetos`

### 6.5 Tela: Radar de Oportunidades ⚠️ PARCIAL

**Rota:** `/investidor/oportunidades` (impl: `/[orgSlug]/opportunities`)

**Controles (Excalidraw):**
- `[ Selecionar teses ▼ ]` — primeira tese ativa por padrão ⚠️
- `MRS Mínimo` slider (0-100) ❌
- `[ + Convidar Ativo ]` ❌

**Cards anonimizados** com informações básicas. Botão **`Ver Detalhes`** abre modal com 3 cenários:

**Cenário 1 — Ativo Pré-Cadastrado (lista fria):**
- Teaser básico gerado pela Mary AI com dados públicos
- Mensagem: "Esta empresa ainda não possui Readiness Score calculado."
- CTA: `[ Acompanhar este Ativo ]` → email automático ao ativo

**Cenário 2 — Ativo Cadastrado (com MRS):**
- Teaser mais completo + MRS exibido
- CTAs variam:
  - 2.1 (com Advisor): `[ Acompanhar ]` + `[ Contatar Advisor ]`
  - 2.2 (sem Advisor): `[ Acompanhar ]` + `[ Contatar Empresa ]`

**Card especial no final da grid:**
> "Conhece uma empresa? Convide para o Radar."

### 6.6 Tela: Teses de Investimento ✅ IMPLEMENTADO (base)

**Rota:** `/investidor/teses` (impl: `/[orgSlug]/thesis`)

Múltiplas teses em abas separadas. `[ + Nova Tese ]` para criar. Todos os campos editáveis pós-onboarding.

### 6.7 Tela: Feed ⚠️ PARCIAL

Atualizações consolidadas dos ativos seguidos. Filtros: `[ Todos ]` / `[ Selecione um projeto ▼ ]` / `[ + Convidar Ativo ]`.

### 6.8 Tela: Projetos (Kanban) ⚠️ PARCIAL

Visão kanban de todos os projetos. Busca semântica. Clicar no card → Resumo do projeto.

**Resumo do Projeto (visão investidor):**
- Campos: Nome, início, responsável, tipo de deal, valor alvo, participação, advisors, visibilidade
- Abas: `[ Resumo ] [ MRS ] [ + Info ]`
- MRS com liberação progressiva (NDA → passos 1-2; NBO → passos 3-4)

---

## 7. Jornada do Advisor

> Fonte: `04_ADVISOR.md`

### 7.1 Etapa 2 — Pré-Cadastro ❌ AUSENTE

**Rota:** `/register/advisor` (pública: `/advise`)

Campos: Nome completo, nome da empresa/boutique, email, senha, tipo de atuação (Contabilidade, Planejamento Financeiro, Conselheiro(a)).

### 7.2 Etapa 3 — Onboarding (2 passos) ❌ AUSENTE

#### Passo 1 — Defina seu Perfil de Atuação

| Campo | Tipo | Status impl. |
|-------|------|-------------|
| Nome real do responsável | Text (auto-filled) | ❌ |
| Nome da empresa/boutique | Text (auto-filled) | ❌ |
| Descrição do perfil de atuação | Textarea | ❌ |
| Setores-alvo de atuação | Multi-select | ❌ |
| Regiões de atuação | Select em 2 passos | ❌ |
| Porte das empresas-alvo | Select (Pequeno, Médio, Grande) | ❌ |
| Tipo de operação preferida | Multi-select | ❌ |

#### Passo 2 — Quem Você Já Assessora?

Campos: Ativos que já assessora (lista: nome, email, CNPJ), convidar membros da equipe.

Pergunta contextual: "Gostaria de contatar possíveis Ativos ou Investidores?" → Sim/Não

### 7.3 Área Logada ❌ AUSENTE

**Menu lateral:** `Radar / Perfil / Feed / Projetos`

### 7.4 Tela: Radar (Leads) ❌ AUSENTE

Duas abas:
- **Leads Sell Side:** encontrar ativos para fechar mandatos. CTAs: `[ Ver Teaser ]` `[ Ofertar Serviços ]`
- **+ Investidores:** screening para encontrar investidores qualificados

### 7.5 Tela: Perfil de Atuação ❌ AUSENTE

Múltiplos perfis em abas separadas. `[ + Nova Atuação ]` para criar.

### 7.6 Tela: Feed ❌ AUSENTE

Atualizações de projetos, ativos e investidores sob gestão.

### 7.7 Tela: Projetos (Portfólio) ❌ AUSENTE

Tabela: Projeto, Responsável, Etapa, Tipo (Sell/Buy Side), Email.

Fluxo `+ Novo Projeto`: Nome + email + CNPJ → Mary busca na base → se encontra, vincula; se não, envia convite.

### 7.8 Permissões do Advisor ❌ AUSENTE

| Ação | Advisor pode? |
|------|--------------|
| Visualizar todos os dados do projeto | ✅ |
| Editar todos os campos do projeto | ✅ |
| Editar Teaser, Valuation, Deck/CIM | ✅ |
| Adicionar documentos ao VDR | ✅ |
| Convidar investidores | ✅ |
| Editar permissões administrativas | ❌ |
| Editar faturamento | ❌ |

---

## 8. Módulos compartilhados

> Fonte: `05_SHARED_MODULES.md`

### 8.1 Radar — Lógica geral ⚠️ PARCIAL

| Usuário | O que exibe | Base do filtro |
|---------|-------------|----------------|
| Ativo | Investidores com tese aderente | Setor, porte, ROB, cheque, região |
| Investidor | Ativos anonimizados compatíveis | Setor, ROB, EBITDA, região, MRS mínimo |
| Advisor | Leads (ativos sem advisor + investidores qualificados) | Perfil de atuação |

### 8.2 MRS — Market Readiness Score ✅ IMPLEMENTADO (base sólida)

4 passos. Gates NDA/NBO. Score 0-100.

### 8.3 VDR — Virtual Data Room ❌ AUSENTE

Duas camadas: PRÉ-DD (base do MRS, automática) e DUE DILIGENCE (editável).

### 8.4 Pipeline M&A 🔄 REQUER EXPANSÃO

**Excalidraw define 12 fases:**
```
Screening → Teaser → NDA → CIM/DFs → IoI → Management Meetings → NBO → DD/SPA → Signing → CPs → Closing → Disclosure
```

**Implementação atual (PRD v2.2): 5 marcos:**
```
Teaser → NDA → NBO → SPA → Fechado/Perdido
```

**Ação necessária:** Expandir pipeline de 5 para 12 fases conforme Excalidraw. A base de kanban existe, precisa adicionar as fases intermediárias.

### 8.5 Geração de Documentos — Mary AI ❌ AUSENTE (majoritariamente)

| Documento | Quando gerado | Status impl. |
|-----------|---------------|-------------|
| Dossiê da empresa | Pós-onboarding Ativo | ❌ |
| MRS inicial | Pós-onboarding Ativo | ❌ |
| Teaser v1 | Pós-onboarding Ativo | ❌ |
| Overview v1 | Pós-onboarding Ativo | ❌ |
| Valuation v1 | Mediante solicitação | ❌ |
| CIM/Deck v1 | Mediante solicitação | ❌ |

### 8.6 Feed ⚠️ PARCIAL

Existe base mas precisa completar eventos por perfil e email semanal automático.

### 8.7 Configurações ❌ AUSENTE

Abas: Conta, Faturamento, Equipe.

### 8.8 NDA — Hierarquia de acesso ⚠️ PARCIAL

Base implementada (gates NDA/NBO no MRS e pipeline). Falta implementação completa da hierarquia progressiva em todas as telas.

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| **Ativo** | Empresa que busca investimento ou venda |
| **Investidor** | Fundo, corporate ou individual comprador |
| **Advisor** | Boutique de M&A ou assessor financeiro |
| **MRS** | Market Readiness Score — score 0 a 100 de maturidade para M&A |
| **Codinome** | Nome fictício do projeto para preservar confidencialidade (ex: Projeto Tiger) |
| **Teaser** | Documento de apresentação anonimizado, gerado pela Mary AI |
| **CIM / Infomemo** | Confidential Information Memorandum — documento detalhado pós-NDA |
| **NDA** | Non-Disclosure Agreement |
| **NBO** | Non-Binding Offer |
| **IoI** | Indication of Interest |
| **SPA** | Share Purchase Agreement |
| **DD** | Due Diligence |
| **VDR** | Virtual Data Room |
| **Tese de Investimento** | Critérios de um investidor para alocação de capital |
| **Pipeline M&A** | Funil de avanço do processo ativo ↔ investidor |
| **RAG** | Retrieval-Augmented Generation — base de conhecimento da Mary AI |

---

## 10. Backlog reconciliado (E0 — E10)

### Sumário de impacto da reconciliação nos épicos existentes

| Épico | Status pré-reconciliação | Impacto |
|-------|--------------------------|---------|
| E1 | ✅ Concluído | ⚠️ Ajustes: ordem de menu investidor, codinome dinâmico no menu ativo |
| E2 | ✅ Concluído | ⚠️ Complemento: campos ROB/EBITDA%, tipo operação, critérios exclusão |
| E3 | ✅ Concluído | ✅ Aderente — MRS está bem alinhado |
| E4 | ✅ Concluído | 🔄 Pipeline precisa expandir de 5 para 12 fases |
| E5 | Pendente | Sem alteração |
| E6 | Pendente | Sem alteração |
| E7 | Pendente | Sem alteração |
| E8 | Pendente | Sem alteração (Advisor parcial) |
| E9 | Pós-MVP | Sem alteração |
| E10 | Em andamento | Subsumido por este PRD v3.0 |

### [P0] [ÉPICO] E0 — Realinhamento Excalidraw (NOVO — PRIORIDADE MÁXIMA)

> **Este é o épico retroativo que antecede todos os outros.** Corrige as divergências críticas identificadas entre o Excalidraw e a implementação.

- **Descrição:** Refatorar implementação para aderir ao Excalidraw como fonte de verdade.
- **Valor de negócio:** Recuperar confiança do cliente. Liberar parcelas. Garantir que produto entregue = produto esperado.
- **Dependências:** Nenhuma (é o primeiro a ser executado).
- **Estimativa:** XL
- **Risco:** Alto

#### [P0] [HISTÓRIA] H0.1 — Refatorar Onboarding do Ativo (4 passos Excalidraw)

- **Descrição:** Substituir os 5 passos genéricos atuais pelos 4 passos M&A do Excalidraw.
- **Campos a implementar:** Todos os 17+ campos dos Passos 1-4 (descrição empresa, objetivo projeto com opções dinâmicas, modelo negócio, ROB, EBITDA%, funcionários, fundação, sede, participação ofertada, valor alvo, sócios, advisors, codinome).
- **Reutilização:** GeographySelector, setores multi-select, componentes de formulário existentes.
- **Critérios de aceite:** Onboarding em 4 passos conforme Excalidraw, campo a campo, com tooltips e auto-save.
- **Estimativa:** L
- **Risco:** Alto (impacto visual direto para o cliente)

#### [P0] [HISTÓRIA] H0.2 — Complementar campos da Tese de Investimento

- **Descrição:** Adicionar campos faltantes na tese: ROB min/max (separado de cheque), EBITDA% mínimo, público-alvo da empresa-alvo, tipo de operação, critérios de exclusão.
- **Critérios de aceite:** Todos os campos do Excalidraw Passos 1-2 do onboarding investidor presentes e funcionais.
- **Estimativa:** M
- **Risco:** Médio

#### [P0] [HISTÓRIA] H0.3 — Expandir Pipeline de 5 para 12 fases

- **Descrição:** Adicionar fases intermediárias: Screening, CIM/DFs, IoI, Management Meetings, DD/SPA, Signing, CPs, Closing, Disclosure.
- **Critérios de aceite:** Kanban com 12 colunas conforme Excalidraw. Cards de investidores arrastáveis entre fases.
- **Estimativa:** M
- **Risco:** Médio

#### [P1] [HISTÓRIA] H0.4 — Implementar Breadcrumbs globais

- **Descrição:** Componente de breadcrumb em todas as telas conforme regras globais.
- **Estimativa:** S
- **Risco:** Baixo

#### [P1] [HISTÓRIA] H0.5 — Transformar Mary AI de página para sidebar

- **Descrição:** Mary AI deve empurrar conteúdo para a esquerda (benchmark: Evernote), ser contextual por tela.
- **Estimativa:** L
- **Risco:** Médio

#### [P1] [HISTÓRIA] H0.6 — Padronizar auto-save e tooltips em todas as telas

- **Descrição:** Hook `useAutoSave` reutilizável + feedback visual. Tooltips em todos os campos com texto do Excalidraw.
- **Estimativa:** M
- **Risco:** Baixo

#### [P1] [HISTÓRIA] H0.7 — Ajustar menus laterais por perfil

- **Descrição:** Investidor: Radar/Teses/Feed/Projetos (nessa ordem). Ativo: MRS/Radar/Feed/[Codinome do projeto]. Advisor: Radar/Perfil/Feed/Projetos.
- **Estimativa:** S
- **Risco:** Baixo

### Priorização recomendada para liberação de parcela

**Sprint imediato (libera parcela):**
1. H0.1 — Refatorar Onboarding Ativo (impacto visual máximo para o cliente)
2. H0.7 — Ajustar menus (rápido, visível)
3. H0.4 — Breadcrumbs (rápido, visível)

**Sprint seguinte:**
4. H0.2 — Complementar tese investidor
5. H0.3 — Expandir pipeline
6. H0.6 — Auto-save e tooltips

**Sprint posterior:**
7. H0.5 — Mary AI sidebar

### Épicos existentes (mantidos, com notas de reconciliação)

**E1 — Fundação de navegação** ✅ Concluído
- Nota: Ajustar ordem do menu investidor (Radar primeiro, Teses segundo) e adicionar codinome dinâmico no menu ativo. Incluído em H0.7.

**E2 — Onboarding Investidor** ✅ Concluído (base)
- Nota: Complementar com H0.2 (campos ROB, EBITDA%, tipo operação, critérios exclusão).

**E3 — MRS canônico** ✅ Concluído
- Nota: Bem alinhado ao Excalidraw. Sem ação imediata.

**E4 — Projetos com marcos jurídicos** ✅ Concluído (base)
- Nota: Expandir pipeline com H0.3.

**E5 — Feed, alertas e recorrência** — Pendente (sem alteração)

**E6 — IA assistiva** — Pendente (sem alteração, mas H0.5 impacta a implementação)

**E7 — Hardening de segurança** — Pendente (sem alteração)

**E8 — Advisor** — Pendente (sem alteração, Excalidraw confirma escopo parcial)

**E9 — Pós-MVP** — Mantido

**E10 — Context Engineering Excalidraw x Frontend** — Subsumido por este PRD v3.0

---

## 11. Decisões consolidadas (MVP reconciliado)

### Incluído no MVP (reconciliado)

| Bloco | Escopo |
|-------|--------|
| Onboarding Ativo | 4 passos M&A (Excalidraw) com todos os campos |
| Onboarding Investidor | 2 passos com campos completos de tese |
| Navegação | Menus por perfil conforme Excalidraw |
| MRS | 4 passos, score normativo, gates NDA/NBO |
| Radar | Por tese (investidor), por projeto (ativo) |
| Feed | Cronológico com eventos mínimos |
| Pipeline | 12 fases conforme Excalidraw |
| Mary AI | Sidebar contextual (empurra conteúdo) |
| Regras globais | Auto-save, tooltips, breadcrumbs |
| Advisor | Escopo parcial: onboarding 2 passos + fluxo mínimo |

### Pós-MVP (mantido)

| Tema | Estado |
|------|--------|
| Chat interno completo | Pós-MVP |
| Automações autônomas de IA | Pós-MVP |
| Benchmark setorial MRS | Pós-MVP |
| Mensageria interna completa | Pós-MVP |
| VDR completo | Pós-MVP (estrutura básica no MVP) |
| Geração automática de documentos | Pós-MVP (UI preparada no MVP) |

---

## 12. Riscos e mitigações

### Risco 1: Cliente perceber que realinhamento é superficial
- **Mitigação:** H0.1 (onboarding ativo) é a entrega mais visualmente impactante. Priorizar primeiro.

### Risco 2: Retrabalho extenso que atrasa entregas
- **Mitigação:** Reaproveitar componentes existentes (GeographySelector, ShareholderEditor, setores). Estimativa real de H0.1 é L, não XL.

### Risco 3: Novas divergências surgirem durante implementação
- **Mitigação:** Toda implementação começa lendo o arquivo Excalidraw correspondente e mapeando campo a campo antes de codar.

### Risco 4: PRD v3.0 ficar desatualizado
- **Mitigação:** Atualizar este documento a cada sprint. Manter hierarquia: Excalidraw > PRD v3.0 > código.

---

## 13. Métricas de sucesso (mantidas do PRD v2.2)

### Produto
- Tempo até primeiro valor no Investidor (tese + radar útil)
- Tempo até primeira evolução de score no Ativo
- Recorrência semanal de uso (feed + alertas)

### Conversão operacional
- Taxa teaser → NDA
- Velocidade média entre marcos
- Percentual de ativos com progresso consistente no MRS

### Saúde operacional do MRS
- Tempo médio de atualização de status por item
- Taxa de itens `completo` por passo
- Proporção de itens `na` por ativo
- Diferença entre sugestão IA e validação humana

---

## 14. Próximos passos

1. ✅ PRD v3.0 Reconciliado criado (este documento)
2. ⬜ Apresentar ao cliente como plano de correção
3. ⬜ Iniciar E0/H0.1 — Refatoração do Onboarding Ativo
4. ⬜ Validar com cliente após H0.1 entregue
5. ⬜ Executar H0.2 a H0.7 em sprints sequenciais
6. ⬜ Retomar E5-E8 após E0 concluído

---

## Histórico de revisões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | Dez/2024 | Equipe Mary | Consolidação inicial |
| 1.2 | 19/12/2025 | Equipe Mary | Atualização pré-pivot |
| 2.0 | 23/03/2026 | Equipe Mary | Pivot MVP (calls 07/03 e 14/03) |
| 2.1 | 23/03/2026 | Equipe Mary | Consolidação call 14/03 |
| 2.2 | 23/03/2026 | Equipe Mary | Contrato funcional MRS |
| **3.0** | **01/04/2026** | **Equipe Mary** | **Reconciliação Excalidraw — fonte primária. Criação do E0 (realinhamento).** |
