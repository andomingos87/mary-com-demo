# Runbook — Mercado em escala (Mary Platform)

**Data:** 2026-04-10  
**Público:** Engenharia, produto e operações antes de declarar prontidão para escala comercial.

## 1. Pré-requisitos de produto

| Item | Verificação | Responsável |
|------|-------------|-------------|
| Matriz atualizada | [MATRIZ-JORNADAS-EXCALIDRAW-MERCADO.md](./MATRIZ-JORNADAS-EXCALIDRAW-MERCADO.md) sem linhas críticas ❌ | Produto |
| T7.1 Assinatura eletrônica | Decisão documentada (sim/não/fora MVP) | Produto + Jurídico |
| T7.2 Upload | Limite MB/arquivo; total por org; formatos | Engenharia |
| E5 Feed | Mínimo 3 tipos de evento com aceite | Produto |

## 2. Self-service e multi-tenant

- **Org:** `OrgSwitcher` com uma ou mais orgs; links `Gerenciar organizações` → `/dashboard/organizations`, `Nova organização` → `/onboarding`; `/dashboard/organizations/new` redireciona para onboarding.
- **Convites:** validar fluxo `invite/project/[token]` e expiração (ver specs colaboração).
- **RLS:** revisar migrations Supabase antes de release (regra do projeto).

## 3. Compliance mínimo B2B

- Termos e privacidade: rotas `/terms`, `/privacy`; versionamento de aceite quando aplicável (`organizations` / `onboarding_data`).
- **Dados:** sem PII em logs; mascarar em exemplos.
- **Backups:** política Supabase (Dashboard) + teste de restore documentado.

## 4. Operações e observabilidade

- **Build:** `npm run validate` (lint + test + build + bundle) no CI.
- **Variáveis:** validar com `node scripts/validate-env.js`; secrets só em Vercel/Cursor secrets.
- **Integrações:** Brevo/Z-API com fallback mock em dev; monitorar taxa de erro em produção.

## 5. Incidentes

1. Identificar (Sentry/logs Vercel ou console estruturado).
2. Mitigar (feature flag, desligar provider não crítico).
3. Comunicar stakeholders se dados ou disponibilidade afetados.
4. Post-mortem leve se SEV1/SEV2.

## 6. Go / no-go (checklist)

- [ ] Nenhuma tarefa P0 crítica aberta na matriz (exceto exceções documentadas).
- [ ] MFA e sessão validados em fluxo real (não só mock).
- [ ] Teste manual ou E2E das três jornadas (investidor, ativo, advisor) em staging.
- [ ] Plano de rollback (deploy anterior na Vercel).
