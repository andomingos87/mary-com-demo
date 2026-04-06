# Escopo Contratual Detalhado
## Backend e Banco de Dados Mary AI (MVP v1.0)

## I. Preparação e Planejamento Inicial

- Kick-off técnico: alinhamento de expectativas, revisão de requisitos, definição de principais entregáveis por sprint.
- Documentação inicial: escopo de endpoints, integrações, regras de negócio críticas, fluxograma geral de acesso e controle.

## II. Arquitetura Backend

- Infraestrutura Node.js/TypeScript/Supabase (ou outra stack definida no projeto).
- Organização por módulos (users, advisors, investimentos, pipelines, VDR, empresas).
- Configuração de variáveis de ambiente, secrets e segregação entre ambientes (dev/prod).
- Setup inicial de Edge Functions e triggers automatizadas.

## III. Segurança e Autenticação

- Refatoração das permissões e roles (Investidor, Advisor, Ativo, Admin).
- Policies RLS: configuração e revisão profunda para cada tabela crítica, impedindo acesso indevido (exclusivo via backend).
- MFA integrado (autenticação multifatorial para onboarding).
- Correção de credenciais expostas, logging seguro e rate limiting.
- Auditoria: logs acesso, alteração, ações sensíveis, tentativas de ataque/bypass.

## IV. Onboarding e Validação de Perfis

- Fluxos backend: integração com dados públicos (CNPJ, Receita, IP), evidências de perfil institucional/individual.
- Workflow de verificação híbrida: automação + painel de verificação manual (SLA 48h).
- Políticas de status: pending, verified, rejected, apenas onboarding completo concede acesso total.

## V. Thesis Intelligence e Mary Taxonomy

- Rotina backend para criação, edição e sugestão de tese por IA.
- Estrutura Mary Taxonomy: macrosetores, setores, subsetores com equivalência NAICS/CNAE.
- Algoritmo fit: matching entre investidor e ativo, score de matching, filtros automáticos e rastreáveis.
- Multi-thesis e logical constraints (um advisor = um projeto por vez, ativo pode ter múltiplos advisors).

## VI. Pipeline Operacional e M&A

- API para gerenciamento das etapas pipeline: Teaser, NDA, IOI, Meetings, NBO, DD, SPA, CPs, Closing.
- Automatização dos triggers: avanço de etapa, notificações de evento, sincronização entre usuários envolvidos (ativo, investidor, advisor).
- Uploads/documentos por etapa: versão controlada, acesso segregado (VDR).
- CTAs e restrições/alertas automáticas backend para consistência.

## VII. Gestão de VDR e QA

- Criação segregada do VDR por investidor, controle de acesso granular.
- Backend para workflow de Q&A por documento: perguntas, respostas, estado (open/waiting/resolved), subida de arquivos (RFI), logs de revisão.
- Threads/documentos versionados, rastreabilidade total de alterações (audit log).
- APIs para advisors elevarem status/documentos durante Due Diligence.

## VIII. Banco de Dados

**Estrutura base PostgreSQL/Supabase:**

- Modelagem: UUID como PK, timestamps automáticos, triggers de atualização.
- Normalização: eliminação de duplicidade de tabelas, arrays, campos NULL.
- Constraints: FKs, UNIQUE, CHECK, versionamento, soft delete.
- Indexação de campos consultados, arrays, full-text search.
- Estrutura de roles, mandatos, perfis, taxonomia.
- Documentação técnica do banco (diagrama, descrição de entidades, relacionamentos).
- Implementação do algoritmo de matching IA (weights/config).

## IX. Testes e Validação

- Planejamento e implementação de testes unitários, integração e E2E para rotinas críticas.
- Cobertura mínima exigida: segurança, onboarding, matching, pipeline, uploads, VDR, advisor mandates.
- Setup automatizado de CI/CD e deploy para homologação.

## X. Métricas, KPIs e Relatórios

**Backend para cálculo e exposição de KPIs:**

- Velocity pipeline, porcentagem de progresso, tempo de onboarding, volume de uploads, score de readiness, eficiência matching, conversão leads, histórico advisor/ativo/investidor.
- Rotina para geração de relatórios automatizados mensais (dashboard técnico e business).
