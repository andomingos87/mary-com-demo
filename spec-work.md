# Spec Workflow — Template Reutilizável

> Template genérico para conduzir qualquer spec (UI, backend, dados, infra, refactor) em 5 fases com pontos de controle explícitos. Cole no início da sessão no Cursor e substitua apenas o placeholder `<CAMINHO-DA-SPEC>`.

---

Você vai me ajudar a implementar a spec `<CAMINHO-DA-SPEC>` seguindo EXATAMENTE estas 5 fases, em ordem, aguardando meu "ok" ao final de cada uma antes de avançar. Nunca pule fases. Nunca escreva código fora da Fase 5.

Fonte de verdade de convenções, arquitetura e estilo: `CLAUDE.md` + `AGENTS.md`. Se houver conflito entre a spec e esses arquivos, pare e me pergunte.

---

## FASE 1 — Leitura + Validação de Entendimento (read-only)

1. Leia a spec completa.
2. Resuma em bullets: objetivo, escopo, critérios de aceite, não-objetivos.
3. Liste EXPLICITAMENTE:
  - (a) Ambiguidades — pontos que admitem mais de uma interpretação
  - (b) Suposições que você fez ao interpretar
  - (c) Pontos onde a spec pode entrar em conflito com o código atual, com o CLAUDE.md, AGENTS.md ou com outras specs já implementadas
4. Pare e aguarde meu "ok Fase 1" com respostas às ambiguidades.

Restrições desta fase:

- Não leia arquivos de código ainda
- Não proponha solução
- Não escreva diff

---

## FASE 2 — Mapeamento de Impacto (read-only)

1. Leia os arquivos/módulos citados na spec + dependências diretas.
2. Entregue um mapa de impacto:
  - Arquivos/módulos a MODIFICAR (com o que muda conceitualmente em cada um)
  - Arquivos/módulos a CRIAR (com propósito)
  - Símbolos/arquivos a DEPRECATED ou REMOVER
  - Dependências cruzadas não óbvias (contextos, hooks, tipos, contratos de API, migrations, jobs, permissões, feature flags)
3. Liste riscos técnicos (regressões possíveis, acoplamentos frágeis, efeitos colaterais em outros domínios).
4. Pare e aguarde meu "ok Fase 2".

Restrições desta fase:

- Ainda sem código, sem diff
- Não altere arquivos

---

## FASE 3 — Checklist de Aceite Testável

1. Traduza cada critério de aceite da spec em itens verificáveis (visual, comportamental, via teste automatizado ou inspeção manual).
2. Acrescente itens de regressão derivados do mapa de impacto da Fase 2.
3. Marque cada item com uma ou mais categorias (use apenas as aplicáveis): `[Funcional]` `[Estado]` `[Dados]` `[UI]` `[A11y]` `[Performance]` `[Segurança]` `[Observabilidade]` `[Compatibilidade]` `[Edge-case]`
4. Esta checklist passa a ser o contrato da implementação — toda fase de código referencia itens dela.
5. Pare e aguarde meu "ok Fase 3".

---

## FASE 4 — Plano em Fases Incrementais

1. Proponha o menor número de fases que mantenha cada uma:
  - Atômica (commitável isoladamente)
  - Testável isoladamente contra itens da checklist da Fase 3
  - Com ordem justificada (por que esta antes daquela)
2. Para cada fase do plano, declare:
  - Arquivos/módulos tocados
  - Nível de risco (baixo/médio/alto) e por quê
  - Itens da checklist que serão cobertos
  - Como validar (comando, teste, verificação manual)
3. Pare e aguarde meu "ok Fase 4".

---

## FASE 5 — Implementação

Execute UMA fase do plano por vez. Ao fim de cada uma:

- Mostre o diff completo
- Marque quais itens da checklist (Fase 3) foram atendidos
- Liste o que ficou pendente e para qual fase seguinte
- Sinalize desvios do plano original com justificativa
- Aguarde meu "ok próxima fase"

Regras durante a implementação:

- Siga rigorosamente CLAUDE.md e AGENTS.md do projeto
- Todo blocker vem com solução proposta + justificativa
- Toda preocupação vem com estratégia de mitigação
- Responda em PT-BR, conciso e direto
- Se descobrir que o plano precisa mudar, pare e me avise antes de executar

---

## Checkpoints de saída (o que devolver a cada "ok")


| Fase | Entregável obrigatório                               |
| ---- | ---------------------------------------------------- |
| 1    | Resumo + ambiguidades + suposições + conflitos       |
| 2    | Mapa de impacto + riscos técnicos                    |
| 3    | Checklist testável com categorias                    |
| 4    | Plano de fases com ordem justificada                 |
| 5    | Diff + cobertura de checklist + pendências, por fase |


