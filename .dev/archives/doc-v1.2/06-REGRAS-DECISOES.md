# 06 — Regras de Negócio e Decisões

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Todos os stakeholders

---

## 1. Decisões do Pivot (07/03/2026)

Decisões tomadas na call de alinhamento que redirecionou o produto:

| # | Decisão | Justificativa |
|---|---------|---------------|
| 1 | Seguir com MVP mais simples e orientado ao essencial | Reduzir fricção, acelerar entrega |
| 2 | MRS como pilar de entrada do lado Ativo | Transformar lista de 180 itens em experiência progressiva |
| 3 | Experiências espelhadas entre Ativo e Investidor | Reduzir custo de desenvolvimento e inconsistência |
| 4 | Onboarding do Investidor: 5 → 2 etapas | Menor abandono, entrada mais rápida |
| 5 | Feed como funcionalidade de engajamento | Gerar efeito de rede e vida na plataforma |
| 6 | Comunicação via e-mail externo (sem chat interno) | Menor custo e risco de segurança |
| 7 | IA como copiloto contextual (sem execução automática) | Manter controle humano no MVP |
| 8 | Pesos de matching: 30/25/15/15/15 (antes: 40/20/10/10/20) | Distribuição mais equilibrada entre critérios |
| 9 | Scoring MRS simplificado: tem/não tem + peso por passo | Transparência e facilidade no MVP |
| 10 | Evitar complexidades prematuras | Mensageria, automações pesadas, excesso de campos removidos |

---

## 1.1 Complementos da call (14/03/2026)

| # | Decisão/Alinhamento | Justificativa |
|---|---------------------|---------------|
| 1 | Kanban do lado buy-side controlado pelo investidor | Melhor aderência ao processo real de tomada de decisão do investidor |
| 2 | MRS com gates por etapa formal | NDA libera passos 1-2 e NBO libera passos 3-4 |
| 3 | Módulo `Mais Infos` como data room complementar | Suportar diligências extras e Q&A fora da taxonomia padrão |
| 4 | Política de upload MVP text-first | Melhor qualidade de leitura da IA e menor risco operacional inicial |
| 5 | Assinatura eletrônica no MVP mínimo permanece em decisão crítica | Ganho jurídico e de auditoria, com impacto de prazo/escopo |
| 6 | Digest semanal de engajamento por e-mail aprovado | Reforçar efeito de rede e retorno à plataforma |

---

## 1.2 Decisões Congeladas para Kickoff (18/03/2026)

| # | Tema | Decisão congelada | Justificativa |
|---|---|---|---|
| 1 | Matching (deal breakers) | Critérios absolutos iniciais: setor excluído, geografia excluída, ticket fora da faixa, readiness abaixo do mínimo da tese | Remove ambiguidade na engine v0 e evita retrabalho |
| 2 | Upload por arquivo (MVP) | Limite inicial: **25 MB por arquivo**, com revisão quinzenal por telemetria | Equilibra custo, performance e UX no início |
| 3 | Assinatura eletrônica no MVP | Fluxo padrão: manual com trilha auditável; integração mínima para NDA/NBO fica em P1 | Mantém segurança jurídica sem bloquear entrega do P0 |
| 4 | Jornada final do Advisor | Handoff formal: curadoria inicial -> validação documental -> apoio em diligência -> transição para acompanhamento de marcos | Fecha lacuna operacional do perfil Advisor |
| 5 | Baseline técnico de ambiente | Toda decisão de kickoff deve ser baseada no relatório MCP do projeto oficial (`eetoztxgkvyxjjmkgdvm`) | Evita execução em ambiente divergente da documentação |

---

## 2. Regras de Negócio Transversais

### 2.1 Isolamento de Dados

| Regra | Descrição | Implementação |
|-------|-----------|---------------|
| RN-ISO-001 | Investidor A nunca vê dados do Investidor B no mesmo projeto | RLS por par `(project_id, investor_org_id)` |
| RN-ISO-002 | DR espelhado scoped por (project × investor) | Tabela `investor_drs` + RLS |
| RN-ISO-003 | Marcações privadas do investidor invisíveis para o ativo | Coluna `investor_org_id` + RLS |
| RN-ISO-004 | Q&A do investidor privada por par projeto×investidor | Thread isolada + RLS |
| RN-ISO-005 | NDA é por par (project × investor) | Unique constraint + RLS |

### 2.2 Permissões por Perfil

| Ação | Investidor | Ativo (Owner/Admin) | Advisor (Sell) | Advisor (Buy) | Admin Mary |
|------|-----------|-------------------|---------------|--------------|-----------|
| Criar projeto | ❌ | ✅ | ✅ | ❌ | ✅ |
| Gerenciar VDR do ativo | ❌ | ✅ | ✅ | ❌ | ✅ |
| Ver DR espelhado | ✅ (próprio) | ✅ | ✅ | ✅ (assessorado) | ✅ |
| Criar tese | ✅ | ❌ | ❌ | ✅ (assessorado) | ✅ |
| Ver Radar | ✅ | ❌ | ❌ | ✅ | ✅ |
| Iniciar NDA | ✅ | ❌ | ❌ | ✅ (assessorado) | ❌ |
| Aprovar NDA (signed) | ❌ | ✅ | ✅ | ❌ | ✅ |
| Ver Teaser | ✅ | ✅ (próprio) | ✅ | ✅ | ✅ |
| Publicar Teaser | ❌ | ✅ | ✅ | ❌ | ✅ |
| Q&A no espelho | ✅ | ❌ (responde) | ❌ (responde) | ✅ | ✅ |
| Solicitar docs | ✅ | ❌ (responde) | ❌ (responde) | ✅ | ❌ |
| Marcações privadas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mover card pipeline | ✅ | ❌ (acompanha) | ✅ (apoio operacional) | ✅ (assessorado) | ✅ |

### 2.3 Advisor — Regra de Conflito

- Advisor tem acesso contextual limitado: **sell-side OU buy-side, nunca ambos** no mesmo projeto
- Sistema impede acesso via `check_advisor_conflict()` + RLS policy
- Tentativa bloqueada gera audit action `advisor.conflict_blocked`

### 2.4 Gate de Elegibilidade

| Critério | Investidor Individual | Advisor |
|----------|----------------------|---------|
| Deals (últimos 3 anos) | ≥ 2 | ≥ 2 |
| Experiência em M&A | ≥ 5 anos | ≥ 5 anos |
| Valor acumulado mínimo | ≥ USD 20k | ≥ USD 100k |

Verificação híbrida:
1. **Automática (score):** análise de deals, URLs, reputação de domínio
2. **Manual (amostragem):** SLA 48h para casos com score médio/baixo

### 2.5 Política de Slug

- **Reserva:** no callback (privado, não indexado)
- **Congelamento:** após `verified + completed` (torna público)
- **Herança:** novos membros de organização verificada herdam status

### 2.6 Matching

- Matching só ocorre entre teses ativas e projetos com Readiness ≥ 70%
- Exclusões são absolutas (score = 0)
- Projetos do mesmo investidor nunca aparecem
- Recalcula ao alterar tese, dados do projeto ou validar documentos
- Apenas projetos com teaser publicado aparecem no Radar

### 2.7 Teaser

- Geração requer Readiness > 30%
- Apenas 1 teaser ativo por projeto
- Aprovação obrigatória do ativo/advisor antes de publicar
- Nenhum dado sensível ou identificador real
- Codename da empresa (nunca nome real)

### 2.8 NDA

- Um NDA por par (projeto × investidor)
- Apenas Advisor ou Owner marca como signed
- NDA signed → cria DR espelhado automaticamente
- NDA pending → sem acesso ao DR
- NDA pode ser revogado

### 2.9 Pipeline

- Kanban do processo é controlado pelo investidor no lado buy-side
- Ativo e advisor atuam como respondedores de solicitações/documentos por etapa
- Formulário obrigatório na fase de Proposta/IOI
- Prazos configuráveis com alertas automáticos (2 sem, 1 sem, 3 dias)
- Investidor sem cumprir prazos perde preferência

---

## 3. Pendências que Precisam Decisão

| # | Categoria | Pendência | Recomendação | Urgência |
|---|-----------|-----------|-------------|----------|
| 1 | Mary AI | Período de armazenamento de conversas | 90 dias (depois purge) | Média |
| 2 | Mary AI | Escopo de execução de ações na plataforma | Copiloto apenas (decisão do pivot) | ✅ Resolvido |
| 3 | Matching | Critérios obrigatórios (deal breakers) | Definidos no bloco 1.2 (congelados para kickoff) | ✅ Resolvido |
| 4 | Convites | Limite de convites pendentes | 10 por organização | Baixa |
| 5 | LGPD | Período de retenção após inatividade | 12 meses com aviso prévio | Alta |
| 6 | LGPD | Período de retenção deals fechados | Indefinido (com paywall) | ✅ Definido |
| 7 | LGPD | Período de retenção deals declinados | 6 meses | Média |
| 8 | LGPD | Detalhes de portabilidade | JSON export básico no MVP | Média |
| 9 | i18n | Idiomas do MVP | Apenas PT-BR (EN como segunda prioridade) | Média |
| 10 | i18n | Idioma docs gerados por IA | PT-BR (com opção EN futura) | Baixa |
| 11 | Infra | Ferramenta de monitoramento | Sentry | Média |
| 12 | Beta | Usuários específicos | Definir com Leonardo/Cassio | Alta |
| 13 | Beta | Duração e critérios de avanço | 4-6 semanas, 0 bugs P0/P1 | Alta |
| 14 | WhatsApp | Credenciais de produção | Aguardando cliente | Blocker para MFA real |
| 15 | VDR | Subpastas hierárquicas (tipo Google Drive) | V2 (VDR atual é flat) | Baixa |
| 16 | Upload | Limite inicial por arquivo no MVP | Definido em 25 MB + revisão quinzenal por telemetria | ✅ Resolvido |
| 17 | Assinatura | Escopo final no MVP (manual vs. integração mínima) | Definido: manual no P0 + integração mínima no P1 | ✅ Resolvido |
| 18 | Advisor | Refinamento do fim de jornada | Definido handoff no bloco 1.2 | ✅ Resolvido |
| 19 | MRS | Calibração visual e pesos de cálculo | Validar fórmula simplificada com casos reais | Média |
| 20 | Mensageria admin | Textos da Mary fora do código | Criar módulo/configuração centralizada | Média |
| 21 | Ambiente | Confirmar oficialmente `project_id` alvo do ciclo | Confirmado: `eetoztxgkvyxjjmkgdvm` (`mary-mvp`) como baseline de validacao técnica | ✅ Resolvido |

---

## 4. Riscos e Mitigações

### 4.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade RLS no DR espelhado | Média | Alto | Testes negativos obrigatórios (investidor A não acessa dados de B) |
| Matching com pesos inadequados | Média | Médio | Seed com 3 teses + 10 projetos para validação manual |
| Performance matching > 2s | Baixa | Médio | Índices + cache + scores persistidos |
| Teaser expondo dados sensíveis | Baixa | Alto | Revisão humana obrigatória + checklist de dados proibidos |
| NDA manual com muita fricção | Média | Médio | UX simplificada; automação em V2 |
| Custos LLM escalando | Média | Médio | Rate limiting + monitoramento de custos por organização |
| Performance RAG com volume | Média | Alto | Otimização de índices, cache, chunks assíncronos |

### 4.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Escopo do MVP voltar a inflar | Alta | Alto | Checklist "essencial vs. depois" com gate por sprint |
| Plataforma perder engajamento pós-onboarding | Alta | Alto | Feed + lembretes + nudges + resumos por e-mail |
| Documentação dispersa/incompleta | Média | Alto | Este documento master como fonte de verdade |
| Adoção lenta por investidores | Média | Alto | Base pré-cadastrada + beta fechado |
| Qualidade dos dados iniciais | Alta | Médio | Validação L1/L2/L3 rigorosa |

### 4.3 Riscos de Dependência

| Dependência | Criticidade | Alternativa |
|-------------|-------------|-------------|
| OpenAI API | Alta | OpenRouter (Claude, Gemini) |
| Stripe | Alta | Nenhuma definida |
| WhatsApp Business API | Alta | SMS como fallback funcional |
| Supabase | Alta | Migração para PostgreSQL dedicado |
| Vercel | Média | AWS/GCP |
| Credenciais do cliente (WhatsApp) | Alta | Mock até receber |

---

## 5. Definição de Pronto (DoD)

Para qualquer tarefa de produto:

- Funcionalidade entregue em staging com configurações documentadas
- RLS/RBAC aplicada (quando houver dados sensíveis)
- Logs/auditoria para ações relevantes
- Teste automatizado mínimo (unit/integration) + checklist manual de UI
- Acessibilidade básica (WCAG AA pragmático): navegação por teclado e labels/aria

Para encerrar uma fase:

- Checklist de critérios de aceite 100% atendida
- Smoke tests em staging executados e registrados
- Sem falhas P0/P1 abertas
- Métricas mínimas disponíveis (logs + eventos)

---

## 6. Resumo: O que Entra e Não Entra no MVP

### Entra agora (prioridade alta)

- MRS funcional com progressão por passos
- Onboarding simplificado (2 etapas investidor)
- Radar e Feed com experiência espelhada
- Projetos com marcos essenciais (Teaser → NDA → NBO → SPA)
- Thesis + Matching Engine v0
- VDR espelhado + NDA manual
- Mary AI como painel contextual colaborativo

### Fica para depois (prioridade futura)

- Automação avançada de IA com execução autônoma
- Mensageria interna completa
- Camadas extras de configuração/campos pouco usados
- Sofisticação avançada de scoring e benchmark setorial
- Subpastas hierárquicas no VDR
- Dark mode, white-label
- Assinatura eletrônica nativa
- Relatórios PDF/Excel
- BI e analytics avançados
