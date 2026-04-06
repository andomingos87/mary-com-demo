# Playbooks de Teste por Tipo de Verificação

Referência rápida com sequências exatas de tools para cada tipo de teste.

---

## 1. Verificar Campo Presente na Tela

**Objetivo:** Confirmar que um campo específico existe e está visível.

```
1. find(query: "campo [nome do campo]", tabId)
   → Se encontrou: ref_id disponível → [x]
   → Se não encontrou: [ ] + obs "Campo ausente"

2. computer(action: "screenshot", tabId, save_to_disk: true)
   → Salvar como evidência
```

---

## 2. Verificar Campo Funcional (Input)

**Objetivo:** Confirmar que um campo aceita dados e se comporta corretamente.

```
1. find(query: "input [nome]", tabId) → ref_id
2. form_input(ref: ref_id, value: "valor de teste", tabId)
3. computer(action: "screenshot", tabId, save_to_disk: true)
4. Verificar se valor aparece no campo
   → Sucesso: [x]
   → Falha (não aceita input, crash): [ ] + obs
```

---

## 3. Verificar Select / Multi-select

**Objetivo:** Confirmar que selects têm as opções corretas.

```
1. find(query: "select [nome]", tabId) → ref_id
2. computer(action: "left_click", ref: ref_id, tabId)
   → Abre dropdown
3. computer(action: "screenshot", tabId, save_to_disk: true)
   → Captura opções visíveis
4. Comparar opções vs spec
5. Selecionar uma opção para confirmar funcionalidade
6. Para multi-select: selecionar 2+ opções e verificar todas marcadas
```

---

## 4. Verificar Tooltip

**Objetivo:** Confirmar tooltip presente com texto correto do Excalidraw.

```
1. find(query: "tooltip icon [campo]" ou "help icon [campo]", tabId)
   → Se ícone (?) não encontrado: [~] + obs "Ícone tooltip ausente"

2. computer(action: "hover", ref: ref_id, tabId)
   → Hover para exibir tooltip

3. computer(action: "wait", duration: 1, tabId)
   → Aguardar tooltip aparecer

4. computer(action: "screenshot", tabId, save_to_disk: true)
   → Capturar tooltip visível

5. get_page_text(tabId) ou read_page(tabId, ref_id: ref_tooltip)
   → Extrair texto da tooltip
   → Comparar com texto esperado do Excalidraw
```

---

## 5. Verificar Auto-save

**Objetivo:** Confirmar que campo salva automaticamente com feedback visual.

```
1. find(query: "input [campo]", tabId) → ref_id
2. form_input(ref: ref_id, value: "teste auto-save", tabId)
3. computer(action: "left_click", coordinate: [area fora do campo], tabId)
   → Perder foco para trigger auto-save

4. computer(action: "wait", duration: 3, tabId)
   → Aguardar debounce (2000ms) + save

5. computer(action: "screenshot", tabId, save_to_disk: true)
   → Verificar se ✓ verde ou indicador de "salvo" aparece

6. navigate(url: "http://localhost:3000/[mesma-pagina]", tabId)
   → Recarregar página

7. find(query: "input [campo]", tabId) → verificar valor preservado
   → Se "teste auto-save" ainda presente: [x]
   → Se vazio: [ ] + obs "Auto-save não persistiu"
```

---

## 6. Verificar Navegação entre Steps

**Objetivo:** Confirmar botões Avançar/Voltar e preservação de dados.

```
1. Preencher campos do step atual (via form_input)
2. find(query: "botão próximo" ou "botão avançar", tabId) → ref_id
3. computer(action: "left_click", ref: ref_id, tabId)
4. computer(action: "wait", duration: 1, tabId)
5. computer(action: "screenshot", tabId, save_to_disk: true)
   → Verificar: novo step carregou

6. find(query: "step [número anterior]" ou "indicador passo [N]", tabId)
7. computer(action: "left_click", ref: ref_step_anterior, tabId)
8. computer(action: "wait", duration: 1, tabId)
9. Verificar dados do step anterior preservados
   → Se preservados: [x]
   → Se perdidos: [ ] + obs "Dados perdidos ao voltar"
```

---

## 7. Verificar Persistência no Supabase

**Objetivo:** Confirmar que dados foram gravados corretamente no banco.

```
1. javascript_tool(action: "javascript_exec", tabId, text: `
   // Tentar acessar Supabase client do app
   const supabase = window.__supabase ||
     window.__NEXT_DATA__?.props?.pageProps?.supabaseClient;

   if (!supabase) {
     'SUPABASE_CLIENT_NOT_FOUND — verificar manualmente no dashboard';
   } else {
     const { data, error } = await supabase
       .from('organizations')
       .select('onboarding_data, onboarding_step')
       .limit(1)
       .single();
     JSON.stringify({ data, error }, null, 2);
   }
`)

2. Analisar resposta:
   - onboarding_data contém campos esperados?
   - onboarding_step é o step correto?
   - Campos não são null?
```

**Fallback se client não acessível:**
```
1. tabs_create_mcp → nova aba
2. navigate(url: "https://supabase.com/dashboard", tabId_novo)
3. Navegar até o projeto → Table Editor → organizations
4. Verificar dados visualmente + screenshot
```

---

## 8. Verificar Responsividade

**Objetivo:** Confirmar layout funciona em mobile e desktop.

```
1. resize_window(width: 375, height: 812, tabId)
   → Simula iPhone 12/13
2. computer(action: "wait", duration: 1, tabId)
3. computer(action: "screenshot", tabId, save_to_disk: true)
   → Verificar: sem overflow, texto legível, botões acessíveis

4. resize_window(width: 768, height: 1024, tabId)
   → Simula tablet
5. computer(action: "screenshot", tabId, save_to_disk: true)

6. resize_window(width: 1440, height: 900, tabId)
   → Volta desktop
7. computer(action: "screenshot", tabId, save_to_disk: true)
```

---

## 9. Verificar Console Errors

**Objetivo:** Confirmar que não há erros no console do browser.

```
1. read_console_messages(tabId, pattern: "error|Error|ERROR|exception|Exception",
   onlyErrors: true, clear: true)

2. Analisar resultado:
   - 0 erros: [x] "Console limpo"
   - Erros de hydration: [~] "Hydration mismatch — baixa severidade"
   - Erros de runtime: [ ] + obs com mensagem de erro
   - Network errors (404, 500): [ ] + obs com endpoint
```

---

## 10. Verificar Regressão de Outros Perfis

**Objetivo:** Confirmar que mudanças não quebraram fluxos de outros perfis.

```
1. Logout do perfil atual:
   find(query: "logout" ou "sair", tabId)
   computer(action: "left_click", ref: ref_logout, tabId)

2. Login como perfil alternativo:
   navigate(url: "http://localhost:3000/login", tabId)
   form_input(ref: ref_email, value: "investidor-teste@test.mary.com", tabId)
   form_input(ref: ref_password, value: "[senha]", tabId)
   computer(action: "left_click", ref: ref_submit, tabId)

3. Verificar dashboard carrega sem erro:
   computer(action: "screenshot", tabId, save_to_disk: true)
   read_console_messages(tabId, pattern: "error", onlyErrors: true)

4. Navegar por telas principais:
   - Teses, Radar, Pipeline
   - Verificar cada uma carrega
```

---

## 11. Gravar GIF de Fluxo Completo

**Objetivo:** Criar evidência animada de um fluxo multi-step.

```
1. gif_creator(action: "start_recording", tabId)
2. computer(action: "screenshot", tabId)  → frame inicial

3. [Executar o fluxo — preencher, clicar, navegar]

4. computer(action: "screenshot", tabId)  → frame final
5. gif_creator(action: "stop_recording", tabId)
6. gif_creator(action: "export", tabId, download: true,
   filename: "H0.X-fluxo-completo.gif")
7. gif_creator(action: "clear", tabId)
```

---

## 12. Verificar Estilização (Design Tokens)

**Objetivo:** Confirmar uso de design tokens do projeto.

```
1. javascript_tool(action: "javascript_exec", tabId, text: `
   // Verificar DM Sans
   const body = getComputedStyle(document.body);
   const fontFamily = body.fontFamily;
   const hasDMSans = fontFamily.includes('DM Sans');

   // Verificar variáveis CSS
   const root = getComputedStyle(document.documentElement);
   const primary = root.getPropertyValue('--primary');
   const foreground = root.getPropertyValue('--foreground');

   JSON.stringify({
     fontFamily,
     hasDMSans,
     cssVars: { primary, foreground }
   }, null, 2);
`)

2. Verificar:
   - DM Sans presente: [x]
   - Variáveis CSS definidas: [x]
   - Se hardcoded: [ ] + obs "Cores hardcoded detectadas"
```

---

## Nomenclatura de Screenshots

Padrão: `{número}-{seção}-{descrição-curta}.png`

Exemplos:
```
01-setup-pagina-inicial.png
02-step1-campos-presentes.png
03-step1-objetivo-dropdown-aberto.png
04-step1-setor-multiselect.png
05-step1-tooltip-descricao.png
06-step2-nota-privacidade.png
07-step2-campos-financeiros.png
08-step2-ebitda-percentual.png
09-step3-socios-editor.png
10-step3-advisor-adicionar.png
11-step4-codinome-input.png
12-step4-modal-parabens.png
13-redirect-mrs.png
14-menu-codinome-dinamico.png
15-mobile-375px.png
16-tablet-768px.png
17-console-limpo.png
18-supabase-dados-persistidos.png
19-regressao-investidor-ok.png
20-regressao-advisor-ok.png
```
