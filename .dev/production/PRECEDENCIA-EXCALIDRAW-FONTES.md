# Precedência entre fontes Excalidraw e escopo V2

**Data:** 2026-04-10  
**Objetivo:** Evitar divergência entre documentos visuais e o que entra no trilho de escala.

## Hierarquia (ordem de precedência)

1. **[`.dev/excalidraw/`](./)** — Fonte de verdade **canônica** do produto (referenciada em [AGENTS.md](../../AGENTS.md) e [6-PRODUCT_BACKLOG_PRIORIZADO.md](./6-PRODUCT_BACKLOG_PRIORIZADO.md)): telas, regras globais e módulos numerados (00_INDEX … 05_SHARED_MODULES).
2. **[`PRD-v3.0-RECONCILIADO.md`](./PRD-v3.0-RECONCILIADO.md)** — Contrato executável campo a campo derivado do Excalidraw oficial.
3. **[`src/docs/Mary-project-mvp-20260410.excalidraw`](../../src/docs/Mary-project-mvp-20260410.excalidraw)** — **Complementa** a visão de “MVP FINAL” e wireframes recentes (rótulos de tela, breadcrumbs de exemplo, regra explícita de Mary AI como **assistente**, não executora, no MVP). Em conflito com `.dev/excalidraw/`, prevalece **`.dev/excalidraw/`** até reconciliação explícita no backlog.
4. **[`src/docs/jornadas-usuario-mary.md`](../../src/docs/jornadas-usuario-mary.md)** — Blueprint de UX por perfil (copy, fluxos, notificações). Onde a jornada pedir rotas dedicadas (`/invest`, `/sell-raise`, `/advise`) e o app usar **`/` + `/signup?profile=`**, tratar como **diferença de URL** a decidir em história (SEO/landing) sem bloquear o núcleo autenticado.

## Itens explícitos fora do trilho “mercado em escala” inicial (V2 / visão)

Conforme jornadas e notas de produto — **não** entram no cronograma de escala até decisão formal:

- Blockchain obrigatório / smart contracts em etapas de deal (mencionado no tripé da jornada).
- Hub global de oportunidades com APIs externas (Cap IQ, Crunchbase, etc.).
- Mary AI **executora** de ações (autopublicação, automações autônomas) — ver [E9](./6-PRODUCT_BACKLOG_PRIORIZADO.md) pós-MVP; MVP = assistente ([Excalidraw `src/docs`](../../src/docs/Mary-project-mvp-20260410.excalidraw), texto “não executora”).
- Clippings de mercado populando Feed (ideia futura na jornada).
- Mensageria interna completa / chat completo — backlog futuro.

## Próximo passo de governança (recomendado)

Se o arquivo em `src/docs/` for elevado a canônico, abrir história única: **“Substituir ou sincronizar `.dev/excalidraw/` com export aprovado 2026-04-10”** e atualizar esta precedência no PRD.
