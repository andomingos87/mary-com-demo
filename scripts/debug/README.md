# Scripts de debug (`scripts/debug/`)

Scripts pontuais para diagnóstico e manutenção de autenticação/usuários em ambientes **não produtivos**. Todos usam `SUPABASE_SERVICE_ROLE_KEY` e podem **criar, listar ou apagar usuários** no projeto Supabase configurado no `.env`.

Execute a partir da **raiz do repositório**.

---

## `cleanup-corrupted-user.ts`

**Objetivo:** Investigar um email de teste fixo (`dev.test@mary.ai`), consultar `profiles`, tentar `exec_sql` (se existir no projeto) e, em seguida, garantir um usuário alternativo `dev.admin@mary.ai` com senha fixa no script, validando login.

**Quando usar:** Base de dev/test com usuário inconsistente ou quando precisar de credenciais alternativas após falhas no fluxo principal.

**Execução:**

```bash
npx tsx scripts/debug/cleanup-corrupted-user.ts
```

**Cuidados:** Usa service role; pode deletar e recriar usuário `dev.admin@mary.ai`. Imprime senha no console. Não rodar em produção.

---

## `debug-auth.ts`

**Objetivo:** Diagnóstico de autenticação (env, conexão ao banco, listagem de usuário de teste, login com anon key, ciclo criar/login/apagar usuário temporário).

**Quando usar:** Erros do tipo “Database error querying schema”, login quebrado em dev, ou checagem rápida de keys e Supabase Auth.

**Execução:**

```bash
npx tsx scripts/debug/debug-auth.ts
```

**Cuidados:** Pode criar e apagar um usuário com email `test-<timestamp>@mary.ai`. Não logar segredos em ambientes compartilhados; preferir projeto de homologação.

---

## `fix-user.ts`

**Objetivo:** Remove o usuário `dev.test@mary.ai` (se existir), recria com senha fixa no script e valida login com anon key.

**Quando usar:** Usuário de teste corrompido (ex.: sem identities) após migrações ou testes manuais.

**Execução:**

```bash
npx tsx scripts/debug/fix-user.ts
```

**Cuidados:** Deleta o usuário alvo antes de recriar. Credenciais fixas no código; apenas dev/test.

---

## `test-new-user.ts`

**Objetivo:** Cria um usuário com email único (`mary-test-<timestamp>@test.com`), testa `signInWithPassword` e remove o usuário.

**Quando usar:** Smoke test rápido de Admin API + login após mudanças em Auth ou env.

**Execução:**

```bash
npx tsx scripts/debug/test-new-user.ts
```

**Cuidados:** Escreve e apaga na Auth; requer `SUPABASE_SERVICE_ROLE_KEY` e variáveis públicas do Supabase no `.env`.

---

### Variáveis de ambiente comuns

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Confirme o `.env` antes de executar qualquer script desta pasta.
