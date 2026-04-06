/**
 * Script de diagnóstico para debug do erro "Database error querying schema"
 * Execute com: npx tsx scripts/debug/debug-auth.ts
 */

import { config } from 'dotenv';
config(); // Carrega .env

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const TEST_EMAIL = 'dev.test@mary.ai';
const TEST_PASSWORD = 'DevTest123!@#';

async function main() {
  console.log('=== DIAGNÓSTICO DE AUTENTICAÇÃO ===\n');
  
  // #region Verificar variáveis de ambiente
  console.log('1. Verificando variáveis de ambiente...');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✓ Definido' : '✗ AUSENTE'}`);
  console.log(`   SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? '✓ Definido' : '✗ AUSENTE'}`);
  console.log(`   ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Definido' : '✗ AUSENTE'}`);
  // #endregion

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('\n❌ Variáveis de ambiente ausentes!');
    process.exit(1);
  }

  // #region Testar conexão com service role
  console.log('\n2. Testando conexão com Supabase (service role)...');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    const { data: healthCheck, error: healthError } = await adminClient
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log(`   ⚠️ Erro na tabela organizations: ${healthError.message}`);
    } else {
      console.log('   ✓ Conexão com banco OK');
    }
  } catch (e) {
    console.log(`   ❌ Falha na conexão: ${e}`);
  }
  // #endregion

  // #region Verificar usuário na tabela auth.users
  console.log('\n3. Verificando usuário na tabela auth.users...');
  try {
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`   ❌ Erro ao listar usuários: ${usersError.message}`);
    } else {
      const testUser = users.users.find(u => u.email === TEST_EMAIL);
      if (testUser) {
        console.log('   ✓ Usuário encontrado:');
        console.log(`     - ID: ${testUser.id}`);
        console.log(`     - Email: ${testUser.email}`);
        console.log(`     - Email confirmado: ${testUser.email_confirmed_at ? '✓ Sim' : '✗ Não'}`);
        console.log(`     - Identities: ${JSON.stringify(testUser.identities, null, 2)}`);
        console.log(`     - App metadata: ${JSON.stringify(testUser.app_metadata, null, 2)}`);
        console.log(`     - User metadata: ${JSON.stringify(testUser.user_metadata, null, 2)}`);
        
        // Verificar se tem identity
        if (!testUser.identities || testUser.identities.length === 0) {
          console.log('\n   ⚠️ PROBLEMA DETECTADO: Usuário sem identities!');
        }
      } else {
        console.log(`   ✗ Usuário ${TEST_EMAIL} NÃO encontrado`);
      }
    }
  } catch (e) {
    console.log(`   ❌ Erro ao verificar usuários: ${e}`);
  }
  // #endregion

  // #region Testar login com anon key (simula frontend)
  console.log('\n4. Testando login com anon key (simula frontend)...');
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) {
      console.log(`   ❌ Erro no login: ${error.message}`);
      console.log(`     - Status: ${error.status}`);
      console.log(`     - Code: ${(error as any).code}`);
      console.log(`     - Full error: ${JSON.stringify(error)}`);
    } else {
      console.log('   ✓ Login bem-sucedido!');
      console.log(`     - User ID: ${data.user?.id}`);
      console.log(`     - Session: ${data.session ? '✓ Presente' : '✗ Ausente'}`);
    }
  } catch (e) {
    console.log(`   ❌ Exceção no login: ${e}`);
  }
  // #endregion

  // #region Testar criação de usuário correto
  console.log('\n5. Verificando se podemos criar usuário corretamente...');
  const newTestEmail = `test-${Date.now()}@mary.ai`;
  try {
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: newTestEmail,
      password: 'Test123!@#',
      email_confirm: true,
    });
    
    if (createError) {
      console.log(`   ⚠️ Erro ao criar usuário teste: ${createError.message}`);
    } else {
      console.log(`   ✓ Usuário teste criado: ${newTestEmail}`);
      console.log(`     - ID: ${newUser.user?.id}`);
      console.log(`     - Identities: ${JSON.stringify(newUser.user?.identities)}`);
      
      // Testar login com novo usuário
      const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
        email: newTestEmail,
        password: 'Test123!@#',
      });
      
      if (loginError) {
        console.log(`   ❌ Login do novo usuário falhou: ${loginError.message}`);
      } else {
        console.log('   ✓ Login do novo usuário OK!');
      }
      
      // Limpar usuário teste
      await adminClient.auth.admin.deleteUser(newUser.user!.id);
      console.log('   ✓ Usuário teste removido');
    }
  } catch (e) {
    console.log(`   ❌ Exceção: ${e}`);
  }
  // #endregion

  console.log('\n=== FIM DO DIAGNÓSTICO ===');
}

main().catch(console.error);
