#!/usr/bin/env node
/**
 * Remove usuários e todos os dados ligados a um domínio de e-mail (ex.: andersondomingos.com.br).
 *
 * Requer conexão direta ao Postgres do Supabase (não usa MCP).
 * Variável de ambiente: DATABASE_URL ou SUPABASE_DATABASE_URL (URI com senha, modo SSL).
 * Obtenha em: Supabase Dashboard → Project Settings → Database → Connection string (URI).
 *
 * Uso:
 *   node scripts/delete-users-by-domain.mjs <domínio>           # dry-run (só lista)
 *   node scripts/delete-users-by-domain.mjs <domínio> --execute # apaga de verdade
 *
 * Exemplos (bash / cmd):
 *   node scripts/delete-users-by-domain.mjs @andersondomingos.com.br
 *   npm run delete-users-by-domain -- construtora.ia.br --execute
 *
 * PowerShell: o `@` é operador — use aspas ou omita o @:
 *   npm run delete-users-by-domain -- "@andersondomingos.com.br"
 *   npm run delete-users-by-domain -- andersondomingos.com.br
 *
 * Conexão Postgres (uma das opções):
 *   - DATABASE_URL ou SUPABASE_DATABASE_URL (URI completa do Dashboard → Database)
 *   - Ou NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD (senha do banco em Settings → Database)
 */

import { config } from 'dotenv';
import pg from 'pg';

config();

const { Client } = pg;

/**
 * Extrai o project ref de https://xxxx.supabase.co
 * @param {string} supabaseUrl
 */
function extractProjectRef(supabaseUrl) {
  try {
    const host = new URL(supabaseUrl).hostname;
    const m = host.match(/^([^.]+)\.supabase\.co$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Resolve connection string: URI explícita ou montagem com URL pública + senha do DB.
 */
function resolveDatabaseUrl() {
  const direct =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED;

  if (direct) return direct;

  const pw =
    process.env.SUPABASE_DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.DATABASE_PASSWORD;

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (pw && publicUrl) {
    const ref = extractProjectRef(publicUrl);
    if (ref) {
      const pass = encodeURIComponent(pw);
      // Sem sslmode na URI: o driver + `ssl.rejectUnauthorized` abaixo evitam erro de cadeia (proxy/corp, pg 8+)
      return `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`;
    }
  }

  return null;
}

/**
 * Remove sslmode/ssl da query — com `sslmode=require` o pg 8+ pode forçar verificação e falhar com
 * "self-signed certificate in certificate chain" em alguns ambientes Windows/rede corporativa.
 */
function stripSslParamsFromConnectionString(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete('sslmode');
    u.searchParams.delete('ssl');
    let s = u.toString();
    if (s.endsWith('?')) s = s.slice(0, -1);
    return s;
  } catch {
    return url
      .replace(/([?&])sslmode=[^&]*/gi, '$1')
      .replace(/([?&])ssl=[^&]*/gi, '$1')
      .replace(/\?&/, '?')
      .replace(/[?&]$/, '');
  }
}

function printDatabaseUrlHelp() {
  console.error(`
Nenhuma URL de Postgres encontrada. Defina no .env (raiz do projeto), por exemplo:

  1) URI completa (recomendado)
     Supabase → Project Settings → Database → Connection string → URI
     DATABASE_URL=postgresql://postgres.[ref]:[SENHA]@aws-0-....pooler.supabase.com:6543/postgres

  2) Senha do banco + URL que o app já usa
     SUPABASE_DB_PASSWORD=[senha em Database → Database password]
     (junto com NEXT_PUBLIC_SUPABASE_URL que o .env normalmente já tem)

Variáveis aceitas como URI: DATABASE_URL, SUPABASE_DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING.
`);
}

function normalizeDomain(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let d = raw.trim();
  if (d.startsWith('@')) d = d.slice(1);
  return d.toLowerCase() || null;
}

function isValidDomain(d) {
  // Domínio simples: letras, números, pontos e hífens; pelo menos um ponto (TLD)
  return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(d);
}

function parseArgs(argv) {
  const args = argv.slice(2).filter((a) => a !== '--execute');
  const execute = argv.includes('--execute');
  const domainArg = args[0];
  return { domainArg, execute };
}

async function dryRun(client, domain) {
  const { rows: users } = await client.query(
    `SELECT id, email, created_at FROM auth.users
     WHERE email ILIKE '%@' || $1::text
     ORDER BY email`,
    [domain]
  );

  const { rows: orgCount } = await client.query(
    `SELECT COUNT(*)::int AS n FROM public.organizations o
     WHERE o.created_by_user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR EXISTS (
          SELECT 1 FROM public.organization_members om
          WHERE om.organization_id = o.id
            AND om.user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        )`,
    [domain]
  );

  const { rows: rateRows } = await client.query(
    `SELECT id, identifier, action FROM public.rate_limits
     WHERE identifier ILIKE '%@' || $1::text`,
    [domain]
  );

  return { users, orgCount: orgCount[0]?.n ?? 0, rateRows };
}

async function runDelete(client, domain) {
  /** @param {string} text */
  const raw = (text) => client.query(text);
  const q = (text, params = [domain]) => client.query(text, params);

  await raw('BEGIN');

  try {
  await raw(
    `ALTER TABLE public.organization_members DISABLE TRIGGER trigger_validate_owner_removal`
  );

  await q(
    `DELETE FROM public.audit_logs
     WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR organization_id IN (
          SELECT DISTINCT o.id FROM public.organizations o
          WHERE o.created_by_user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
             OR EXISTS (
               SELECT 1 FROM public.organization_members om
               WHERE om.organization_id = o.id
                 AND om.user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
             )
        )
        OR metadata::text ILIKE '%@' || $1::text || '%'`
  );

  await q(
    `DELETE FROM public.user_sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.otp_codes WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.known_devices WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.whatsapp_messages WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );

  await q(
    `DELETE FROM public.organizations
     WHERE id IN (
       SELECT DISTINCT o.id FROM public.organizations o
       WHERE o.created_by_user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
          OR EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = o.id
              AND om.user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
          )
     )`
  );

  await q(
    `DELETE FROM public.user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );

  await q(
    `DELETE FROM public.rate_limits WHERE identifier ILIKE '%@' || $1::text`
  );

  await q(
    `DELETE FROM public.eligibility_reviews
     WHERE submitted_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR reviewed_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.investment_theses
     WHERE created_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR updated_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.investor_follows
     WHERE created_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR updated_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.nda_requests
     WHERE requested_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR reviewed_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)
        OR updated_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.investor_theses
     WHERE created_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.project_invites
     WHERE invited_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.project_members
     WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.organization_invites
     WHERE invited_by IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );
  await q(
    `DELETE FROM public.organization_members
     WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%@' || $1::text)`
  );

  await q(
    `DELETE FROM auth.users WHERE email ILIKE '%@' || $1::text`
  );

  await raw(
    `ALTER TABLE public.organization_members ENABLE TRIGGER trigger_validate_owner_removal`
  );

  await raw('COMMIT');
  } catch (err) {
    try {
      await raw('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  }
}

async function main() {
  const { domainArg, execute } = parseArgs(process.argv);
  const domain = normalizeDomain(domainArg);

  if (!domain || !isValidDomain(domain)) {
    console.error(
      'Uso: node scripts/delete-users-by-domain.mjs <domínio> [--execute]\n' +
        'Ex.: node scripts/delete-users-by-domain.mjs andersondomingos.com.br\n' +
        'PowerShell: aspas se usar @ → npm run delete-users-by-domain -- "@dominio.com"\n' +
        '     ou: npm run delete-users-by-domain -- andersondomingos.com.br --execute'
    );
    process.exit(1);
  }

  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    printDatabaseUrlHelp();
    process.exit(1);
  }

  const connectionString = stripSslParamsFromConnectionString(databaseUrl);
  const isLocal =
    /localhost|127\.0\.0\.1/i.test(connectionString) &&
    !/supabase\.co|pooler\.supabase/i.test(connectionString);

  const client = new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const preview = await dryRun(client, domain);

    console.log(`\nDomínio: @${domain}`);
    console.log(`Usuários em auth.users: ${preview.users.length}`);
    preview.users.forEach((u) => console.log(`  - ${u.email} (${u.id})`));
    console.log(`Organizações (estimativa alvo): ${preview.orgCount}`);
    console.log(`Rate limits com esse sufixo: ${preview.rateRows.length}`);
    preview.rateRows.forEach((r) =>
      console.log(`  - ${r.identifier} (${r.action})`)
    );

    if (preview.users.length === 0 && preview.rateRows.length === 0) {
      console.log('\nNada a remover. Encerrando.');
      return;
    }

    if (!execute) {
      console.log(
        '\n[DRY-RUN] Nada foi apagado. Para executar, repita com --execute'
      );
      return;
    }

    console.log('\nExecutando exclusão em transação...');
    await runDelete(client, domain);
    console.log('Concluído com sucesso.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
