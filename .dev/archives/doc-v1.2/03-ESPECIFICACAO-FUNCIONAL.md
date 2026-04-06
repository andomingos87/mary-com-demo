# 03 — Especificação Funcional

> **Ref:** [MASTER.md](./MASTER.md)
> **Público-alvo:** Produto + Engenharia

---

## 1. Autenticação e Segurança

> **Status:** ✅ Implementado (Marco 1)

### 1.1 MFA (Multi-Factor Authentication)

| Requisito | Especificação |
|-----------|---------------|
| Provider | WhatsApp Business API (SMS mock até credenciais reais) |
| Obrigatoriedade | Todos os perfis |
| OTP | 6 dígitos, expira em 5 minutos, máx 3 tentativas |
| Alternativas | Nenhuma no MVP |

### 1.2 Gestão de Sessões

| Requisito | Especificação |
|-----------|---------------|
| Expiração | 24 horas |
| Sessões simultâneas | Não permitido (sessão anterior invalidada) |
| Refresh token | Sim, com rotação automática |
| Implementação | Server Actions (migrado de API Routes — BUG-001 resolvido) |

### 1.3 Recuperação de Conta

| Requisito | Especificação |
|-----------|---------------|
| Canal | Apenas e-mail |
| Expiração do link | 15 minutos |
| Limite | 3 tentativas por hora |

### 1.4 Segurança Adicional

- Notificação de novo dispositivo (e-mail/WhatsApp)
- Detecção de login de país diferente (heurística IP/Geo)
- Rate limiting em login, MFA e recovery
- Audit log de todas as tentativas

---

## 2. Organizações e RBAC

> **Status:** ✅ Implementado (Marco 1)

### 2.1 Hierarquia de Papéis

| Papel | Descrição |
|-------|-----------|
| **Owner** | Controle total da organização |
| **Admin** | Gestão de membros e configurações |
| **Member** | Acesso a funcionalidades operacionais |
| **Viewer** | Apenas visualização |

### 2.2 Multi-perfil

Usuário pode ter múltiplos perfis em contas diferentes (ex: Investidor em uma organização e Advisor em outra).

### 2.3 Convites

- Expiração: 7 dias
- Token único gerado automaticamente
- Herança de verificação: novos membros da organização verificada herdam status

### 2.4 Estados de Verificação

| Status | Acesso |
|--------|--------|
| `pending` | Onboarding completo, modo leitura-only |
| `verified` + `completed` | Acesso total ao dashboard |
| `rejected` | Modo observador + possibilidade de appeal |

---

## 3. Onboarding

> **Status:** ✅ Implementado (Marco 1) — Será simplificado pelo pivot

### 3.1 Versão atual (implementada)

Wizard de 6+ steps com enriquecimento automático:
- Seleção de perfil → CNPJ → Confirmação de dados → Detalhes do perfil → Elegibilidade → Termos

Integrações: BrasilAPI (CNPJ), Jina.ai (scraping), Clearbit (logo), CVM, ViaCEP, OpenAI (descrição).

### 3.2 Nova versão (pivot)

**Investidor:** 2 etapas
1. Criação da tese de investimento
2. Dados financeiros essenciais

**Ativo:** Pré-cadastro + onboarding em 4 passos
1. Dados base e objetivo da empresa (vender/captar)
2. Contexto financeiro e transacional
3. Definição de advisor (já possui, quer indicação, ou seguir sem advisor)
4. Codinome do projeto + aceite de termos

Após concluir onboarding do ativo:
- acesso à plataforma é liberado;
- investigação/dossiê inicial da Mary roda em background;
- usuário segue navegando sem bloqueio.

**Impacto:** Reduz atrito, mantém enriquecimento automático como suporte.

---

## 4. MRS — Market Readiness Score

> **Status:** ⚠️ Parcialmente implementado (interface com dados mock)
> **Detalhes completos:** [02-ARQUITETURA-EXPERIENCIA.md](./02-ARQUITETURA-EXPERIENCIA.md) seção 3

### Requisitos funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-MRS-001 | Score total 0-100 calculado por cobertura + peso por passo | P0 |
| RF-MRS-002 | Radar chart com 8 eixos temáticos | P0 |
| RF-MRS-003 | Tabela hierárquica de 3 níveis (tema → item → dropzone) | P0 |
| RF-MRS-004 | 4 passos de criticidade com progressão visual | P0 |
| RF-MRS-005 | Upload via DropZone com análise automática da Mary AI | P1 |
| RF-MRS-006 | Recálculo de score ao validar/adicionar documentos | P0 |
| RF-MRS-007 | Benchmark setorial (placeholder "Em breve") | P2 |
| RF-MRS-008 | Integração com VDR para persistência | P0 |
| RF-MRS-009 | Gate de acesso por etapa: NDA libera passos 1-2; NBO libera passos 3-4 | P0 |
| RF-MRS-010 | Controle de exibição por investidor conforme etapa contratual | P0 |

---

## 5. VDR — Virtual Data Room

### 5.1 VDR Core do Ativo

> **Status:** ✅ Implementado (Marco 2 — 37 componentes, ~50 server actions)

| Funcionalidade | Status |
|----------------|--------|
| Pastas padrão (Financeiro, Jurídico, Operacional, Comercial, RH, Outros, Estratégia) | ✅ |
| Pastas customizadas (CRUD, não pode remover padrão) | ✅ |
| Documentos como links + upload de arquivos | ✅ |
| Campos: título, descrição, visibilidade, responsável, prioridade, status, prazo | ✅ |
| Comentários por item (sidebar) + histórico | ✅ |
| Validação N1/N2/N3 por perfil + histórico | ✅ |
| Readiness Score recalculado ao validar | ✅ |
| Links compartilháveis (UUID + expiração + revogação) | ✅ |
| Log de visualização (quem/quando/duração) | ✅ |
| Anti-print (mitigação + registro) | ✅ |
| Permissões granulares (visualizar/comentar/editar) | ✅ |
| Analytics/Engagement Dashboard | ✅ |
| Bulk actions | ✅ |

### 5.2 VDR Investidor (Espelho)

> **Status:** ❌ Pendente — Blocker para Marco 2

| Requisito | Prioridade | Status |
|-----------|------------|--------|
| DR espelhado criado após NDA signed | P0 | ❌ |
| Herda estrutura + links (somente leitura) | P0 | ❌ |
| Isolamento por par Projeto × Investidor | P0 | ⚠️ |
| Q&A por item no espelho | P1 | ❌ |
| Solicitações de documentos adicionais | P1 | ❌ |
| Marcações privadas do investidor | P2 | ❌ |
| Notificação de documentos atualizados | P2 | ❌ |

**Regras:**
1. Espelho é cópia de referência (links apontam para mesmos docs)
2. Ativo controla quais documentos são visíveis
3. Novos docs no VDR original não aparecem automaticamente (opt-in)
4. Espelho é imutável pelo investidor

### 5.3 Armazenamento

| Aspecto | Especificação |
|---------|---------------|
| Limite por conta/projeto | 50GB |
| Limite por arquivo | A definir no kickoff operacional (baseado em telemetria de uso) |
| Formatos prioritários MVP | PDF, DOC/DOCX, XLS/XLSX, TXT e equivalentes textuais |
| Formatos fora de foco inicial | Áudio, vídeo e imagem não estruturada |
| MVP | Links externos + upload básico |
| Volume esperado | 200-300 documentos por projeto |

### 5.4 Mais Infos (data room complementar)

| Requisito | Prioridade | Status |
|-----------|------------|--------|
| Área para documentos fora da taxonomia MRS | P0 | ⚠️ Parcial |
| Compartilhamento granular (investidor específico ou todos) | P0 | ❌ |
| Uso para diligência adicional e Q&A | P1 | ❌ |
| Histórico de compartilhamento por item | P1 | ❌ |

---

## 6. NDA (Non-Disclosure Agreement)

> **Status:** ❌ Pendente — Pré-requisito para DR espelhado

### Fluxo V1 (manual)

1. Investidor clica "Prosseguir" no Teaser/Radar
2. Upload do NDA assinado (PDF ou URL)
3. Advisor/Ativo revisa e marca como `signed`
4. Sistema cria DR espelhado automaticamente

### Variação em decisão (assinatura eletrônica)

- Existe decisão crítica em aberto para integrar assinatura eletrônica no MVP mínimo (ex.: Clicksign).
- Recomendação atual: iniciar por NDA e NBO para garantir trilha jurídica/auditoria.
- Até decisão final, manter fluxo manual como fallback obrigatório.

### Regras

- Um NDA por par `(project_id, investor_org_id)`
- Apenas Advisor ou Owner pode marcar como `signed`
- Investidor não pode marcar seu próprio NDA
- NDA `pending` não dá acesso ao DR
- NDA pode ser revogado (remove acesso ao espelho)

---

## 7. Teaser

> **Status:** ❌ Pendente

### Definição

Visão resumida pré-NDA do projeto. Empresa apresentada em **sigilo** (usa codename, sem nome real).

### Formato

- **Scrollável em HTML** (não PDF)
- Compartilhável via **link rastreável** (padrão DocSend)
- Responsivo, sem possibilidade de download

### Conteúdo padrão

Resumo, mercado, TAM/SAM/SOM, highlights, números-chave, próximos passos.

### Geração

- IA gera versão inicial (requer Readiness > 30%)
- Revisão humana obrigatória (ativo/advisor)
- Apenas 1 teaser ativo por projeto
- Teaser expirado/revogado sai do Radar

### Tracking

- Quem viu, quais seções, tempo gasto
- Analytics por investidor (estilo DocSend)

---

## 8. Thesis e Matching Engine

> **Status:** ❌ Pendente — Blocker para Marco 2

### 8.1 Tese de Investimento

| Campo | Descrição |
|-------|-----------|
| Setores | MAICS L1/L2/L3 (interesse + exclusões) |
| Ticket | Range mín/máx em USD |
| Geografia | Regiões/estados alvo + exclusões |
| Objetivos | Aquisição, minoria, maioria, etc. |
| Exclusões | Setores, geo, tamanho (prioridade absoluta) |
| Readiness mínima | Score MRS mínimo |

Múltiplas teses por organização (ativo/inativo). Tese inativa não participa do matching.

### 8.2 Matching Engine v0 (determinístico)

| Critério | Peso |
|----------|------|
| Setor/Taxonomia | 30% |
| Ticket (min/max) | 25% |
| Geografia | 15% |
| Readiness (% L2+) | 15% |
| Faixas operacionais | 15% |

**Score:** 0-100 por par (tese × projeto)

**Regras:**
- Exclusões são absolutas → score = 0
- Matching só entre teses ativas e projetos com Readiness ≥ 70%
- Projetos do mesmo investidor nunca aparecem
- Recalcula ao alterar tese, dados do projeto ou validar documentos
- Scores persistidos na tabela `matches`
- Pesos ajustáveis pelo Admin Mary

### 8.3 Explicabilidade

- **Top 3 razões** do match (texto legível)
- **Breakdown** por critério (JSON)
- Performance: < 2 segundos

### 8.4 Radar de Oportunidades

- Lista de projetos ranqueada por score
- Filtros: setor, ticket, geografia, score mínimo
- Apenas projetos com teaser publicado e Readiness ≥ 70%
- Ações: Ver Teaser → Prosseguir (NDA) → Dismiss

---

## 9. Pipeline

> **Status:** ❌ Pendente (Marco 3)

### 9.1 Etapas (simplificadas no pivot)

Marcos essenciais: **Teaser visualizado → NDA assinado → NBO (oferta) → SPA (fechamento)**

Etapas completas V1:
```
Screening → Teaser → NDA → Pré-DD/Q&A → IOI → Análise → NBO/Term Sheet → DD+SPA → Signing → CPs → Closing → Disclosure → Encerrado/Declinado
```

### 9.2 Espelhamento

- Cada par Projeto × Investidor = ticket no Kanban
- Atualizações do investidor no kanban sincronizam a visão de acompanhamento do ativo/advisor
- Regras de transição com checks + automação de prazos

### 9.3 Regras

- Kanban é controlado pelo investidor no lado buy-side
- Ativo/Advisor acompanham evolução e respondem checkpoints/documentos
- Formulário obrigatório na Proposta/IOI (valor, %, prazo, termos)
- Prazos configuráveis por fase com alertas automáticos
- Histórico de mudanças auditável

---

## 10. Mary AI

> **Status:** ❌ Pendente (Marco 3)

### 10.1 Posicionamento (pivot)

**Copiloto contextual** especializado em M&A:
- Sugere, orienta, resume e recomenda
- Usa contexto do ativo/projeto
- **Não executa ações finais automaticamente** no MVP

### 10.2 Mary AI Public (pré-login)

- FAQ, onboarding, pricing, educação
- Sem dados sensíveis
- Sem captura de leads

### 10.3 Mary AI Private (logada)

- Contexto do projeto/workspace ativo
- Isolamento total entre projetos
- Guardrails de segurança obrigatórios

### 10.4 RAG

- Ingestão: metadados VDR, Q&A, pipeline, campos do projeto
- Retrieval + citações internas
- Fallback: se IA não resolve → solicitação ao responsável

### 10.5 Geração de Documentos

| Documento | Descrição |
|-----------|-----------|
| **Teaser** | Resumo pré-NDA gerado pela IA com revisão humana |
| **CIM** | Confidential Info Memo (24-60 págs) com curadoria obrigatória |
| **Valuation** | Múltiplos automáticos + metodologia explicada |

Fluxo: IA gera → Sócios revisam → Advisor valida → Publica (link rastreável, não PDF).

### 10.6 Investigação automática (dossiê)

Pós-onboarding: deep search sobre CNPJ (website, LinkedIn, notícias, reputação). Documento estruturado ~16 páginas em ~20 minutos. Alimenta RAG + matching + features.

### 10.7 Limites

| Aspecto | Especificação |
|---------|---------------|
| LLM Principal | OpenAI (ChatGPT) |
| Fallback | OpenRouter (Claude, Gemini, Grok) |
| Rate limiting | 10 perguntas/minuto |
| Estratégia | RAG (sem fine-tuning no MVP) |
| Arquitetura | Banco IA separado do Supabase principal (UUID como elo) |

---

## 11. Notificações

> **Status:** ❌ Pendente (Marco 3)

### Canais

| Canal | Provider |
|-------|---------|
| In-app | Sistema interno |
| E-mail | Brevo (ou similar) |
| WhatsApp | API oficial (quando credenciais disponíveis) |

### Eventos

| Evento | Prioridade |
|--------|------------|
| NDA assinado | P0 |
| Mudança de etapa Pipeline | P0 |
| Novo item/alteração no DR | P1 |
| Nova pergunta/resposta Q&A | P1 |
| Menção em comentário | P2 |
| Novo match relevante | P2 |
| Digest semanal de engajamento (e-mail) | P1 |

Controle de silenciamento por usuário (toggle simples).

---

## 12. Pagamentos

> **Status:** ❌ Pendente (Marco 3)

| Funcionalidade | Especificação |
|----------------|---------------|
| Gateway | Stripe |
| Planos | Free / Pro / Premium |
| Free | 1 projeto ativo |
| Recorrência | Assinaturas (cartão de crédito) |
| Desconto anual | Sim (% a definir) |
| Cobrança | Por organização |
| Success Fee | Tracking no pipeline (sem automação fiscal no MVP) |
| Nota Fiscal | Não automática no MVP |

---

## 13. Requisitos Não-Funcionais

### Performance

| Métrica | Target |
|---------|--------|
| Uptime | 99% |
| Matching | < 2 segundos |
| Mary AI | < 5 segundos |
| Usuários MVP | ~100 |
| Deals simultâneos | ~50 |

### Infraestrutura

| Aspecto | Especificação |
|---------|---------------|
| Região | Brasil (São Paulo) |
| CDN | Sim |
| Staging | Ambiente separado |
| Deploy | Automático via Vercel |

### Compliance (LGPD)

| Requisito | Especificação |
|-----------|---------------|
| Portabilidade | Sim (detalhes a definir) |
| Exclusão | Até 5 dias úteis |
| Termos de Uso | Já redigidos |
| Política de Privacidade | Já redigida |
| Versionamento com re-aceite | Sim |
| Logs/auditoria | Retenção por tempo indeterminado, exportáveis |

### Internacionalização

| Aspecto | Especificação |
|---------|---------------|
| Rotas | 100% EN-US |
| Conteúdo | PT-BR |
| i18n futuros | PT, EN, ES, FR (depois: DE, JA, ZH) |

---

## 14. Critérios de Aceite por Fluxo Crítico (Gate M2)

> **Ref:** [09-MATRIZ-RASTREABILIDADE.md](./09-MATRIZ-RASTREABILIDADE.md)
> **Objetivo:** remover ambiguidade entre produto, engenharia e QA antes do desenvolvimento pleno.

| Fluxo | Cenário de aceite (positivo) | Cenário de rejeição (negativo) | Evidência obrigatória |
|---|---|---|---|
| Investidor: tese -> radar -> teaser -> NDA -> DR espelhado | Investidor com tese ativa visualiza oportunidades aderentes, assina NDA e acessa apenas seu DR espelhado | Investidor sem NDA ou com tese inativa não acessa DR espelhado | Log de autorização + resultado E2E multi-perfil |
| Ativo: onboarding -> MRS -> teaser -> compartilhamento controlado | Ativo conclui onboarding, evolui MRS e publica teaser sem dados sensíveis | Teaser com dado sensível ou readiness abaixo do mínimo não publica | Checklist de teaser + evento de publicação |
| Advisor: curadoria -> validação -> handoff contextual | Advisor vinculado no lado correto valida documentos e apoia etapa sem conflito | Advisor em conflito sell/buy é bloqueado | Evento `advisor.conflict_blocked` no audit log |
| Gate de acesso MRS por contrato | NDA signed libera passos 1-2; NBO signed libera passos 3-4 | Sem NDA/NBO, sistema bloqueia acesso aos passos não autorizados | Captura de tela + log de bloqueio/liberação |
| Matching determinístico v0 | Exclusões absolutas forçam score 0 e ranking respeita filtros | Projeto fora da tese aparece no radar | Breakdown JSON salvo em `matches` + teste de regra |

### Definição objetiva de pronto para M2

- 100% dos fluxos acima com cenário positivo e negativo validados.
- Nenhum bug P0/P1 aberto nos fluxos críticos.
- Evidências publicadas no checkpoint da sprint.
