# Specialists Index

## Modulos

- `specialist-auth`: especialista para autenticacao (login, sessao, MFA, OTP, rate-limit e recovery).
- `specialist-z-api`: especialista para integracao Z-API no canal WhatsApp (OTP/alertas, resiliencia, fallback e observabilidade).
- `specialist-foundation-common`: especialista para auth/autorizacao/navegacao/auditoria transversais.
- `specialist-onboarding`: especialista para fluxo completo de onboarding (steps, gates, elegibilidade, pending review e consistencia de tipos/actions).
- `specialist-thesis`: especialista para modulo de Tese (investidor).
- `specialist-radar`: especialista para descoberta/matching no Radar.
- `specialist-radar-score`: especialista para score, ranking e explicabilidade no Radar.
- `specialist-radar-teaser`: especialista para preview pre-NDA e UX de teaser no Radar.
- `specialist-radar-nda`: especialista para solicitacao de NDA, status e autorizacao no Radar.
- `specialist-radar-follow`: especialista para seguir/desseguir e sinal de interesse no Radar.
- `specialist-feed`: especialista para feed, notificacoes e recorrencia.
- `specialist-projects`: especialista para CRUD de projetos, status, membros e readiness.
- `specialist-mrs`: especialista para score/readiness e contrato MRS.
- `specialist-mais-infos`: especialista para data room complementar e Q&A.
- `specialist-collaboration`: especialista para convites e colaboracao (org/projeto).
- `specialist-mary-ai`: especialista para assistencia Mary AI com guardrails.
- `specialist-settings-admin`: especialista para configuracoes e administracao.
- `specialist-dashboard-frontend`: especialista para frontend dos dashboards (investor/asset/advisor/admin), componentes visuais e navegacao.
- `specialist-excalidraw-front-alignment`: especialista para confrontar doc Excalidraw com frontend atual, priorizar gaps e orientar refatoracao com evidencias.

## Ordem de uso obrigatoria por modulo

Para qualquer demanda de modulo:

1. consultar `.context/modules/<modulo>/context.md`
2. carregar `.cursor/skills/<modulo>/SKILL.md`
3. usar `specialist-<modulo>`
4. responder com evidencias concretas de codigo

Para precedencia entre especialistas de modulo e agents transversais, consultar `.context/AI_GOVERNANCE.md`.
