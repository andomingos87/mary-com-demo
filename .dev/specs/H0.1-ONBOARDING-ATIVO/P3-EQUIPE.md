# Subspec P3 — Equipe

**Spec pai:** [INDEX.md](INDEX.md)
**Blocker:** [BLOCKER-data-enrichment.md](BLOCKER-data-enrichment.md)
**Excalidraw ref:** `.dev/excalidraw/02_ATIVO.md` — Passo 3
**Step type:** `asset_team`
**Componente:** `AssetTeamStep`

---

## Schema de dados

```typescript
// Passo 3 — Equipe
shareholders: Array<{
  name: string
  email: string
  role: string                   // cargo/função
  ownershipPercent: number       // %
}>
advisors: Array<{
  name: string
  email: string
  company: string
  role: string
}>
invitedMembers: Array<{
  name: string
  email: string
}>
```

### Validações

- **Obrigatórios:** shareholders (min 1 com nome e email)
- **Opcionais:** advisors, invitedMembers

---

## Comportamento especial

- Dados de sócios do **enriquecimento CNPJ** devem ser pré-preenchidos (vindos de `enrichment.shareholders`)
- Sócios pré-preenchidos devem ser **editáveis** (o usuário pode corrigir)
- Advisors e convite de membros são **opcionais** — o usuário pode avançar sem preencher

---

## Componentes envolvidos

| Componente | Status | Notas |
|-----------|--------|-------|
| `AssetTeamStep` | Criar | Formulário principal do Passo 3 |
| `ShareholderEditor` | Reusar | `src/components/shared/ShareholderEditor.tsx` — adicionar % e role |
| `AdvisorEditor` | Criar | Lista de advisors com CRUD + convite por email |

---

## Checklist de Validação (15 itens)

> **Pré-condição:** Blocker resolvido. Avançar até Passo 3 com Passos 1–2 preenchidos.

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| **Sócios** | | | |
| 4.1 | Seção de **Sócios** visível com editor inline | ⌛ | Bloqueado |
| 4.2 | Cada sócio tem: nome, email/CPF, cargo, % participação | ⌛ | Bloqueado |
| 4.3 | Pode adicionar múltiplos sócios | ⌛ | Bloqueado |
| 4.4 | Pode remover sócios | ⌛ | Bloqueado |
| 4.5 | Mínimo 1 sócio obrigatório para avançar | ⌛ | Bloqueado |
| **Advisors** | | | |
| 4.6 | Seção de **Advisors** visível | ⌛ | Bloqueado |
| 4.7 | Cada advisor tem: nome, email, empresa, cargo | ⌛ | Bloqueado |
| 4.8 | Pode adicionar/remover advisors (opcional) | ⌛ | Bloqueado |
| **Convite de membros** | | | |
| 4.9 | Seção de **Convidar membros** visível | ⌛ | Bloqueado |
| 4.10 | Pode adicionar membro com nome e email | ⌛ | Bloqueado |
| 4.11 | Pode remover membro convidado | ⌛ | Bloqueado |
| 4.12 | Seção é opcional (pode avançar sem convidar) | ⌛ | Bloqueado |
| **Comportamento** | | | |
| 4.13 | Dados de sócios do enriquecimento CNPJ pré-preenchidos | ⌛ | Bloqueado |
| 4.14 | Sócios pré-preenchidos são editáveis | ⌛ | Bloqueado |
| 4.15 | Botão voltar preserva dados do Passo 2 | ⌛ | Bloqueado |
