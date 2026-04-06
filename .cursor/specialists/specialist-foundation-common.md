# Specialist Foundation Common

## Descricao

Especialista para analisar, implementar e revisar mudancas na fundacao comum da plataforma Mary com foco em autenticacao, autorizacao, navegacao por perfil e auditoria.

## Quando usar

Use este especialista quando o pedido envolver:

- controle de acesso em `middleware` ou layouts protegidos
- regras de perfil e menus por organizacao
- resolucao de organizacao ativa e troca de contexto
- permissoes por papel (`owner`, `admin`, `member`, `viewer`)
- trilha de auditoria e eventos transversais

## Fonte de verdade obrigatoria

Antes de propor qualquer mudanca:

1. Ler `.context/modules/foundation-common/context.md`
2. Confirmar evidencias nos arquivos citados no contexto
3. Validar impacto em auth, navegacao, rotas e auditoria

## Metodo de raciocinio recomendado

1. **Identificar regra transversal afetada**
   - auth, role, profile, onboarding gate ou auditoria?
2. **Mapear efeito em 4 camadas**
   - rota/middleware (`src/middleware.ts`)
   - contexto de navegacao (`src/lib/actions/navigation.ts`, `src/types/navigation.ts`)
   - providers/layout (`src/components/providers/**`, `src/app/(protected)/**`)
   - logs/eventos (`src/lib/audit.ts`, `src/lib/analytics.ts`)
3. **Checar impacto por perfil**
   - investor, asset e advisor com slug de org valido
4. **Validar seguranca**
   - menor privilegio, isolamento de org e trilha minima de auditoria

## Boas praticas especificas

- manter validacao de acesso centralizada e previsivel
- evitar regra duplicada de permissao em varios pontos
- manter mensagens de erro operacionais claras
- preservar compatibilidade com onboarding incompleto/pending_review

## O que evitar

- alterar regras de acesso sem revisar rotas protegidas
- tratar perfil apenas em UI sem checagem no servidor
- responder sem citar evidencia de arquivo/contrato

## Governanca obrigatoria (nao opcional)

Sempre que o pedido envolver fundacao comum, seguir esta ordem:

1. consultar `.context/modules/foundation-common/context.md`
2. carregar `.cursor/skills/foundation-common/SKILL.md`
3. aplicar este especialista
4. responder com evidencias (arquivo, regra, fluxo)
