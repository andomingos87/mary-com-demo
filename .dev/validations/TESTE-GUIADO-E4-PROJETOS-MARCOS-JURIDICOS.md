# Teste Guiado — E4: Projetos com Marcos Jurídicos

**Data:** 06/04/2026
**Status do Épico:** Concluído
**Objetivo:** Validar o pipeline de projetos com suas fases, transições e condições jurídicas (gates).

---

## O que é este épico?

O Épico 4 implementou o **pipeline de projetos** com marcos jurídicos. Um projeto na Mary AI representa a relação entre um Ativo (empresa) e investidores interessados. O pipeline organiza essa relação em **12 fases** que vão desde o envio do Teaser até o Disclosure (divulgação do deal). Algumas fases possuem **gates** — condições obrigatórias que precisam ser atendidas para avançar (ex: NDA assinado antes de acessar informações confidenciais).

---

## O que você deve conseguir fazer

- Visualizar o pipeline com todas as 12 fases em formato kanban (colunas).
- Criar um projeto vinculando um Ativo a investidores.
- Movimentar investidores entre fases (arrastar cards ou botões de avanço).
- Verificar que gates jurídicos bloqueiam avanço quando não atendidos.
- Ver o histórico de transições de um investidor no pipeline.

---

## Checklist de Validação (10 tarefas)

Marque cada item após testar. Se encontrar problema, descreva brevemente ao lado.

| # | Tarefa | OK? | Observação |
|---|--------|-----|------------|
| 1 | Acesse a seção **Pipeline** (ou o projeto específico). Verifique se o kanban carrega com as **12 colunas de fases** visíveis: Teaser Enviado, NDA, Screening, CIM/DFs, IoI, Management Meetings, DD/SPA, NBO, Signing, CPs, Closing, Disclosure. | ☐ | |
| 2 | Verifique se existem também as fases especiais **Fechado** e **Perdido** visíveis (como saídas laterais). | ☐ | |
| 3 | Verifique se cada coluna exibe os **cards de investidores** que estão naquela fase. | ☐ | |
| 4 | Tente **arrastar um card** de investidor de uma fase para a fase seguinte (ex: de "Teaser Enviado" para "NDA"). Confirme que a movimentação funciona. | ☐ | |
| 5 | Tente mover um card **pulando fases** (ex: direto de "Teaser" para "Screening", sem passar por "NDA"). Verifique se o sistema **bloqueia** ou exige condições. | ☐ | |
| 6 | Verifique o **gate NDA**: tente avançar um investidor além de NDA sem que o NDA esteja marcado como assinado. O sistema deve impedir ou alertar. | ☐ | |
| 7 | Mova um investidor para a fase **Perdido**. Confirme que o card sai do fluxo principal e aparece em "Perdido". | ☐ | |
| 8 | Verifique se existe um **histórico de transições** visível (quando o investidor mudou de fase, data/hora). | ☐ | |
| 9 | Verifique se as **12 colunas** são navegáveis mesmo em telas menores (scroll horizontal ou adaptação responsiva). | ☐ | |
| 10 | Crie ou visualize um projeto e confirme que o **nome/codinome do projeto** aparece corretamente no pipeline e no menu lateral. | ☐ | |

---

## Como reportar problemas

Para cada item com problema, informe:
1. **Qual item** falhou (número).
2. **O que esperava** ver.
3. **O que viu** de fato.
4. **Screenshot** (se possível).
