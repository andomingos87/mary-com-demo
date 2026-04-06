$f$# Mary — Módulos Compartilhados

> Este arquivo documenta os módulos que são compartilhados entre os três tipos de usuário (Ativo, Investidor, Advisor) com variações por contexto.

---

## 1. Radar — Lógica e Estrutura Geral

O Radar é o coração da plataforma. Cada perfil tem seu próprio Radar, mas todos seguem a mesma lógica base de **matching por tese/perfil**.

### Como funciona o matching

| Usuário | O que o Radar exibe | Base do filtro |
|---|---|---|
| Ativo | Investidores com tese aderente ao projeto | Setor, porte, ROB, cheque, região |
| Investidor | Ativos (anonimizados) compatíveis com a tese | Setor, ROB, EBITDA, região, MRS mínimo |
| Advisor | Leads (ativos sem advisor + investidores qualificados) | Perfil de atuação |

### Após o Onboarding
- O Radar do **Ativo** já filtra Investidores com tese aderente ao projeto recém-criado
- O Radar do **Investidor** já exibe ativos compatíveis com a primeira tese cadastrada (selecionada por padrão)
- O Radar do **Advisor** já exibe leads filtrados pelo perfil de atuação

### Anonimização
- Ativos aparecem no Radar de Investidores com **codinome** — nunca com nome real
- Investidores aparecem no Radar de Ativos com nome e dados completos (não são anonimizados)
- Advisors veem ativos anonimizados no Radar de Leads

### Botão `[ + Convidar ]` (estimula efeito de rede)
- **Ativo:** `[ + Convidar Investidores ]` — fixo dentro da área do Projeto
- **Investidor:** `[ + Convidar Ativo ]` — adiciona empresa externa ao Radar
- **Advisor:** Fluxo via Projetos → `[ + Novo Projeto ]`

---

## 2. MRS — Market Readiness Score

### O que é
Score de 0 a 100 que reflete a maturidade do ativo para um processo de M&A. Calculado automaticamente pela Mary AI com base nos documentos enviados ao VDR.

### Geração inicial
- Após o onboarding do Ativo, Mary AI gera um **MRS inicial** com base nas informações preenchidas + pesquisa pública (deep research)
- O score evolui conforme o ativo sobe documentos para o VDR

### Estrutura em passos (4 passos)

| Passo | Conteúdo | Desbloqueio para Investidor |
|---|---|---|
| Passo 1 | Dados básicos da empresa e do projeto | Após NDA assinado |
| Passo 2 | Dados financeiros e operacionais | Após NDA assinado |
| Passo 3 | Documentação legal e societária | Após NBO assinado |
| Passo 4 | Due Diligence avançada | Após NBO assinado |

### Visibilidade por perfil

| Perfil | O que vê do MRS |
|---|---|
| Ativo | Score completo, breakdown por categoria, documentos faltantes |
| Investidor | Score do ativo no card do Radar; passos desbloqueados conforme pipeline |
| Advisor | Score do cliente (ativo) que representa — acesso completo |

### Slider de MRS Mínimo (no Radar do Investidor)
- Investidor pode ajustar o MRS mínimo para filtrar ativos no Radar
- Faixa: 0 a 100

### Notas técnicas críticas
1. Definir **tamanho máximo** para upload dos arquivos no VDR
2. Definir **formatos de arquivos permitidos**
3. Mary AI precisa interpretar os documentos para calcular o score

---

## 3. VDR — Virtual Data Room

### O que é
Repositório de documentos do processo de M&A. Organizado em duas camadas:

### Estrutura

**1. PRÉ-DD / PREPARAÇÃO**
- Criada automaticamente ao criar a empresa
- Subpastas e arquivos = base do MRS
- Itens colapsáveis em árvore com indent por nível

**2. DUE DILIGENCE**
- Estrutura livremente editável
- Sócios e Advisors fazem upload conforme demandas específicas de cada investidor
- Compartilhado apenas após investidor entrar na fase de DD

### Colunas da tabela VDR
```
✓ | ID | Solicitações | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Comentários | Prioridade | Status | Responsável | Revisor | Flags | Arquivos | Tags | Risco | Data Início | Prazo | Últ. Atualização | ⋮
```

### Controles disponíveis
- `Busca` — busca de documentos
- `Filtros` — filtros por coluna
- `Ações em massa` — operações em lote
- `Permissões` — controle de acesso por investidor
- `Notificações` — alertas de atividade
- `+ Documentos` — adicionar novos documentos

### Acesso por perfil

| Perfil | Acesso ao VDR |
|---|---|
| Ativo | Acesso total — upload, edição, controle de permissões |
| Advisor | Acesso total — mesmo nível do ativo (exceto permissões administrativas) |
| Investidor | Acesso progressivo — liberado conforme avanço no pipeline (NDA → NBO → SPA) |

### Integração com Mary AI
- Todos os arquivos **anexados no chat da Mary AI** entram automaticamente no VDR
- Mary AI interpreta os documentos para alimentar o MRS e o RAG da empresa
- Documentos aprovados no chat viram versões finais e alimentam o contexto do projeto

---

## 4. Pipeline M&A — Fases e Kanban

### Fases do pipeline (em ordem)
```
Screening → Teaser → NDA → CIM / DFs → IoI → Management Meetings → NBO → DD / SPA → Signing → CPs → Closing → Disclosure
```

### Kanban de Investidores (visão do Ativo)

**Rota:** `/ativo/projects/:codename/pipeline`

**Controles:**
- `Pipeline` / `Lista` — alternar entre visão kanban e lista
- `Busca` — busca por investidor
- `Filtros` — filtros por coluna/fase
- `Ações em massa` — operações em lote
- `Permissões` — controle de acesso
- `Members` — membros do projeto
- `Share` — compartilhamento

**Colunas do kanban (cada fase é uma coluna):**

| Coluna | Contador |
|---|---|
| Screening | (n) |
| Teaser | (n) |
| NDA | (n) |
| CIM / DFs | (n) |
| IoI | (n) |
| Management Meetings | (n) |
| NBO | (n) |
| DD / SPA | (n) |
| Signing | (n) |
| CPs | (n) |
| Closing | (n) |
| Disclosure | (n) |

> `(n)` = número de investidores em cada fase

**Cards do kanban:**
- Nome do investidor (clicável → perfil completo)
- Filtro disponível em cada coluna/fase

---

## 5. Geração de Documentos — Mary AI

### Documentos gerados automaticamente pela Mary AI

| Documento | Quando é gerado | Base de dados |
|---|---|---|
| Dossiê da empresa | Ao finalizar o onboarding do Ativo | Campos do onboarding + deep research |
| MRS inicial | Ao finalizar o onboarding do Ativo | Campos do onboarding + documentos |
| Teaser (v1) | Ao finalizar o onboarding do Ativo | Dossiê + campos do onboarding |
| Overview da empresa (v1) | Ao finalizar o onboarding do Ativo | Dossiê + campos do onboarding |
| Valuation (v1) | Mediante solicitação | Dados financeiros + MRS |
| CIM / Deck (v1) | Mediante solicitação | Dossiê completo |

### Fluxo de geração e aprovação

```
1. Mary AI gera primeira versão automaticamente
2. Usuário revisa no editor
3. Usuário interage no chat da Mary AI para refinar
4. Mary AI pergunta: "Deseja aprovar esta versão?"
5. Se aprovada:
   → Vira versão final do documento
   → Alimenta o RAG da empresa (melhora futuras respostas)
   → Arquivos anexados vão para o VDR
```

### Estrutura do Teaser

```
Capa
  - Descrição da empresa
  - Setor e tempo de operação
  - Faturamento e posicionamento

Mercado
  - Informações sobre mercado-alvo

Detalhes
  - Objetivo da operação (captação/venda)
  - Prazo esperado

Dados
  - KPIs e métricas principais
```

---

## 6. Feed — Atualizações (todos os perfis)

### Propósito
Manter todos os usuários informados sobre movimentações relevantes nos projetos que acompanham.

### Por perfil

| Perfil | O que aparece no Feed |
|---|---|
| Ativo | Atividades dos investidores no pipeline do projeto |
| Investidor | Movimentações dos ativos que segue (MRS, documentos, pipeline) |
| Advisor | Movimentações de projetos, ativos e investidores sob sua gestão |

### Email semanal automático
- Enviado para **todos os perfis**
- Conteúdo personalizado por perfil
- Objetivo: manter engajamento entre sessões

---

## 7. Configurações (todos os perfis)

### Abas comuns

**`[ Conta ]`**
- Informações da conta
- Configurações de segurança
- Backups
- Logs de atividade

**`[ Faturamento ]`**
- Plano atual
- Histórico de pagamentos
- Dados de cobrança

**`[ Equipe ]`**
- Membros com acesso à conta
- Permissões por membro
- Convite de novos membros

---

## 8. Convite de Membros (todos os perfis)

### Botão `+ Convidar membro`
- Disponível no rodapé de todas as telas logadas
- Abre campo de nome + email para envio de convite
- Membro convidado recebe email com link de acesso

### Tipos de membro por projeto
- **Sócios/Equipe interna:** acesso total ao projeto
- **Advisors:** acesso total exceto permissões administrativas
- **Investidores:** acesso progressivo conforme pipeline

---

## 9. NDA — Controle de Acesso

### Hierarquia de acesso

```
Visitante (sem login)
  → Vê apenas landing page

Cadastrado (com login, sem NDA)
  → Vê Radar com dados anonimizados
  → Pode acompanhar ativos
  → Não vê dados sensíveis

Cadastrado (com NDA assinado para um ativo específico)
  → Vê Passos 1 e 2 do MRS
  → Vê Teaser completo

Cadastrado (com NBO assinado)
  → Vê Passos 3 e 4 do MRS
  → Acesso ao VDR de Due Diligence

Após SPA assinado
  → Status do projeto: Fechado
```

### Documentos legais disponíveis no pipeline
- NDA — Non-Disclosure Agreement
- NBO — Non-Binding Offer
- SPA — Share Purchase Agreement
- CIM — Confidential Information Memorandum
