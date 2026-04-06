A modal de criação de projeto está muito simples, precisa de mais dados para criar o projeto pois iremos precisar deles depois.

---

## Status (implementado vs pendente)

### Task de correção (resumo) ✅
- **Nome do projeto** já existe, mas o botão **"Gerar com IA"** precisa ficar no campo **Nome** (não no codinome).
- O **nome gerado** deve ser um nome real (não slug).
- O **slug/codename** deve derivar do nome e validar unicidade/disponibilidade automaticamente.

### 3) Slug automático ✅
- `codename` é gerado automaticamente a partir do nome via `generateSlug(name)`.
- O usuário pode editar manualmente.
- Usado na URL como antes (`/{orgSlug}/projects/{codename}`).

### 4) Objetivo do projeto ✅
- Opções serão apenas: **Venda do Ativo** e **Captação de recursos**.
- Formulário dinâmico conforme objetivo escolhido.

#### Venda do Ativo
- Valor mínimo e máximo (em USD, com máscara de currency, separador de milhares e prefixo `USD`).
- Motivos da venda:
  - Aposentadoria dos sócios
  - Sucessão familiar
  - Diversificação de investimentos
  - Necessidade de liquidez
  - Parceria estratégica
  - Valorização do ativo

#### Captação de recursos
- Valor mínimo e máximo (em USD, com máscara de currency, separador de milhares e prefixo `USD`).
- Equity mínimo e máximo (%).
- Motivos da captação:
  - Crescimento da empresa
  - Nova linha de produtos
  - Expansão geográfica
  - Investimento em tecnologia
  - Capital de giro
  - Aquisições estratégicas


#### Regra adicional (responsáveis)
- Responsáveis **devem ter conta** na plataforma.
- Se não tiverem, **enviar convite** automaticamente ao adicionar.

#### Pontos de atenção (revisão)
1. **Sem validação de email no servidor** — `createProject` e `updateProject` não validam formato de email dos contatos. Um contato com email inválido é salvo sem erro.
2. **Sem limite de contatos** — Não há cap no array. Sugere-se limitar a ~10 contatos.
3. **Cast `as unknown as Json`** — Usado em `projects.ts`. Quando os types forem regenerados, esses casts devem ser removidos.
4. **Sem deduplicação** — Dois contatos com mesmo email podem ser adicionados. Considerar aviso ao usuário.
5. **Telefone não validado** — Só nome+email são obrigatórios. Se telefone é relevante para M&A, considerar torná-lo recomendado (warning, não bloqueio).

### 6) Sessão Advisor (Radio Button) ✅
- Opções:
  - "Já possuo advisor para este projeto"
  - "Gostaria de receber recomendações da Mary"
- Persistido em `projects.advisor_preference`.

#### Regra adicional (advisor próprio)
- Se o usuário marcar **"Já possuo advisor"**, abrir campo para **email do advisor**. Se o email digitado ja for um usuário aparecer convidar, e se não for usuário, mostrar botão **enviar convite**.

### 7) Criar projeto ✅
- Fluxo atualizado para enviar `name`, `codename`, `objective`, `contacts`, `advisorPreference`,
  `advisorEmail` (quando aplicável), e os campos dinâmicos do objetivo
  (valores mínimos/máximos em USD, equity %, motivos).

---

## Ajustes do banco (Supabase)

- Migração aplicada:
  - `projects.name` (varchar, NOT NULL)
  - `projects.contacts` (jsonb, default `[]`)
  - `projects.advisor_preference` (varchar)
  - `projects.visibility` (varchar, default `private`) — já era usado no código, mas faltava no schema

### Pendências de schema (a definir)
- Campos para **valores mínimos/máximos** (USD) e **equity %**.
- Campos para **motivos** (venda/captação).
- Campo para **advisorEmail** (quando “já possuo advisor”).

---

## Arquivos principais atualizados

- `src/components/projects/CreateProjectDialog.tsx` (novo formulário completo)
- `src/lib/actions/projects.ts` (createProject atualizado)
- `src/types/projects.ts` (tipos para contatos e advisor)
- `src/types/database.ts` (types atualizados do Supabase)
- `src/lib/projects/slug.ts` (slug + mock IA)
- `src/components/projects/ProjectCard.tsx` (mostra `project.name`)
- `src/app/(protected)/[orgSlug]/projects/[codename]/layout.tsx` (breadcrumb/título usam `name`)

---

## Observação do teste (Playwright MCP)

- No Playwright os estilos CSS estavam carregando normalmente.
- Erro apenas de `favicon.ico` 404 (não relacionado ao CSS).

---

## Erro em dev (Next.js) ✅

- **Mensagem:** `Error: Cannot find module './vendor-chunks/@supabase.js'`
- **Stack:** `.next/server/webpack-runtime.js` → `.next/server/app/(protected)/[orgSlug]/projects/page.js`
- **Contexto:** erro durante geração da página no ambiente de desenvolvimento (Next.js).
- **Sintoma:** página de projetos não renderiza (Server Error).

---

## Correções pendentes reportadas pelo cliente ✅

1) Adicionar máscara de telefone no input de telefone do modal.
2) Confirmar validação de email no input (hoje só `type=\"email\"`).
3) Ao criar o projeto, os membros adicionados não aparecem na guia de membros (Solução A).
4) IA deve gerar **nome real** (não slug) e o botão precisa estar no **Nome do projeto**.
5) Slug/codename deve derivar do nome e validar unicidade automaticamente.
6) Formulário dinâmico por objetivo (Venda/Captação) + campos de valores, equity e motivos.
7) Valores USD com formatação (prefixo `USD` + separador de milhares).
8) Se “já possuo advisor”, abrir campo de email e enviar convite.
9) Responsáveis precisam ter conta; se não tiverem, enviar convite ao adicionar.

---

## Gestão de Responsáveis (aba dedicada) ✅

### Objetivo
- Criar uma **aba/seção dedicada** na página do projeto para gerenciar responsáveis.
- Responsáveis **devem ser usuários da plataforma** (não apenas contatos avulsos).

### Fluxo ao adicionar responsável
1. Usuário digita o **email** do responsável.
2. **Se o email já pertence a um usuário da plataforma:**
   - Adicionar como responsável do projeto.
   - Enviar **notificação interna** ao usuário informando que foi adicionado.
3. **Se o email NÃO pertence a um usuário cadastrado:**
   - Enviar **convite por email** para criar conta na plataforma.
   - Ao aceitar o convite e criar conta, o usuário é automaticamente vinculado como responsável do projeto.

### Requisitos da aba
- Listar todos os responsáveis atuais (nome, cargo, email, telefone).
- Permitir **adicionar** e **remover** responsáveis.
- Indicar status: "Ativo" (já tem conta) ou "Convite pendente" (aguardando aceite).
- Os dados atuais de `projects.contacts` (jsonb) devem migrar para este novo modelo.

### Pontos de atenção
- Definir se responsáveis terão permissões no projeto (ex: viewer) ou se é apenas informativo.
- Avaliar se `projects.contacts` continua como jsonb ou se migra para tabela relacional (`project_contacts` ou reutiliza `project_members` com role específica).
- Limite sugerido: máximo 10 responsáveis por projeto.

---

## Sidebar (estrutura + branding) ✅

### Objetivo
- ✅ Substituir abas de navegação (Overview, Membros, Teaser, VDR) por **segunda sidebar dedicada ao projeto**.
- ✅ Manter **breadcrumbs** no topo.
- ✅ Aba "Responsáveis" adicionada na sidebar do projeto.

### Task separada (branding)
- ✅ Logo oficial na sidebar principal: `public/logotipo.png` (via `next/image`).