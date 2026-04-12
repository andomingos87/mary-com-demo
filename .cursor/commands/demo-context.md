# Contexto da página (preparação)

Quando este comando for acionado, o assistente deve **carregar o contexto da página** a partir da **URL obrigatória** que o usuário enviar e **preparar-se para receber instruções** sobre mudanças ou análises nessa tela — sem executar ainda o trabalho completo, salvo se o usuário pedir na mesma mensagem.

## Entrada obrigatória

- **Sempre** incluir a **URL completa** ou, no mínimo, o **path absoluto** (ex.: `http://localhost:3000/demo/asset/projects/tiger` ou `/demo/asset/projects/tiger`).
- Se a URL não vier na mensagem, **parar e pedir** — não inferir rota por suposição.

## Entrada opcional: elemento marcado no browser

O usuário pode colar, junto com a URL, o bloco que o Cursor/browser gera ao inspecionar um nó, por exemplo:

- **DOM Path** (cadeia de seletores / hierarquia)
- **Position** (coordenadas e tamanho)
- **React Component** (nome minificado tipo `_c8` ou nome real, quando disponível)
- **HTML Element** (tag, classes, `data-cursor-element-id`, texto visível)

### Como usar esse bloco

1. Priorizar o **texto visível** e atributos estáveis (`data-*`, rótulos acessíveis) para localizar no código (`rg`/busca).
2. O nome **React Component** em build de produção costuma ser ofuscado — tratar como pista fraca; cruzar com texto/classes.
3. O **DOM Path** ajuda a entender região da árvore (ex.: `main` → grid de cards → segundo card → badges), não copiar seletores frágeis para o código.
4. No resposta ao usuário, **ligar o elemento ao arquivo/trecho** que renderiza aquele conteúdo (ex.: badges “Privado / Restrito / Radar Mary” → dados em `platform-data` + `PanelGrid` / `Badge` em `PlatformDemo.tsx`).

## O que você deve fazer (ordem sugerida)

1. **Normalizar a rota**: remover origin, query e hash; obter o path do App Router (ex.: `/demo/asset/projects/tiger`).
2. **Localizar no código** como essa rota é resolvida:
   - `src/app/**/page.tsx`, `layout.tsx`, route groups `(protected)`, segmentos dinâmicos `[param]`, catch-all `[[...slug]]`, etc.
   - Usar busca no repositório quando o mapeamento não for óbvio.
3. Se houver **elemento marcado**, incorporar na análise: apontar componente e fonte de dados mais prováveis antes das próximas instruções.
4. **Listar os arquivos envolvidos** na renderização dessa página (páginas, layouts, componentes de domínio, dados mock, providers, estilos relevantes).
5. **Ler** os trechos necessários (não o repositório inteiro) para entender: propósito da tela, fluxo de dados (server vs client), e pontos de extensão prováveis.
6. **Responder em português (BR)** com um resumo **curto e acionável**:
   - O que a rota mostra (1–3 frases).
   - Arquivos-chave (paths) e papel de cada um.
   - Se couber, **uma linha** ligando o elemento marcado (se houver) ao trecho de código.
   - Observações úteis (ex.: “100% mock”, “depende de Supabase em X”).
7. **Encerrar** convidando o usuário à próxima instrução **específica** sobre essa página ou sobre o elemento focado.

## O que você não deve fazer por padrão

- Não prosseguir sem URL.
- Não fazer refatorações amplas nem mudanças fora do escopo até o usuário pedir.
- Não criar documentação nova (.md) salvo se o usuário solicitar.
