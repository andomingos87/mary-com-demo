---
name: spec-tester
description: "Executa testes automatizados de validação de specs usando Claude in Chrome + Supabase + Desktop Commander. Use SEMPRE que o usuário disser 'testar spec', 'rodar validação', 'executar checklist', 'testar H0.x automaticamente', 'validar no browser', 'rodar testes visuais', ou quando existir um checklist em .dev/validations/ pronto para ser executado. Também use quando o usuário pedir para verificar implementação de qualquer história no browser real. Essa skill complementa a spec-validator: enquanto a spec-validator GERA o checklist, a spec-tester EXECUTA o checklist."
---

# Spec Tester — Execução Automatizada de Validação

Skill que executa checklists de validação contra a aplicação rodando no browser, simulando um QA humano com olhar atento e metódico, usando Claude in Chrome para interação visual e Desktop Commander para operações de sistema.

## Pré-requisitos

- App rodando em `http://localhost:3000`
- Checklist de validação existente em `.dev/validations/H0.X-CHECKLIST-VALIDACAO.md`
- MCPs ativos: Claude in Chrome, Desktop Commander
- Credenciais de teste disponíveis (ver seção de Autenticação)

## Arquitetura de Tools

A skill orquestra 3 camadas de ferramentas, cada uma com papel específico:

### Camada 1 — Interação Visual (Claude in Chrome)
Simula o humano navegando e interagindo com o app.

| Tool | Uso |
|------|-----|
| `tabs_context_mcp` | Obter contexto de abas (SEMPRE chamar primeiro) |
| `tabs_create_mcp` | Criar aba dedicada para testes |
| `navigate` | Navegar para URLs do app |
| `read_page` | Ler árvore de acessibilidade (encontrar elementos, verificar estrutura) |
| `find` | Buscar elementos por linguagem natural ("botão próximo", "campo EBITDA") |
| `form_input` | Preencher campos de formulário |
| `computer` | Clicar, digitar, scrollar, tirar screenshot, hover (para tooltips) |
| `get_page_text` | Extrair texto da página (verificar conteúdo) |
| `read_console_messages` | Verificar erros no console |
| `javascript_tool` | Executar JS na página (verificar state, localStorage, Supabase client) |
| `gif_creator` | Gravar GIF de fluxos complexos como evidência |

### Camada 2 — Verificação de Dados (Supabase via JS)
Valida persistência acessando o Supabase client já carregado no app.

```javascript
// Via javascript_tool no contexto da página do app:
// O app Next.js já tem o Supabase client instanciado

// Consultar dados do onboarding
const { data } = await window.__supabase?.from('organizations')
  .select('onboarding_data, onboarding_step')
  .eq('id', '<org_id>')
  .single();
JSON.stringify(data, null, 2);
```

**Alternativa se __supabase não exposto:** Abrir o Supabase Dashboard (dashboard.supabase.com) em outra aba e consultar via UI.

### Camada 3 — Sistema e Evidências (Desktop Commander)
Operações de arquivo para salvar evidências.

| Tool | Uso |
|------|-----|
| `write_file` | Salvar screenshots e relatórios |
| `read_file` | Ler checklist e specs |
| `start_search` | Buscar arquivos de referência |

---

## Processo de Execução

### Fase 0 — Setup

1. **Ler o checklist:** Carregar `.dev/validations/H0.X-CHECKLIST-VALIDACAO.md`
2. **Ler a spec:** Carregar `.dev/specs/H0.X-*.md` para contexto completo
3. **Inicializar browser:**
   ```
   tabs_context_mcp (createIfEmpty: true)
   tabs_create_mcp → obter tabId
   navigate(url: "http://localhost:3000", tabId)
   ```
4. **Criar pasta de evidências:**
   ```
   .dev/validations/evidence/H0.X/
   ```
5. **Screenshot inicial** da página como baseline

### Fase 1 — Autenticação

O teste suporta dois modos de autenticação:

**Modo A — Usuário novo (teste E2E completo):**
1. Navegar para `/signup`
2. Criar conta com email de teste: `teste-h0x-{timestamp}@test.mary.com`
3. Completar signup → selecionar perfil → seguir fluxo

**Modo B — Usuário existente (teste pontual):**
1. Navegar para `/login`
2. Usar credenciais de teste pré-configuradas
3. Se MFA ativo, usar OTP de dev (`SHOW_MFA_CODE=true` em dev/homologação)

**Decisão:** Perguntar ao usuário qual modo usar antes de iniciar. Para validação de onboarding (H0.1), Modo A é obrigatório.

### Fase 2 — Execução do Checklist

Para cada seção do checklist, seguir este loop:

```
PARA CADA item do checklist:
  1. NAVEGAR para a tela relevante (se necessário)
  2. SCREENSHOT antes da ação
  3. EXECUTAR a verificação:
     - Campo presente? → read_page + find
     - Campo funciona? → form_input + computer (type/click)
     - Tooltip existe? → computer (hover) + screenshot
     - Dados persistem? → javascript_tool (query Supabase)
     - Console limpo? → read_console_messages
  4. SCREENSHOT depois da ação (evidência)
  5. REGISTRAR resultado: [x], [~] ou [ ] com observação
  6. ATUALIZAR o checklist no arquivo
```

### Fase 3 — Verificações Especiais

#### Teste de Auto-save
```
1. Preencher campo com form_input
2. Aguardar 3 segundos (debounce)
3. Verificar feedback visual (✓ verde) via screenshot
4. Recarregar página (navigate para mesma URL)
5. Verificar se dados persistiram (campo preenchido)
```

#### Teste de Tooltips
```
1. Encontrar ícone (?) ao lado do campo via find
2. Hover sobre o ícone via computer(action: "hover")
3. Screenshot para capturar tooltip visível
4. Verificar texto da tooltip vs texto do Excalidraw
```

#### Teste de Navegação entre Steps
```
1. Preencher step atual
2. Avançar via botão "Próximo"
3. Screenshot do novo step
4. Voltar via indicador de progresso (click no step anterior)
5. Verificar dados preservados
```

#### Teste de Persistência no Supabase
```
1. Após preencher formulário, executar via javascript_tool:
   - Verificar organizations.onboarding_data contém campos esperados
   - Verificar onboarding_step está no step correto
   - Verificar timestamps atualizados
```

#### Teste de Responsividade
```
1. resize_window(width: 375, height: 812) — mobile
2. Screenshot
3. Verificar layout não quebra
4. resize_window(width: 1440, height: 900) — desktop
5. Screenshot
```

#### Teste de Regressão
```
1. Logout
2. Login como perfil diferente (Investidor)
3. Verificar que onboarding do Investidor funciona normalmente
4. Screenshot como evidência
5. Repetir para Advisor se aplicável
```

#### Teste de Console Errors
```
1. Em cada tela, após interação:
   read_console_messages(pattern: "error|Error|ERROR|warn", onlyErrors: true)
2. Se encontrar erros, registrar como gap com severidade
```

### Fase 4 — Geração de Evidências

Para cada item verificado, salvar screenshot nomeada:

```
.dev/validations/evidence/H0.X/
  01-estrutura-steps-4-passos.png
  02-passo1-campos-presentes.png
  03-passo1-objetivo-sub-opcoes.png
  04-passo1-setor-multiselect.png
  ...
  20-regressao-investidor-ok.png
```

**Screenshots salvas** com `computer(action: "screenshot", save_to_disk: true)`.

**GIFs para fluxos complexos:** Usar `gif_creator` para gravar:
- Fluxo completo de 4 passos (start_recording → navegar → stop_recording → export)
- Drag & drop no pipeline (se aplicável)
- Transição de Mary AI sidebar (se aplicável)

### Fase 5 — Atualização do Checklist

Após executar todos os itens:

1. **Atualizar cada item** no `.dev/validations/H0.X-CHECKLIST-VALIDACAO.md`:
   - `[x]` para itens conformes
   - `[~]` para parciais (com observação detalhada)
   - `[ ]` para ausentes

2. **Preencher tabela de resumo** com contagens

3. **Marcar resultado final:** APROVADO / APROVADO COM RESSALVAS / REPROVADO

4. **Adicionar seção de evidências** no final do checklist:
   ```markdown
   ## Evidências

   Screenshots salvas em `.dev/validations/evidence/H0.X/`

   | # | Evidência | Arquivo |
   |---|-----------|---------|
   | 1 | Estrutura 4 steps | `01-estrutura-steps-4-passos.png` |
   | 2 | Passo 1 campos | `02-passo1-campos-presentes.png` |
   ...
   ```

5. **Preencher data e validador** (Validador: "Claude AI — spec-tester automatizado")

---

## Regras de Qualidade

### Olhar atento — O que um humano faria que a automação deve replicar:
- Verificar **alinhamento visual** — elementos não estão sobrepostos ou cortados
- Conferir **textos de placeholder** — são informativos, não genéricos
- Checar **estados de loading** — há feedback enquanto dados carregam
- Observar **transições** — são suaves, não abruptas
- Notar **espaçamentos** — consistentes, sem gaps visuais
- Verificar **contraste** — texto legível sobre fundo

### Severidade de gaps encontrados:
- **BLOCKER:** Funcionalidade core quebrada, crash, perda de dados
- **ALTA:** Campo obrigatório ausente, validação não funciona, regressão
- **MÉDIA:** Tooltip ausente, auto-save sem feedback, estilização fora do padrão
- **BAIXA:** Cosmético, placeholder aceitável, melhoria futura

### Quando parar e perguntar ao usuário:
- Login falhou (credenciais inválidas)
- App não está rodando (connection refused)
- Encontrou BLOCKER que impede continuar o fluxo
- Encontrou mais de 5 itens ALTA — perguntar se vale continuar ou corrigir primeiro

---

## Integração com spec-validator

Esta skill é o complemento da `spec-validator`:

```
spec-validator  →  GERA o checklist   →  .dev/validations/H0.X-CHECKLIST-VALIDACAO.md
spec-tester     →  EXECUTA o checklist →  Atualiza o .md + salva evidências em evidence/
```

Se o checklist não existir quando `spec-tester` for chamada, sugerir rodar `spec-validator` primeiro.

---

## Configuração

### Variáveis de ambiente esperadas (dev/homologação)
```
SHOW_MFA_CODE=true          # Exibe OTP na UI para testes
NEXT_PUBLIC_SUPABASE_URL=   # URL do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Chave pública
```

### Credenciais de teste (pedir ao usuário ou ler de .env.test se existir)
```
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
TEST_ORG_ID=
```

---

## Referências

- Playbook de testes por tipo: `references/test-playbooks.md`
- Checklist template: gerado pela skill `spec-validator`
- Specs: `.dev/specs/`
- Excalidraw: `.dev/excalidraw/`
