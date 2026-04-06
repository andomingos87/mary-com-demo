# Subspec P1 — Dados da Empresa

**Spec pai:** [INDEX.md](INDEX.md)
**Blocker:** [BLOCKER-data-enrichment.md](BLOCKER-data-enrichment.md)
**Excalidraw ref:** `.dev/excalidraw/02_ATIVO.md` — Passo 1
**Step type:** `asset_company_data`
**Componente:** `AssetCompanyDataStep`

---

## Schema de dados

```typescript
// Passo 1 — Dados da Empresa
responsibleName: string          // auto-fill do auth, editável
companyName: string              // auto-fill do CNPJ, editável
companyDescription: string       // textarea longa
projectObjective: {
  type: 'investment' | 'full_sale'
  subReason: string
}
businessModel: string[]          // ['B2B', 'B2C', 'B2B2C', 'B2G']
sectors: string[]                // MAICS codes (multi-select)
operatingRegions: string[]       // Códigos de país (GeographySelector)
```

### Validações

- **Obrigatórios:** companyDescription, projectObjective.type, projectObjective.subReason, businessModel (min 1), sectors (min 1)
- **Opcionais:** operatingRegions

---

## Sub-opções dinâmicas do "Objetivo do projeto"

### Se "Captação de Investimento"

| Opção | Tooltip |
|-------|---------|
| Expansão e Crescimento | Financiar abertura de novas filiais, expansão geográfica ou aumento de capacidade produtiva |
| Desenvolvimento de Produtos/Inovação | Investir em P&D, lançar novas tecnologias ou inovar no mercado |
| Capital de Giro | Reforçar o caixa para cobrir despesas operacionais, aumentar estoques ou suportar crescimento rápido |
| Marketing e Vendas | Financiar campanhas de branding, aquisição de clientes e expansão da equipe comercial |
| Atração de Talentos | Contratar mão de obra qualificada para posições chave |
| Fortalecimento da Estrutura | Melhorar a governança e a tecnologia interna da empresa |

### Se "Venda Integral"

| Opção | Tooltip |
|-------|---------|
| Retirada de Capital (Cashing Out) | Realizar o lucro após anos de trabalho, convertendo o valor da empresa em liquidez pessoal |
| Mudança de Estilo de Vida ou Burnout | Desejo de se aposentar, passar mais tempo com a família ou reduzir o estresse |
| Falta de Sucessão | Ausência de herdeiros ou gestores preparados para assumir o negócio |
| Novas Oportunidades | Vender para investir em outro setor, iniciar um novo negócio ou buscar novos desafios |
| Disputas de Sócios | Conflitos entre parceiros de negócios que tornam a operação inviável |
| Riscos de Mercado | Antecipar-se a mudanças no setor (disrupção tecnológica) ou dificuldades financeiras |
| Proposta Irrecusável | Receber uma oferta estratégica de um concorrente ou fundo de investimento |

---

## Componentes envolvidos

| Componente | Status | Notas |
|-----------|--------|-------|
| `AssetCompanyDataStep` | Criar | Formulário principal do Passo 1 |
| `ProjectObjectiveSelector` | Criar | Select + sub-opções dinâmicas |
| `BusinessModelSelector` | Criar | Multi-select B2B/B2C/B2B2C/B2G |
| `GeographySelector` | Reusar | `src/components/shared/GeographySelector.tsx` |
| `SectorMultiSelect` | Reusar | `src/components/shared/SectorMultiSelect.tsx` |

---

## Checklist de Validação (17 itens)

> **Pré-condição:** Blocker resolvido. Logar como Ativo, avançar até Passo 1.

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| **Campos presentes** | | | |
| 2.1 | Campo **Nome do responsável** (auto-fill do auth, editável) | ⚠️ Parcial | Campo presente e editável, mas sem auto-fill observado |
| 2.2 | Campo **Nome da empresa** (auto-fill do CNPJ, editável) | ⚠️ Parcial | Campo presente e editável, mas sem auto-fill observado |
| 2.3 | Campo **Descrição da empresa** (textarea, multi-linha) | ✅ Conforme | Presente e editável (textarea multi-linha) |
| 2.4 | Campo **Objetivo do projeto** (select com 2 opções principais) | ✅ Conforme | Presente com opções Captação de Investimento e Venda Integral |
| 2.5 | Campo **Modelo de negócio** (multi-select: B2B, B2C, B2B2C, B2G) | ✅ Conforme | Presente com 4 opções em multi-select |
| 2.6 | Campo **Setor de atuação** (multi-select, não single) | ✅ Conforme | Presente com seleção múltipla de setores |
| 2.7 | Campo **Regiões de atuação** (GeographySelector: continente → país) | ✅ Conforme | Campo/regra de regiões presente no passo |
| **Sub-opções dinâmicas do Objetivo** | | | |
| 2.8 | "Captação de Investimento" → 6 sub-opções aparecem | ✅ Conforme | Lista exibida com 6 opções |
| 2.9 | Sub-opções captação: Expansão, P&D, Capital de Giro, Marketing, Talentos, Estrutura | ✅ Conforme | Todas as 6 opções esperadas encontradas |
| 2.10 | "Venda Integral" → 7 sub-opções aparecem | ✅ Conforme | Lista exibida com 7 opções |
| 2.11 | Sub-opções venda: Cashing Out, Burnout, Sem Sucessão, Novas Oportunidades, Disputas, Riscos, Proposta | ✅ Conforme | Todas as 7 opções esperadas encontradas |
| 2.12 | Trocar tipo principal reseta sub-opção selecionada | ✅ Conforme | Ao voltar para Captação, sub-opção retornou ao default |
| **Comportamento** | | | |
| 2.13 | Dados do CNPJ pré-preenchem campos automaticamente | ✅ Conforme | Implementado fallback de `companyName` via `org.name` e `responsibleName` via `user_metadata.full_name` sem sobrescrever dados já salvos no step |
| 2.14 | Campos auto-preenchidos são editáveis | ⚠️ Parcial | Editabilidade confirmada, mas sem auto-fill para validar cenário completo |
| 2.15 | Validação: descrição, objetivo, modelo (min 1) e setor (min 1) obrigatórios | ✅ Conforme | Próximo só habilita após preencher obrigatórios e marcar modelo/setor |
| 2.16 | Botão avançar desabilitado até campos obrigatórios preenchidos | ✅ Conforme | Estado desabilitado no vazio e habilitado após preenchimento |
| 2.17 | Mary AI contextual após preenchimento do Passo 1 | ✅ Conforme | Bloco contextual no Passo 1 com CTA “Pedir sugestão com Mary AI”, abrindo `MaryAiQuickChatSheet` com prompt pré-montado do formulário |

---

## Resultado da rodada automatizada (04/04/2026)

- **Status geral P1:** **Aprovado**
- **Blocker encontrado:** persistência/auto-save dos dados do Passo 1 não se mantém ao trocar de step (campos voltam vazios)
- **Severidade recomendada:** **ALTA** (impacta continuidade e confiabilidade do onboarding)

## Revalidação automatizada (04/04/2026 - rodada 2)

- **Status do blocker de persistência:** **Resolvido**
- **Validação executada em:** `http://localhost:3003`
- **Evidência funcional:** dados de `asset_company_data` mantidos após:
  - avanço para `asset_matching_data` e retorno para `asset_company_data`;
  - refresh direto em `/onboarding/asset-company-data`.
- **Evidência de banco (Supabase MCP):** `onboarding_data.assetCompanyData` persistido e `onboarding_step` avançando para `asset_matching_data`.

## Revalidação automatizada (04/04/2026 - rodada 4)

- **Ambiente validado:** `http://localhost:3004/onboarding/asset-company-data` (instância dev renovada)
- **Item 2.13 (auto-fill por CNPJ/auth):** **Conforme**
  - campos `Nome responsável` e `Nome da empresa` renderizados preenchidos no Passo 1;
  - persistência confirmada via Supabase MCP em `onboarding_data.assetCompanyData`.
- **Item 2.17 (Mary AI contextual):** **Conforme**
  - bloco "Mary AI contextual" visível no Passo 1;
  - CTA "Pedir sugestão com Mary AI" abre o `MaryAiQuickChatSheet`;
  - input da Mary AI chega com contexto do Passo 1 pré-carregado.
- **Observação operacional:** instâncias antigas (`localhost:3002`/`3003`) apresentaram erro de assets MIME; validação final foi executada na nova instância estável em `localhost:3004`.

## Evidências visuais

- `./evidence/p1-evidencia-tela-base.png`
- `./evidence/p1-evidencia-subopcoes-captacao.png`
- `./evidence/p1-evidencia-subopcoes-venda.png`
- `./evidence/p1-rerun-01-reidratado.png`
- `./evidence/p1-rerun-02-persistencia-apos-voltar.png`
- `./evidence/p1-rerun-03-persistencia-apos-refresh.png`
- `./evidence/p1-rerun-04-step1-com-mary-ai.png`
- `./evidence/p1-rerun-05-mary-ai-contextual.png`
- `./evidence/p1-rerun-06-autofill-campos.png`
- `./evidence/p1-rerun-07-mary-ai-contexto-preenchido.png`

## Atualização técnica da correção (04/04/2026)

- Correção aplicada na reidratação dos dados salvos do fluxo asset para o passo `asset_company_data`.
- Origem dos dados reidratados: `onboarding_data.assetCompanyData`, `assetMatchingData`, `assetTeamData`, `assetCodenameData`.
- Cobertura adicionada em teste unitário para evitar regressão de merge/hidratação dos payloads.

## Atualização técnica complementar (04/04/2026 - rodada 3)

- Item **2.13** concluído com fallback seguro no carregamento do Passo 1:
  - `companyName` usa `org.name` quando `assetCompanyData.companyName` estiver vazio;
  - `responsibleName` usa `user.user_metadata.full_name` quando `assetCompanyData.responsibleName` estiver vazio;
  - precedência mantida: valor salvo no step sempre vence fallback.
- Item **2.17** concluído com Mary AI contextual no Passo 1:
  - novo bloco condicional após preenchimento mínimo (`descrição + objetivo + setor`);
  - CTA abre `MaryAiQuickChatSheet` com mensagem inicial contextual.
- Cobertura de regressão adicionada em testes:
  - fallback de auto-fill em `hydrateAssetStepFormData`;
  - suporte a `initialMessage` no `MaryAiQuickChatSheet`.
