# scripts/

## Identidade do pacote
- Scripts de manutenção/diagnóstico em Node/TypeScript

## Setup e execução
- Preferir expor novos scripts via `package.json`
- Scripts `.js` podem ser executados com `node`

## Padrões e convenções
- Scripts novos devem ser idempotentes quando possível
- Evite efeitos colaterais em produção sem validação explícita
- Centralize lógica reutilizável em `src/lib` ao invés de duplicar
- Documente flags/inputs no topo do arquivo

## Arquivos chave
- `scripts/check-bundle-size.js`
- `scripts/validate-env.js`
- `scripts/debug/README.md` — documentação dos scripts de diagnóstico
- `scripts/debug/cleanup-corrupted-user.ts`
- `scripts/debug/debug-auth.ts`
- `scripts/debug/fix-user.ts`
- `scripts/debug/test-new-user.ts`

## JIT Index
- Variáveis de ambiente: `rg -n "process\\.env" scripts`
- Integração Supabase: `rg -n "supabase" scripts`

## Pre-PR
- Adicione instruções de uso quando criar novo script
