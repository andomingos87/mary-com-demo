# 12 — Contrato Tecnico RPC/Server Actions (M2)

> **Ref:** [03-ESPECIFICACAO-FUNCIONAL.md](./03-ESPECIFICACAO-FUNCIONAL.md)
> **Data:** 18/03/2026
> **Escopo:** funcoes canônicas para fluxos M2 no projeto oficial `eetoztxgkvyxjjmkgdvm`

---

## 1. Objetivo

Padronizar a interface tecnica entre backend e aplicacao para os fluxos criticos M2, reduzindo ambiguidade de naming e de responsabilidades entre banco e Server Actions.

---

## 2. Mapa de funcoes canonicas

| Funcao | Objetivo | Entradas principais | Saida | Tabelas impactadas |
|---|---|---|---|---|
| `rpc_upsert_profile` | Atualizar perfil base do usuario | `phone_number`, `whatsapp_number` | `profile_id` | `user_profiles` |
| `rpc_create_project` | Criar projeto no contexto da org | `org_id`, `codename`, `name`, `objective` | `project_id` | `projects` |
| `rpc_create_thesis` | Criar tese + filtros | `org_id`, `name`, `payload` | `thesis_id` | `investor_theses`, `thesis_filters_*` |
| `rpc_list_opportunities` | Listar oportunidades por score | `thesis_id`, `limit`, `offset` | lista ordenada | `matches` |
| `rpc_set_nda_status` | Alterar status NDA e sincronizar DR | `project_id`, `investor_org_id`, `status` | `nda_id` | `ndas`, `investor_drs` |
| `rpc_dr_upsert_item` | Criar/editar item no VDR | `project_id`, `payload` | `document_id` | `vdr_documents` |
| `rpc_dr_validate` | Registrar validacao N1/N2/N3 | `document_id`, `level`, `approved` | `validation_id` | `vdr_document_validations` |
| `rpc_qna_ask` | Registrar pergunta Q&A no contexto do projeto | `project_id`, `question` | `message_id` | `vdr_qa_messages` |
| `rpc_pipeline_move` | Placeholder controlado ate M3 | `project_id`, `investor_org_id`, `new_stage` | JSON de status | sem alteracao de dominio |

---

## 3. Regras de implementacao

- As funcoes usam validacao de acesso por `is_org_member(...)` e contexto de projeto.
- A funcao `rpc_set_nda_status` cria/atualiza `investor_drs` automaticamente quando NDA vira `signed`.
- `rpc_pipeline_move` permanece em modo seguro (`not_implemented`) ate o bloco de pipeline M3.
- Server Actions devem consumir **somente** este contrato canônico para evitar rotas paralelas.
- Nomenclatura canônica de identidade no banco oficial: `user_profiles` (evitar alias historico `profiles` em novos artefatos).
- Toda RPC critica deve declarar comportamento de erro e idempotencia no contrato FE/BE antes de release.

---

## 4. Rastreabilidade com requisitos

| Requisito | Funcao canônica | Evidencia esperada |
|---|---|---|
| Tese + matching | `rpc_create_thesis`, `rpc_list_opportunities` | tese criada, match consultado por score |
| NDA + DR espelhado | `rpc_set_nda_status` | NDA `signed` gera/ativa `investor_drs` |
| VDR core governado | `rpc_dr_upsert_item`, `rpc_dr_validate` | item persistido + validacao registrada |
| Q&A operacional | `rpc_qna_ask` | mensagem registrada por projeto |

---

## 5. Rollback operacional (por bloco)

- **Bloco thesis/matching:** remover dependencias de leitura na aplicacao e desativar chamadas para `rpc_create_thesis`/`rpc_list_opportunities`.
- **Bloco nda/dr:** reverter para fluxo manual sem criacao automatica de `investor_drs`.
- **Bloco vdr validate:** manter somente trilha existente de VDR sem validacao N1/N2/N3 via RPC.

> O rollback fisico de schema deve ser feito por migration dedicada de reversao, nunca por ajuste manual direto.

---

## 6. Gate minimo de contrato (obrigatorio no kickoff)

| Item | Regra de aprovacao |
|---|---|
| Payload tipado | Entradas com shape canonico validado no backend e no frontend |
| Erros padronizados | Codigo e mensagem padrao para `forbidden`, `not_found`, `conflict`, `invalid_state` |
| Idempotencia | Operacoes sensiveis (`rpc_set_nda_status`, `rpc_dr_upsert_item`) com protecao contra repeticao |
| Rastreabilidade | Toda chamada critica gera evento auditavel por `project_id` e ator |

Sem esses 4 itens, o contrato fica em `APROVADO COM CONDICAO` e nao pode ser considerado fechado.
