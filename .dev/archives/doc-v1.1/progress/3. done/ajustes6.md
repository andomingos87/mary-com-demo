# Ajustes Cliente - Sprint de Correções

> Documento de contexto para implementação dos ajustes solicitados pelo cliente.

---

## 1. Card "Agents" - Corrigir copy ✅ (EM BREVE)

**Prioridade:** Baixa
**Complexidade:** Simples (copy only)

**Problema:** O card "EM BREVE" na landing page descreve os agentes como "Agentes de IA autônomos para acelerar seus deals". Na realidade, são profissionais de mercado (afiliados) que indicam negócios para a Mary e recebem comissão. Existe um protótipo Lovable com uma LP dedicada para eles.

**Arquivos envolvidos:**
- `src/components/landing/AgentsWaitlistCard.tsx` — Componente do card com copy incorreta (título "Agents", descrição "Agentes de IA autônomos")
- `src/app/page.tsx` (linhas ~181-194) — Seção "O futuro do M&A" que exibe o card

**Implementação:**
- Alterar título de "Agents" para algo genérico como "Parceiros" ou "Rede de Profissionais"
- Alterar descrição para copy genérica sobre rede de profissionais de mercado
- Trocar ícone `Bot` por algo mais adequado (ex: `Users`, `Handshake`)
- Manter a mecânica de waitlist/email intacta
- A seção na landing page ("O futuro do M&A") também pode ser ajustada

**Status:** Concluída

---

## 3. Logo quebrado nas páginas de Termos e Privacidade ✅

**Prioridade:** Alta
**Complexidade:** Trivial

**Problema:** As páginas de Termos de Uso e Política de Privacidade referenciam `/Mary-preto.png` que **não existe** no diretório `public/`. O logo correto é `/logotipo.png`.

**Arquivos envolvidos:**
- `src/app/terms/page.tsx` (linhas 19-25) — `<Image src="/Mary-preto.png" ...>`
- `src/app/privacy/page.tsx` (linhas 19-25) — `<Image src="/Mary-preto.png" ...>`

**Implementação:**
- Substituir `src="/Mary-preto.png"` por `src="/logotipo.png"` em ambos os arquivos
- O arquivo `public/logotipo.png` já existe e é o logo correto (MARY em bordô)
- Conferir outras páginas que usam logo: `src/app/page.tsx` e `src/app/login/page.tsx` já usam o correto

**Status:** Concluída

---

## 4. Refazer agente de descrição da empresa ✅

> **Nota:** Este item envolve redesign do fluxo de enriquecimento de dados. Escopo maior, será tratado separadamente.
> - Remover bloco de descrição da empresa e botão "Gerar com IA" no passo atual
> - Adicionar novas fontes (links, YouTube, redes sociais, PDF, texto)
> - Remover botão "Buscar" ao lado do input do site

**Status:** Planejamento futuro

---

## 5. Dividir as Américas (Sul, Central e Norte) ✅

**Prioridade:** Média
**Complexidade:** Média (migração de dados)

**Problema:** Na seção de onboarding (Profile Details, passo 4), o seletor de geografia tem "Américas" como um único continente. O cliente quer dividir em América do Sul, Central e Norte.

**Arquivos envolvidos:**
- `supabase/migrations/20260131134410_seed_geographies_data.sql` — Seed com `AMERICAS` como continente único e todos os países como filhos diretos
- `src/components/onboarding/GeographySelector.tsx` — Componente de seleção cascata (Continente → País → Estado). Constrói a árvore dinamicamente do banco, portanto se adapta automaticamente.
- `src/components/onboarding/ProfileDetailsForm.tsx` (linhas ~395-397) — Usa o `GeographySelector`
- `src/lib/actions/geographies.ts` — `getGeographyHierarchy()` retorna a árvore

**Estrutura atual:**
```
AMERICAS (continente único)
├── BR, US, MX, AR, CL, CO, PE, UY, PY, EC, BO, VE, PA, CR, DO, GT, CA
```

**Estrutura desejada:**
```
SOUTH_AMERICA (América do Sul)
├── BR, AR, CL, CO, PE, UY, PY, EC, BO, VE

CENTRAL_AMERICA (América Central e Caribe)
├── PA, CR, DO, GT, MX

NORTH_AMERICA (América do Norte)
├── US, CA
```

**Implementação:**
- Criar nova migration SQL para:
  1. Inserir 3 novos registros de continente (`SOUTH_AMERICA`, `CENTRAL_AMERICA`, `NORTH_AMERICA`)
  2. Atualizar `parent_code` dos países para o continente correto
  3. Remover o registro `AMERICAS`
- O `GeographySelector` se adapta automaticamente (lê do banco)
- Validar que organizações existentes com `AMERICAS` selecionado são tratadas

**Status:** ✅ Implementado (migration `20260207130000_split_americas_geographies.sql`)

---

## 6. Idioma padrão e seletor de idioma ⚠️

> **Nota:** Escopo maior — internacionalização (i18n). Será tratado separadamente.
> - Detectar idioma do navegador
> - Ter seletor de idioma disponível

**Status:** Planejamento futuro

---

## 7. Navegação com dados persistentes no onboarding ✅

**Prioridade:** Alta
**Complexidade:** Média

**Problema:** Quando o usuário navega para trás no onboarding, os formulários aparecem em branco. Os dados não são restaurados corretamente ao retornar a passos anteriores.

**Arquivos envolvidos:**
- `src/components/onboarding/OnboardingWizard.tsx` — Gerencia estado via `useReducer` (WizardState). Passa `initialData` e `enrichedData` para os subcomponentes.
- `src/components/onboarding/hooks/useAutoSave.ts` — Auto-save em localStorage com debounce. Salva `formData` genérico.
- `src/components/onboarding/hooks/useOnboarding.ts` — Combina auto-save com estado do reducer. Restaura draft no mount.
- `src/app/onboarding/[step]/page.tsx` — Server component que reconstrói estado do banco (`reconstructEnrichedData`). Só reconstrói `enrichedData` (CNPJ, website, descrição), **não** reconstrói `formData` do Profile Details.
- `src/components/onboarding/DataConfirmation.tsx` — Step 3, inicializa estado local a partir de `cnpjData`
- `src/components/onboarding/ProfileDetailsForm.tsx` — Step 4, recebe `initialData` mas pode não estar populado ao voltar

**Causa raiz:**
- A navegação entre steps usa URL routing (`/onboarding/[step]`), o que causa re-mount do componente
- O server component reconstrói `enrichedData` do banco mas `formData` do Profile Details pode não estar sendo restaurado corretamente
- O auto-save em localStorage existe mas a restauração pode não estar funcionando ao re-montar via navegação de URL

**Implementação:**
- Garantir que `formData` do Profile Details seja persistido no banco (campo `onboarding_data` da tabela `organizations`)
- No `page.tsx`, reconstruir `formData` a partir de `onboarding_data` além do `enrichedData`
- Passar `initialData` corretamente para `ProfileDetailsForm` ao navegar de volta
- Verificar que `DataConfirmation` também preserva edições (shareholders editados)

**Status:** Concluído

---

## 8. Dar mais destaque ao botão "Enviar para Revisão" ✅

**Prioridade:** Média
**Complexidade:** Simples

**Problema:** No final do onboarding, quando o usuário não cumpre os requisitos de elegibilidade, o botão "Enviar para Revisão" usa `variant="secondary"` (estilo discreto). Deveria ter mais destaque visual.

**Arquivos envolvidos:**
- `src/components/onboarding/EligibilityForm.tsx` (linhas ~457-480) — Botão com `variant={result.eligible ? 'default' : 'secondary'}`

**Implementação:**
- Alterar `variant` de `'secondary'` para `'default'` ou criar estilo customizado com destaque (cor primária, tamanho maior, ícone diferente)
- Considerar adicionar texto explicativo acima do botão para orientar o usuário
- Manter feedback visual de loading (`isSubmittingReview`)

**Status:** COncluído

---

## 8.1. Navegação falsa após "Enviar para Revisão" ✅

**Prioridade:** Alta
**Complexidade:** Média

**Problema:** Após clicar em "Enviar para Revisão", aparece "Step não encontrado" brevemente antes de redirecionar. O fluxo pós-review tenta navegar para um step `pending_review` que não existe no switch/case do wizard.

**Arquivos envolvidos:**
- `src/components/onboarding/EligibilityForm.tsx` (linhas ~184-213) — Handler `handleSubmitReview` que define `nextStep: 'pending_review'`
- `src/components/onboarding/OnboardingWizard.tsx` (linhas ~420-425) — Default case retorna "Step não encontrado" para steps não mapeados

**Causa raiz:**
- `handleSubmitReview` define `nextStep: 'pending_review'` no resultado
- O wizard tenta navegar para esse step que não tem case no `renderStepContent`
- Cai no `default` → mostra "Step não encontrado" → eventualmente redireciona

**Implementação:**
- Adicionar case `'pending_review'` no `renderStepContent` do wizard com tela de confirmação adequada (ex: "Sua solicitação foi enviada! Entraremos em contato.")
- OU redirecionar diretamente para uma página de confirmação após o submit com sucesso
- Garantir que não haja flash de "Step não encontrado"

**Status:** Concluido

---

## 9. Participação societária obrigatória no passo 2 ✅

**Prioridade:** Alta
**Complexidade:** Simples

**Problema:** No passo de confirmação de dados (Data Confirmation), quando os sócios são carregados via API do CNPJ (BrasilAPI/QSA), o campo `percentualParticipacao` vem vazio/undefined da API. O preenchimento deve ser obrigatório para os sócios ativos (vindos da API).

**Arquivos envolvidos:**
- `src/components/onboarding/ShareholderEditor.tsx` — Campo `percentualParticipacao` é opcional no tipo `Shareholder` (linha ~46: `percentualParticipacao?: number`). Input de percentual nas linhas ~271-290. Validação atual só verifica se > 100%.
- `src/components/onboarding/DataConfirmation.tsx` (linhas ~188-197) — Inicializa shareholders a partir dos dados do CNPJ. Linhas ~395-401: usa `ShareholderEditor`.
- `src/lib/enrichment/brasil-api.ts` (linhas ~188-195) — Normaliza dados do QSA, `percentualParticipacao` vem de `percentual_capital_social` que frequentemente é `null`.

**Implementação:**
- Tornar `percentualParticipacao` obrigatório na validação do `ShareholderEditor` para sócios ativos (os que vêm da API)
- Adicionar validação no `handleConfirm` do `DataConfirmation` que impede avançar se algum sócio ativo não tiver percentual preenchido
- Mostrar erro visual no campo quando vazio
- A soma dos percentuais já é calculada (linha ~404-409) — manter warning de > 100%

**Status:** Concluído

---

## 10. Card de projeto - Clique no card inteiro ✅

**Prioridade:** Média
**Complexidade:** Simples

**Problema:** No `ProjectCard`, apenas o texto do nome do projeto (codename) é clicável via `<Link>`. O usuário espera clicar em qualquer lugar do card para navegar.

**Arquivos envolvidos:**
- `src/components/projects/ProjectCard.tsx` (linhas ~89-96) — `<Link>` envolve apenas o `<CardTitle>`, não o card inteiro

**Implementação:**
- Envolver o `<Card>` inteiro com `<Link>` (ou usar `onClick` com `router.push`)
- Manter os botões/ações internas do card com `e.stopPropagation()` para não conflitar
- Usar `cursor-pointer` no card e hover state adequado

**Status:** COncluido 

---

## 11. Sidebar - Ordem VDR vs Projetos ✅

**Prioridade:** Média
**Complexidade:** Trivial

**Problema:** O cliente reportou que na sidebar o VDR aparece antes de Projetos.

**Arquivos envolvidos:**
- `src/types/navigation.ts` (linhas ~202-209) — `ASSET_MENU` define a ordem: Dashboard → Projects → AssetVDR

**Nota:** No código atual, Projetos **já vem antes** do VDR na definição do `ASSET_MENU`. Verificar se:
- O problema era em outro perfil (investor/advisor)
- Houve cache ou build desatualizado
- O problema já foi corrigido

**Implementação:**
- Confirmar a ordem em todos os perfis (`INVESTOR_MENU`, `ADVISOR_MENU`, `ASSET_MENU`)
- Se necessário, reordenar os itens no array correspondente

**Status:** ✅ Verificado — Código já está correto. `ASSET_MENU` define Projects (index 1) antes de VDR (index 2). Nenhuma alteração necessária.

---

## Itens de planejamento futuro (não implementar agora)

| # | Item | Observação |
|---|------|------------|
| 12 | Testar atribuição de projeto a Advisor | Teste manual necessário |
| 13 | Advisor iniciar cadastro e convidar sócios | Feature nova, requer planejamento |
| 14 | Campo de atribuição de Advisor com preview/convite | UX de busca + convite |
| 15 | Checkbox "Tenho advisor" no onboarding | Fluxo condicional com input de email |

## VDR (escopo separado)
- Ver protótipo Lovable
- Histórico de comentários itemizado por linha
- Filtros e ordenação por seção nas colunas
- Grupo padrão: ID_Solicitação com pastas/subpastas
- Grupos e itens personalizados/adicionais
- Gestão de notificações para pessoas autorizadas

## Módulo de IA (escopo separado)
- Avaliar banco separado para RAG
- Preparação para data lake (monetização de dados)
