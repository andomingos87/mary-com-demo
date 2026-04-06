---
name: epic-client-validation
description: Cria documentos de validacao de epicos para cliente em linguagem amigavel e sem jargao tecnico, no padrao de `.dev/production/client-validation`. Use sempre que o usuario pedir checklist de aceite, validacao de entrega de epico, comprovacao de implementacao, UAT com tarefas e subtarefas, ou roteiro de testes para cliente nao tecnico.
---

# Epic Client Validation Skill

## Objetivo

Gerar um documento de validacao que permita ao cliente:
- entender o que foi entregue no epico;
- conferir o que foi implementado/revisado;
- executar testes guiados com checklist;
- aprovar ou reprovar com base em criterios claros.

## Fonte obrigatoria antes de escrever

1. Ler o epico no backlog citado pelo usuario.
2. Ler evidencias tecnicas relacionadas (checklists, PRD, arquivos de validacao).
3. Se houver documento ja iniciado pelo cliente, ler esse arquivo e **preservar o estilo que ele ajustou**.

## Estilo obrigatorio

- Escrever em portugues (Brasil), com linguagem simples e direta.
- Evitar termos tecnicos desnecessarios.
- Explicar "o que" e "por que" de forma amigavel.
- Usar checklists com tarefas e subtarefas.
- Manter tom de validacao de negocio, nao de engenharia.

## Estrutura padrao de saida

Use esta estrutura base:

1. `Validacao do Cliente - Epico X (<tema>)`
2. Bloco inicial com:
   - Data da validacao
   - Responsavel
   - Ambiente testado
3. `## 1) O que e o Epico X (explicacao simples)`
4. `## 2) O que foi implementado e revisado`
5. `## 3) Checklist de validacao para o cliente`
   - `### 3.1 Preparacao`
   - `### 3.2 ...` (subchecklists por fluxo/perfil/modulo)
6. `## 4) Criterio de aprovacao`
7. `## 5) Resultado final`

## Refinamento obrigatorio (modelo aprovado pelo cliente)

Sempre que fizer sentido, adicionar o padrao abaixo nos itens do checklist:

- `Como testar:` passo a passo curto e claro
- `Resultado esperado:` comportamento correto
- `Marque como falha se:` condicao objetiva de erro
- `Resultado executado (reteste):` quando houver reteste real

Tambem incluir, quando aplicavel:

- bloco de `Decisoes` do cliente (ex.: padronizacao de nomenclatura);
- resumo de aprovacao por niveis (ex.: N1/N2/N3);
- secao de `Registro complementar - Correcao (<data>)` para ajustes posteriores.

## Regras de qualidade

- Nao deixar checklist generico; cada item deve ser verificavel.
- Separar claramente aprovacao vs reprovacao.
- Incluir evidencias minimas que o cliente deve anexar (prints, URLs testadas, resultados).
- Se houver risco/pendencia, sempre trazer:
  - problema;
  - solucao recomendada;
  - justificativa curta;
  - urgencia (agora ou pode esperar).

## Template pratico (copiar e adaptar)

```md
# Validacao do Cliente - Epico X (Tema)

Data da validacao: ____/____/______
Responsavel: ____________________
Ambiente testado: ( ) Preview  ( ) Producao

## 1) O que e o Epico X (explicacao simples)

[explicacao curta em linguagem de negocio]

## 2) O que foi implementado e revisado

- [entrega/revisao 1]
- [entrega/revisao 2]

## 3) Checklist de validacao para o cliente

### 3.1 Preparacao
- [ ] [item]

### 3.2 [Fluxo principal]
- [ ] [item principal]
  - Como testar: [passos]
  - Resultado esperado: [esperado]
  - Marque como falha se: [condicao de falha]

### 3.3 [Fluxo secundario]
- [ ] [item principal]
  - Como testar: [passos]
  - Resultado esperado: [esperado]
  - Marque como falha se: [condicao de falha]

## 4) Criterio de aprovacao

✅ [criterio de aprovacao 1]
✅ [criterio de aprovacao 2]

Marcar **REPROVADO** se houver:
- [ ] [erro critico 1]
- [ ] [erro critico 2]

## 5) Resultado final

Status final: ( ) APROVADO  ( ) REPROVADO

Resumo da validacao:
- N1 [nome]: [status]
- N2 [nome]: [status]
- N3 [nome]: [status]

Pendencias encontradas (se houver):
____________________________________________________

Proxima acao recomendada:
- Se APROVADO: [proximo passo]
- Se REPROVADO: [plano de correcao e revalidacao]
```

## Quando perguntar antes de gerar

Perguntar ao usuario somente se faltar algo que bloqueia o documento:
- numero/nome do epico;
- publico/perfis envolvidos;
- ambiente de validacao;
- se deseja incluir bloco de reteste e registro complementar.

Se der para inferir com seguranca pelos arquivos citados, seguir sem travar.
