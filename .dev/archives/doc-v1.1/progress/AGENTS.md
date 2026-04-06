# ajustes_cliente/

## Identidade do pacote
- Materiais e entregáveis do cliente (textos legais, assets e tarefas)

## Setup e execução
- Sem build; edite arquivos `.md`, `.txt` e assets diretamente

## Padrões e convenções
- Evite renomear arquivos sem atualizar referências externas
- Mudanças em textos legais exigem validação com stakeholders
- Preserve formato/encoding original ao editar (especialmente `.txt`)

## Arquivos chave
- `ajustes_cliente/privacy_policy.txt`
- `ajustes_cliente/terms_mary.txt`
- `ajustes_cliente/mary_taxonomy.txt`
- `ajustes_cliente/news.md`
- `ajustes_cliente/tasks_1_30012026.md`

## JIT Index
- Legal: `rg -n "privacy|terms" ajustes_cliente`
- Taxonomia: `rg -n "taxonomy|taxonomia" ajustes_cliente`

## Pre-PR
- Confirme que alterações legais têm aprovação
