# Bloqueadores do Projeto Mary AI Platform

Data da análise: 03/04/2026
Fontes consultadas: `.dev/production/` (backlog, PRD, validações, matriz de conformidade)

---

## Resumo Executivo

O projeto está em **andamento com bloqueadores operacionais e de produto**. A raiz dos bloqueadores é uma **divergência crítica entre o Excalidraw (especificação aprovada pelo cliente) e a implementação atual**, que exige realinhamento antes de liberar parcelas de pagamento.

**Status geral:** Em pivô — saiu de desenvolvimento linear para uma fase de reconciliação que é pré-requisito para continuar expandindo.

---

## 1. Bloqueador Crítico: Divergência Excalidraw vs Implementação

### Problema

O cliente aprovou um Excalidraw com especificação de UI/UX e fluxos, mas a implementação não segue fielmente esse documento. A análise de conformidade campo a campo identificou:

| Indicador | Quantidade |
|-----------|-----------|
| ✅ Implementado (aderente) | 10 itens |
| ⚠️ Parcial (diverge) | 19 itens |
| ❌ Ausente (não implementado) | 25 itens |
| 🔄 Requer refatoração | 6 itens |

### Impacto

- **Comercial:** Bloqueia liberação de parcelas de R$5.000/entrega (cliente valida contra Excalidraw, não PRD v2.2)
- **Produto:** Usuário vê produto diferente do esperado
- **Técnico:** Requer pivô de roadmap do desenvolvimento linear para fase de realinhamento (E0)
- **Timeline:** Atraso estimado de 2-3 sprints para reconciliar tudo

### Evidências

- `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md` — matriz oficial
- `.dev/production/PRD-v3.0-RECONCILIADO.md` — contrato executável derivado do Excalidraw
- Backlog v3.0 marca E0 como **prioridade máxima (P0, XL)**

---

## 2. Bloqueador de Produto: Onboarding do Ativo

### Problema

**Especificação Excalidraw (4 passos M&A):**
1. Dados da Empresa (CNPJ, razão social, descrição, modelo negócio, sede, ano fundação, nº funcionários, setor)
2. Dados de Matching (objetivo do projeto, ROB, EBITDA%, participação ofertada, valor alvo, estágio)
3. Equipe (sócios com %, advisors, convite de membros)
4. Codinome (nome fictício gerado ou manual)

**Implementação atual:** 5 passos genéricos com campos não-M&A, sem os 17+ campos M&A específicos.

**Impacto:**
- Ativo não consegue inserir dados que o sistema precisa (ROB, EBITDA%, modelo negócio)
- Fluxo de onboarding não gera automaticamente o dossiê que Mary AI deveria compilar pós-onboarding
- Cliente vê divergência visual imediata e rejeita a UI

**Status:** Bloqueado — história H0.1 marcada como de impacto máximo (L, Alto risco) e pré-requisito para outras histórias.

---

## 3. Bloqueador de Produto: Pipeline com 5 Fases vs 12 Fases M&A

### Problema

**Especificação Excalidraw (12 fases + saídas laterais):**
1. Teaser Enviado
2. NDA
3. Screening
4. CIM/DFs Entregues
5. IoI (Indication of Interest)
6. Management Meetings
7. DD (Due Diligence) / SPA
8. NBO (Non-Binding Offer)
9. Signing
10. CPs (Condições Precedentes)
11. Closing
12. Disclosure
+ Especiais: Fechado, Perdido

**Implementação atual:** 5 fases simplificadas (`teaser/nda/nbo/spa/closed_lost`) — falta estrutura completa de M&A.

**Impacto:**
- Investidor/Ativo não consegue rastrear pipeline real de transação (modelo de negócio é mais complexo)
- Impossível condicionar eventos/gates a fases intermediárias (ex.: DD condiciona à NDA aprovada)
- Cliente marca como "não funciona para transações reais"

**Status:** Bloqueado — história H0.3 (M, Médio risco, depende de migração de dados).

---

## 4. Bloqueador de UX: Auto-save + Tooltips não Universalizados

### Problema

**Especificação Excalidraw (regra global):**
- Todo campo salva automaticamente ao ser preenchido
- Todo campo tem tooltip com texto de ajuda retirado do Excalidraw
- Feedback visual de sucesso de salvamento (check ✓ ou texto verde)

**Implementação atual:**
- Auto-save implementado parcialmente em alguns formulários
- Botões "Salvar" explícitos em várias telas (ex.: projeto)
- Tooltips com cobertura baixa

**Impacto:**
- Experiência inconsistente entre telas
- Usuário não sabe se preenchimento foi salvo ou não
- Campos sem tooltips causam retrabalho (usuário não entende o que preencher)

**Status:** Bloqueado — história H0.6 (M, Baixo risco) identificada como "padrão de formulários".

---

## 5. Bloqueador de Tese de Investimento: Campos Faltantes

### Problema

**Especificação Excalidraw (O3_INVESTIDOR.md):**
- ROB min/max (separado de cheque/ticket)
- EBITDA% mínimo
- Público-alvo da empresa-alvo (B2B, B2C, B2B2C)
- Tipo de operação (Compra majoritária, Minoritária, Buyout)
- Critérios de exclusão

**Implementação atual:** ROB confundido com ticket/cheque. Campos de critérios de exclusão e tipo de operação ausentes.

**Impacto:**
- Investidor não consegue definir tese com precisão
- Matching de investidor/ativo impreciso (sistema não sabe o que o investidor realmente quer)
- Radar mostra oportunidades que não combinam

**Status:** Bloqueado — história H0.2 (M, Médio risco).

---

## 6. Bloqueador de Navegação: Menu e Menus Laterais por Perfil Divergem

### Problema

**Especificação Excalidraw (01_GLOBAL_RULES.md):**

Investidor: `Radar → Teses → Feed → Projetos`
Ativo: `MRS → Radar → Feed → [Codinome do Projeto]` (codinome dinâmico)
Advisor: `Radar → Perfil → Feed → Projetos`

**Implementação atual:**
- Ordem diferente em partes
- Menu ativo usa label "Projeto" estático (não dinâmico com codinome)
- OrgSwitcher não permite navegação visível para criar nova org (lacuna UX)

**Impacto:**
- Usuário se perde na navegação
- Codinome do projeto não é visível na navegação (confunde o ativo com qual projeto está operando)
- Investidor com 1 org não consegue escalar para multi-org sem digitar URL

**Status:** Bloqueado — histórias H0.7 (S, Baixo risco) e B0.8 (S, Médio risco).

---

## 7. Bloqueador: Mary AI não é Sidebar Contextual

### Problema

**Especificação Excalidraw (01_GLOBAL_RULES.md):**
- Mary AI deve ser um sidebar que **empurra conteúdo** (não overlay)
- Presente em todas as telas
- Contextual: sabe em qual tela o usuário está
- MVP: assistente apenas (consulta, responde, sugere — não executa)

**Implementação atual:**
- Implementada como drawer/sheet (overlay, não push)
- Acesso global existe mas não é contextual por tela
- Botão presente em header protegido

**Impacto:**
- Usuário não consegue ler conteúdo e chat simultaneamente (overlay tapa tudo)
- Mary AI não oferece sugestões contextuais por página
- Experiência diverge significativamente do Excalidraw

**Status:** Bloqueado — história H0.5 (L, Médio risco, refatoração de layout).

---

## 8. Bloqueador: Breadcrumbs Ausentes

### Problema

**Especificação Excalidraw (01_GLOBAL_RULES.md):**
- Breadcrumb em todas as telas
- Passos anteriores clicáveis
- Página atual visível mas sem link
- Exemplos: `Início > Onboarding > Passo 1`, `Início > Tiger > Investidores`

**Implementação atual:** Ausente — não existe componente breadcrumb em nenhuma rota.

**Impacto:**
- Usuário não sabe em que página está dentro da hierarquia
- Não consegue voltar rapidamente para telas anteriores
- Navegação é não-linear (usuário fica desorientado)

**Status:** Bloqueado — história H0.4 (S, Baixo risco, componente novo).

---

## 9. Bloqueador de Dados: Lacunas Operacionais Críticas Abertas

### Problema (Decisões Pendentes)

Existem decisões de produto que bloqueiam a continuidade do desenvolvimento:

1. **T7.1 — Assinatura eletrônica no MVP?**
   - Status: Decisão formal pendente
   - Impacto: Afeta fluxo de NDA/NBO/SPA (podem precisar assinatura)
   - Urgência: Alta

2. **T7.2 — Limite inicial de upload por arquivo**
   - Status: Baseline pendente (recomendação: definir e ajustar por telemetria)
   - Impacto: Evita falhas de ingestão de IA
   - Urgência: Alta

3. **Calibragem de pesos do MRS após telemetria**
   - Status: Recomendação é manter modelo atual no MVP, revisar depois de uso real
   - Impacto: Score do MRS pode ser impreciso até ter dados reais
   - Urgência: Média

**Status:** Bloqueado — E7 (Hardening) não pode avançar sem T7.1 e T7.2 fechadas.

---

## 10. Bloqueador: Radar do Ativo Operacional Diverge

### Problema

**Especificação Excalidraw (O2_ATIVO.md):**
- Radar Ativo operacional com lista de investidores aderentes à tese do ativo
- Deve mostrar matches alinhados aos critérios de busca

**Implementação atual:** Tela em estado de preparação — não operacional.

**Impacto:**
- Ativo não consegue ver investidores interessados
- Fluxo principal do ativo (apresentar tese para investidores) não funciona

**Status:** Bloqueado — item CE-008 na matriz de conformidade marcado como GAP/S0/P0.

---

## 11. Bloqueador: Advisor tem Cobertura Parcial Crítica

### Problema

**Especificação Excalidraw (O4_ADVISOR.md):**
- Rota de Radar Advisor (`/advisor/radar`) — abas Leads Sell Side + Investidores
- Rota de Feed Advisor (`/advisor/feed`) — operacional
- Perfil de Atuação com múltiplas atuações
- Portfolio de clientes + fluxo "+ Novo Projeto"

**Implementação atual:**
- `/advisor/radar` não implementada
- `/advisor/feed` não implementada
- `/advisor/profile` existe mas sem contrato completo de atuações
- `/advisor/projects` em modo placeholder

**Impacto:**
- Advisor não consegue operar na plataforma
- Terceiro perfil não é viável no MVP (E8 precisa de E0 primeiro)

**Status:** Bloqueado — histórias CE-015, CE-016, CE-017, CE-018 (multiplos GAPs/S0/P0).

---

## 12. Bloqueador: Validações de Cliente (E4) Aprovadas, Mas Revelaram Divergências

### Problema

O E4 (Projetos com Marcos Jurídicos) foi **aprovado tecnicamente** após rerun, mas a rodada 1 de validação cliente revelou:

1. **Blocker A:** Sem cenário de tese para validar ambos os casos (com NDA vs sem NDA)
2. **Blocker B:** Sem projeto de investidor para testar transições de estágio
3. **Blocker C:** Eventos de auditoria E4 faltavam inicialmente
4. **Blocker D:** Erro técnico local no pipeline (`vendor-chunks/@supabase.js`)
5. **Blocker E:** OTP WhatsApp falhou por provider não configurado

**Status atual (E4):** Tratados no rerun ✅, mas E4 ainda depende de E0 para ser plenamente operacional.

### Impacto (E0 é necessário)

E0 é pré-requisito para que E5-E8 avancem. Sem realinhamento visual/funcional:
- E5 (Feed, Alertas) não reflete estrutura reconciliada
- E6 (IA Assistiva) opera em estrutura divergente
- E7 (Hardening) não consegue fechar lacunas de segurança
- E8 (Advisor) não consegue operar

---

## 13. Bloqueador Estrutural: Infraestrutura Sólida, Mas Presa a Gaps de Especificação

### O que está funcionando bem ✅

- Auth + multi-tenant + RLS (sólido)
- MRS (4 passos, score normativo, gates NDA/NBO) — aderente ao Excalidraw
- Tese CRUD com UI guiada (base OK, precisa de H0.2)
- Pipeline base (precisa de H0.3 para ser completo)
- Componentes reutilizáveis existem (GeographySelector, ShareholderEditor, StepIndicator, SectorMultiSelect)

### O que está bloqueado

Especificação → Implementação — **realinhamento é obrigatório antes de expandir escopo**.

---

## Cronograma Crítico (Baseado no Backlog)

| Fase | Sprint | Foco | Resultado esperado |
|------|--------|------|-------------------|
| **0 — Realinhamento** | Sprint imediato | E0 (reconciliação Excalidraw) | Produto visual alinhado + parcelas liberadas |
| **1 — Consolidação MVP** | Sprint +2 | E5 (Feed), decisões T7.1/T7.2 | Recorrência ativa, decisões fechadas |
| **2 — IA e Segurança** | Sprint +3 | E6 (IA), E7 (Hardening) | Governança de IA + segurança |
| **3 — Advisor** | Sprint +4 | E8 (Advisor parcial) | Terceiro perfil habilitado |
| **4 — Pós-MVP** | Sprint +5+ | E9 (evoluções) | Melhorias planejadas |

---

## Recomendação de Ação

### Imediato (Próximo Sprint)

1. **Executar E0 em prioridade máxima (P0)**
   - H0.1 (Refatorar Onboarding Ativo) — impacto visual máximo, libera parcelas
   - H0.7 (Ajustar menus por perfil) — rápido, visível
   - H0.4 (Breadcrumbs) — rápido, visível

2. **Comunicar cliente sobre o realinhamento**
   - Mostrar matriz de conformidade
   - Explicar que E0 é pré-requisito para E5-E8
   - Renegociar timeline se necessário

3. **Iniciar preparação do Sprint +2**
   - H0.2 (Tese investidor)
   - H0.3 (Pipeline 12 fases)
   - H0.6 (Auto-save + tooltips)

### Médio prazo (Sprint +2)

- Fechar decisões T7.1 e T7.2
- Entregar E5 (Feed com eventos)
- Manter monitoramento de MFA em produção

### Longo prazo (Sprint +3+)

- E6 (IA Assistiva)
- E7 (Hardening)
- E8 (Advisor)

---

## Conclusão

O projeto **não está travado**, mas está em **pivô controlado**: passa de desenvolvimento linear para fase de reconciliação que é **pré-requisito obrigatório** para liberação de parcelas e expansão de escopo. E0 é a chave — sem o realinhamento, não há progresso em E5-E8.

**Recomendação:** Confirmar com cliente que Excalidraw é a fonte de verdade, concordar que E0 é obrigatório, e executar realinhamento em ondas curtas (2 sprints máximo) antes de retomar expansão de features.

