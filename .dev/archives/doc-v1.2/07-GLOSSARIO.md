# Glossário — Plataforma Mary

> Documento de referência de termos de negócio usados no ecossistema Mary.

## 1. Conceitos Centrais

### MRS (Market Readiness Score)
Índice de prontidão de uma empresa para M&A, variando de **0 a 100**.  
Organiza cerca de 180 pontos de atenção de uma due diligence em passos progressivos, distribuídos em níveis de criticidade (Básico, Crítico, Importante, Desejável) e em 8 eixos temáticos (Fundamentos, Financeiro, Comercial, Operações, Pessoas, Jurídico, Planejamento, Adicionais).

- **Objetivo:** mostrar se a empresa está pronta para entrar em processo de M&A.
- **Benefício para o Ativo:** clareza sobre o que falta organizar.
- **Benefício para o Investidor:** confiança mínima na maturidade do alvo.

---

### Projeto
Representa uma **empresa/ativo específico** dentro da Mary que está em processo de preparação ou oferta para M&A.

- Um usuário/organização pode ter vários projetos.
- Cada projeto agrupa: MRS, Teaser, VDR, documentação e status no pipeline.
- É a unidade básica de trabalho da plataforma.

---

### Teaser
Resumo executivo **pré-NDA** de um projeto, com a empresa em sigilo (usa um **codinome** em vez do nome real).

- Mostra visão geral, tese de valor, principais números e diferenciais.
- É gerado com apoio de IA, mas sempre com revisão humana.
- É o primeiro contato do investidor com o projeto.
- **Objetivo:** despertar interesse sem expor informações sensíveis.

---

### NDA (Non-Disclosure Agreement)
Acordo de confidencialidade entre o projeto (Ativo) e um investidor específico.

- Um NDA é sempre relacionado a um par: **Projeto × Investidor**.
- No MVP, o fluxo padrão é manual (PDF/URL com auditoria), com integração mínima de assinatura eletrônica em evolução P1 para NDA/NBO.
- Apenas o Advisor ou o dono do Ativo podem marcar como “assinado”.
- **Efeito principal:** libera acesso ao VDR espelhado para aquele investidor.

---

### VDR (Virtual Data Room)
Repositório seguro de documentos do projeto.

- Contém contratos, demonstrações financeiras, documentos societários, relatórios, etc.
- Organizado em categorias para facilitar due diligence.
- Serve como fonte única da verdade documental do projeto.

#### VDR Espelhado
Cópia de leitura do VDR do projeto, acessível para um investidor específico após NDA assinado.

- O investidor não consegue editar, apenas visualizar/baixar o que foi permitido.
- Cada investidor enxerga apenas o seu próprio espelho (isolamento total).
- **Objetivo:** permitir análise profunda com segurança e rastreabilidade.

---

## 2. Conceitos de Matching e Classificação

### Tese de Investimento
Declaração estruturada do que um investidor está buscando.

Inclui:
- Setores de interesse (via taxonomia **MAICS**).
- Faixa de ticket (valor mínimo e máximo em USD).
- Geografia (país, região, eventualmente estado/cidade).
- Características desejadas (porte, estágio, faixa de receita/EBITDA).
- Exclusões (o que ele nunca quer ver).

- O investidor pode ter múltiplas teses ativas ou inativas.
- A partir da tese, o sistema gera um **Radar de Oportunidades** via matching automático.

---

### Matching Score
Nota de afinidade, de **0 a 100**, entre uma **Tese de Investimento** e um **Projeto**.

Ponderação prevista:
- Setor: 30%
- Ticket (faixa de valor): 25%
- Geografia: 15%
- Readiness (MRS): 15%
- Faixas operacionais (ex.: receita, EBITDA, número de funcionários): 15%

Regras importantes:
- **Exclusões:** se algum critério “proibido” na tese for detectado no projeto, o score vai a 0.
- **Pré-requisito:** só há matching se:
  - Tese estiver ativa; e
  - Projeto tiver MRS ≥ 70; e
  - Teaser do projeto estiver publicado.

---

### MAICS (Mary Industry Classification Standard)
Taxonomia proprietária de setores da Mary, com 12 macrosetores.

- Padroniza como empresas são classificadas setorialmente.
- Usada tanto pelo Ativo (projeto) quanto pela Tese do Investidor.
- **Benefício:** reduz ruído no matching, evitando interpretações ambíguas de “setor”.

---

## 3. Conceitos de Processo e Negociação

### Pipeline (Kanban)
Representação visual (em colunas) da jornada de um projeto no processo de M&A.

Etapas macro (podem evoluir):
- Teaser
- NDA
- NBO (Non-Binding Offer) ou IOI (Indication of Interest)
- SPA (Share Purchase Agreement)

Regras chave:
- O investidor controla o avanço do seu Kanban no lado buy-side.
- Ativo e Advisor acompanham o progresso e respondem marcos/documentos solicitados.
- Permite acompanhamento de status, prazos e gargalos.

---

### NBO (Non-Binding Offer)
Oferta não vinculante feita pelo investidor após análise inicial do projeto.

- Formaliza interesse em seguir na negociação, com termos ainda flexíveis.
- Geralmente ocorre após acesso ao VDR e interações iniciais.

---

### IOI (Indication of Interest)
Indicação de interesse, muitas vezes anterior ou alternativa à NBO.

- Demonstração preliminar de que o investidor quer seguir olhando o ativo.
- Menos formal e menos detalhada que uma NBO.

---

### SPA (Share Purchase Agreement)
Contrato de compra e venda de participação societária.

- É o desfecho formal do processo de M&A.
- Momento em que a Mary pode capturar **success fee** do lado do Ativo.

---

## 4. Perfis de Atuação e Organização

### Ativo (Empresa)
Empresa que está buscando investimento, venda total ou parcial, ou outro tipo de transação de capital.

- Foco: organizar-se, elevar o MRS e disponibilizar um projeto atrativo.
- Usa principalmente: MRS, VDR, Teaser, Pipeline do seu projeto.

---

### Investidor
Fundo, holding, corporate, family office ou investidor individual.

- Foco: definir teses, receber oportunidades filtradas e analisar projetos.
- Usa principalmente: Tese de Investimento, Radar de Oportunidades, VDR espelhado.

---

### Advisor
Intermediário (consultor, boutique M&A, banca de investimento).

- Atuação contextual: pode estar do lado do Ativo (sell-side) ou do Investidor (buy-side), mas nunca nos dois lados do mesmo projeto.
- Foco: estruturar dados, organizar documentos, coordenar pipeline e negociações.

---

### Organização
Unidade de conta dentro da Mary (ex.: uma empresa, um fundo, uma boutique de M&A).

- Uma pessoa pode pertencer a múltiplas organizações.
- Cada organização tem seus próprios usuários, projetos, teses e configurações.

---

### Papéis de Acesso (RBAC simplificado)
Níveis de permissão dentro de uma organização Mary:

- **Owner:** dono da organização, gerencia tudo (inclui billing e configurações críticas).
- **Admin:** gerencia usuários, projetos e configurações, com menos poderes que o Owner.
- **Member:** usuário operacional, cria/edita projetos, preenche MRS, interage com o dia a dia.
- **Viewer:** leitor, apenas visualiza informações (ideal para sócios, conselheiros, auditores).

---

## 5. Nomenclatura Canônica (obrigatória)

| Termo canônico | Não usar como principal | Observação |
|---|---|---|
| **MRS** | Market Readiness Score (somente por extenso) | Usar `MRS` em UI e documentação operacional |
| **VDR Espelhado** | DR espelhado, VDR Investidor (como nome principal) | Pode usar como alias explicativo |
| **Tese de Investimento** | Thesis (como termo principal) | `Thesis` pode aparecer em nome de rota/código |
| **N1/N2/N3** | L1/L2/L3 (como principal em fluxo VDR) | Em validação documental usar N1-N3 como padrão |
| **GO CONDICIONAL** | Go parcial, almost go | Usar somente este rótulo no gate atual |