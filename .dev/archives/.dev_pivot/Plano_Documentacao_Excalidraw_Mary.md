# Plano para Documento Completo — Base `mary_excalidraw.json`

> Objetivo: transformar o conteúdo visual do Excalidraw em um documento oficial, completo, consistente e útil para Produto + Engenharia.

---

## 1) Escopo e objetivo do documento

## Decisão recomendada

- Formato **híbrido**: produto + funcional/técnico.

## Justificativa

- O Excalidraw mistura fluxo de negócio, jornadas e estrutura de telas/rotas.
- Um documento apenas estratégico perde operacionalidade.
- Um documento apenas técnico perde contexto de decisão do pivot.

## Resultado esperado

- Fonte única de verdade para implementação da nova fase.

---

## 2) Estrutura final do documento

1. Resumo executivo  
2. Contexto da pivotagem  
3. Princípios da nova fase  
4. Arquitetura da experiência (macro)  
5. Perfis e permissões (Ativo, Investidor, Advisor, Agentes)  
6. Mapa de navegação e rotas (`:codename`, áreas principais)  
7. Jornadas por perfil (fim a fim)  
8. Pipeline detalhado (Teaser -> NDA -> IoI -> NBO -> DD/SPA -> Signing -> CP's -> Closing -> Disclosure)  
9. Módulos por tela (objetivo, ações, estados, dados)  
10. Regras de negócio e critérios de avanço  
11. Papel da Mary AI (contextual, limites, gatilhos)  
12. Dependências técnicas e dados mínimos necessários  
13. Riscos, mitigação e urgência  
14. Priorização (MVP agora vs depois)  
15. Gap com o código atual (implementado/parcial/pendente)  
16. Próximos passos e roadmap de execução

---

## 3) Método de extração do Excalidraw

## 3.1 Clusterização visual

Separar os blocos do JSON por macrogrupos:

- Navegação global e menus
- Áreas por perfil
- Fluxos por `:codename`
- Pipeline e estágios
- Cards, filtros, busca, ações em massa
- Integrações e pontos de decisão

## 3.2 Tabela de interpretação (obrigatória)

Para cada bloco identificado, preencher:

- **Origem no Excalidraw** (texto/label/rota)
- **Interpretação funcional** (o que representa)
- **Regra implícita** (comportamento esperado)
- **Status de clareza** (claro / ambíguo)
- **Decisão pendente** (sim/não)

## 3.3 Normalização de termos

Padronizar nomenclaturas para evitar conflito:

- IoI/IOI
- DD/SPA
- CP's
- Visão Geral/Overview
- Investors/Investidores

---

## 4) Conversão para especificação funcional

Para cada tela/módulo do Excalidraw, documentar:

- Objetivo da tela
- Perfil que usa
- Pré-condições
- Ações principais
- Estados (vazio, carregando, erro, sucesso)
- Regras de permissão
- Eventos relevantes (auditáveis)
- Dependências de backend/dados

Para cada etapa de pipeline, definir:

- Critério de entrada
- Critério de avanço
- Critério de bloqueio
- Evidências mínimas por etapa

---

## 5) Cruzamento com o código atual

## Objetivo

- Evitar documento "teórico" sem aderência à base já existente.

## Modelo de status

- **Concluído**
- **Parcial**
- **Não iniciado**

## Saída esperada

- Tabela "Excalidraw x Código Atual" por módulo.
- Lista objetiva de gaps técnicos para execução.

---

## 6) Gestão de lacunas e ambiguidades

## Regra

Nenhum ponto ambíguo fica sem proposta.

Para cada ambiguidade:

- Descrever o problema
- Recomendar solução
- Justificar a recomendação
- Definir urgência (alta/média/baixa)

---

## 7) Priorização para MVP

## Regra de classificação

Cada item deve receber uma tag:

- `MVP-Agora`
- `Depois`

## Critério de entrada no MVP-Agora

- Impacta valor imediato do usuário
- Reduz risco de adoção
- Não aumenta complexidade prematura

---

## 8) Critérios de qualidade do documento (DoD)

O documento é considerado pronto quando:

- Cobre os blocos principais do Excalidraw
- Não há conflito de termos entre seções
- Possui regras claras por fluxo/tela
- Contém status implementado/parcial/pendente
- Traz backlog priorizado com recomendação
- Lista decisões pendentes com proposta explícita

---

## 9) Plano de execução (4 dias)

## Dia 1 — Extração

- Mapear clusters e construir tabela de interpretação

## Dia 2 — Estrutura principal

- Redigir seções de contexto, arquitetura, jornadas e rotas

## Dia 3 — Especificação e gap técnico

- Completar pipeline, regras, IA, dados e "Excalidraw x Código"

## Dia 4 — Consolidação

- Revisão final, priorização MVP e versão executiva (1 página)

---

## 10) Entregáveis finais

- Documento completo (referência oficial)
- Versão executiva (1 página)
- Checklist de implementação por prioridade

---

## 11) Próximo passo recomendado

Iniciar pela seção **"Mapa de Navegação e Rotas"** e, em seguida, pelo **"Pipeline detalhado"**, pois concentram os principais acoplamentos de produto e engenharia da nova fase.

