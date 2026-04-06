# Ajustes Onboarding - Empresas (Projeto Mary)

## Informações do Email
- **De:** Leonardo Pansardi Grisotto (leopagri@gmail.com)
- **Para:** andomingos87@gmail.com, app.mvp.plus@gmail.com
- **Data:** 12 de janeiro de 2026 às 10:55

---

## Resumo dos Ajustes Solicitados

### 1. Correção de Fluxo de Cadastro ✅
- **Problema:** Ao acessar https://project-mary.vercel.app/ e clicar em "Cadastrar como Empresa", o sistema redireciona para a área do **Investidor** em vez de Empresa
- **Comportamento esperado:** Isso **NÃO PODE** acontecer
- **Workaround atual:** Sair do perfil e criar outra conta de Empresa
- **Email de teste:** leopagri+asset@gmail.com

### 2. Configuração do Tipo de Empresa ✅
- **Caminho:** Empresa → Startups, Scale-ups → Usar: Empresas - Qualquer porte, segmento ou região
- **Ação:** Seguir ajustes institucionais conforme especificado

### 3. Quadro Societário (Passo 2 - Confirmar) ✅
Necessário adicionar novas colunas no card:

| Campo | Descrição |
|-------|-----------|
| **Nome do Sócio** | Já existente |
| **Part. Societária (%)** | Nova coluna - % de cotas editável |
| **CPF** | Nova coluna - CPF de cada sócio |

**Exemplo de dados:**

| Quadro Societário | Part. Societária (%) |
|-------------------|---------------------|
| Leonardo Pansardi Grisotto (Sócio-Administrador) | 50% |
| Tatiana Marino Pereira Lima (Sócio-Administrador) | 50% |

**Adicional:** Área de cadastro por sócio para:
- Outros documentos
- Endereço
- Dados de contato
- Redes sociais
- Dados estáticos, etc.

### 4. LinkedIn
- Solicitar o **LinkedIn da empresa** além do Website ✅
- **OBS:** Website é **obrigatório** nos perfis de: Investidor, Empresa e Advisor ✅

### 5. Setor Principal (Passo 3 - Detalhes)
- Puxar os **12 macro setores** da Mary Taxonomy ✅

### 6. Faturamento Bruto Anual ✅
- **Renomear:** "Faixa de Fat Anual" → "Faturamento Bruto Anual"
- **Tipo:** Campo de input para valor aproximado
- **Moeda:** USD

### 7. EBITDA Anual ✅
- **Novo campo:** EBITDA anual
- **Formato:** Mesmo do faturamento (input de valor)
- **Moeda:** USD

### 8. Número de Funcionários ✅
- **Ação:** **Excluir** este campo do onboarding (não é relevante)

### 9. Objetivo Principal ✅
Opções a serem oferecidas:
- Venda Total
- Venda Parcial (Captação)
- Fusão ou Joint Venture
- Outro -> Abrir um input de texto

---