# .dev/docs/

## Identidade
- Documentacao funcional e tecnica de apoio ao produto.
- Fonte para contexto de PRD, auditorias e guias operacionais.

## Estrutura recomendada
- `README.md`: indice principal de documentacao.
- `prd/`: requisitos e contratos funcionais.
- `architecture/`: decisoes tecnicas e limites de arquitetura.
- `operations/`: guias de validacao e runbooks.

## Regras de atualizacao
- Atualize sempre que houver mudanca de contrato funcional.
- Mantenha links para backlog e specs de producao validos.
- Evite duplicar fonte de verdade: prefira referenciar arquivos canonicos.

## Qualidade minima
- Toda decisao relevante deve registrar contexto, decisao e impacto.
- Toda especificacao deve ter criterios de aceite testaveis.
- Toda lacuna deve incluir mitigacao e proximo passo.

## Checklist rapido
- [ ] Documento tem owner e data de atualizacao.
- [ ] Links internos funcionam.
- [ ] Escopo e fora de escopo estao claros.
- [ ] Riscos e mitigacoes foram declarados.
