# Mary M&A — Design System Specification

> Fonte primária: `src/app/globals.css` + `tailwind.config.ts`
> Última atualização: Março 2026

## Visão Geral

A Mary utiliza um design system baseado em **CSS custom properties (HSL)** mapeadas para o Tailwind CSS. A paleta é construída sobre o padrão **shadcn/ui** com customizações de marca.

**Identidade visual:** Premium, profissional, confiável — adequada ao mercado M&A.

| Aspecto | Decisão |
|---------|---------|
| Cor primária | Burgundy (`350 73% 27%` light / `350 73% 35%` dark) |
| Tipografia | DM Sans (Google Fonts) — 400, 500, 600, 700 |
| Framework CSS | Tailwind CSS + tailwindcss-animate |
| Componentes | shadcn/ui (Radix primitives) |
| Modo escuro | Suportado via classe `.dark` |
| Formato de cor | HSL (sem `hsl()` wrapper nas variáveis) |

---

## Tokens de Cor

### Light Mode (`:root`)

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--background` | `0 0% 100%` | `#FFFFFF` | Fundo padrão |
| `--foreground` | `240 7% 10%` | `#18181B` | Texto padrão |
| `--card` | `240 5% 96%` | `#F4F4F5` | Fundo de cards |
| `--card-foreground` | `240 7% 10%` | `#18181B` | Texto em cards |
| `--popover` | `240 5% 96%` | `#F4F4F5` | Fundo de popovers |
| `--popover-foreground` | `240 7% 10%` | `#18181B` | Texto em popovers |
| `--primary` | `350 73% 27%` | `#771323` | Marca (burgundy) |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `240 5% 96%` | `#F4F4F5` | Superfícies secundárias |
| `--secondary-foreground` | `240 7% 10%` | `#18181B` | Texto sobre secondary |
| `--muted` | `240 5% 96%` | `#F4F4F5` | Neutro discreto |
| `--muted-foreground` | `240 5% 46%` | `#6B6B7B` | Texto discreto |
| `--accent` | `240 5% 96%` | `#F4F4F5` | Realce |
| `--accent-foreground` | `240 7% 10%` | `#18181B` | Texto sobre accent |
| `--destructive` | `0 84% 60%` | `#EF4343` | Ações destrutivas |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre destructive |
| `--border` | `240 9% 91%` | `#E6E6EA` | Bordas padrão |
| `--input` | `240 5% 96%` | `#F4F4F5` | Fundo de inputs |
| `--ring` | `350 73% 27%` | `#771323` | Focus ring |

### Dark Mode (`.dark`)

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--background` | `240 10% 3.9%` | `#09090B` | Fundo padrão |
| `--foreground` | `0 0% 98%` | `#FAFAFA` | Texto padrão |
| `--card` | `240 10% 3.9%` | `#09090B` | Fundo de cards |
| `--card-foreground` | `0 0% 98%` | `#FAFAFA` | Texto em cards |
| `--popover` | `240 10% 3.9%` | `#09090B` | Fundo de popovers |
| `--popover-foreground` | `0 0% 98%` | `#FAFAFA` | Texto em popovers |
| `--primary` | `350 73% 35%` | `#9A182E` | Marca (burgundy, mais claro) |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `240 3.7% 15.9%` | `#27272A` | Superfícies secundárias |
| `--secondary-foreground` | `0 0% 98%` | `#FAFAFA` | Texto sobre secondary |
| `--muted` | `240 3.7% 15.9%` | `#27272A` | Neutro discreto |
| `--muted-foreground` | `240 5% 64.9%` | `#A1A1AA` | Texto discreto |
| `--accent` | `240 3.7% 15.9%` | `#27272A` | Realce |
| `--accent-foreground` | `0 0% 98%` | `#FAFAFA` | Texto sobre accent |
| `--destructive` | `0 62.8% 30.6%` | `#7F1D1D` | Ações destrutivas |
| `--destructive-foreground` | `0 0% 98%` | `#FAFAFA` | Texto sobre destructive |
| `--border` | `240 3.7% 15.9%` | `#27272A` | Bordas padrão |
| `--input` | `240 3.7% 15.9%` | `#27272A` | Fundo de inputs |
| `--ring` | `350 73% 35%` | `#9A182E` | Focus ring |

---

## Tokens de Sidebar

### Light

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--sidebar` | `0 0% 98%` | `#FAFAFA` | Fundo da sidebar |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `#3F3F46` | Texto na sidebar |
| `--sidebar-primary` | `240 5.9% 10%` | `#18181B` | Item ativo |
| `--sidebar-primary-foreground` | `0 0% 98%` | `#FAFAFA` | Texto em item ativo |
| `--sidebar-accent` | `240 4.8% 95.9%` | `#F4F4F5` | Hover/realce |
| `--sidebar-accent-foreground` | `240 5.9% 10%` | `#18181B` | Texto no hover |
| `--sidebar-border` | `220 13% 91%` | `#E5E7EB` | Bordas da sidebar |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `#3B82F6` | Focus ring sidebar |

### Dark

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--sidebar` | `240 5.9% 10%` | `#18181B` | Fundo da sidebar |
| `--sidebar-foreground` | `240 4.8% 95.9%` | `#F4F4F5` | Texto na sidebar |
| `--sidebar-primary` | `350 73% 35%` | `#9A182E` | Item ativo |
| `--sidebar-primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto em item ativo |
| `--sidebar-accent` | `240 3.7% 15.9%` | `#27272A` | Hover/realce |
| `--sidebar-accent-foreground` | `240 4.8% 95.9%` | `#F4F4F5` | Texto no hover |
| `--sidebar-border` | `240 3.7% 15.9%` | `#27272A` | Bordas da sidebar |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `#3B82F6` | Focus ring sidebar |

---

## Raios, Sombras e Transições

### Border Radius

| Token | Valor | Tailwind |
|-------|-------|----------|
| `--radius` | `0.5rem` (8px) | `rounded-lg` |
| — | `calc(--radius - 2px)` (6px) | `rounded-md` |
| — | `calc(--radius - 4px)` (4px) | `rounded-sm` |

### Sombras

| Token / Class | Valor | Uso |
|---------------|-------|-----|
| `shadow-card` | `0 2px 8px -2px hsl(240 7% 10% / 0.08)` | Cards padrão |
| `shadow-elegant` | `0 8px 25px -8px hsl(240 7% 10% / 0.12)` | Destaque/elevação |
| `shadow-glow` | `0 0 40px hsl(350 73% 27% / 0.2)` | Glow de marca |

### Transições

| Utility Class | Duração | Easing | Uso |
|---------------|---------|--------|-----|
| `transition-smooth` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Padrão |
| `transition-bounce` | 400ms | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Bounce |
| `transition-elegant` | 500ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Suave/elegante |

### Animações

| Classe | Keyframe | Uso |
|--------|----------|-----|
| `animate-accordion-down` | Expand height | Accordion abrir |
| `animate-accordion-up` | Collapse height | Accordion fechar |
| `animate-fade-in` | Opacity + translateY | Entrada de elementos |
| `animate-slide-in-right` | Opacity + translateX | Entrada lateral |
| `animate-glow` | Box-shadow pulse | Destaque pulsante |

---

## Tipografia

| Propriedade | Valor |
|-------------|-------|
| Font family | `DM Sans`, fallback: `-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif` |
| Pesos usados | 400 (regular), 500 (medium), 600 (semibold), 700 (bold) |
| Optical size | 9–40 |
| Import | Google Fonts |

---

## Mapeamento Tailwind

As variáveis CSS são consumidas via `tailwind.config.ts` com wrapper `hsl(var(--token))`:

```
bg-background    → hsl(var(--background))
text-foreground  → hsl(var(--foreground))
bg-primary       → hsl(var(--primary))
text-primary-foreground → hsl(var(--primary-foreground))
border-border    → hsl(var(--border))
ring-ring        → hsl(var(--ring))
bg-card          → hsl(var(--card))
bg-sidebar       → hsl(var(--sidebar))
shadow-card      → custom box-shadow
shadow-elegant   → custom box-shadow
shadow-glow      → custom box-shadow
```

---

## Container

| Breakpoint | Padding |
|------------|---------|
| Default | `1rem` |
| `sm` | `2rem` |
| `lg` | `4rem` |
| `xl` | `5rem` |
| `2xl` | `6rem` |
| Max width | `1400px` |

---

## Regras de Uso

1. **Sempre use tokens semânticos** — nunca hardcode cores (`#771323`), use `bg-primary`
2. **Sempre use o par foreground** — `bg-primary` com `text-primary-foreground`
3. **Suporte dark mode** — tokens se adaptam automaticamente via `.dark`
4. **Sombras customizadas** — prefira `shadow-card`, `shadow-elegant`, `shadow-glow`
5. **Transições** — use `transition-smooth` como padrão, `transition-bounce` para interações lúdicas
6. **Componentes** — use shadcn/ui que já consomem os tokens corretamente
7. **Fonte** — DM Sans é obrigatória; nunca substitua por outra font-family

---

## Arquivos-Fonte

| Arquivo | Conteúdo |
|---------|----------|
| `src/app/globals.css` | Definição das CSS variables (`:root` e `.dark`) |
| `tailwind.config.ts` | Mapeamento tokens → Tailwind utilities |
| `src/components/ui/*` | Componentes shadcn/ui que consomem os tokens |
| `.dev/design/` | Documentação visual interativa (HTML) |
