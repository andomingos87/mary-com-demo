# 05 — Execução e Roadmap

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Gestão + Engenharia

---

## 1. Estrutura Contratual

### Pagamentos

| Evento | Percentual | Status |
|--------|-----------|--------|
| Assinatura do contrato | 40% | ✅ Recebido |
| Aceite Marco 1 | 20% | ⚠️ Pendente aceite formal |
| Aceite Marco 2 | 20% | ❌ Em progresso |
| Aceite Marco 3 + Go-live | 20% | ❌ Não iniciado |

### Procedimento de aceite

1. Contratado comunica conclusão do marco
2. Contratante tem **5 dias úteis** para testes e validação
3. Ressalvas → ajustes → nova validação
4. Ausência de manifestação no prazo = aceite tácito
5. Marcos são sequenciais (não pode aceitar M2 sem M1)

---

## 1.1 Janela de execução validada (call 14/03)

- Referência operacional: **4 semanas** para versão funcional ponta a ponta (release de teste)
- Janela opcional adicional: **+1 semana** de refino
- Cadência alvo: ~2 entregas consistentes por semana
- Estratégia: ciclos curtos de validação contínua (`desenvolve -> aprova -> desenvolve -> aprova`)

---

## 2. Marco 1 — Fundação, Identidade e Onboarding ✅

> **Fases:** 0, 1, 2, 3
> **Cobertura:** ~95%

### Critérios de aceite contratuais

| # | Critério | Status |
|---|----------|--------|
| 3.3.a | Ambiente de homologação acessível e funcional | ✅ |
| 3.3.b | Fluxo completo de autenticação operacional | ✅ |
| 3.3.c | Controle de acesso por papéis validado | ✅ |
| 3.3.d | Isolamento de dados entre organizações | ✅ |
| 3.3.e | Onboarding completo → dashboard correto por perfil | ✅ |

### Entregas por fase

**Fase 0 — Infraestrutura:** ✅
- Repositório Next.js + TypeScript, Supabase configurado, CI/CD Vercel, audit log, feature flags, i18n base, segurança inicial

**Fase 1 — Autenticação:** ✅
- Login/signup, MFA (SMS mock), sessão única 24h, refresh token, alerta novo dispositivo, detecção país, rate limiting

**Fase 2 — Organizações e RBAC:** ✅
- 14 RLS policies, 4 roles, multi-perfil, convites (7 dias), advisor conflict check

**Fase 3 — Onboarding + Rotas base:** ✅
- 9 componentes wizard + 2 hooks, 10 server actions, enrichment (6 APIs), rotas PRD implementadas, 101 testes

### Pendências menores

| Item | Prioridade | Status |
|------|------------|--------|
| 3 personas testadas formalmente em staging | P1 | ❌ |
| Métricas de taxa de abandono e sucesso de APIs | P2 | ❌ |
| Edge Function sync-cvm-data (cron) | P3 | ❌ |
| Bug inferência tipos Supabase | P3 | ⚠️ Documentado |

**Conclusão:** Funcionalidade implementada. Falta validação formal (gate de saída Fase 3) para aceite contratual.

---

## 3. Marco 2 — Funcionalidades Centrais ⚠️

> **Fases:** 4, 5, 6
> **Cobertura:** ~55%
> **Detalhes completos:** [03-ESPECIFICACAO-FUNCIONAL.md](./03-ESPECIFICACAO-FUNCIONAL.md)

### Critérios de aceite contratuais

| # | Critério | Status | Blocker |
|---|----------|--------|---------|
| 4.3.a | Projetos criados e gerenciados | ✅ | — |
| 4.3.b | Data Room funcional com permissões | ⚠️ | VDR Investidor + NDA |
| 4.3.c | Isolamento entre investidores | ⚠️ | RLS por par Projeto×Investidor |
| 4.3.d | Matching retornando resultados coerentes | ❌ | Thesis + Engine + Radar |
| 4.3.e | Validação prática com múltiplos perfis | ❌ | Teaser + NDA + E2E |

### Status por componente

| Componente | Cobertura | Status |
|------------|-----------|--------|
| Projetos + Taxonomia + Readiness | 100% | ✅ |
| VDR Core (ativo) | 95% | ✅ |
| VDR Investidor (espelho) | 15% | ❌ |
| NDA (manual) | 0% | ❌ |
| Teaser | 0% | ❌ |
| Thesis + Matching + Radar | 5% | ❌ |

### Migrations pendentes (P0 bloqueantes)

| # | Tabela | Desbloqueia |
|---|--------|-------------|
| 1 | `investor_theses` + `thesis_filters_*` | Thesis CRUD |
| 2 | `matches` + `settings_matching` | Matching Engine |
| 3 | `teasers` | Teaser |
| 4 | `ndas` | NDA flow |
| 5 | `investor_drs` | DR espelhado |

### Ordem de implementação recomendada (pós-pivot)

| # | Item | Justificativa | Desbloqueia |
|---|------|---------------|-------------|
| 1 | Migrations (todas P0) | Sem tabelas, nada funciona | Tudo |
| 2 | MRS funcional (integrado VDR) | Novo pilar do ativo pós-pivot | Readiness real |
| 3 | Thesis CRUD + UI | Base para matching | Matching |
| 4 | Matching Engine v0 | Critério 4.3.d | Radar |
| 5 | Radar (oportunidades) | Critério 4.3.d | Fluxo investidor |
| 6 | Teaser (geração + link) | Critério 4.3.e | NDA flow |
| 7 | NDA flow (manual) | Pré-requisito DR espelhado | DR espelhado |
| 8 | VDR Investidor (espelho) | Critérios 4.3.b e 4.3.c | Isolamento |
| 9 | Validação E2E multi-perfil | Critério 4.3.e | Aceite contratual |

**Estimativa:** ~15 itens P0 + ~6 itens P1/P2 = ~21 itens de desenvolvimento.

---

## 4. Marco 3 — Operação, Pipeline, IA e Monetização ❌

> **Fases:** 7, 8, 9
> **Cobertura:** ~5%

### Critérios de aceite contratuais

| # | Critério | Status |
|---|----------|--------|
| 5.3.a | Pipeline plenamente funcional e auditável | ❌ |
| 5.3.b | IA operando sem vazamento entre projetos | ❌ |
| 5.3.c | Geração de documentos conforme escopo | ❌ |
| 5.3.d | Sistema de pagamentos ativo e funcional | ❌ |
| 5.3.e | Documentação técnica para operação/manutenção | ❌ |

### Entregas pendentes

**Fase 7 — Pipeline:**
- Modelagem + UI espelhada (Kanban)
- Etapas com regras de transição
- Formulário obrigatório na Proposta/IOI
- Permissões alinhadas ao fluxo buy-side (investidor controla o kanban)
- Prazos + gatilhos de notificação

**Fase 8 — Mary AI:**
- Camada LLM (OpenAI + OpenRouter)
- Guardrails de segurança
- Mary AI Public + Private
- RAG (ingestão + retrieval + citações)
- Geração de docs (Teaser, CIM, Valuation)
- Investigação automática (dossiê pós-onboarding)
- Arquitetura desacoplada (banco IA separado)

**Fase 9 — Go-Live:**
- Stripe subscriptions + feature gating
- Notificações (in-app + email + WhatsApp)
- Admin (usuários, pesos matching/readiness)
- NFRs (performance, LGPD, auditoria)
- Documentação técnica
- Beta fechado (20-30 usuários)

### Ordem recomendada (Marco 3)

| # | Item | Justificativa |
|---|------|---------------|
| 1 | Pipeline (modelagem + UI espelhada) | Critério 5.3.a |
| 2 | IA + RAG (isolamento + citações) | Critério 5.3.b |
| 3 | Geração docs (Teaser/CIM/Valuation) | Critério 5.3.c |
| 4 | Notificações (in-app + email) | Suporte operacional |
| 5 | Stripe (subscriptions + feature gating) | Critério 5.3.d |
| 6 | Documentação técnica + go-live | Critério 5.3.e |

---

## 5. Gap Analysis — Modelo de Dados

| Tabela | Prevista | Implementada | Marco |
|--------|----------|--------------|-------|
| `profiles` | ✅ | ✅ | M1 |
| `organizations` | ✅ | ✅ | M1 |
| `organization_members` | ✅ | ✅ | M1 |
| `investor_theses` | ✅ | ❌ | M2 |
| `thesis_filters_sector` | ✅ | ❌ | M2 |
| `thesis_filters_geo` | ✅ | ❌ | M2 |
| `thesis_filters_ranges` | ✅ | ❌ | M2 |
| `projects` | ✅ | ✅ | M2 |
| `teasers` | ✅ | ❌ | M2 |
| `ndas` | ✅ | ❌ | M2 |
| `investor_drs` | ✅ | ❌ | M2 |
| `vdr_documents` | ✅ | ✅ | M2 |
| `vdr_document_links` | ✅ | ✅ | M2 |
| `vdr_document_validations` | ✅ | ✅ | M2 |
| `vdr_qa_messages` | ✅ | ✅ | M2 |
| `vdr_access_logs` | ✅ | ✅ | M2 |
| `matches` | ✅ | ❌ | M2 |
| `settings_matching` | ✅ | ❌ | M2 |
| `mary_taxonomy` | ✅ | ✅ | M2 |
| `pipeline_tickets` | ✅ | ❌ | M3 |
| `rag_chunks` | ✅ | ❌ | M3 |
| `qna_threads` | ✅ | ❌ | M3 |
| `qna_messages` | ✅ | ❌ | M3 |
| `notifications` | ✅ | ❌ | M3 |
| `ia_dossiers` | — | ❌ | M3 |
| `ia_processing_queue` | — | ❌ | M3 |
| `settings_readiness` | ✅ | ⚠️ | M2 |

**Resultado:** 27 tabelas previstas → 11 implementadas (41%), 16 pendentes (59%).

---

## 6. Itens Fora do Escopo V1

Explicitamente excluídos (Anexo I §1):

- Marketplace de advisors
- Suite completa de assinatura eletrônica avançada (workflows customizados, automações e integrações profundas)
- Upload pesado interno (file storage proprietário)
- Relatórios PDF/Excel
- BI
- Smart-contracts / escrow
- Cap table
- Ranking / gamificação
- LP pública avançada
- API Cronos compliance/dossiê (V2)
- Score por tese com pesos adaptativos (V3/V4)
- Dark mode, White-label
- Integração calendário
- Mensageria interna completa (decisão do pivot)

**Observação de alinhamento 18/03:** assinatura no MVP foi congelada em duas camadas: fluxo manual auditável no P0 e integração mínima para NDA/NBO no P1.

---

## 7. Checklist de Testes (mínimo por fase)

### Automatizados

- **Unit:** regras de score, validações, normalizações, rate limiting
- **Integration:** endpoints + RLS + webhooks + edge functions
- **E2E (Playwright):** login+MFA, onboarding, VDR, matching, pipeline

### Manuais (smoke)

- **Perfis:** Investor / Asset / Advisor / Admin
- **Segurança:** acesso cruzado entre orgs, vazamento de projeto, links revogados
- **Performance:** páginas core e endpoints dentro dos targets

---

## 8. Backlog Executivo P0/P1 (Dono e Dependências)

### 8.1 P0 — Bloqueante para fluxo crítico M2

| ID | Item | Dono sugerido | Dependências | Evidência de conclusão |
|---|---|---|---|---|
| P0-01 | Migration `investor_theses` + filtros | Backend | Nenhuma | CRUD de tese em staging |
| P0-02 | Migration `matches` + pesos | Backend | P0-01 | Score persistido + breakdown |
| P0-03 | Migration `teasers` + link rastreável | Backend + Frontend | P0-01 | Teaser publicado por codename |
| P0-04 | Migration `ndas` + fluxo manual | Backend + Produto | P0-03 | NDA signed com audit log |
| P0-05 | Migration `investor_drs` + RLS por par | Backend + Security | P0-04 | Teste negativo investidor A/B |
| P0-06 | Gate MRS por NDA/NBO | Frontend + Backend | P0-04 | Bloqueio/liberação validado |
| P0-07 | Matching v0 (regras absolutas) | Backend | P0-02 | Cenário exclusão => score 0 |
| P0-08 | Radar com filtros e ação Prosseguir | Frontend | P0-07 + P0-03 | Fluxo de decisão investidor |
| P0-09 | E2E multi-perfil dos fluxos críticos | QA + Engenharia | P0-01..P0-08 | Relatório E2E sem falha P0/P1 |

### 8.2 P1 — Necessário para aceite formal do marco

| ID | Item | Dono sugerido | Dependências | Evidência de conclusão |
|---|---|---|---|---|
| P1-01 | Q&A por item no DR espelhado | Backend + Frontend | P0-05 | Thread funcional por par |
| P1-02 | Solicitação de docs adicionais | Frontend + Produto | P0-05 | Histórico de solicitações |
| P1-03 | Monitoramento base (Sentry) | Plataforma | P0-09 | Alertas ativos em staging |
| P1-04 | Digest semanal de engajamento | Backend | P0-08 | Disparo validado |
| P1-05 | Runbook operacional + troubleshooting | Tech Lead | P0-09 | Documento validado no gate |

---

## 9. Gate Formal de Revisão (Semanal)

| Item de controle | Critério objetivo | Resultado esperado |
|---|---|---|
| Cobertura P0 | 100% dos itens P0 com dono, prazo e evidência | Aprovado/Reprovado |
| Segurança | Nenhum vazamento entre investidores no mesmo projeto | Aprovado/Reprovado |
| Fluxo E2E | Caminho investidor e ativo sem falha P0/P1 | Aprovado/Reprovado |
| Governança | Documentação atualizada após cada entrega crítica | Aprovado/Reprovado |
| Risco | Todo risco alto com mitigação executável | Aprovado/Reprovado |

**Regra de decisão:** qualquer reprovação em segurança, isolamento ou ausência de evidência P0 bloqueia avanço da sprint seguinte.

---

## 10. Resultado do Gate Técnico com MCP (18/03/2026)

> **Fonte:** [11-RELATORIO-ADERENCIA-MCP-SUPABASE.md](./11-RELATORIO-ADERENCIA-MCP-SUPABASE.md)

| Item | Resultado |
|---|---|
| Aderência doc x banco para tabelas P0 | ✅ Aprovado |
| Aderência de RPCs críticas | ✅ Aprovado |
| Isolamento e RLS no padrão alvo | ⚠️ Aprovado com ressalvas |
| Inventário de Edge Functions | ⚠️ Não aplicável no momento |

**Decisão do gate:** `APROVADO COM CONDIÇÃO` para kickoff técnico de M2.

### Ações mandatórias antes do novo gate

1. Executar testes negativos A/B de isolamento em homologação.
2. Endereçar warnings de `search_path` mutável.
3. Revisar e reduzir políticas permissivas legadas do fluxo auth.
4. Reexecutar validação MCP semanal durante a execução de M2.
