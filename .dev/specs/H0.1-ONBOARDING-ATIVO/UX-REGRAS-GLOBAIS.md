# Subspec UX — Regras Globais

**Spec pai:** [INDEX.md](INDEX.md)
**Blocker:** [BLOCKER-data-enrichment.md](BLOCKER-data-enrichment.md)
**Excalidraw ref:** `.dev/excalidraw/01_GLOBAL_RULES.md`
**Aplica-se a:** Todos os 4 passos (P1–P4)

---

## Auto-save

- Cada campo salva automaticamente ao **perder foco** (blur)
- **Debounce:** 2000ms (já existe hook `useAutoSave`)
- **Feedback visual:** check (✓) verde ou texto "Salvo" — sem botão "Salvar"
- **Retry:** em caso de falha de rede, tentar novamente automaticamente
- **Server action:** `autoSaveOnboardingField(orgId, field, value)`

## Tooltips

- Todos os campos devem ter tooltip com ícone `(?)`
- Textos das tooltips devem conferir com o Excalidraw
- Sub-opções do objetivo do projeto têm tooltips descritivas (ver [P1-DADOS.md](P1-DADOS.md))

## Navegação

- **Breadcrumb** no header: `Mary | Início > Onboarding > Passo X`
  - Depende de H0.4 para componente global; implementar inline enquanto H0.4 não entrega
- **Botão "Próximo":** avança para o step seguinte (desabilitado se validação falha)
- **Botão "Voltar":** retorna ao step anterior preservando dados
- **Steps clicáveis:** indicador de progresso permite clicar em steps já completados

## Estilização (CLAUDE.md)

- **Fonte:** DM Sans — nunca sobrescrever `font-family`
- **Tokens:** bg-primary, text-foreground, etc. (nunca hardcode)
- **Sombras:** shadow-card, shadow-elegant (evitar shadow-lg/xl genéricos)
- **Border radius:** `rounded-lg` (8px)
- **Transições:** `transition-smooth` (300ms)

---

## Checklist de Validação (15 itens)

> **Pré-condição:** Blocker resolvido. Validar em todos os 4 passos.

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| **Auto-save** | | | |
| 6.1 | Campos salvam automaticamente ao perder foco | ⌛ | Bloqueado |
| 6.2 | Feedback visual de salvamento (✓ verde ou texto) | ⌛ | Bloqueado |
| 6.3 | Nenhum botão "Salvar" em nenhum passo | ⌛ | Bloqueado |
| 6.4 | Funciona em conexão lenta (retry) | ⌛ | Bloqueado |
| **Tooltips** | | | |
| 6.5 | Todos os campos têm tooltip com ícone (?) | ⌛ | Bloqueado |
| 6.6 | Textos das tooltips conferem com o Excalidraw | ⌛ | Bloqueado |
| 6.7 | Sub-opções do objetivo têm tooltips descritivas | ⌛ | Bloqueado |
| **Navegação** | | | |
| 6.8 | Breadcrumb no header: `Início > Onboarding > Passo X` | ⌛ | Bloqueado |
| 6.9 | Botão "Próximo" avança para o step seguinte | ⌛ | Bloqueado |
| 6.10 | Botão "Voltar" retorna ao step anterior | ⌛ | Bloqueado |
| **Estilização** | | | |
| 6.11 | Fonte DM Sans (não sobrescrita) | ⌛ | Bloqueado |
| 6.12 | Design tokens semânticos (bg-primary, text-foreground, etc.) | ⌛ | Bloqueado |
| 6.13 | Sombras: shadow-card ou shadow-elegant (não genéricos) | ⌛ | Bloqueado |
| 6.14 | Border radius: rounded-lg | ⌛ | Bloqueado |
| 6.15 | Transições: transition-smooth | ⌛ | Bloqueado |
