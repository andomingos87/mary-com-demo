# Resumo Estruturado - Reunião 26/11

**Participantes:** Cássio (Product Owner / Domínio M&A) e Leonardo (Desenvolvimento)
**Duração:** ~1h31min
**Contexto:** Continuação da reunião anterior sobre Data Room e IA. Foco em enriquecimento de dados, documentos do pipeline e fases do processo M&A.

---

## 1. Investigação Automática via IA (pós-onboarding)

**Conceito:** Quando qualquer perfil (ativo, investidor ou advisor) completa o cadastro/onboarding, a plataforma dispara automaticamente uma tarefa de investigação via IA (deep search) sobre aquele CNPJ/empresa.

**O que a IA busca (exemplo: PDI - Perfil do Investidor):**
- Descrição do negócio, CNPJ, sede, LinkedIn de pessoas-chave
- Lista de principais produtos e competidores
- Benchmarks, quantidade de funcionários, perfil do negócio
- Histórico de investimentos e aquisições (notícias, fatos relevantes)
- Mapa de temperatura do segmento de atuação
- Problemas, riscos e regulações do setor
- Faixa de valores investidos, geografia, tipo de participação (minoritária/majoritária)
- Fontes para cada informação

**Resultado:** Documento estruturado (~16 páginas) gerado em ~20 minutos que normalmente levaria 30+ dias manualmente. Serve para:
- Subsidiar a Mary AI com contexto rico sobre cada perfil
- Alimentar o motor de matching
- Responder perguntas dos usuários sobre contrapartes

**Aplicação:** Mesmo modelo para investidor e ativo, com prompts adaptados ao perfil.

---

## 2. API Cronos - Dossiê de Compliance (pré-diligência)

**O que é:** API de compliance que gera dossiês detalhados a partir de CNPJ, acessando 3.500+ fontes.

**Conteúdo do dossiê (~146 páginas):**
- Risco reputacional, jurídico e de crédito
- Processos judiciais (por tribunal, vara, área, valores)
- Protestos e pendências financeiras
- Pessoas relacionadas, e-mails qualificados
- Perfil demográfico (capital social, faturamento, funcionários)
- Veículos, aeronaves, balanços
- Certidões negativas

**Modelo de negócio proposto:**
- Custo da API Cronos: ~R$ 600-800 por relatório
- Mary cobra: ~R$ 1.500-2.000 (com markup)
- Fluxo: usuário contrata > Mary cobra > gera via API > entrega no Data Room
- **V1:** IA + investigação gratuita (incluída na assinatura)
- **V2:** Integração com Cronos como produto adicional pago

**Integração com Mary:**
- Resultados vão para o Data Room (seção jurídica)
- Pode gerar um "Mary Compliance Score" ponderando os dados
- Cruza informações do Data Room com dados do Cronos para análise comparativa

---

## 3. Geração de Documentos via IA

### 3.1 Teaser
- Já discutido na reunião anterior

### 3.2 Information Memorandum (Infomemo)
- Documento mais aprofundado que o Teaser (24-60 páginas)
- Conteúdo: disclaimer, dados de mercado, players relevantes, detalhes da empresa, produtos/serviços, estrutura organizacional, carteira de clientes, faturamento, estrutura física (com Google Maps), fotos, dados financeiros/balanço, estrutura societária
- **Geração:** IA monta automaticamente usando dados do Data Room + investigação prévia + prompt estruturado
- **Curadoria obrigatória:** sócios/executivos revisam > advisor valida > só então publica

### 3.3 Formato de Compartilhamento
- **Não gerar PDF para download** — usar links rastreáveis (como DocSend)
- Benefícios do tracking: saber quando acessou, quais páginas leu, tempo gasto
- Inteligência de processo: "o investidor nem abriu o material" vs "já leu tudo"
- Exceção: modelo financeiro pode ser baixável (investidor precisa fazer contas)

---

## 4. Pipeline M&A - Fases Detalhadas

Fluxo completo do pipeline com regras de negócio para cada fase:

| # | Fase | Descrição | Regras |
|---|------|-----------|--------|
| 1 | **Teaser** | Documento inicial sobre a empresa | Compartilhamento rastreável |
| 2 | **NDA** | Non-Disclosure Agreement | Assinatura obrigatória para prosseguir |
| 3 | **Pré-DD** | Pré-diligência + reuniões de gestão (unificados) | Acesso ao Infomemo, Data Room, relatório Cronos (se pago). Prazo definido na criação do projeto |
| 4 | **Proposta (IOI)** | Indicação de interesse / oferta indicativa | **Formulário obrigatório** ao arrastar card (modal com campos: valor, %, prazo, termos). Separa "quem é sério" |
| 5 | **Análise** | Curadoria pelo ativo + advisor | Etapa humana. Seleção do investidor. Pode pedir análise comparativa à Mary AI |
| 6 | **NBO / Term Sheet** | Contrato pré-diligência (investidor envia) | Upload de documento (não formulário — varia muito por investidor). Prazo: ~30 dias, 3 idas e vindas máximo |
| 7 | **DD + SPA** | Diligência + contrato de compra e venda (paralelos) | DD: ~90 dias, checklist ~180 itens, equipe jurídica/contábil/tributária. SPA: roda em paralelo |
| 8 | **Signing** | Assinatura formal | Etapa curta mas necessária (dezenas de anexos, múltiplos sócios) |
| 9 | **CPs** | Condições precedentes | Regularizações obrigatórias pré-fechamento (ex: regime CLT, saída de aval). Prazo configurável |
| 10 | **Closing** | Fechamento efetivo | Transferência CNPJ na Junta, pagamento. Upload de documentação + check final |
| 11 | **Disclosure** | Divulgação da transação | Geração de "Tombstone" (card visual). Publicação no site Mary. Ranking do Advisor. Envio para veículos de mídia |

---

## 5. Regras Transversais do Pipeline

### Prazos
- Definidos na criação do projeto (campos: prazo NDA, prazo NBO, prazo proposta)
- Configuráveis via admin
- Gatilhos automáticos de notificação (2 semanas, 1 semana, 3 dias)
- Investidor que não cumpre prazo perde preferência; reativam-se os demais

### Controle de Avanço
- Card não pode ser arrastado sem cumprir requisitos da fase (formulário, upload, check)
- Ao arrastar: abre modal obrigatório com ações da fase
- Duplo check em fases críticas (sócio + advisor)
- Permissão de mover card: apenas advisor ou dono da empresa (não o investidor)

### Data Room como Eixo Central
- Pastas adicionais criadas conforme fases avançam (DD, Sign, CPs, Closing)
- Checklist de diligência sobe como documentos adicionais
- Links compartilháveis rastreáveis para documentos

---

## 6. Decisões e Simplificações Acordadas

| Decisão | Detalhe |
|---------|---------|
| Unificar IOI + NBO em "Proposta" | Formulário padronizado para fase inicial; NBO como documento separado depois |
| Unificar Pré-DD + Management Meetings | Tudo faz parte do aprofundamento pré-proposta |
| DD e SPA em paralelo | Não são fases sequenciais, rodam juntas |
| Investigação IA = gratuita (V1) | Incluída na assinatura |
| Relatório Cronos = pago (V2) | Produto adicional com markup |
| Documentos via link rastreável | Não PDF para download (exceto modelo financeiro) |

---

## 7. Próximos Passos

- [ ] Leonardo detalhar as fases do pipeline com prazos específicos para cada etapa
- [ ] Cássio criar pasta compartilhada com modelos de documentos (Teaser, Infomemo, NBO, etc.)
- [ ] Configurar prazos padrão no admin da plataforma
- [ ] Definir campos do formulário de proposta (IOI)
- [ ] Próxima reunião: dia seguinte às 10h (com Anderson)

---

## Referências / Benchmarks Mencionados

- **DocSend** — tracking de documentos compartilhados
- **Cronos** — API de compliance/dossiê
- **Clux (Zaxo)** — base de dados de empresas privadas (balanços via API)
- **Smartplan** (Áustria) — plataforma de valuation (~$400/mês)
- **CVM / Status Invest** — dados de empresas públicas
- **Intelbras** — exemplo de empresa usada para demonstração do PDI
