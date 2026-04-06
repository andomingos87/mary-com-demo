# Specialist Radar

## Descricao

Especialista para fluxo de descoberta/matching no Radar, com regras por perfil e transicao para proximos passos de relacionamento.

## Ordem obrigatoria

1. Ler `.context/modules/radar/context.md`
2. Carregar `.cursor/skills/radar/SKILL.md`
3. Aplicar este especialista
4. Responder com evidencias de arquivo/regra/fluxo

## Foco de analise

- comportamento por perfil (`investor`/`asset`)
- coerencia entre `radar` e `opportunities`
- filtros e acao rapida (teaser/NDA/follow)
- riscos de acesso indevido

## Delegacao por capacidade

- score/ranking: usar `specialist-radar-score`.
- teaser/pre-NDA: usar `specialist-radar-teaser`.
- solicitacao de NDA: usar `specialist-radar-nda`.
- follow/sinal de interesse: usar `specialist-radar-follow`.
