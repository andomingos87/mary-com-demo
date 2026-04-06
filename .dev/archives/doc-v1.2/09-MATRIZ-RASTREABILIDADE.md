# 09 — Matriz de Rastreabilidade (Objetivo -> RF -> Técnico -> Teste)

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Produto + Engenharia + QA
> **Status:** Gate obrigatório para kickoff técnico
> **Última atualização:** 18/03/2026

---

## 1. Estrutura da matriz

| Campo | Descrição |
|---|---|
| Objetivo | Resultado de negócio esperado |
| Requisito funcional | RF oficial no documento funcional |
| Componente técnico | Tabela/API/rota/componente para implementação |
| Critério de aceite | Regra objetiva para aprovar |
| Teste mínimo | Teste unit/integration/E2E mínimo |
| Evidência | Log, captura, relatório ou query |
| Status | `P0-BLOQUEANTE`, `P1-NECESSARIO`, `P2-EVOLUTIVO` |

---

## 2. Matriz consolidada (kickoff M2)

| Objetivo | Requisito funcional | Componente técnico | Critério de aceite | Teste mínimo | Evidência | Status |
|---|---|---|---|---|---|---|
| Garantir prontidão real do Ativo | RF-MRS-001, 002, 004, 006, 008 | `projects`, `vdr_documents`, `vdr_document_validations`, cálculo de score em server action/RPC | Score 0-100 recalcula ao validar documento e persiste por projeto | Integration de recálculo + E2E fluxo MRS | Query de score + gravação em audit log | P0-BLOQUEANTE |
| Controlar acesso por etapa contratual | RF-MRS-009, 010 | `ndas`, regra de gate no app, RLS por etapa | NDA signed libera passos 1-2; NBO signed libera passos 3-4 | E2E investidor sem NDA/NBO | Logs de autorização negada/liberada | P0-BLOQUEANTE |
| Publicar visão pré-NDA sem vazamento | Teaser seção 7 | `teasers`, link rastreável, render HTML | Teaser exibe codename, sem dados sensíveis, com tracking de visualização | E2E abrir teaser por link + teste negativo de dados sensíveis | Captura do teaser + evento de tracking | P0-BLOQUEANTE |
| Formalizar confidencialidade por investidor | NDA seção 6 | `ndas`, `rpc_set_nda_status`, permissões de assinatura | Apenas Owner/Advisor marca `signed`; investidor nunca marca próprio NDA | Integration de permissão + E2E assinatura | Registro de status e actor no audit log | P0-BLOQUEANTE |
| Liberar DR espelhado com isolamento | VDR Investidor 5.2 | `investor_drs`, RLS por `(project_id, investor_org_id)` | Investidor A não acessa DR do Investidor B no mesmo projeto | E2E negativo A/B + query de RLS | Resultado de testes + policy validada | P0-BLOQUEANTE |
| Gerar oportunidades aderentes à tese | Thesis 8.1 + Matching 8.2 | `investor_theses`, `thesis_filters_*`, `matches` | Matching retorna score coerente e respeita exclusões absolutas | Unit do score + integration persistência em `matches` | Top 3 razões + breakdown JSON salvo | P0-BLOQUEANTE |
| Permitir decisão de avanço pelo investidor | Radar 8.4 | rota `opportunities`, filtros por score/setor/geo | Radar lista apenas projetos com teaser publicado e readiness >= 70 | E2E filtros + ação "Prosseguir" | Captura da lista e ação registrada | P0-BLOQUEANTE |
| Garantir governança de conflito advisor | Regra 2.3 | `check_advisor_conflict`, RLS contextual | Advisor não atua em sell-side e buy-side do mesmo projeto | Integration de função + E2E bloqueio | Evento `advisor.conflict_blocked` | P1-NECESSARIO |
| Garantir trilha de auditoria para ações críticas | Segurança 1.4 + DoD | `audit_events`, logs de acesso VDR/teaser/NDA | Ações críticas têm evento auditável com ator, timestamp e contexto | Integration de geração de audit event | Export de log por projeto | P1-NECESSARIO |
| Sustentar operação com testes multi-perfil | Roadmap 7 | suíte Playwright + smoke manual | Fluxo Ativo/Investidor/Advisor passa sem bug P0/P1 | E2E fim-a-fim multi-perfil | Relatório de execução de testes | P1-NECESSARIO |
| Padronizar nomenclatura e fonte de verdade | Governança documental | `MASTER.md`, `07-GLOSSARIO.md`, cross-links | Termos canônicos aplicados e links consistentes | Revisão documental checklist | Checklist assinado no gate | P1-NECESSARIO |
| Expandir benchmark setorial e ajustes finos | RF-MRS-007 e ajustes de peso | `settings_readiness`, módulo benchmark | Placeholder substituído por dados reais em evolução | Unit + smoke | Registro de release evolutivo | P2-EVOLUTIVO |

---

## 3. Decisão operacional de uso

- Itens `P0-BLOQUEANTE` precisam estar prontos e aprovados para iniciar desenvolvimento pleno de fluxo crítico.
- Itens `P1-NECESSARIO` podem evoluir em paralelo, mas devem fechar antes do aceite formal do marco.
- Itens `P2-EVOLUTIVO` entram após estabilidade do fluxo principal.

---

## 4. Atualização de execução (S0/S1)

| Bloco | Status | Evidência |
|---|---|---|
| Hardening de segurança/RLS (S0) | Concluído | Reexecução `get_advisors(security)` sem erros críticos |
| Convergência de schema P0 M2 (S1) | Concluído | Tabelas `investor_theses`, `thesis_filters_*`, `matches`, `teasers`, `ndas`, `investor_drs` existentes |
| Contrato técnico RPC M2 (S1) | Concluído | Funções `rpc_*` canônicas criadas e documentadas em `12-CONTRATO-TECNICO-RPC-M2.md` |
| Re-gate técnico MCP | Aprovado com condição | Parecer consolidado em `11-RELATORIO-ADERENCIA-MCP-SUPABASE.md` |

---

## 5. Donos sugeridos e evidência mínima por bloco P0

| Bloco P0 | Dono sugerido | Evidência mínima obrigatória |
|---|---|---|
| MRS + prontidão | Backend + Produto | Query de score + log de recálculo por projeto |
| Teaser | Frontend + Backend | Captura do teaser + evento de tracking |
| NDA + DR espelhado | Backend + Segurança | Teste negativo A/B + policy RLS validada |
| Thesis + Matching | Backend | Persistência de breakdown + top reasons |
| Radar do investidor | Frontend + QA | E2E com filtros e ação registrada |

Sem dono e sem evidência, o item deve permanecer em `P0-BLOQUEANTE`.
