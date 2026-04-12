---
name: vercel-deploy
description: Guia deploy na Vercel com checklist e troubleshooting. Use quando o usuario pedir deploy, Vercel, build/producao/preview, variaveis de ambiente, root directory ou dominio.
---

# Deploy na Vercel

## Escopo
Skill para orientar deploy na Vercel com foco em monorepo/Next.js, incluindo checklist operacional e troubleshooting. Inclui ajustes especificos deste projeto.

## Quick start
Use a saida mista:
1) Checklist operacional
2) Template com secoes curtas (Resumo, Passos, Verificacao, Problemas comuns)

## Checklist operacional (base)
- Confirmar app alvo e ambiente (preview ou production)
- Definir Root Directory do projeto (se monorepo)
- Validar Build Command, Output Directory e Node version
- Configurar variaveis de ambiente
- Disparar deploy e verificar URL
- Validar dominio e redirects (se aplicavel)

## Template de resposta (misto)
Use este formato:

```markdown
Resumo rapido:
- [1-2 bullets do que sera feito]

Checklist:
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

Passos:
1) ...
2) ...
3) ...

Verificacao:
- [ ] Build ok
- [ ] App respondeu na URL
- [ ] Logs sem erros

Problemas comuns:
- <erro> -> <causa/proxima acao>
```

## Instrucoes especificas — Mary AI Platform (este repositorio)
- **Layout:** app Next.js na **raiz** do repo (nao e monorepo `apps/web`).
- **Package manager:** **pnpm** (`pnpm-lock.yaml`). Na Vercel, o install segue o lockfile; use `pnpm install` / `pnpm add` localmente.
- **Build Command:** `pnpm run build` (equivale a `next build`).
- **Output Directory:** `.next` (padrao Next.js)
- **Root Directory no painel Vercel:** raiz do repositorio (vazio ou `.`), salvo projeto forkado com subpasta.
- **Variaveis de ambiente** (alinhado a `AGENTS.md` / `.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (somente server-side)
  - `NEXT_PUBLIC_SITE_URL` (opcional)

### Checklist pre-deploy (evitar falhas de CI)
1. Toda dependencia importada no codigo esta em `dependencies` ou `devDependencies` do `package.json`.
2. Rodar `pnpm run build` antes do push na branch de producao/preview.
3. Commitar `pnpm-lock.yaml` junto com mudancas de dependencias.

### Problemas comuns (Mary)
| Erro no log | Causa provavel | Acao |
|-------------|----------------|------|
| `Cannot find module 'X'` | Pacote usado em import mas nao declarado em `package.json` | `pnpm add X` e commit do lockfile |
| Cache / install estranho | Troca npm vs pnpm sem atualizar lock | Usar apenas pnpm neste repo |
| 404 apos deploy | Root Directory errado no projeto Vercel | Root = repo root para este app |

## Notas da documentacao Vercel (Context7)
- Root Directory restringe acesso a arquivos fora do diretorio configurado
- Output Directory costuma ser detectado automaticamente pelo framework
- Mudancas de Root Directory/Output Directory aplicam no proximo deploy

## Troubleshooting rapido
- Build falha por dependencias: conferir Node version e install command
- 404 apos deploy: confirmar Root Directory e Output Directory
- Variaveis nao aplicadas: verificar ambiente correto (Preview/Production)
- URL incorreta: conferir `NEXT_PUBLIC_SITE_URL` e auto-detect via `NEXT_PUBLIC_VERCEL_URL`

## Referencias internas
- `.cursor/rules/vercel-build-gate.mdc` — regra de dependencias e build antes de deploy
- `AGENTS.md` — variaveis e convencoes do projeto
- `.env.example` — template de env
