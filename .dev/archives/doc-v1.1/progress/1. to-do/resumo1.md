# Resumo Estruturado — Transcrição 25/11

## Participantes
- **Leonardo** — Cliente / Especialista em M&A (domínio de negócio)
- **Anderson** — Desenvolvedor
- **Cássio** — Desenvolvedor / Co-fundador

## Contexto
Reunião de alinhamento sobre o módulo de **Data Room (VDR)**, fluxo de **Q&A entre investidor e empresa**, integração com **IA (RAG)** e o **pipeline de M&A**. Leonardo explica os processos reais de M&A para guiar o desenvolvimento da plataforma.

---

## 1. Data Room — Estrutura de Documentação Padrão

**Conceito:** A empresa (asset) que quer vender ou captar recursos precisa organizar toda sua documentação para apresentar ao mercado.

- Ao se cadastrar na plataforma, a empresa já recebe uma **árvore padrão de solicitações de documentos** (Estratégia, Comercial, Financeiro, Operacional, RH, etc.)
- Essa árvore é a base para o cálculo do **Mary Readiness Score** (0 a 100)
- O score **não impede** a empresa de aparecer — indica o **grau de preparação** para ir a mercado
- Suporta **subpastas** (tipo Google Drive): pasta > subpasta > arquivos

**Níveis de checagem (validação):**

| Nível | Quem valida | Descrição |
|-------|------------|-----------|
| N1 | Dono da empresa (asset) | Upload inicial do documento |
| N2 | Advisor (ex: Anderson) | Validação do assessor |
| N3 | Auditoria externa | Empresa de auditoria valida |

- Cada perfil **só pode dar check no seu nível** — não pode cruzar com outro nível
- N1, N2, N3 devem estar atrelados a **perfis de acesso e alçada**

---

## 2. Documentos Adicionais e Q&A (Perguntas e Respostas)

**Problema real:** Investidores sempre pedem informações extras, fora do padrão. Hoje isso acontece via e-mail, WhatsApp, planilhas — informação fica espalhada.

**Fluxo proposto:**

1. **Investidor** entra no Data Room e tem um botão/modal para fazer **novas solicitações** (perguntas)
2. Cada pergunta vira um **item** na lista
3. Notificação vai para o **advisor** e para o **dono da empresa**
4. O dono/advisor **responde** a pergunta e opcionalmente **sobe um documento**
5. A resposta pode ser só texto (sem documento obrigatório)
6. O item respondido pode ser **promovido a item padrão** pelo advisor/asset (ex: se a pergunta for recorrente, ela vira parte do data room para todos os investidores)
7. A comunicação é sempre **unidirecional**: empresa → investidor

**Importante:** Documentos adicionais também devem entrar no **contexto do RAG** (IA).

---

## 3. Integração com IA (RAG)

**Conceito central:** Cada empresa terá um **contêiner de contexto** com todos os dados (documentos, projeto, dados cadastrais, CNPJ, sócios, etc.) conectado a uma IA via RAG.

**Funcionalidades:**
- Ao fazer upload de documentos, já criar **embeddings** automaticamente no backend
- Investidor pode abrir um **chat com a Mary** (botão tipo Notion, no canto inferior) para tirar dúvidas sobre a empresa
- A IA responde com base nos documentos e traz **referências/links** para os documentos originais
- Se a IA **não souber responder**, gera notificação para o advisor/asset responder manualmente

**Duas instâncias de IA:**
1. **Área pública** (site) — IA genérica
2. **Área interna** (dentro do data room do ativo) — IA com contexto completo da empresa, com segurança de dados compartimentalizada

**Segurança:** Cada chamada à IA passa por **autenticação** + **Row Level Security (Supabase)** para garantir que dados da empresa A nunca vazem para a empresa B.

---

## 4. Visão do Investidor — Data Room Compartilhado

Após assinar o **NDA**, o investidor recebe um **espelho** do Data Room:

- **Mesma árvore** de documentos
- **Mesma documentação**
- **Plano de ação zera** (prioridade, status, responsável) — cada investidor tem sua própria visão de gestão
- Investidor pode:
  - Navegar pelos documentos
  - Conversar com a IA (Mary)
  - Fazer novas solicitações
  - Marcar prioridades/riscos (visão própria)

**Interação com itens do Data Room:**
- Cada item pode ter um **chat lateral** para discussão
- Se o investidor discorda ou tem dúvida, abre chat → IA responde → se insuficiente, notifica advisor/asset
- Notificação de documentos atualizados chega automaticamente ao investidor

---

## 5. Pipeline de M&A — Fluxo do Investidor

| Etapa | Descrição |
|-------|-----------|
| **Screening** | Investidor busca ativos no radar de oportunidades (baseado nas teses) |
| **Teaser** | Visualiza documento resumo da empresa (sem nome, sem dados sensíveis) |
| **Assinatura NDA** | Click-sign ou upload de NDA assinado (com validação do advisor) |
| **Pré-Due Diligence** | Acesso ao Data Room completo + IA |
| **Indicação de Interesse** | Proposta informal (e-mail) ou NBO (proposta não vinculante formal) |

**Teaser:**
- Documento gerado pela **IA** (com score mínimo, ex: >30%)
- Contém: resumo da empresa, dados de mercado, TAM/SAM/SOM, highlights, principais números, próximos passos
- Deve ser **compartilhável** (link traqueável) e scrollável (formato simples, sem design pesado)
- A IA monta o teaser automaticamente com base nos documentos do Data Room

**Infomemo:**
- Documento mais detalhado, também gerado pela IA
- Será explorado na próxima reunião

---

## 6. Decisões e Pontos em Aberto

| Item | Status |
|------|--------|
| Estrutura padrão do Data Room (árvore) | Alinhado |
| Níveis N1/N2/N3 com perfis de acesso | Alinhado (detalhar alçadas depois) |
| Q&A / Solicitações adicionais | Alinhado (desenvolver) |
| IA com RAG por empresa | Alinhado (desenvolver) |
| Chat no Data Room (por item) | Alinhado |
| Teaser gerado por IA | Conceito definido, detalhar na próxima reunião |
| Infomemo gerado por IA | Pendente — próxima reunião |
| Assinatura NDA (Click-sign vs upload manual) | Pendente decisão |
| Detalhamento de perfis de acesso/alçada | Pendente |

---
