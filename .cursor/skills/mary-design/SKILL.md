---
name: mary-design
description: Aplica o design system da Mary M&A ao criar ou editar componentes UI. Fornece tokens de cor, tipografia, sombras, transições e regras de uso. Use quando criar componentes, páginas, estilos, ou quando o usuário mencionar design, UI, cores, tokens, tema, dark mode, ou estilo visual.
---

# Mary Design System

## Quick Reference

### Cor primária (Burgundy)
- Light: `bg-primary` → HSL `350 73% 27%` (#771323)
- Dark: `bg-primary` → HSL `350 73% 35%` (#9A182E)
- Texto sobre primary: `text-primary-foreground` (branco)

### Tokens de superfície

| Superfície | Background | Texto |
|------------|-----------|-------|
| Página | `bg-background` | `text-foreground` |
| Card | `bg-card` | `text-card-foreground` |
| Popover | `bg-popover` | `text-popover-foreground` |
| Primary | `bg-primary` | `text-primary-foreground` |
| Secondary | `bg-secondary` | `text-secondary-foreground` |
| Muted | `bg-muted` | `text-muted-foreground` |
| Accent | `bg-accent` | `text-accent-foreground` |
| Destructive | `bg-destructive` | `text-destructive-foreground` |
| Sidebar | `bg-sidebar` | `text-sidebar-foreground` |

### Utilitários

| Tipo | Classes |
|------|---------|
| Bordas | `border-border`, `border-input`, `border-sidebar-border` |
| Focus | `ring-ring`, `ring-sidebar-ring` |
| Input bg | `bg-input` |

### Sombras (customizadas)

```
shadow-card     → sutil, para cards
shadow-elegant  → elevação/destaque
shadow-glow     → glow burgundy (marca)
```

### Border Radius

```
rounded-sm → 4px
rounded-md → 6px
rounded-lg → 8px (padrão)
```

### Transições

```
transition-smooth  → 300ms ease
transition-bounce  → 400ms bounce
transition-elegant → 500ms suave
```

### Animações

```
animate-fade-in         → entrada com fade + translateY
animate-slide-in-right  → entrada lateral
animate-accordion-down  → expand
animate-accordion-up    → collapse
animate-glow            → pulse burgundy
```

### Tipografia
- **Font:** DM Sans (400, 500, 600, 700)
- Já configurada globalmente — não sobrescrever

## Regras obrigatórias

1. Nunca usar cores hardcoded — sempre tokens via Tailwind
2. Sempre parear superfície + foreground (`bg-X` + `text-X-foreground`)
3. Usar `shadow-card` / `shadow-elegant` / `shadow-glow` em vez de shadows padrão do Tailwind
4. Dark mode é automático via tokens — não usar `dark:bg-[hex]`
5. Componentes shadcn/ui já respeitam tokens — preferir usá-los
6. DM Sans é obrigatória — nunca substituir

## Arquivos-fonte

- Tokens: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Componentes base: `src/components/ui/`
- Spec completa: `.context/docs/design-system.md`
