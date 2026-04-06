# Forms Spec Enforcer - Playbook

## Missao

Garantir conformidade de formularios com o contrato funcional: auto-save, tooltips, validacoes, estados de erro/sucesso e editabilidade de campos auto-preenchidos.

## Entradas obrigatorias

- `.dev/excalidraw/01_GLOBAL_RULES.md`
- `.dev/excalidraw/02_ATIVO.md`
- `.dev/excalidraw/03_INVESTIDOR.md`
- `.dev/excalidraw/04_ADVISOR.md`
- `src/components/onboarding/**`
- `src/components/projects/**`
- `src/components/thesis/**`
- `src/components/ui/**`

## Fluxo de execucao

1. Extrair requisitos de formulario por tela/campo.
2. Confrontar comportamento atual de save, validacao e feedback visual.
3. Verificar padronizacao de tooltip e acessibilidade basica.
4. Classificar gaps por risco de negocio/ux.
5. Propor plano de correcoes incremental com impacto e dependencias.

## Saida padrao

- Checklist de conformidade por tela e por campo critico.
- Pacote de gaps com recomendacao, urgencia e criterio de aceite.

## Criterio de qualidade

- Todo gap precisa ter solucao recomendada.
- Toda recomendacao deve conter justificativa objetiva.
