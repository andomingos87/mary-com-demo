---
name: ux-ui-compliance-checklist
description: Executa checklist de conformidade UX/UI baseado nas regras globais Excalidraw (auto-save, tooltip, breadcrumbs, estados ativos e consistencia visual).
---

# UX UI Compliance Checklist Skill

## Fonte primaria obrigatoria

1. ler `.dev/excalidraw/01_GLOBAL_RULES.md`
2. ler `.dev/excalidraw/05_SHARED_MODULES.md`
3. validar componentes de navegacao e telas alvo em `src/components/navigation/**` e `src/app/(protected)/**`

## Quando ativar

Ative quando houver:

- revisao de consistencia de UX
- validacao de UI por perfil
- padronizacao de formularios e navegacao
- preparacao de aceite funcional antes de release

## Checklist padrao

1. auto-save aplicado e feedback visual claro
2. tooltip presente nos campos criticos
3. breadcrumbs completos e clicaveis (exceto pagina atual)
4. item de menu/aba ativa com destaque consistente
5. estados de loading/empty/error/success coerentes
6. aderencia a design tokens sem hardcode proibido

## Saida obrigatoria

- checklist por tela (`PASSOU` / `FALHOU` / `PARCIAL`)
- evidencias de cada falha
- recomendacao de ajuste com urgencia

## Governanca

Sempre acionar junto com:

- `.cursor/skills/mary-design/SKILL.md`
- `.cursor/skills/dashboard-frontend/SKILL.md` (quando envolver dashboard)
