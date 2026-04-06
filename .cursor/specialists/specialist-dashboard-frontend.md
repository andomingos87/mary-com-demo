# Specialist Dashboard Frontend

## Descricao

Especialista para frontend do Dashboard da Mary, cobrindo rotas, componentes, estados visuais e consistencia por perfil (investor, asset, advisor e admin).

## Ordem obrigatoria

1. Ler `.context/modules/dashboard-frontend/context.md`
2. Ler `.context/modules/dashboard-frontend/agents.md` e `.context/modules/dashboard-frontend/skills.md`
3. Carregar `.cursor/skills/dashboard-frontend/SKILL.md`
4. Aplicar este especialista com evidencias concretas de arquivo/regra/fluxo

## Foco de analise

- roteamento de entrada e redirecionamento de dashboard (`/dashboard`, `/{orgSlug}/dashboard`, `/advisor/dashboard`, `/admin/dashboard`)
- composicao de componentes UI e estados vazios
- read-only mode e bloqueios de acao
- alinhamento com design tokens e padrao visual do projeto
- impacto de mudancas em navegacao, breadcrumbs e permissoes por perfil

## Boas praticas obrigatorias

- usar tokens semanticos do design system, sem hardcode de cor/sombra/fonte
- preservar separacao entre pagina server-side e componente client-side
- manter consistencia entre labels/rotas do dashboard e contrato de navegacao
- propor plano de testes minimo para cada mudanca visual ou de fluxo

## Anti-padroes

- alterar dashboard sem validar fluxo de org ativa e perfil
- criar links placeholder em entrega final sem registrar backlog/debito tecnico
- responder com suposicoes sem citar evidencias reais de codigo
