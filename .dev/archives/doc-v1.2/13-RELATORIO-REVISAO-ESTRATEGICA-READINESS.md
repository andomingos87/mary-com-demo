# 13 — Relatório de Revisão Estratégica de Readiness (Doc v1.2 + MCP)

> **Ref:** [MASTER.md](./MASTER.md)  
> **Data:** 18/03/2026  
> **Responsável:** Tech Lead (AI)  
> **Escopo:** revisão integral da pasta `.dev/doc-v1.2` + validação técnica via MCP no projeto oficial `eetoztxgkvyxjjmkgdvm`

---

## 1. Objetivo e método de revisão

Este relatório consolida a decisão de prontidão para início de desenvolvimento do M2 com base em:

1. revisão documental estratégica (produto, UX, funcional, técnico, governança);
2. inspeção real do Supabase herdado da v1 via MCP;
3. fechamento de gaps críticos com critérios objetivos de aprovação/reprovação.

**Método aplicado:**
- varredura de todos os documentos `01` a `12`;
- leitura de evidências técnicas no Supabase (`list_tables`, `list_migrations`, `execute_sql`, `get_advisors`);
- consolidação de bloqueios P0 e plano de mitigação com responsáveis sugeridos.

---

## 2. Diagnóstico executivo

### 2.1 Decisão recomendada

**Decisão:** `GO CONDICIONAL CONTROLADO`.

**Por que não GO pleno:**
- ainda existem riscos ativos de segurança/hardening (`search_path` mutável e policies permissivas);
- ainda faltam evidências E2E negativas A/B para isolamento final de DR espelhado em dados reais.

**Por que não NO-GO:**
- estrutura crítica de M2 existe no banco oficial;
- contrato RPC canônico existe e está utilizável para execução;
- documentação está madura o suficiente para iniciar sob gate.

### 2.2 Base de evidências técnicas (MCP)

- Projeto confirmado: `eetoztxgkvyxjjmkgdvm` (`mary-mvp`), status saudável.
- `38` tabelas no schema `public`.
- Tabelas críticas M2 presentes: `investor_theses`, `thesis_filters_*`, `matches`, `teasers`, `ndas`, `investor_drs`.
- Funções RPC críticas presentes: `rpc_create_thesis`, `rpc_list_opportunities`, `rpc_set_nda_status`, `rpc_dr_upsert_item`, `rpc_qna_ask`, `rpc_pipeline_move`.
- Migrations registradas até `s1_m2_rpc_contract_baseline`.

### 2.3 Riscos técnicos objetivos (estado atual)

- `22` funções sem `search_path` explícito.
- `14` policies potencialmente permissivas (`USING/WITH CHECK = true`) em tabelas sensíveis de auth/base.
- `1` tabela com RLS habilitado e sem policy (`feature_flags`).

**Conclusão técnica:** base pronta para kickoff com travas obrigatórias de segurança e evidência.

---

## 3. Cobertura documental: o que está pronto vs lacunas

## 3.1 Cobertura pronta para execução

- Visão de produto e direcionamento pós-pivot claros (`01`, `02`, `03`, `08`).
- Regras de negócio transversais e decisões congeladas com bom nível (`06`).
- Matriz de rastreabilidade com P0/P1/P2 publicada (`09`).
- Relatórios de prontidão/governança e aderência MCP publicados (`10`, `11`).
- Contrato RPC M2 estabelecido (`12`).

### 3.2 Lacunas críticas que ainda exigem fechamento

1. **Evidência de isolamento A/B em homologação real**  
   - **Impacto:** risco multi-tenant.  
   - **Recomendação:** suíte obrigatória antes de release funcional M2.

2. **Hardening de segurança residual (`search_path` + permissive policies)**  
   - **Impacto:** risco de segurança e compliance.  
   - **Recomendação:** sprint curta de segurança paralela ao fluxo funcional.

3. **Convergência final de nomenclatura em docs técnicos**  
   - **Impacto:** risco de drift FE/BE e retrabalho.  
   - **Recomendação:** padronizar nomes canônicos do banco oficial em todos os docs.

---

## 4. Gate formal de revisão técnica

## 4.1 Checklist de revisão

| Bloco | Critério | Status |
|---|---|---|
| Código/contrato | RPC canônicas existentes e mapeadas com fluxo M2 | ✅ |
| Banco/schema | Tabelas P0 do M2 convergidas | ✅ |
| Segurança | Sem erro crítico bloqueante | ✅ |
| Segurança residual | Hardening pendente (`search_path`, policies permissivas, RLS sem policy) | ⚠️ |
| Testes de isolamento | E2E negativo A/B com dado real | ❌ pendente |
| Governança documental | Regras/escopo/rastreabilidade publicadas | ✅ |

## 4.2 Critério de decisão

- **Aprovação plena:** 100% P0 com evidência técnica verificável.
- **Reprovação:** qualquer falha sem mitigação executável em isolamento ou segurança.

**Resultado atual do gate:** `APROVADO COM CONDIÇÃO`.

---

## 5. Sequência estratégica de execução (próximos 10 dias úteis)

### Fase A — Segurança e isolamento (D1-D3)
- hardening das funções com `search_path` mutável;
- ajuste de policies permissivas legadas de auth;
- correção de `feature_flags` (RLS sem policy).

### Fase B — Evidência de isolamento (D2-D4)
- rodar cenários negativos A/B para `investor_drs`, `ndas`, acesso por projeto/investidor;
- anexar evidência técnica (query + log + relatório de teste).

### Fase C — Contrato executável FE/BE (D3-D5)
- fechar payload, erros padronizados e idempotência para RPCs M2;
- validar consumo das Server Actions apenas por contrato canônico.

### Fase D — Gate semanal (D5)
- revisar checklist P0 completo;
- publicar decisão operacional da semana (aprova/reprova).

### Fase E — Escala de implementação M2 (D6+)
- liberar desenvolvimento completo dos fluxos M2 após aprovação do gate.

---

## 6. Supabase herdado da v1: leitura estratégica

### 6.1 O que herdamos pronto e utilizável

- base robusta de autenticação, organização, RBAC e VDR core;
- estrutura de M2 principal já criada (thesis, matching, teaser, nda, dr espelhado);
- baseline de migrations com marcos de hardening/convergência.

### 6.2 O que herdamos como dívida ativa

- policies permissivas em tabelas de auth/infra;
- conjunto de funções sem `search_path` fixo;
- governança de evidência de testes ainda incompleta para isolamento final.

**Recomendação:** tratar dívida de segurança como requisito de entrega, não como melhoria opcional.

---

## 7. Deploy de Edge Functions (situação atual)

- Não há catálogo de funções públicas/protegidas versionado nesta pasta para execução automática segura.
- Não há evidência de função ativa no projeto oficial no momento da inspeção.

**Regra até normalização:**
- bloquear deploy de Edge Function sem classificação explícita (pública/protegida) e confirmação humana;
- usar `--no-verify-jwt` somente para função pública formalmente classificada.

---

## 8. Decisão final e recomendação de Tech Lead

### Opções avaliadas

1. **GO pleno agora**  
   - Pró: velocidade imediata.  
   - Contra: aumenta risco de segurança e retrabalho.

2. **GO condicional controlado (recomendado)**  
   - Pró: mantém ritmo com risco controlado e auditável.  
   - Contra: exige disciplina de gate semanal.

3. **NO-GO total**  
   - Pró: reduz risco imediato.  
   - Contra: atraso desnecessário com base técnica já suficiente.

### Recomendação final

**Seguir opção 2 (`GO CONDICIONAL CONTROLADO`)**, com bloqueio explícito de avanço caso qualquer item P0 de segurança/isolamento fique sem evidência.

---

## 9. Checklist executivo de conclusão desta revisão

- [x] Revisão de todos os documentos da pasta `.dev/doc-v1.2`.
- [x] Inspeção MCP do Supabase oficial herdado da v1.
- [x] Consolidação de decisão, critérios de aceite e riscos.
- [x] Plano de execução com fases, donos sugeridos e gates.
- [x] Registro de recomendações técnicas para kickoff seguro.

