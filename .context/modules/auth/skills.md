# Skills - Auth

Skills aplicaveis ao modulo Auth e cenarios de ativacao.

## Skills internas

| Skill | Quando ativar |
|-------|--------------|
| [security-audit](../../skills/security-audit/SKILL.md) | Revisao de superficie de ataque em login, MFA e OTP |
| [bug-investigation](../../skills/bug-investigation/SKILL.md) | Erros de sessao, loops de redirect e expurgo de cookie |
| [code-review](../../skills/code-review/SKILL.md) | Mudancas em `src/lib/actions/auth.ts`, middleware e auth services |
| [test-generation](../../skills/test-generation/SKILL.md) | Cobertura de cenarios de auth e regressao de MFA |
| [feature-breakdown](../../skills/feature-breakdown/SKILL.md) | Quebra de entregas de auth em fases seguras |

## Skills externas

| Skill | Quando ativar |
|-------|--------------|
| [supabase-postgres-best-practices](../../../.agents/skills/supabase-postgres-best-practices/) | Revisao de rate-limit, sessoes e desenho de queries |
| [vercel-react-best-practices](../../../.agents/skills/vercel-react-best-practices/) | Estabilidade de fluxo no Next.js App Router |

## Governanca obrigatoria

Para qualquer demanda de Auth:

1. consultar `.context/modules/auth/context.md`
2. carregar `.cursor/skills/auth/SKILL.md`
3. usar `specialist-auth`
4. responder com evidencias concretas
