# Mary — Regras Globais da Plataforma

## 1. Auto-save

- **Todo campo da plataforma salva automaticamente** ao ser preenchido ou alterado — sem botões "Salvar".
- Ao salvar, exibir **feedback visual sutil**: check (✓) ou texto em verde indicando que o dado foi salvo.
- Esse comportamento é padrão em todas as telas, formulários, editores de documento e campos de onboarding.
- Campos preenchidos automaticamente pelo sistema (auto-filled) devem permanecer **editáveis** pelo usuário.

---

## 2. Tooltips

- **Todos os campos devem ter tooltips** claras e objetivas.
- Tooltips ajudam o usuário a entender o propósito de cada campo, especialmente em contexto de M&A onde a terminologia pode ser técnica.
- Ver tooltips específicas por campo em cada arquivo de usuário (`02_ATIVO.md`, `03_INVESTIDOR.md`, `04_ADVISOR.md`).

---

## 3. Breadcrumbs

- Sempre indicar o caminho completo de navegação no topo da tela.
- Passos/páginas anteriores são **clicáveis**.
- A página atual é exibida mas **não tem link** (usuário já está nela).
- Exemplos:
  - `Início > Onboarding > Passo 1`
  - `Início > Tiger > Investidores`
  - `Início > Projetos > Tiger > MRS`

---

## 4. Mary AI — Sidebar Global

### Comportamento
- Botão da Mary AI sempre visível no canto da tela (padrão: canto inferior direito ou no header como `Mary AI ▼`).
- Ao acionar, a sidebar **empurra e espreme** o conteúdo principal para a esquerda (benchmark: Evernote).
- A sidebar é **contextual** — a Mary AI sabe em qual tela o usuário está e adapta suas sugestões.

### Capacidades no MVP (assistente apenas — não executa)
- Consultar bases de dados da plataforma
- Responder perguntas sobre o projeto, processo de M&A, documentos
- Conferir e revisar documentos
- Sugerir ajustes e melhorias
- Resumir informações
- Explicar termos e etapas do processo
- **Não executa nada diretamente** — sugere que o usuário realize a ação, assim como o Gemini faz hoje

### Saudação inicial
Ao abrir a sidebar pela primeira vez: `"Prazer, sou a Mary AI. Estarei sempre aqui!"`

### Prompt contextual de boas-vindas
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

### Disclaimer obrigatório (rodapé do chat)
```
A Mary AI pode cometer erros. A Mary não usa dados da "[Nome da Empresa]" para treinar os modelos.
```

### Geração automática de documentos (pós-onboarding)
Após finalizar o onboarding do Ativo, a Mary AI:
1. Coleta todos os campos preenchidos como base
2. Executa agente "deep research" para levantar informações públicas sobre o ativo
3. Gera automaticamente:
   - Dossiê da empresa (resumo executivo, SWOT, pontos de destaque, timeline)
   - MRS inicial
   - Primeira versão do Teaser
   - Primeira versão do Overview
4. Esse dossiê alimenta o RAG do ativo e é alocado no VDR em Q&As

### Fluxo de aprovação de documentos gerados pela Mary AI
1. Mary AI gera primeira versão de cada documento (Overview, Teaser, Valuation, CIM, NDA)
2. Usuário pode interagir no chat para refinar o documento
3. Ao final de cada conversa, Mary AI pergunta: **"Deseja aprovar esta versão?"**
4. Se aprovada:
   - Vira a versão final do documento
   - Alimenta o contexto da empresa (melhora o RAG)
5. Todos os arquivos anexados no chat entram automaticamente no VDR da empresa

---

## 5. Sistema de Mensageria Automática

> **CRÍTICO**: Todas as mensagens automáticas, modais, tooltips e triggers devem ser gerenciadas em uma **única tabela central no banco de dados** — o "Mary Messaging System". Isso garante governança, facilita manutenção e permite evolução sem que mensagens fiquem espalhadas no código.

### Categorias de mensagens a centralizar
- Mensagens de onboarding
- Emails automáticos (convites, notificações, alertas)
- Modais de boas-vindas e parabéns
- Tooltips de campos
- Alertas e notificações in-app
- Mensagens da Mary AI (templates)
- Triggers de engajamento (ex: email semanal)

### Exemplos de mensagens automáticas catalogadas

**Convite de Advisor para Ativo (enviado por email):**
> "Olá [Fulano], o(a) advisor [Zezito] da [NOME DA EMPRESA DO ADVISOR] encontrou o perfil da [EMPRESA/ATIVO] na Mary e gostaria de ofertar seus serviços. Abaixo o email dele para que possa fazer contato direto, apresentar seu projeto e solicitar uma proposta. A Mary deseja boa sorte e bons negócios. Qualquer dúvida, só entrar em contato conosco."

**Convite de Investidor para Ativo não cadastrado:**
> "Há um novo investidor interessado em sua empresa. Se for do seu interesse, cadastre sua empresa na Mary gratuitamente e comece a se preparar para um possível investimento."

**Email semanal para Investidores:**
> Resumo de movimentações dos ativos que segue. Objetivo: manter engajamento.

**Email semanal para Advisors:**
> Resumo de movimentações de projetos, ativos e investidores que segue.

---

## 6. NDA e Controle de Acesso a Dados

- Dados financeiros e sensíveis de ativos **nunca são exibidos publicamente**.
- Apenas usuários cadastrados na Mary, **após NDA assinado e autorizados**, podem visualizar os detalhes completos.
- O ativo **controla quem, como e quando** acessa os dados da empresa e do projeto.
- Investidores veem apenas o **codinome** do projeto até assinarem NDA.

### Liberação progressiva do MRS para Investidor
| Evento | O que é liberado |
|---|---|
| Investidor assina NDA | Passos 1 e 2 do MRS |
| Investidor assina NBO | Passos 3 e 4 do MRS |
| Investidor assina SPA | Status automático: Fechado |

---

## 7. Navegação por Abas — Comportamento Padrão

- Ao clicar em uma aba ou menu, o sistema **negrita e sublinha** o item ativo.
- A aba ativa é visualmente diferenciada das demais.

---

## 8. Seleção de Regiões (campo global)

Seleção em **2 passos**:
1. Mostra continentes primeiro
2. Após selecionar um continente, usuário escolhe os países daquele continente
3. Opção de selecionar todos os países de um continente de uma vez

---

## 9. Campos de Setor (campo global)

- Permite **multisseleção**
- Tooltip: "Você pode selecionar múltiplos setores. Quanto mais específico, melhor o match."

---

## 10. Permissões de Advisor

- Por padrão, o Advisor tem **permissão total de edição** dos projetos dos seus clientes (Ativos).
- Exceção: não pode editar **permissões administrativas** do cliente (ex: faturamento da conta).

---

## 11. Vínculo Automático Advisor ↔ Ativo

- Quando um Ativo se cadastra através de um convite enviado pelo Advisor, ele é **automaticamente vinculado** à conta do Advisor.
- Após esse vínculo, o Advisor pode acessar a área de membros autorizados e incluir novos investidores.

---

## 12. Compartilhamento de Projetos — Opções

| Modo | Comportamento |
|---|---|
| **Privado** | Projeto não aparece em nenhum radar. Apenas equipe + advisors autorizados acessam. |
| **Restrito** | Compartilhável com investidores específicos via link de convite. Não aparece no Radar. |
| **Radar Mary** | Publicado no Radar geral da Mary. Nunca fora do ambiente da plataforma. |

> Todos os compartilhamentos exigem cadastro e login.
