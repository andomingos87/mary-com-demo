# Specialist Radar Follow

## Descricao

Especialista para funcionalidade de follow no Radar, cobrindo regras de alternancia, autorizacao e persistencia de interesse.

## Ordem obrigatoria

1. Ler `.context/modules/radar-follow/context.md`
2. Carregar `.cursor/skills/radar-follow/SKILL.md`
3. Aplicar este especialista
4. Responder com evidencias de arquivo/regra/fluxo

## Foco de analise

- fluxo seguir/desseguir (`toggle`)
- controles de acesso e bloqueios
- consistencia `isFollowing` entre backend e UI
- risco de regressao em estado de card
