# Próxima Etapa do Mary AI Platform

**Data de Referência:** 2026-04-03
**Fonte de Verdade:** `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md` (v3.0)

---

## Status Atual

O projeto está em **fase de realinhamento crítico** (Épico E0) após ciclo de pivot MVP e validação com cliente.

**Última mudança consolidada:** 2026-04-01 (Context Engineering Frontend + Cleanup Repository)

### Diagnóstico de Reconciliação

| Indicador | Quantidade |
|-----------|-----------|
| ✅ IMPLEMENTADO (aderente ao Excalidraw) | 10 |
| ⚠️ PARCIAL (existe mas diverge) | 19 |
| ❌ AUSENTE (não implementado) | 25 |
| 🔄 REQUER REFATORAÇÃO | 6 |

---

## Próxima Etapa: Épico E0 — Realinhamento Excalidraw

**Prioridade:** P0 (Crítico)
**Estimativa:** XL
**Risco:** Alto
**Status:** Em andamento (desde 02/04/2026)

### Objetivo

Refatorar implementação para aderir ao **Excalidraw** como fonte de verdade aprovada pelo cliente. Recuperar confiança entregando exatamente o que foi especificado.

### Valor de Negócio

- Recuperar confiança do cliente após divergências identificadas
- Liberar **R$ 5.000 por entrega** de parcelas

### Histórias P0 (Ordem de Execução)

#### 1. **H0.1 — Refatorar Onboarding do Ativo** (L / CRÍTICA)
   - **Problema:** 5 passos genéricos vs 4 passos M&A do Excalidraw (17+ campos ausentes)
   - **Solução:** Implementar 4 passos conforme `02_ATIVO.md`:
     - Passo 1: Dados da Empresa (CNPJ, razão social, setor, etc.)
     - Passo 2: Dados de Matching (objetivo, ROB, EBITDA%, participação, valor alvo)
     - Passo 3: Equipe (sócios, advisors, convites)
     - Passo 4: Codinome (automático via Mary AI ou manual)
   - **Impacto Visual:** Máximo (visível ao cliente imediatamente)
   - **Dependências:** Nenhuma

#### 2. **H0.2 — Complementar Campos da Tese de Investimento** (M)
   - **Problema:** Campos faltantes e confusão ROB/Cheque/Ticket
   - **Solução:** Adicionar:
     - ROB min/max (separado de cheque)
     - EBITDA% mínimo
     - Público-alvo (B2B, B2C, etc.)
     - Tipo de operação (Compra majoritária, Minoritária, etc.)
     - Critérios de exclusão
   - **Dependências:** Nenhuma

#### 3. **H0.3 — Expandir Pipeline de 5 para 12 Fases** (M)
   - **Problema:** Apenas 5 marcos (teaser/nda/nbo/spa/closed_lost) vs 12 fases do Excalidraw
   - **Solução:** Implementar 12 fases:
     - Teaser Enviado → NDA → Screening → CIM/DFs → IoI → Management Meetings → DD/SPA → NBO → Signing → CPs → Closing → Disclosure
     - Plus: Fechado, Perdido
   - **Kanban:** 12 colunas + estado de saída lateral
   - **Dependências:** Nenhuma

#### 4. **H0.4 — Implementar Breadcrumbs Globais** (S)
   - **Regra:** Sempre indicar caminho completo no topo (ex: `Início > Tiger > Investidores`)
   - **Novo componente:** `src/components/shared/Breadcrumb.tsx`
   - **Dependências:** Nenhuma

#### 5. **H0.5 — Transformar Mary AI de Página para Sidebar** (L)
   - **Problema:** Mary AI é página separada vs sidebar contextual no Excalidraw (benchmark: Evernote)
   - **Solução:**
     - Sidebar que empurra conteúdo (não overlay)
     - Contextual por tela (sabe em qual screen o usuário está)
     - Saudação: "Prazer, sou a Mary AI. Estarei sempre aqui!"
     - Prompt contextual com CTAs por perfil
     - MVP: assistente apenas (não executa ações)
   - **Dependências:** Nenhuma

#### 6. **H0.6 — Padronizar Auto-save e Tooltips** (M)
   - **Ação:**
     - Extrair hook `useAutoSave` para reutilização (trocar localStorage por Supabase)
     - Adicionar feedback visual (check ✓ ou texto verde)
     - Implementar tooltip em cada campo com texto do Excalidraw
   - **Dependências:** Nenhuma

#### 7. **H0.7 — Ajustar Menus Laterais por Perfil** (S)
   - **Problema:** Ordem diferente do Excalidraw; menu ativo usa "Projeto" estático
   - **Solução:**
     - **Investidor:** Radar → Teses → Feed → Projetos
     - **Ativo:** MRS → Radar → Feed → [Codinome do projeto] (dinâmico)
     - **Advisor:** Radar → Perfil → Feed → Projetos
   - **Dependências:** H0.1 (codinome precisa estar implementado)

#### 8. **B0.8 — Tornar Multi-organização Acessível** (S)
   - **Problema:** Com 1 organização, usuário não vê caminho para criar nova
   - **Solução:** Exibir CTA "Nova organização" mesmo com 1 org; permitir troca quando houver 2+
   - **Dependências:** H0.7 (para refletir mudança de org ativa no menu dinâmico)

---

## Sequência de Execução Recomendada

**Fase 1 — Infraestrutura Base (Sem cliente visível ainda)**
1. H0.2 — Completar Tese (campos desconectados, sem UI impactante)
2. H0.3 — Pipeline 12 fases (migração de dados, pouco UI quebrada)

**Fase 2 — Impacto Máximo para Cliente**
3. H0.1 — Onboarding 4 passos (ALTO IMPACTO — cliente vê imediatamente)
4. H0.6 — Auto-save + Tooltips (polimento, funciona com H0.1)

**Fase 3 — Navegação + Contexto**
5. H0.4 — Breadcrumbs
6. H0.5 — Mary AI Sidebar
7. H0.7 — Menus por Perfil (requer H0.1 para codinome dinâmico)
8. B0.8 — Multi-org (requer H0.7)

---

## Lacunas Abertas

Decisões pendentes que NÃO bloqueiam E0:

- **T7.1:** Assinatura eletrônica no MVP (decisão pendente)
- **T7.2:** Limite inicial de upload por arquivo (baseline pendente)
- Calibragem fina de pesos MRS (pós-telemetria)
- Provider de Mary AI sidebar (modelo, contexto por tela)

---

## Estrutura de Especificações

Cada história tem spec individual em `.dev/specs/`:

- `H0.1-ONBOARDING-ATIVO.md`
- `H0.2-TESE-INVESTIDOR.md`
- `H0.3-PIPELINE-12-FASES.md`
- `H0.4-H0.7-ITENS-MENORES.md` (breadcrumbs, Mary AI sidebar, menus, multi-org)

---

## Governança

**Fonte de Verdade (Hierarquia):**
1. **Excalidraw** (`.dev/excalidraw/` — 00_INDEX a 05_SHARED_MODULES)
2. **PRD v3.0** (`.dev/production/PRD-v3.0-RECONCILIADO.md`)
3. **Código atual** (baseline a reconciliar)

**Validação:**
- Cada história tem critério "campo a campo contra Excalidraw"
- Cliente valida entrega como "matches design"

---

## Referências

- **Backlog Oficial:** `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
- **Changelog:** `.dev/production/CHANGELOG.md`
- **Roadmap Técnico:** `.dev/production/15-PLAN-GAP5-IMPLEMENTACAO-TECNICA.md`
- **Validação Cliente:** `.dev/production/client-validation/E1-VALIDACAO-CLIENTE-NAVEGACAO.md`
