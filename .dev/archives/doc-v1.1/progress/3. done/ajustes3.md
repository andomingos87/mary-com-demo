# Ajustes Onboarding - Investidores (Projeto Mary)

## Informações do Email
- **De:** Leonardo Pansardi Grisotto (leopagri@gmail.com)
- **Para:** andomingos87@gmail.com, app.mvp.plus@gmail.com
- **Data:** 10 de janeiro de 2026 às 16:58

---

## A) Cadastro do Investidor

**URL:** https://project-mary.vercel.app/signup?profile=investor  
**Usuário de teste:** leopagri+investor@gmail.com

### 1. Logo na Tela de Cadastro ✅
- **Ação:** Deixar só o logo "Mary" (remover "Mary Platform")

### 2. Descrição do Tipo de Investidor ✅
- **De:** "Investidor • PE, VC, Family Office"
- **Para:** "Investidores – PEs, VCs, Family Offices, Corporates, Angels, CVCs, Venture Builders, Sovereigns, Pension Funds, Search Funds, Aceleradoras e Incubadoras."

### 3. Termos de Uso e Política de Privacidade ✅
- **Ação:** Criar páginas específicas e públicas
- **Arquivos:** Atualizados em anexo (terms_mary.txt e privacy_policy.txt)

### 4. Página de Sucesso ✅
- **URL:** https://project-mary.vercel.app/signup/success
- **Ação:** Adicionar logo da Mary (página de sucesso está sem identificação)

### 5. Logo Oficial ✅
- **Ação:** Ajustar para o logo oficial em todas as telas

### 6. Tela de CNPJ Input ✅
- **URL:** https://project-mary.vercel.app/onboarding/cnpj-input
- **Problema:** "Termos" ficou deslocado do passo "5"
- **Ação:** Corrigir alinhamento

### 7. Label do Campo CNPJ ✅
- **De:** "Informe o CNPJ da sua empresa"
- **Para:** "Informe seu CNPJ"

### 8. Campo Website ✅
- **Ação:** Excluir do Passo 1, mover para o Passo 2
- **Texto atual:** "Website (opcional)" com placeholder "https://www.suaempresa.com.br"
- **Helper:** "Se informado, buscaremos logo e informações adicionais"

### 9. Indicador de Passo CNPJ ✅
- **Problema:** Ficou deslocado
- **Ação:** Corrigir posicionamento

### 10. Rodapé ✅
- **Ação:** Em todos os rodapés, usar sempre: **"© 2026 Mary Digital Ecosystem."**

### 11. Título do Passo de Confirmação ✅
- **De:** "Confirme os dados da empresa"
- **Para:** "Confirme seus dados"

### 12. Indicador de Validação (Bolinha Verde) ✅
- **Problema:** Bolinha verde ficou esquisita
- **Ação:** Usar um **check verde** como padrão, ao invés da bolinha preenchida

### 13. Card de Website (Passo 2) ✅
- **URL:** https://project-mary.vercel.app/onboarding/data-confirmation
- **Ação:** Reforçar para o investidor colocar o site dele ali
- **Sugestão:** IA pode ajudar a criar um perfil melhor (tooltip de repente)

### 14. Descrição da Empresa ✅
- **Ação:** Enviar o prompt que usarem para eu avaliar e depois podemos melhorar

---

## B) Passo 3 - Detalhes do Perfil

**URL:** https://project-mary.vercel.app/onboarding/profile-details

### 15. Campo "Tipo de Investidor"
Usar a seguinte lista:

| Tipo de Investidor |
|-------------------|
| Accelerator |
| Angel |
| Corporate Venture Capital (CVC) |
| Corporate/Strategic |
| Family Office (FO) |
| Incubator |
| Pension Fund |
| Private Equity (PE) |
| Search Fund |
| Sovereign |
| Venture Builder (VB) |
| Venture Capital (VC) |

### 16. Campos de Ticket (Mínimo e Máximo) ✅
- **Ticket Mínimo (USD):** Ex: 10000000
- **Ticket Máximo (USD):** Ex: 100000000
- **Ação:** Usar **pontuação automática** após digitar números

### 17. Campo "Setores de Interesse" ✅
- **Ação:** Usar **Level 1: Macrosetor (12)** da Mary Taxonomy
- **Idioma:** Pode deixar em inglês
- **Exemplos:**
  - Financial & Professional Services
  - Technology & Digital Infrastructure
  - Energy, Utilities & Sustainability
  - etc.

### 18. Geografia de Atuação ✅
- **Problema:** Ficou estranho
- **Referência:** No protótipo está bem detalhado, verificar lá

---

## C) Passo 4 - Elegibilidade

**URL:** https://project-mary.vercel.app/onboarding/eligibility-check

### 19. Campo "Valor Total Acumulado de Deals" ✅
- **Exemplo:** 500000
- **Placeholder:** "Informe em dólares americanos (USD)"
- **Ação:** Usar **pontuação automática** após digitar números

### 20. Texto de Validação de Experiência ✅
- **De:** "Para garantir a qualidade da plataforma, validamos que você possui experiência em investimentos."
- **Para:** "Para garantirmos a qualidade da plataforma, precisamos validar sua experiência em investimentos."

### 21. Bug na Tela de Elegibilidade ✅
- **Problema:** Se eu inputar dados errados e quiser corrigir, não dá. Se voltar, zera tudo. Se dados não atendem, sistema deixou avançar (não deveria!)

---

## D) Passo 5 - Termos de Serviço

**URL:** https://project-mary.vercel.app/onboarding/terms-acceptance

### 22. Link dos Termos de Serviço ✅
- **Problema:** Cliquei no link e o sistema me levou para tela de dashboard direto, ANTES de "Finalizar Cadastro"
- **Ação:** Links devem levar aos Termos e Privacidade corretamente

### 23. Visual dos Passos Concluídos ✅
- **Problema:** Passos concluídos estão ficando verdinhos, dando visão de feitos
- **Observação:** CNPJ e Termos desalinhados dos passos
- **Sugestão:** Seria legal os passos ficarem em formato legal (visual consistente)

**Fluxo de Passos:**
| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| CNPJ | Confirmar | Detalhes | Elegibilidade | Termos |

---

## Observações Gerais

> "Fora os campos e textos específicos de Investidores, alguns dos ajustes acima, acredito que podem se aplicar para os demais perfis. Vejam o que podem usar. Em breve mando aos ajustes dos demais."

---

## Anexos

| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| terms_mary.txt | 48K | Termos de Uso atualizados |
| privacy_policy.txt | 41K | Política de Privacidade atualizada |

---