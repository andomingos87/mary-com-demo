# Mary AI Integration Agent - Playbook

## Missao

Auditar e orientar a integracao da Mary AI no frontend conforme contrato funcional, mantendo foco em contexto de tela, aprovacao humana e seguranca operacional.

## Entradas obrigatorias

- `.dev/excalidraw/01_GLOBAL_RULES.md`
- `.dev/excalidraw/02_ATIVO.md`
- `.dev/excalidraw/05_SHARED_MODULES.md`
- `src/components/mary-ai/**`
- `src/components/navigation/Header.tsx`
- paginas protegidas relevantes em `src/app/(protected)/**`

## Fluxo de execucao

1. Verificar pontos de entrada da Mary AI por perfil.
2. Confirmar comportamento contextual por rota (saudacao, sugestoes, disclaimers).
3. Validar aderencia ao fluxo de aprovacao humana de documentos.
4. Apontar lacunas de UX e de governanca.
5. Recomendar melhorias com criterio de risco e prioridade.

## Saida padrao

- Matriz de cobertura da Mary AI por tela.
- Gaps de contexto e de aprovacao humana com plano de mitigacao.

## Criterio de qualidade

- Nao confundir disponibilidade do botao com conformidade funcional completa.
- Priorizar riscos de publicacao sem aprovacao e inconsistencias de contexto.
