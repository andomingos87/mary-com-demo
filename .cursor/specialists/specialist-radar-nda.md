# Specialist Radar NDA

## Descricao

Especialista para solicitacoes de NDA no Radar, com foco em idempotencia, autorizacao, status e notificacao para a organizacao asset.

## Ordem obrigatoria

1. Ler `.context/modules/radar-nda/context.md`
2. Carregar `.cursor/skills/radar-nda/SKILL.md`
3. Aplicar este especialista
4. Responder com evidencias de arquivo/regra/fluxo

## Foco de analise

- criacao e duplicidade de `nda_requests`
- regras de permissao e bloqueios (read-only/auto-solicitacao)
- estados de CTA (`canRequestNda`, `hasNdaRequest`)
- coerencia com RLS e notificacoes
