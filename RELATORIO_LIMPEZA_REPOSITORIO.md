# Relatório de Varredura — Limpeza do Repositório Mary AI Platform

**Data:** 2026-04-02
**Escopo:** Análise completa de arquivos candidatos à remoção, arquivamento ou consolidação
**Status:** Execução ampliada concluída (Crítico + Alto + Médio/Baixo parciais) em 2026-04-03

---

## Resumo Executivo

O repositório possui **~599 MB** totais, sendo ~458 MB de `node_modules` e ~112 MB de `.next/` (cache de build). O conteúdo real do projeto é de **~23 MB**. Foram identificados **~50 itens** para limpeza distribuídos em 4 níveis de prioridade.

---

## Execução Registrada (2026-04-02)

### Itens executados

- Arquivamento de `.dev/doc-v1.1/`, `.dev/doc-v1.2/` e `.dev/.dev_pivot/` para `.dev/archives/`.
- Criação de `.dev/archives/ARCHIVE_README.md` com contexto histórico.
- Consolidação de backlog: `6-PRODUCT_BACKLOG_PRIORIZADO_V3.md` promovido para `6-PRODUCT_BACKLOG_PRIORIZADO.md`; v2.2 movido para `.dev/archives/production/`.
- Inclusão de banner de depreciação em `.dev/production/1-PRD.md`.
- Normalização do DOCX de mapeamento para `.dev/production/` e remoção da cópia da raiz.
- Remoção dos diretórios vazios em `src/lib/mvp/`, `src/lib/onboarding/`, `src/lib/mary-ai/__tests__/` e `src/lib/mrs/__tests__/`.
- Remoção de `supabase/.temp/cli-latest`.
- Redução do `README.md` para formato thin redirect.
- Limpeza de `.next/` executada antes das validações (regenerado pelo `npm run build`).

### Validações executadas

- `npm run lint` (aprovado, com warning não-bloqueante pré-existente em teste de `verify-mfa`).
- `npm run test -- --runInBand` (32 suites / 488 testes aprovados).
- `npm run build` (build concluído com sucesso).

### Ajustes de diagnóstico (diferença entre análise e estado real)

- `scripts/AGENTS.md` e `supabase/AGENTS.md` **não** são cópias idênticas do `AGENTS.md` raiz (hashes distintos), portanto foram preservados.

### Atualização de execução (2026-04-03)

#### Itens executados adicionais

- Criação de `.context/modules/module-index.json` para centralizar mapeamento módulo -> context/agents/skills.
- Simplificação de boilerplate em `agents.md` e `skills.md` dos módulos ativos com referência ao índice central.
- Atualização dos `SKILL.md` modulares em `.cursor/skills/` para reduzir duplicação e reforçar fonte de verdade por módulo.
- Reorganização dos scripts de debug para `scripts/debug/` com `scripts/debug/README.md`.
- Atualização de referências documentais para novos caminhos de scripts (`scripts/AGENTS.md`, `.context/docs/project-overview.md`, `.context/docs/architecture.md`, `.context/docs/tooling.md`).
- Consolidação de changelog em `.dev/production/CHANGELOG.md`.
- Depreciação explícita de `4-CHANGELOG-PIVOT-07-03.md` e `28-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md`.
- Criação de `.dev/production/NAMING_MIGRATION_MAP.md` com mapeamento formal e status da migração de nomenclatura.
- Registro de gate humano em `.dev/production/client-validation/H0.7-VALIDACAO-CLIENTE-MENU-LATERAL.md` para itens com decisão funcional pendente de Product Owner.

#### Validação incremental executada

- `npm run build` executado de forma incremental após cada etapa do mapa de arquivos, com sucesso em todas as execuções.
- Warning pré-existente mantido: `@next/next/no-img-element` em teste de `verify-mfa`.

### Atualização de governança documental (2026-04-03)

#### Itens executados adicionais

- `BACKLOG-V3.md` convertido para ponte de governança apontando para `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`.
- `SPEC-H0.1-ONBOARDING-ATIVO.md` (raiz) convertido para redirect/deprecated da fonte canônica em `.dev/specs/`.
- `SPEC-H0.2-TESE-INVESTIDOR.md` (raiz) convertido para redirect/deprecated da fonte canônica em `.dev/specs/`.
- `SPEC-H0.3-PIPELINE-12-FASES.md` (raiz) convertido para redirect/deprecated da fonte canônica em `.dev/specs/`.
- `SPEC-H0.4-H0.7-ITENS-MENORES.md` (raiz) convertido para redirect/deprecated da fonte canônica em `.dev/specs/`.
- `.dev/guides/GUIA-FLUXO-IMPLEMENTACAO-E0.md` alinhado com o fluxo oficial incluindo uso de `/convertToPlan`.
- `.cursor/commands/convertToPlan.md` atualizado com governança explícita de fontes canônicas.
- `.dev/production/NAMING_MIGRATION_MAP.md` atualizado com status de execução desta onda.

#### Situação atual após reorganização

- Backlog canônico: `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`.
- Specs canônicas: `.dev/specs/`.
- Arquivos da raiz relacionados ao backlog/specs permanecem apenas como redirect/histórico.
- Sem alteração de código funcional da aplicação nesta onda.

### Atualização de despoluição da raiz (2026-04-03)

#### Itens executados adicionais

- Criação de `DOCS.md` como índice mestre de documentação canônica na raiz.
- Alinhamento de `README.md`, `AGENTS.md`, `.dev/guides/GUIA-FLUXO-IMPLEMENTACAO-E0.md` e `.cursor/commands/convertToPlan.md` com a política de raiz mínima.
- Remoção da raiz dos arquivos de trabalho/redirect legados:
  - `BACKLOG-V3.md`
  - `SPEC-H0.1-ONBOARDING-ATIVO.md`
  - `SPEC-H0.2-TESE-INVESTIDOR.md`
  - `SPEC-H0.3-PIPELINE-12-FASES.md`
  - `SPEC-H0.4-H0.7-ITENS-MENORES.md`

#### Situação atual após despoluição

- A raiz passa a atuar como ponto de entrada enxuto de documentação.
- Governança canônica preservada em `.dev/production/`, `.dev/specs/` e `.dev/guides/`.
- Rastreabilidade atualizada em `NAMING_MIGRATION_MAP.md` e `CLEANUP_EXECUTION_LOG.md`.

---

## 1. CRÍTICO — Executar Imediatamente

### 1.1 Documentação Obsoleta em `.dev/`

| Caminho | Tamanho | Motivo |
|---------|---------|--------|
| `.dev/doc-v1.1/` (inteira) | ~0.1 KB | Totalmente obsoleta (Jan 2026), apenas 1 arquivo de 84 bytes |
| `.dev/doc-v1.2/` (14 arquivos) | ~150 KB | Superada pelo PRD v3.0 — reflete PRD v2.2 que não é mais válido |
| `.dev/.dev_pivot/` (4 arquivos) | ~20 KB | Notas de transição pré-v3.0, já consolidadas |

**Recomendação:** Mover tudo para `.dev/archives/` com um `ARCHIVE_README.md` explicando o histórico.

### 1.2 Backlog Duplicado

| Arquivo | Status |
|---------|--------|
| `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md` | SUPERSEDED (v2.2) — **deletar** |
| `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO_V3.md` | ATUAL (v3.0) — **renomear** para `6-PRODUCT_BACKLOG_PRIORIZADO.md` |

### 1.3 PRD v2.2 sem Banner de Depreciação

O arquivo `.dev/production/1-PRD.md` (v2.2) ainda existe sem nenhuma indicação de que foi superado pelo `PRD-v3.0-RECONCILIADO.md`. Adicionar banner:

```markdown
> ⚠️ DEPRECATED — Superado por PRD-v3.0-RECONCILIADO.md (2026-04-01)
```

### 1.4 DOCX Duplicado na Raiz

| Arquivo | Localização |
|---------|-------------|
| `MAPEAMENTO_EXCALIDRAW_VS_IMPLEMENTACAO.docx` | Raiz do projeto |
| Mesmo conteúdo existe em `.dev/` | `.dev/production/` |

**Recomendação:** Manter apenas em `.dev/production/`, remover da raiz.

---

## 2. ALTO — Executar Esta Sprint

### 2.1 Diretórios Vazios no `src/`

| Caminho | Situação |
|---------|----------|
| `src/lib/mvp/` | Vazio, nenhum import encontrado |
| `src/lib/onboarding/` | Vazio, nenhum import encontrado |
| `src/lib/mary-ai/__tests__/` | Diretório de testes vazio |
| `src/lib/mrs/__tests__/` | Diretório de testes vazio |

**Recomendação:** Deletar todos. Verificado via grep — nenhum import referencia estes caminhos.

### 2.2 AGENTS.md Duplicados

| Arquivo | Status |
|---------|--------|
| `scripts/AGENTS.md` | Cópia do root `AGENTS.md` — **deletar** |
| `supabase/AGENTS.md` | Cópia do root `AGENTS.md` — **deletar** |

### 2.3 Artefatos Temporários

| Arquivo | Motivo |
|---------|--------|
| `supabase/.temp/cli-latest` (7 bytes) | Artefato de build do CLI Supabase |

### 2.4 README.md da Raiz Redundante

O `README.md` na raiz duplica **~60%** do conteúdo do `AGENTS.md`. O `AGENTS.md` já é a fonte de verdade para arquitetura e setup.

**Recomendação:** Reduzir `README.md` a um "thin redirect" com 5-10 linhas apontando para `AGENTS.md` e `.context/docs/README.md`.

### 2.5 Build Cache `.next/`

| Diretório | Tamanho |
|-----------|---------|
| `.next/` | **112 MB** |

**Recomendação:** Verificar se está no `.gitignore` (✅ está). Seguro deletar localmente com `rm -rf .next/` — é regenerado no próximo `npm run dev`. Confirmar que não está sendo commitado.

---

## 3. MÉDIO — Próximas 2-3 Sprints

### 3.1 Boilerplate em `.context/modules/`

Cada um dos 17 módulos tem 3 arquivos com **~70% de duplicação** entre eles:

```
.context/modules/<modulo>/
├── context.md   ← Conteúdo real (único)
├── agents.md    ← Boilerplate genérico (quase idêntico entre módulos)
└── skills.md    ← Boilerplate genérico (quase idêntico entre módulos)
```

**Impacto:** 34 arquivos (17×2) de boilerplate que poderiam ser 1 arquivo de índice (JSON/YAML).

**Recomendação:** Criar um `module-index.json` que mapeia módulo → agents/skills, eliminando os 34 arquivos individuais.

### 3.2 Duplicação `.cursor/skills/` vs `.context/modules/`

Para cada módulo, existe:
- `.context/modules/<m>/context.md` — Especificação do módulo
- `.cursor/skills/<m>/SKILL.md` — Guia Cursor (40-60% do mesmo conteúdo)

**Recomendação:** Refatorar os `SKILL.md` do Cursor para **referenciar** o `context.md` em vez de duplicar conteúdo. Manter no SKILL.md apenas instruções específicas de IDE.

### 3.3 Scripts de Debug em `supabase/`

| Arquivo | Finalidade |
|---------|-----------|
| `cleanup-corrupted-user.ts` | Utilitário de emergência |
| `debug-auth.ts` | Debug de autenticação |
| `fix-user.ts` | Fix de usuário |
| `test-new-user.ts` | Teste manual |

**Recomendação:** Mover para `scripts/debug/` ou `scripts/maintenance/` com README explicando quando usar cada um.

### 3.4 Componentes VDR Possivelmente Órfãos

| Arquivo | Tamanho |
|---------|---------|
| `CreateFolderDialog.tsx` | ~7 KB |
| `EditFolderDialog.tsx` | ~5 KB |
| `VdrFolderAccordionRow.tsx` | ~8 KB |
| `VdrFolderList.tsx` | ~7 KB |

Exportados mas aparentemente usados apenas internamente em `VdrAccordionTable`. Requer validação com o time de produto antes de qualquer ação.

### 3.5 Changelogs Fragmentados

Existem changelogs espalhados:
- `4-CHANGELOG-PIVOT-07-03.md`
- `28-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md`

**Recomendação:** Criar um `CHANGELOG.md` unificado em `.dev/production/` e arquivar os individuais.

### 3.6 Esquema de Numeração Quebrado em `.dev/production/`

Arquivos numerados de 1-29, mas o `PRD-v3.0-RECONCILIADO.md` e `6-PRODUCT_BACKLOG_PRIORIZADO_V3.md` quebram o padrão. Dois arquivos com número "6".

**Status 2026-04-03:** parcialmente endereçado por `NAMING_MIGRATION_MAP.md` (migração total pendente para evitar quebra de referências).

**Recomendação:** Executar onda dedicada de renome + atualização automática de links internos.

---

## 4. BAIXO — Polish/Opcional

### 4.1 Assimetria na Pasta `.agents/`

A maioria das definições de agentes vive em `.context/agents/`, não em `.agents/agents/`. A pasta `.agents/` contém apenas skills e a library Supabase/Postgres.

**Recomendação:** Documentar formalmente a razão dessa separação ou consolidar.

### 4.2 `.cursor/rules/` Vazio

Contém apenas `README.md`. Decidir se regras do Cursor pertencem aqui ou em `.cursor/commands/`.

### 4.3 Verificar Uso de `public/logotipo.png`

Confirmar se este asset está realmente sendo referenciado na aplicação. Há cópias duplicadas em `.dev/doc-v1.1/progress/`.

**Status 2026-04-03:** em uso ativo em múltiplas telas (`login`, `signup`, `verify-mfa`, `sidebar`, `terms`, `privacy`, `onboarding`, `home`, `vdr share`). Não remover.

### 4.4 Rota Potencialmente Redundante

`src/app/(protected)/[orgSlug]/projeto/page.tsx` parece redundante com a rota `/projetos`. Verificar com product team.

**Status 2026-04-03:** manter ambas nesta etapa. `/{orgSlug}/projeto` e `/{orgSlug}/projetos` atendem fluxos por perfil e não foram consideradas seguras para remoção sem validação funcional dedicada.

---

## Resumo Quantitativo

| Prioridade | Itens | Espaço Recuperável | Esforço |
|------------|-------|-------------------|---------|
| **Crítico** | 6 ações | ~170 KB + clareza | ~15 min |
| **Alto** | 7 ações | ~112 MB (cache) + ~5 KB | ~30 min |
| **Médio** | 6 ações | Redução de ~34 arquivos boilerplate | ~2-4 horas |
| **Baixo** | 4 ações | Minimal | ~1 hora |

---

## O Que Está BEM (Não Mexer)

- ✅ Configs de build (tsconfig, eslint, jest, next.config) — únicos e corretos
- ✅ `.gitignore` — corretamente configurado para `.env*`, `node_modules/`, `.next/`
- ✅ Migrations do Supabase — bem organizadas com nomenclatura clara
- ✅ `.context/docs/` — documentação técnica ativa e bem estruturada
- ✅ `.context/agents/` e `.context/skills/` — agentes e skills bem definidos
- ✅ Estrutura de componentes em `src/components/` — 18 categorias limpas
- ✅ `package-lock.json` (472 KB) — necessário, não remover

---

*Relatório atualizado com execução incremental e rastreabilidade de limpeza em 2026-04-03.*
