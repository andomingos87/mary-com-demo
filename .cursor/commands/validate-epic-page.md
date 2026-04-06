Atualize a página de validação de épicos com os novos documentos em `.dev/production/client-validation/*.md`.

Regras obrigatórias:
1. Use a skill `epic-client-validation` (`.cursor/skills/epic-client-validation/SKILL.md`) para manter linguagem simples e checklist verificável.
2. Preserve os padrões já utilizados no MVP:
   - Rota: `src/app/validacao-epicos/page.tsx`
   - Fonte de dados dos épicos: `src/lib/client-validation/epics.ts`
   - Persistência: `src/app/api/client-validation/route.ts`
   - Banco: tabela única `public.epic_validation_responses`
3. Para cada novo documento de épico, incluir na sidebar e no conteúdo:
   - `O que e`
   - `O que foi implementado`
   - `Checklist` com itens objetivos
4. Cada item do checklist deve continuar com os 3 status:
   - `Aprovado ✅`
   - `Reprovado ❌`
   - `Bug 🪲`
   e comentário opcional por item.
5. Manter seção de:
   - Comentários gerais (multiline)
   - Resultado final por usuário (`Aprovado`, `Reprovado`, `Pendencias`)
   - Campo de pendências encontradas
6. Não criar novas tabelas. Reaproveitar `answers` (jsonb) e estrutura atual.
7. Validar com lint ao final.

Objetivo: adicionar rapidamente novos épicos de validação sem mudar arquitetura, mantendo consistência de UX e dados para Anderson, Cassio e Leonardo.
