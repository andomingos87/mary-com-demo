# Specs H0.4 a H0.7 — Itens Menores do Realinhamento

**Épico:** E0 — Realinhamento Excalidraw
**Data:** 02/04/2026
**Fonte primária:** `.dev/excalidraw/01_GLOBAL_RULES.md`, jornadas `02-04`
**PRD:** `.dev/production/PRD-v3.0-RECONCILIADO.md` — Seções 3 e 10

---

## H0.4 — Implementar Breadcrumbs Globais

**Prioridade:** P1 | **Estimativa:** S | **Risco:** Baixo

### Objetivo

Implementar componente de breadcrumb em todas as telas protegidas conforme regras globais do Excalidraw.

### Especificação (Excalidraw `01_GLOBAL_RULES.md`)

- Sempre indicar o caminho completo de navegação no topo da tela
- Passos/páginas anteriores são clicáveis
- Página atual é exibida mas não tem link

Exemplos:
- `Início > Onboarding > Passo 1`
- `Início > Tiger > Investidores`
- `Início > Projetos > Tiger > MRS`
- `Início > Configurações`

### Implementação

**Novo componente:** `src/components/shared/Breadcrumb.tsx`

```typescript
interface BreadcrumbItem {
  label: string
  href?: string  // undefined = página atual (sem link)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}
```

**Integração:** No layout protegido `src/app/(protected)/[orgSlug]/layout.tsx`:
- Breadcrumb renderizado abaixo do Header, acima do conteúdo
- Cada page exporta seus breadcrumb items via metadata ou context

**Alternativa:** Breadcrumb automático baseado no pathname:
- `/[orgSlug]/mrs` → `Início > MRS`
- `/[orgSlug]/radar` → `Início > Radar`
- `/[orgSlug]/pipeline` → `Início > [Codinome] > Pipeline`

### Estilização

- Separador: `>`
- Links: cor de texto com hover underline
- Página atual: texto sem link, bold ou cor diferente
- Fonte: DM Sans (global — não sobrescrever)
- Responsivo: truncar items intermediários em mobile com `...`

### Critérios de aceite

- [ ] Breadcrumb visível em todas as telas protegidas
- [ ] Links funcionais para páginas anteriores
- [ ] Página atual sem link
- [ ] Responsivo (truncamento em mobile)
- [ ] Codinome do projeto usado quando aplicável

---

## H0.5 — Transformar Mary AI de Página para Sidebar

**Prioridade:** P1 | **Estimativa:** L | **Risco:** Médio

### Objetivo

Transformar a Mary AI de drawer/overlay para sidebar que **empurra o conteúdo** para a esquerda, tornando-a contextual por tela.

### Especificação (Excalidraw `01_GLOBAL_RULES.md`)

**Comportamento:**
- Botão da Mary AI sempre visível no header: `Mary AI ▼`
- Ao acionar, sidebar **empurra e espreme** o conteúdo principal para a esquerda
- Benchmark: Evernote (sidebar push, não overlay)
- Sidebar é **contextual** — sabe em qual tela o usuário está

**Capacidades MVP (assistente apenas):**
- Consultar bases de dados da plataforma
- Responder perguntas sobre projeto, processo de M&A, documentos
- Conferir e revisar documentos
- Sugerir ajustes e melhorias
- Resumir informações
- Explicar termos e etapas
- **NÃO executa nada** — sugere que o usuário realize a ação

**Saudação inicial:** "Prazer, sou a Mary AI. Estarei sempre aqui!"

**Prompt contextual (boas-vindas):**
```
Olá [Username], vamos começar?

Como posso te ajudar?

[ O que a Mary AI pode fazer? ]
[ Pergunte sobre este projeto ]      ← para Ativo
[ Pergunte sobre um projeto ]        ← para Investidor
[ Suba Q&As e obtenha respostas ]
[ Convide investidores ]              ← para Ativo
[ Convide novos Ativos ]              ← para Investidor
```

**Disclaimer (rodapé do chat):**
```
A Mary AI pode cometer erros. A Mary não usa dados da "[Nome da Empresa]" para treinar os modelos.
```

### Estado atual

`src/components/mary-ai/MaryAiQuickChatSheet.tsx` — implementado como side drawer (overlay, não push).

### Implementação

**Refatoração necessária:**

1. **Layout global:** Mudar de overlay para grid com coluna lateral condicional
```
┌─────────┬──────────────┬─────────────┐
│ Sidebar │   Content    │  Mary AI    │
│  (nav)  │   (main)     │  (sidebar)  │
│  w-64   │   flex-1     │  w-96       │
└─────────┴──────────────┴─────────────┘
```

2. **Transição:** Content area reduz width com `transition-smooth` (300ms) quando Mary AI abre

3. **Context provider:** `MaryAiContext` com:
   - `currentPage: string` (rota atual)
   - `currentProfile: 'investor' | 'asset' | 'advisor'`
   - `projectCodename?: string`
   - `isOpen: boolean`
   - `toggle(): void`

4. **CTAs contextuais:** Diferentes botões de ação rápida por perfil e tela

**Arquivos a modificar:**
- `src/components/mary-ai/MaryAiQuickChatSheet.tsx` → refatorar para `MaryAiSidebar.tsx`
- `src/components/navigation/Header.tsx` — botão toggle
- `src/app/(protected)/[orgSlug]/layout.tsx` — grid com coluna condicional
- `src/components/navigation/Sidebar.tsx` — coordenar com Mary AI sidebar

### Critérios de aceite

- [ ] Mary AI abre como sidebar que empurra conteúdo (não overlay)
- [ ] Transição suave ao abrir/fechar
- [ ] Botão toggle no header sempre visível
- [ ] Contextual: CTAs mudam por tela e perfil
- [ ] Saudação e disclaimer conforme Excalidraw
- [ ] Chat funcional com histórico
- [ ] Responsivo: em mobile, pode ser fullscreen ou overlay (exceção)

---

## H0.6 — Padronizar Auto-save e Tooltips em Todas as Telas

**Prioridade:** P1 | **Estimativa:** M | **Risco:** Baixo

### Objetivo

Criar hook `useAutoSave` reutilizável com feedback visual e implementar tooltips em todos os campos com texto do Excalidraw.

### Especificação (Excalidraw `01_GLOBAL_RULES.md`)

**Auto-save:**
- Todo campo da plataforma salva automaticamente ao ser preenchido ou alterado
- Sem botões "Salvar" em nenhum formulário
- Feedback visual sutil: check (✓) ou texto em verde indicando que o dado foi salvo
- Campos auto-filled devem permanecer editáveis

**Tooltips:**
- Todos os campos devem ter tooltips claras e objetivas
- Especialmente em contexto M&A onde terminologia é técnica
- Texto de cada tooltip está nos arquivos Excalidraw (02-05)

### Estado atual

- `src/components/onboarding/hooks/useAutoSave.ts` — existe, debounce 2000ms, usa localStorage
- Tooltips: parcialmente implementados, sem padronização

### Implementação

**1. Hook `useAutoSave` global:**

```typescript
// src/hooks/useAutoSave.ts
interface UseAutoSaveOptions {
  entityId: string           // ID da entidade (org, thesis, project)
  entityType: string         // Tipo (organization, thesis, project)
  debounceMs?: number        // Default: 2000ms
  onSave: (field: string, value: unknown) => Promise<void>
}

interface UseAutoSaveReturn {
  registerField: (field: string) => {
    onChange: (value: unknown) => void
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  }
  isSaving: boolean
  lastSaved: Date | null
}
```

**Diferenças do hook atual:**
- Persistência via Supabase (não localStorage)
- Feedback visual por campo (não global)
- Status: `idle → saving → saved` com check ✓ animado
- Error handling com retry

**2. Componente `AutoSaveIndicator`:**

```typescript
// src/components/shared/AutoSaveIndicator.tsx
interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
}
// Renderiza: nada (idle), spinner (saving), ✓ verde (saved), ⚠ vermelho (error)
```

**3. Componente `FieldTooltip`:**

```typescript
// src/components/shared/FieldTooltip.tsx
interface FieldTooltipProps {
  text: string
  children: React.ReactNode
}
// Wrapper que adiciona ícone ? ao lado do label + popover com texto
```

**4. Catálogo de tooltips:**

Criar arquivo centralizado com todos os textos de tooltip:

```typescript
// src/lib/constants/tooltips.ts
export const TOOLTIPS = {
  onboarding: {
    asset: {
      companyDescription: "Descreva sua empresa de modo que os investidores...",
      projectObjective: "Selecione o objetivo principal do seu projeto",
      businessModel: "Selecione os modelos de negócio da sua empresa",
      sectors: "Você pode selecionar múltiplos setores...",
      // ... todos os campos dos 4 passos
    },
    investor: {
      thesisName: 'Ex: "Edtechs", "Fintechs Series A"',
      thesisDescription: "Descreva sua tese de modo que os Ativos...",
      // ... todos os campos dos 2 passos
    },
  },
  thesis: { /* ... */ },
  pipeline: { /* ... */ },
  // etc.
}
```

### Telas a atualizar

| Tela | Campos com tooltip | Auto-save |
|------|-------------------|-----------|
| Onboarding Ativo (4 passos) | ~17 campos | Sim |
| Onboarding Investidor (2 passos) | ~14 campos | Sim |
| Tese de investimento (wizard) | ~13 campos | Sim |
| MRS | Itens do MRS | Já tem (validar) |
| Projeto (resumo) | Campos editáveis | Sim |
| Configurações | Campos de conta | Sim |

### Critérios de aceite

- [ ] Hook `useAutoSave` global com persistência Supabase
- [ ] Feedback visual (✓ verde) em todos os campos ao salvar
- [ ] Sem botões "Salvar" em nenhum formulário
- [ ] Tooltips em todos os campos das telas listadas
- [ ] Textos de tooltip conforme Excalidraw (catálogo centralizado)
- [ ] Auto-save funciona em conexão lenta (retry)
- [ ] Campos auto-filled editáveis

---

## H0.7 — Ajustar Menus Laterais por Perfil

**Prioridade:** P1 | **Estimativa:** S | **Risco:** Baixo

### Objetivo

Reordenar e ajustar menus laterais conforme Excalidraw para cada perfil.

### Especificação (Excalidraw — jornadas 02, 03, 04)

**Investidor (`03_INVESTIDOR.md`):**
```
[ Radar ]
[ Teses ]
[ Feed ]
[ Projetos ]
```

**Ativo (`02_ATIVO.md`):**
```
[ MRS ]
[ Radar ]
[ Feed ]
[ Projeto Tiger ▼ ]   ← codinome dinâmico do projeto ativo
```

**Advisor (`04_ADVISOR.md`):**
```
[ Radar ]
[ Perfil ]
[ Feed ]
[ Projetos ]
```

### Divergências atuais

| Perfil | Menu atual | Menu Excalidraw | Divergência |
|--------|-----------|----------------|-------------|
| Investidor | Tese/Radar/Feed/Projetos | **Radar**/Teses/Feed/Projetos | Ordem: Radar antes de Teses |
| Ativo | MRS/Radar/Feed/Projeto | MRS/Radar/Feed/**[Codinome]** | Label estático vs dinâmico |
| Advisor | Dashboard/Projetos/Mary AI/Perfil/Configurações | Radar/Perfil/Feed/Projetos | Ordem e itens divergentes |

### Implementação

**Arquivos principais:** `src/types/navigation.ts`, `src/components/providers/NavigationProvider.tsx`

**Mudanças:**

1. **Investidor:** Trocar ordem — Radar primeiro, Teses segundo
2. **Ativo:** Substituir "Projeto" estático por codinome dinâmico
   - Buscar `projects.codename` da org ativa
   - Exibir como `[ Projeto Tiger ▼ ]` com dropdown se houver mais de um projeto
   - Se nenhum projeto, exibir `[ Novo Projeto ]`
3. **Advisor:** Configurar menu para Excalidraw no namespace `/advisor`
   - Ordem canônica: `Radar -> Perfil -> Feed -> Projetos`
   - Rotas esperadas: `/advisor/radar`, `/advisor/profile`, `/advisor/feed`, `/advisor/projects`
   - Compatibilidade: `/advisor/dashboard` redireciona para `/advisor/radar`

**Rodapé (Excalidraw — todas as jornadas):**
```
[Nome Real]
[Company Name]
+ Convidar membro
```

Verificar se rodapé do sidebar inclui estes elementos.

### Critérios de aceite

- [ ] Investidor: Radar → Teses → Feed → Projetos (nessa ordem)
- [ ] Ativo: MRS → Radar → Feed → [Codinome dinâmico]
- [ ] Codinome busca `projects.codename` e exibe no menu
- [ ] Se múltiplos projetos: dropdown no item do menu
- [ ] Rodapé: nome real + empresa + botão convidar
- [x] Advisor: Radar → Perfil → Feed → Projetos (nessa ordem) — validado em reteste 04/04/2026
- [x] Advisor: links funcionais para `/advisor/radar`, `/advisor/profile`, `/advisor/feed`, `/advisor/projects` — reteste 04/04/2026
- [x] Regressão: navegação funcional em todos os perfis (sem blocker ativo após correção de chunk em Advisor/Profile)

---

## Resumo de estimativas

| Item | Estimativa | Dependências |
|------|-----------|-------------|
| H0.4 — Breadcrumbs | S | Nenhuma |
| H0.5 — Mary AI sidebar | L | Nenhuma |
| H0.6 — Auto-save + Tooltips | M | Nenhuma (mas beneficia H0.1 e H0.2) |
| H0.7 — Menus por perfil | S | Nenhuma |

**Recomendação de ordem:** H0.7 → H0.4 → H0.6 → H0.5 (do mais rápido/visível ao mais complexo)
