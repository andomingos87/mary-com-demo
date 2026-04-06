# 📋 BACKLOG TÉCNICO — Plataforma Mary

## 🔥 Prioridade Alta (Bloqueadores de MVP)

### B1 — Corrigir bug de finalização do cadastro da empresa ✅

* **Descrição:** Ao finalizar o cadastro da empresa, o sistema entra em loop infinito e não avança.
* **Impacto:** Bloqueia onboarding.
* **Status:** Aberto
* **Tipo:** Bug crítico

---

### B2 — Corrigir vazamento de sessão / token entre perfis ✅

* **Descrição:** Sessão do usuário anterior (empresa/investidor/advisor) interfere em novos cadastros.
* **Causa provável:** Cache/token persistente em ambiente de teste.
* **Ação:** Revisar isolamento de sessão por perfil.
* **Tipo:** Bug crítico

---

### B3 — Garantir uso de LinkedIn e Website no prompt da IA ⌛

* **Descrição:** A IA está usando apenas dados genéricos da Receita Federal para descrever empresas.
* **Esperado:**
  Prioridade de fontes:

  1. Website
  2. LinkedIn
  3. Receita Federal
* **Tipo:** Bug funcional / IA

---

### B4 — Corrigir comportamento visual dos steps do onboarding ✅

* **Descrição:** Steps ficam verdes ao completar e depois “somem”.
* **Impacto:** Confusão de UX.
* **Tipo:** Bug UX

---

## ⚠️ Prioridade Média (Qualidade e UX)

### M1 — Adicionar botão “Enviar para revisão” ✅

* **Descrição:** Quando o investidor não cumpre critérios de elegibilidade:

  * Exibir botão “Enviar para revisão”
  * Registrar tentativa
  * Notificar time interno
* **Observação:** Revisão humana no MVP.
* **Tipo:** Feature

---

### M2 — Alerta de compatibilidade e-mail corporativo × domínio ✅

* **Descrição:**
  Exibir alerta quando:

  * E-mail corporativo ≠ domínio do site informado.
* **Importante:**

  * **Não bloquear**
  * Apenas aviso de confirmação
* **Tipo:** Regra de negócio / UX

---

### M3 — Campo “Qualificação” como seleção fechada ✅

* **Aplicável a:** Sócios / Investidor
* **Opções iniciais:**

  * Conselheiro
  * Diretor de Investimentos
  * General Partner
* **Tipo:** Melhoria de formulário

---

### M4 — Corrigir overflow de dropdowns ✅

* **Descrição:** Dropdowns cortam conteúdo.
* **Ação:** Aplicar `overflow` adequado no componente base.
* **Tipo:** Bug visual

---

## 🧠 Prioridade Baixa (Evolução do Produto)

### L1 — Região de atuação em estrutura hierárquica ✅

* **Modelo:**
  Continente → País → Estado
* **Características:**

  * Múltipla seleção
  * Cidade descartada
* **Tipo:** Feature UX avançada

---

### L2 — Faturamento e EBITDA como valores abertos ✅

* **Mudanças:**

  * Remover faixas
  * Padronizar moeda em **USD**
* **Tipo:** Regra de negócio

---

### L3 — Campo “Outro” com input manual ✅

* **Descrição:** Sempre que opção “Outro” for selecionada, abrir campo texto.
* **Tipo:** UX

---

### L4 — Card “Agentes (em breve)” ⚠️ Confirmar se é Agentes de IA mesmo

* **Descrição:**

  * Novo card no onboarding
  * Sem clique funcional
  * CTA para lista de espera (captura de e-mail)
* **Objetivo:** Sinalizar roadmap ao mercado
* **Tipo:** Feature de marketing

---

# 🐞 LISTA DE BUGS CONSOLIDADA

| ID | Bug                                            | Severidade |
| -- | ---------------------------------------------- | ---------- |
| B1 | Loop infinito ao finalizar cadastro da empresa | Crítico    |
| B2 | Sessão/token misturado entre perfis            | Crítico    |
| B3 | IA ignora LinkedIn e Website                   | Alta       |
| B4 | Steps do onboarding somem                      | Média      |
| B5 | Dropdown sem overflow                          | Média      |

---

# 🧾 ATA EXECUTIVA — DECISÕES E ALINHAMENTOS

## Decisões Tomadas

* MVP terá **revisão humana** para casos de elegibilidade.
* Não bloquear usuários por inconsistência de domínio → apenas alertar.
* Cidade fora do escopo da região de atuação.
* IA deve priorizar fontes externas reais (site/LinkedIn).
* Confirmação de e-mail será reativada após fase de testes.

---

## Padrão de Trabalho Definido

* Reuniões curtas + walkthrough ao vivo.
* Ajustes identificados viram backlog imediatamente.
* Entrega validada em conjunto antes de avançar.

---

## Próximos Passos Imediatos

1. Corrigir bugs críticos do onboarding.
2. Ajustar prompt da IA.
3. Estabilizar fluxo Investidor → Empresa → Advisor.
4. Agendar nova validação (sábado à tarde).

---