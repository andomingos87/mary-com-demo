# Pontos da transcrição Cassio/Leo (reunião) — desenvolvimento

Documento extraído e organizado a partir da transcrição em `0. raw/cassio_leo_4.md`.

---

## 1. Contexto: modelo atual (Intralinks / “data room clássico”)

- **Fluxo:** Área interna (preparo) → usuário marca itens com checkbox → “Enviar para diligência” → cópia vai para pasta de diligência (investidor).
- **Cobrança:** Arquivos na área interna não cobram; na pasta de diligência começa o “taxímetro” (ex.: 75 KB = 1 página; 30 GB ≈ 5 mi páginas).
- **Problema:** 100% dos data rooms funcionam com “pastinhas + checklist do investidor”. Cada investidor manda checklist **diferente** (estrutura, ordem, nomes). Exige **depara** pesado (mesmo arquivo em posições diferentes: 3↔5↔7).
- **Conclusão:** Esse é o formato de 10 anos atrás; a Mary pode ser mais moderna e “viva”.

---

## 2. Visão: Data Room “vivo” e adaptativo

- **Objetivo:** Dar “vida” ao negócio: **indexar dados**, tornar o sistema **adaptável** ao contexto.
- **Readiness Score:** Já cobre boa parte do que investidores pedem (regra de Pareto: ~80%+ do que é normalmente exigido).
- **Realidade:** Todo ativo precisa de **flexibilidade** para atender à diligência; cada investidor traz checklist diferente (e isso não vai mudar).

---

## 3. Camadas além da árvore visual: indexação estruturada

- Não só árvore visual: usar **esquema estruturado** com **metadados**.
- **Cada arquivo/informação** deve ter indexação, por exemplo:
  - **Tipo de documento:** financial document, DRE, balanço, folha de funcionários, relatório de vendas, contrato, cliente, etc.
  - **Ano**, **validação** (CL1, CL2, CL3), **categoria**.
- **Metadados obrigatórios** no upload para indexação no banco.
- Campos específicos ainda precisam ser definidos (tipos de documento, categorias, etc.).

---

## 4. Dockling + Markdown → metadados (conexão com Anderson)

- Uso do **Dockling:** lê o arquivo e gera **Markdown**.
- A partir do Markdown: instrução (ex.: prompt/regras) para **extrair e preencher metadados** (cabeçalho, tipo, ano, etc.).
- Isso conecta com a ideia de “jogar no Readiness Score e indexar”: arquivo sobe → vira Markdown → vira metadados → entra no “Google de informações do cliente”.

---

## 5. “Google de informações do cliente”

- Usuário joga “qualquer coisa” no Readiness Score → sistema **indexa e entende** o arquivo.
- Exemplo de uso: “Qual empresa quer pesquisar?” → usuário pergunta (ex.: faturamento de X) → resultado vem **indexado**, com localização (pasta/caminho) já conhecida via metadados + sincronização.
- **Diferencial:** não só repositório de arquivos; **riqueza de dados** para:
  - Criar apresentação com dados evidenciados.
  - Criar documento com dados financeiros, cruzar com demissão, entrada/saída, etc.
  - Reformular relatórios sob demanda → “organismo vivo”.

---

## 6. Motor de mapeamento de checklist (investidor)

- Investidor envia **checklist** (PDF, Excel, etc.).
- **Mary AI** compara o que ele pede com o que **já está indexado**.
- Resultado: “X% já coberto, faltam estes itens” → direciona para Advisor/sócio responder.
- Reduz fricção: não é mais “colocar 100 documentos para chegar a 20”; fica **contextual** e orientado ao que falta.

---

## 7. Score por tese do investidor (V3 / V4)

- O que um **investidor de tech** valoriza ≠ o que um investidor de **ativo (ex.: fazenda)** valoriza.
- **Score deve variar conforme a tese do investidor** (pesos diferentes).
- Cruzamento e priorização diferentes → decisão mais assertiva, menos documentos para analisar (ex.: 5–10 docs prioritários em vez de 100).

---

## 8. UX e adoção: manter referências conhecidas

- **Não remover** a visualização atual do VDR (tabela com prioridade, etc.); é importante para as pessoas e para ações do dia a dia.
- Tudo que é **muito novo** deve ser inserido **aos poucos** para não assustar.
- Quando o usuário perceber que pode “jogar tudo ali” e o trabalho pesado é feito pelo sistema (classificação, indexação), a adoção tende a melhorar.
- Considerar **referências do mercado** na usabilidade:
  - Ex.: “Notebook LLM” onde se joga arquivos e recebe resumo.
  - Ex.: fluxo tipo “ChatGPT” — jogar todos os arquivos e obter resposta.
- Alinhar com **Anderson** a forma como isso aparece na experiência do cliente.

---

## 9. Funcionalidades de inteligência (além de documentação)

- **Q&A** (perguntas e respostas): dinâmico, muita interação.
- **Red flags.**
- **Versionamento** (evitar “vai e volta” de e-mail e planilha V1 vs V1.1.2).
- Não descartar o que já foi construído; dar **“outra roupagem”** (2026, não “dinossauro”), mantendo dados essenciais: responsável, prioridade, data, versionamento.

---

## 10. Posicionamento e ecossistema

- Mary nasce **AI** e **digital**; concorrentes antigos têm estrutura legada e mais dificuldade para migrar.
- Objetivo: **primeira plataforma M&A totalmente digital**; ecossistema “vivo”, não só uma funcionalidade isolada.
- Proposta de valor: reduzir tempo de decisão (ex.: de meses para uma semana), eliminar depara manual e troca de versões por e-mail.

---

## 11. Operacional / técnico (citado na transcrição)

- **Supabase:** menção a “erro” ou alerta sobre regras descobertas; explicado como mudança em regras de **visualização**, não exposição de dados; Anderson deve reverter/ajustar.
- **Linear:** já entendido e em andamento; nada novo a mostrar na reunião.

---

## 12. Próximos passos sugeridos (implícitos na transcrição)

| Item | Ação |
|------|------|
| Metadados e taxonomia | Definir campos específicos (tipos de documento, categorias, CL1/CL2/CL3). |
| Dockling + metadados | Alinhar fluxo: arquivo → Markdown → extração de metadados. |
| Checklist do investidor | Especificar motor de mapeamento (input PDF/Excel → comparação com índice → gaps para Advisor). |
| Score por tese | Especificar pesos/configuração do score por tipo de investidor (V3/V4). |
| UX (Notebook LLM / chat) | Alinhar com Anderson a experiência (upload de arquivos + resumo/respostas). |
| Supabase | Anderson reverter/ajustar regras de visualização que geraram alerta. |

---

*Fonte: `0. raw/cassio_leo_4.md` — processado para uso em desenvolvimento.*
