# 14 — Matriz de Reaproveitamento (v1 -> v2 Pivot)

> **Ref:** [MASTER.md](./MASTER.md)  
> **Objetivo:** apoiar a retomada em modelo greenfield + reuso seletivo (Opção C)  
> **Escopo de reuso aprovado:** system design frontend + Supabase  
> **Como usar:** preencher item a item e aprovar somente ativos com evidência

---

## 1. Regras de decisão (KEEP / ADAPT / DROP)

### Critérios obrigatórios de avaliação

1. **Aderência ao pivot**  
   - O ativo ajuda diretamente o fluxo M2 (`thesis -> matching -> teaser -> nda -> investor_drs`)?
2. **Qualidade técnica**  
   - Nome, estrutura e padrão seguem arquitetura canônica?
3. **Segurança e governança**  
   - Não introduz risco RLS/RBAC/compliance?
4. **Custo de manutenção**  
   - Reusar é realmente mais barato do que refazer?

### Decisão por ativo

- **KEEP:** reaproveitar como está.
- **ADAPT:** reaproveitar com ajustes obrigatórios antes de uso.
- **DROP:** arquivar e não usar na v2.

---

## 2. Matriz principal de triagem

| ID | Tipo de ativo | Caminho/Origem v1 | Dono | Status técnico | Aderência ao pivot | Risco (baixo/médio/alto) | Decisão (KEEP/ADAPT/DROP) | Ação obrigatória | Evidência |
|---|---|---|---|---|---|---|---|---|---|
| FE-001 | Design Token | `src/*` | Frontend Lead | A avaliar | A avaliar | A avaliar | A definir | Revisar consistência com UI atual | Screenshot + checklist |
| FE-002 | Componente UI base | `src/components/ui/*` | Frontend Lead | A avaliar | A avaliar | A avaliar | A definir | Validar API de props e acessibilidade | Story/teste |
| FE-003 | Layout/Navegação | `src/app/(protected)/*` | Frontend Lead | A avaliar | A avaliar | A avaliar | A definir | Ajustar rotas para fluxo pivot | Mapa de rotas |
| DB-001 | Tabela Supabase | `public.investor_theses` | Backend Lead | Existe | Alta | Médio | A definir | Validar constraints + RLS | Query + policy |
| DB-002 | Tabela Supabase | `public.matches` | Backend Lead | Existe | Alta | Médio | A definir | Validar score/breakdown | Query + teste |
| DB-003 | Tabela Supabase | `public.teasers` | Backend Lead | Existe | Alta | Médio | A definir | Validar regra de publicação | Query + teste |
| DB-004 | Tabela Supabase | `public.ndas` | Backend Lead | Existe | Alta | Alto | A definir | Validar autorização por papel | Teste negativo |
| DB-005 | Tabela Supabase | `public.investor_drs` | Backend Lead | Existe | Alta | Alto | A definir | Validar isolamento A/B | Teste E2E + query |
| RPC-001 | RPC canônica | `rpc_create_thesis` | Backend Lead | Existe | Alta | Médio | A definir | Fechar payload/erros | Contrato FE/BE |
| RPC-002 | RPC canônica | `rpc_list_opportunities` | Backend Lead | Existe | Alta | Médio | A definir | Validar paginação e filtros | Teste integração |
| RPC-003 | RPC canônica | `rpc_set_nda_status` | Backend Lead | Existe | Alta | Alto | A definir | Garantir idempotência + trilha | Teste + log |
| RPC-004 | RPC canônica | `rpc_dr_upsert_item` | Backend Lead | Existe | Média | Médio | A definir | Revisar permissão e validação | Teste + policy |

> Dica: mantenha esta tabela viva por sprint. Qualquer ativo sem evidência deve continuar como `A definir`.

---

## 3. Checklist de aprovação por categoria

### 3.1 Frontend (System Design)

- Tokens canônicos aplicados sem forks locais.
- Componentes base documentados (estado, variante, comportamento).
- Layouts e navegação compatíveis com jornadas pivotadas.
- Acessibilidade mínima validada (labels, foco, teclado).

### 3.2 Supabase (Schema/RLS/RPC)

- Tabelas críticas M2 validadas no ambiente oficial.
- RLS revisada com cenário positivo e negativo.
- RPCs críticas com contrato fechado (payload, erro, idempotência).
- Logs de auditoria para ações sensíveis (`nda.signed`, bloqueios, acesso negado).

---

## 4. Lista de bloqueios de reuso (com solução)

| Bloqueio | Impacto | Solução recomendada | Urgência |
|---|---|---|---|
| Policies permissivas legadas | Risco de acesso indevido | Sprint de hardening de RLS/policies antes de release | Alta |
| Funções sem `search_path` explícito | Risco de segurança/comportamento | Hardening em lote nas funções críticas | Alta |
| Drift de nomenclatura (`profiles` vs `user_profiles`) | Retrabalho FE/BE | Padronizar contrato e docs para nomenclatura canônica | Alta |
| Falta de evidência A/B de isolamento | Risco multi-tenant | Rodar testes negativos com dado real de homologação | Alta |

---

## 5. Sequência recomendada de execução (Opção C)

1. **Congelar fonte de verdade** (docs canônicos do pivot).
2. **Triagem da matriz** (KEEP/ADAPT/DROP com dono por item).
3. **Executar ADAPT crítico** (segurança + contrato + isolamento).
4. **Aprovar gate técnico** (100% P0 com evidência).
5. **Escalar desenvolvimento** somente dos itens aprovados.

---

## 6. Definição de pronto para “reuso aprovado”

Um ativo só é considerado aprovado quando:

- decisão registrada (`KEEP` ou `ADAPT concluído`);
- ação obrigatória concluída;
- evidência anexada;
- sem pendência P0 de segurança;
- validado por Tech Lead no gate da sprint.

---

## 7. Resumo executivo para kickoff

- **Objetivo:** acelerar com IA sem herdar dívida desnecessária da v1.
- **Estratégia:** greenfield com reuso seletivo (system design + Supabase).
- **Regra:** sem evidência, não reaproveita.
- **Resultado esperado:** contexto limpo, engenharia previsível e execução rápida no pivot.
