# Mudanças da Nova Fase (Pivot MVP) — Mary

> Documento de consolidação das mudanças definidas para a nova fase do produto.  
> Baseado em: `MRS-Market-Readiness-Score.md` e `Call_-_Mary_-_07-03_-_2026_03_07_15_59_GMT-03_00_-_Recording_estruturado.md`.

---

## 1) Objetivo deste documento

Organizar, em um único lugar, o que mudou no MVP da Mary, por que mudou, qual o impacto esperado e como isso orienta a implementação daqui para frente.

---

## 2) Visão geral da mudança

## O que mudou

- O produto deixou de priorizar robustez ampla no MVP e passou a priorizar simplicidade com valor imediato.
- O MRS foi promovido a núcleo da experiência do perfil Ativo.
- As jornadas de Ativo e Investidor foram espelhadas para reduzir complexidade de uso e desenvolvimento.
- A IA passou a ser posicionada como copiloto contextual (sugere e orienta), não como executor automático no MVP.
- A plataforma passou a ter foco explícito em "vida de produto" (feed, alertas, lembretes e gatilhos recorrentes).

## Por que mudou

- Reduzir fricção de entrada e melhorar adoção inicial.
- Evitar sobrecarga de escopo e retrabalho em funcionalidades prematuras.
- Acelerar entrega do MVP com base realmente utilizável.
- Preservar diferencial competitivo (IA + matching) sem elevar risco técnico no curto prazo.

---

## 3) Princípios definidos para a nova fase

- **Leveza no MVP:** menos campos e menos controles secundários.
- **Essencial primeiro:** entregar o mínimo que gera valor real e expandir por demanda validada.
- **Estruturas espelhadas:** Ativo e Investidor com lógica parecida.
- **Plataforma viva:** mecanismos de recorrência para evitar abandono pós-onboarding.
- **IA colaborativa:** apoio contextual, sem publicação/edição automática no MVP.

---

## 4) Mudanças de produto (Antes x Depois)

## 4.1 Escopo do MVP

- **Antes:** tendência de escopo mais amplo, com maior densidade funcional.
- **Depois:** recorte intencional para fluxo crítico de valor.
- **Decisão:** remover complexidades prematuras (ex.: chat interno nativo no MVP, excesso de colunas/controles, automações pesadas).

## 4.2 Onboarding do Investidor

- **Antes:** 5 etapas.
- **Depois:** 2 etapas.
- **Novo fluxo:**
  1. Criação inicial da tese.
  2. Dados financeiros essenciais.
- **Impacto:** entrada mais rápida no sistema, menor abandono no início.

## 4.3 Estrutura principal de navegação

- **Padrão definido:** Sidebar fixa + header com breadcrumb.
- **Menus centrais (espelhados):** `Tese`, `Radar`, `Feed`, `Projetos`.
- **IA:** botão Mary AI destacado, abrindo painel lateral contextual.

## 4.4 MRS como núcleo do Ativo

- **Antes:** risco de apresentação "bruta" dos 180 itens.
- **Depois:** estrutura em camadas:
  - passos progressivos;
  - temas e subtemas;
  - evolução de score visível.
- **Resultado esperado:** experiência mais palatável, orientada a progresso.

## 4.5 Reorganização dos itens MRS por criticidade

- **Passo 1 (básico):** início rápido e baixa barreira.
- **Passo 2 (crítico):** documentos indispensáveis para análise de investimento.
- **Passo 3 (importante):** complementares relevantes.
- **Passo 4 (desejável):** diferenciais e materiais adicionais.

## 4.6 Pontuação MRS no MVP

- **Regra simplificada inicial:**
  - tem/não tem documento;
  - peso por criticidade do passo.
- **Diretriz:** transparência e evolução contínua; sofisticação de scoring fica para fases posteriores.

## 4.7 Radar e Feed espelhados

- **Radar (Investidor):** ativos aderentes à tese, com ações de detalhe (ver teaser, assinar NDA, acompanhar ativo).
- **Radar (Ativo):** investidores aderentes ao projeto, com lógica equivalente.
- **Feed (ambos):** atualizações de movimento para gerar efeito de rede e engajamento recorrente.

## 4.8 Projetos com marcos de M&A

- **Gatilhos centrais do fluxo:** Teaser visualizado, NDA, NBO, SPA.
- **Modelo:** visão em etapas/kanban para acompanhar evolução do processo.

## 4.9 Comunicação no MVP

- **Antes (potencial):** mensageria interna completa.
- **Depois (MVP):** abordagem simplificada com acionamento de e-mail externo + logs de ação essenciais.
- **Justificativa:** menor custo de implementação, menor risco de segurança e foco no core.

---

## 5) Mudanças de UX/UI

- Redução de densidade visual e cognitiva.
- Remoção de campos e colunas secundárias no MRS inicial.
- Uso de componentes limpos e consistentes para progressão (cards, radar, botões de passo, tabela hierárquica, dropzone).
- Clareza de status e prioridade por cores/estados.
- Manutenção da sensação de progresso (score, status global, itens concluídos).

---

## 6) Mudanças no papel da IA

## Novo posicionamento da Mary AI no MVP

- Copiloto contextual especializado em M&A.
- Sugere, orienta, resume e recomenda ajustes.
- Usa contexto do ativo/projeto para respostas mais úteis.
- **Não executa ações finais automaticamente** (edição/publicação depende de validação humana).

## Impacto prático

- Reduz risco operacional e retrabalho.
- Aumenta confiança do usuário no processo.
- Mantém diferencial de inteligência sem elevar complexidade inicial.

---

## 7) Mudanças técnicas e de implementação

## 7.1 Direção técnica geral

- Construção incremental com base nas rotas e componentes já mapeados.
- Reuso estrutural entre telas de Ativo e Investidor para acelerar entrega.
- Priorização de arquitetura simples e extensível.

## 7.2 MRS (estado atual consolidado)

- Rota alvo: `/ativo/rs`.
- Interface com:
  - cards de score/status;
  - radar por eixos;
  - seleção de passo;
  - tabela hierárquica de 3 níveis;
  - dropzone por item;
  - FAB da Mary AI.
- Estado atual com dados mock e regras locais, pronto para evolução incremental.

## 7.3 Integrações previstas

- Fluxo com VDR para persistência e disponibilidade de documentos.
- Uso do score MRS em critérios de matching/radar.
- Evolução posterior para automações avançadas e benchmarks setoriais.

---

## 8) O que entra e o que não entra no MVP agora

## Entra agora (prioridade alta)

- MRS funcional com progressão por passos.
- Onboarding simplificado.
- Radar e Feed com experiência espelhada.
- Projetos com marcos essenciais.
- Mary AI como painel contextual colaborativo.

## Fica para depois (prioridade futura)

- Automação avançada de IA com execução autônoma.
- Mensageria interna completa.
- Camadas extras de configuração/campos pouco usados.
- Sofisticação avançada de scoring e benchmark completo.

---

## 9) Riscos identificados e mitigação

## Risco 1: voltar a inflar o escopo do MVP

- **Impacto:** aumento de prazo/custo e queda de adoção inicial.
- **Mitigação recomendada:** checklist "essencial agora vs depois", com gate de escopo por sprint.
- **Urgência:** alta (imediata).

## Risco 2: perda de recorrência após onboarding

- **Impacto:** usuário entra e não retorna.
- **Mitigação recomendada:** feed útil + lembretes + nudges + resumos periódicos por e-mail.
- **Urgência:** alta (antes do release do MVP).

## Risco 3: contexto de documentação disperso

- **Impacto:** interpretações divergentes e retrabalho técnico.
- **Mitigação recomendada:** índice único de referência com status de maturidade dos materiais.
- **Urgência:** média/alta (curto prazo).

---

## 10) Recomendação de execução (próximas iterações)

1. Congelar escopo MVP da fase atual com critérios objetivos de entrada/saída.
2. Priorizar implementação do MRS e suas integrações mínimas.
3. Concluir e versionar o documento de jornadas como fonte de verdade funcional.
4. Implementar gatilhos de "vida de produto" desde o início (feed + lembretes + e-mail resumo).
5. Evoluir IA por estágios: primeiro colaboração contextual; depois automações graduais com validação humana.

---

## 11) Síntese executiva

O pivot posiciona a Mary para entregar um MVP mais claro, adotável e escalável.  
A estratégia preserva o diferencial de IA e matching, mas troca complexidade prematura por foco em execução e valor real.  
O MRS vira o centro da jornada do Ativo, com progressão simples e visível, enquanto Investidor e Ativo passam a operar em experiências espelhadas, reduzindo custo de desenvolvimento e aumentando consistência de produto.

