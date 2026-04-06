# Module Context Guide (Scaffold)

Use este template para documentar qualquer modulo do projeto Mary.

---

## 1) Identificacao do modulo

- **Nome do modulo:**
- **Owner tecnico:**
- **Owner de negocio:**
- **Status:** `discovery | em desenvolvimento | estavel | legado`
- **Ultima atualizacao:**

## 2) Objetivo de negocio

- **Problema que resolve:**
- **Publico/area impactada:**
- **Valor esperado:**
- **Nao objetivos (fora de escopo):**

## 3) Escopo funcional

- **Entradas principais:**
- **Processamentos-chave:**
- **Saidas/entregaveis:**
- **Fluxo principal (happy path):**
- **Fluxos alternativos/erros:**

## 4) Arquitetura e componentes

- **Camadas envolvidas:** `UI | Server Actions | API | DB | Integracoes`
- **Componentes/servicos principais:**
- **Dependencias internas:**
- **Dependencias externas:**
- **Decisoes arquiteturais relevantes:**

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/...`
- **Componentes UI:** `src/components/...`
- **Acoes de servidor:** `src/lib/actions/...`
- **Schemas/tipos:** `src/types/...`
- **Migrations/policies:** `supabase/migrations/...`

## 6) Dados e contratos

- **Entidades/tabelas principais:**
- **Campos criticos:**
- **Regras de validacao:**
- **Contratos de API/eventos:**
- **Regras de autorizacao (RLS/permissoes):**

## 7) Seguranca e conformidade

- **Dados sensiveis envolvidos:**
- **Controles aplicados:**
- **Riscos atuais:**
- **Mitigacoes recomendadas:**

## 8) Observabilidade e operacao

- **Logs importantes:**
- **Metricas-chave:**
- **Alertas necessarios:**
- **Runbook basico (falhas comuns + acao):**

## 9) Qualidade e testes

- **Testes unitarios existentes:**
- **Testes de integracao existentes:**
- **Cenarios criticos sem cobertura:**
- **Plano minimo de teste manual:**

## 10) Backlog do modulo

- **Divida tecnica:**
- **Melhorias de curto prazo:**
- **Melhorias de medio prazo:**
- **Riscos bloqueantes e plano de resolucao:**

## 11) Checklist de pronto

- [ ] Escopo funcional validado com negocio.
- [ ] Requisitos de seguranca aplicados.
- [ ] Testes minimos implementados e executados.
- [ ] Documentacao tecnica atualizada.
- [ ] Monitoramento basico definido.

## 12) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| AAAA-MM-DD | | | |

---

## Como preencher bem

- Seja direto e concreto.
- Use paths reais do projeto.
- Evite texto generico.
- Atualize junto com o codigo.
