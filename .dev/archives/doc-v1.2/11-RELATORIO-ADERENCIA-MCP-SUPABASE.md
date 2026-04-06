# 11 — Relatorio de Aderencia Doc x Banco (MCP Supabase)

> **Ref:** [MASTER.md](./MASTER.md)
> **Data:** 18/03/2026
> **Projeto Supabase oficial:** `eetoztxgkvyxjjmkgdvm` (`mary-mvp`)
> **Metodo:** investigacao MCP + validacao pos-migracao (`get_project`, `list_tables`, `list_migrations`, `execute_sql`, `get_advisors`, `list_edge_functions`)

---

## 1. Resultado executivo

**Status final:** `GO CONDICIONAL` para kickoff tecnico de M2.

**Justificativa:**
- Sprint S0 (hardening): erros criticos de seguranca no advisor foram eliminados.
- Sprint S1 (convergencia P0): schema critico de M2 e contrato RPC canonico foram implementados.
- Permanecem warnings de seguranca/performance que exigem acompanhamento, mas sem bloqueio critico imediato.

---

## 2. Evidencias objetivas (pos-convergencia)

### 2.1 Projeto e ambiente
- `get_project`: `eetoztxgkvyxjjmkgdvm` ativo saudavel, Postgres 17.6.1.

### 2.2 Schema P0 M2
As tabelas criticas agora existem no `public`:
- `investor_theses`
- `thesis_filters_sector`
- `thesis_filters_geo`
- `thesis_filters_ranges`
- `matches`
- `teasers`
- `ndas`
- `investor_drs`

### 2.3 Contrato tecnico RPC
As funcoes canonicas agora existem:
- `rpc_upsert_profile`
- `rpc_create_project`
- `rpc_create_thesis`
- `rpc_list_opportunities`
- `rpc_set_nda_status`
- `rpc_dr_upsert_item`
- `rpc_dr_validate`
- `rpc_qna_ask`
- `rpc_pipeline_move` (placeholder controlado)

### 2.4 Seguranca (advisor)
- **Antes:** erros criticos de RLS desabilitada em tabelas publicas.
- **Depois:** sem erros criticos; ficaram apenas warnings/infos (ex.: `search_path` mutavel e policies permissivas legadas para fluxo auth).

### 2.5 Edge Functions
- `list_edge_functions`: nenhuma funcao ativa no projeto oficial neste momento.

---

## 3. Gate tecnico final

### Checklist
- Seguranca critica resolvida: **Aprovado**
- Schema P0 M2 presente: **Aprovado**
- RPC/Server Actions canonicas definidas: **Aprovado**
- Isolamento e RLS por dominio critico: **Aprovado com ressalvas**
- Operacao/deploy de edge functions: **Nao aplicavel no momento**

### Decisao
**Gate:** `APROVADO COM CONDICAO`.

**Condicoes mandatorias para continuidade:**
1. Rodar testes negativos A/B de isolamento (projeto-investidor) em dados reais de homologacao.
2. Enderecar lote de warnings de `search_path` mutavel.
3. Revisar policies permissivas legadas do fluxo auth e normalizar para menor privilegio.

---

## 4. Riscos residuais e mitigacao

| Risco residual | Mitigacao recomendada | Urgencia |
|---|---|---|
| `search_path` mutavel em funcoes | hardening de funcoes em lote no proximo ciclo | Media |
| Policies permissivas em tabelas de auth | restringir `WITH CHECK` e roles por contexto | Alta |
| Falta de validacao E2E A/B com dados reais | executar suite de seguranca antes de release de feature | Alta |

---

## 5. Conclusao

A convergencia tecnica S0/S1 foi executada com sucesso no projeto oficial `eetoztxgkvyxjjmkgdvm`.

**Recomendacao final:** iniciar desenvolvimento de M2 com gate semanal e plano de hardening residual em paralelo.

---

## 6. Snapshot objetivo de riscos ativos (MCP em 18/03/2026)

Resultado de consultas SQL de validacao no ambiente oficial:

| Indicador | Valor | Observacao |
|---|---:|---|
| Total de tabelas no `public` | 38 | Base atual do projeto oficial |
| Funcoes sem `search_path` explicito | 22 | Inclui funcoes de auth e RPCs M2 |
| Policies potencialmente permissivas (`USING/WITH CHECK = true`) | 14 | Concentradas em tabelas de auth/base |
| Tabelas com RLS habilitado sem policy | 1 | `feature_flags` |

### 6.1 Tabelas com atencao imediata (hardening)

- Policies permissivas detectadas em: `audit_logs`, `known_devices`, `otp_codes`, `rate_limits`, `user_profiles`, `user_sessions`, `whatsapp_messages`.
- RLS sem policy detectado em: `feature_flags`.

### 6.2 Implicacao para kickoff

- **Nao bloqueia kickoff tecnico controlado**, pois nao ha erro critico ativo.
- **Bloqueia release sem gate**, pois o risco residual de seguranca ainda precisa de tratamento formal.

### 6.3 Proxima acao recomendada

Executar sprint curta de hardening (search_path + policies) em paralelo ao P0 funcional e revalidar este bloco no proximo gate semanal.
