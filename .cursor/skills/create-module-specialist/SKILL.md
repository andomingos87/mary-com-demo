---
name: create-module-specialist
description: Cria estrutura padronizada de modulo com contexto, especialista e skill dedicados, com governanca obrigatoria baseada em evidencias. Use sempre que o usuario pedir para criar/estruturar um modulo novo, criar especialista de modulo, organizar contexto por modulo, ou padronizar respostas sobre um dominio especifico do sistema.
---

# Create Module Specialist

## Objetivo

Padronizar a criacao de modulos com rastreabilidade, consistencia entre sessoes e respostas baseadas em evidencias.

## Quando usar

Ative esta skill quando o usuario pedir algo como:
- "crie um modulo [X]"
- "crie especialista do modulo [X]"
- "padronize contexto do modulo [X]"
- "crie a skill do modulo [X]"
- "organize a documentacao do modulo [X]"

## Workflow obrigatorio

1. **Levantamento de contexto**
   - Entenda o modulo alvo e registre:
     - objetivo do modulo
     - fluxos principais e funcionalidades
     - entidades envolvidas
     - regras de negocio
     - pontos criticos/sensiveis
   - Leia arquivos reais do projeto antes de concluir.
   - Nao responda com suposicoes quando houver evidencia disponivel.

2. **Criar fonte de verdade do modulo**
   - Criar/atualizar `.context/modules/[nome-do-modulo].md`.
   - Consolidar ali:
     - escopo funcional
     - arquitetura e dependencias
     - riscos, mitigacoes e backlog
     - decisoes e pendencias

3. **Criar especialista do modulo**
   - Seguir padrao do projeto para especialista:
     - nome: `specialist-[nome-do-modulo]`
     - descricao objetiva
     - instrucoes de uso, boas praticas e anti-padroes
   - Se a estrutura de especialistas nao existir, criar de forma consistente e registrar no indice.

4. **Criar skill do modulo**
   - Criar em `.cursor/skills/[nome-do-modulo]/SKILL.md`.
   - Incluir:
     - gatilhos claros de ativacao
     - metodo de analise do modulo
     - avaliacao de impacto de mudancas
     - orientacao para respostas baseadas em evidencias
   - Referenciar `.context/modules/[nome-do-modulo].md` como fonte primaria.

5. **Atualizar indice de descoberta**
   - Atualizar indice de especialistas/skills (ex.: `.cursor/specialists/index.md` ou equivalente).
   - Garantir que o novo modulo seja facil de encontrar.

6. **Aplicar governanca obrigatoria**
   - Sempre que o pedido envolver o modulo, seguir esta ordem:
     1. consultar `.context/modules/[nome-do-modulo].md`
     2. carregar a skill do modulo
     3. usar o especialista do modulo
     4. responder com evidencias (arquivo, regra, fluxo)
   - Essa sequencia e obrigatoria, nao opcional.

7. **Padronizacao de resposta**
   - Garantir:
     - consistencia entre sessoes
     - mesmo padrao de raciocinio
     - respostas auditaveis (origem da informacao)
     - minimizacao de respostas genericas

8. **Validacao final**
   - Verificar compatibilidade com padroes existentes (ex.: Dashboard, OMIE).
   - Checar conflitos com especialistas/skills ja existentes.
   - Confirmar clareza, reutilizacao e governanca.

## Formato de entrega esperado

- Arquivo de contexto do modulo criado/atualizado
- Arquivo do especialista criado
- Arquivo da skill do modulo criado
- Indice atualizado
- Regras de governanca explicitas

## Regras de qualidade

- Sempre citar evidencias concretas do codigo/projeto.
- Nunca inventar padroes fora da estrutura existente.
- Em caso de lacuna critica, perguntar de forma objetiva.
- Ao apontar risco/bloqueio, sempre propor solucao com justificativa.
