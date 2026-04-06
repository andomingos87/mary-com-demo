# Usuários Teste

## Empresa
contato+empresa@andersondomingos.com.br
Xe@159753

teste-h01-20260404-1501@test.mary.com
Mary@123456

---

## Rodada H0.3 - 2026-04-05 (Supabase MCP)

### Resultado do mapeamento
- Nao foi necessario criar novos usuarios ou organizacoes nesta rodada.
- Ja existem registros suficientes para validacao dos cenarios H0.3.

### Usuarios de teste encontrados
1. `teste-h03-202604051247@test.mary.com`
   - user_id: `f669e8df-ace0-4b24-8a9e-a5de1d6e4a26`
   - org_slug: `nova-organizacao-mnlraz8p-yril`
   - role: `owner`
   - projects_count_org: `3`

2. `spec.h02.investidor+01@acmeinvest.com`
   - user_id: `7b9e00f2-236b-4794-8fe1-9c17bcce27fd`
   - org_slug: `nova-organizacao-mnlp3mny-fhl3`
   - role: `owner`
   - projects_count_org: `0`

### Observacao operacional
- No `cursor-ide-browser`, a aba ativa estava autenticada na org `nova-organizacao-mnlraz8p-yril`.
- Para testes de tela de projeto por codename, usar codenames existentes da org (ex.: `h03-scr-test`, `h03-nda-test`, `h03-nda-gate-pos`).