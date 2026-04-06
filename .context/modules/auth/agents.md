# Agents - Auth

Agentes relevantes de `.context/agents/` para o modulo de autenticacao.

## Primary

| Agente | Playbook | Quando usar |
|--------|----------|-------------|
| Security Auditor | [security-auditor.md](../../agents/security-auditor.md) | Revisar risco em login, MFA, OTP, sessao e rate-limit |
| Backend Specialist | [backend-specialist.md](../../agents/backend-specialist.md) | Server Actions de auth, middleware e integracoes de OTP |
| Frontend Specialist | [frontend-specialist.md](../../agents/frontend-specialist.md) | UX de login, verify-mfa, resend OTP e erros de fluxo |

## Secondary

| Agente | Playbook | Quando usar |
|--------|----------|-------------|
| Database Specialist | [database-specialist.md](../../agents/database-specialist.md) | Tabelas/funcs de sessao OTP rate-limit e auditoria |
| Architect Specialist | [architect-specialist.md](../../agents/architect-specialist.md) | Definir fronteira auth vs foundation-common e contratos |
| DevOps Specialist | [devops-specialist.md](../../agents/devops-specialist.md) | Variaveis de ambiente, estabilidade em preview/prod |

## On-demand

| Agente | Playbook | Quando usar |
|--------|----------|-------------|
| Test Writer | [test-writer.md](../../agents/test-writer.md) | Criar cobertura de funil auth login-MFA-dashboard |
| Bug Fixer | [bug-fixer.md](../../agents/bug-fixer.md) | Incidentes de loop de redirect e falha de sessao |
| Code Reviewer | [code-reviewer.md](../../agents/code-reviewer.md) | Gate final de qualidade e risco antes de merge |

## Regra operacional do time especialista

1. Ler `.context/modules/auth/context.md`.
2. Carregar `.cursor/skills/auth/SKILL.md`.
3. Aplicar `specialist-auth`.
4. Responder com evidencias (arquivo, regra, fluxo, risco/mitigacao).
