/**
 * Script para corrigir o usuário de teste corrompido
 * Execute com: npx tsx scripts/debug/fix-user.ts
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_EMAIL = 'dev.test@mary.ai';
const TEST_PASSWORD = 'DevTest123!@#';

async function main() {
  console.log('=== CORREÇÃO DO USUÁRIO DE TESTE ===\n');

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Buscar e deletar usuário corrompido
  console.log('1. Buscando usuário corrompido...');
  try {
    const { data: users } = await adminClient.auth.admin.listUsers();
    const corruptedUser = users?.users.find(u => u.email === TEST_EMAIL);
    
    if (corruptedUser) {
      console.log(`   Encontrado: ${corruptedUser.id}`);
      console.log('   Deletando...');
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(corruptedUser.id);
      if (deleteError) {
        console.log(`   ⚠️ Erro ao deletar: ${deleteError.message}`);
      } else {
        console.log('   ✓ Usuário deletado');
      }
    } else {
      console.log('   Usuário não encontrado (pode já ter sido deletado)');
    }
  } catch (e) {
    console.log(`   ⚠️ Erro na busca/deleção: ${e}`);
  }

  // 2. Criar usuário corretamente
  console.log('\n2. Criando usuário corretamente...');
  try {
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Dev Test User',
      },
    });

    if (createError) {
      console.log(`   ❌ Erro ao criar: ${createError.message}`);
    } else {
      console.log('   ✓ Usuário criado com sucesso!');
      console.log(`   - ID: ${newUser.user?.id}`);
      console.log(`   - Email: ${newUser.user?.email}`);
      console.log(`   - Identities: ${newUser.user?.identities?.length || 0}`);
    }
  } catch (e) {
    console.log(`   ❌ Exceção: ${e}`);
  }

  // 3. Testar login
  console.log('\n3. Testando login...');
  const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.log(`   ❌ Login falhou: ${error.message}`);
    } else {
      console.log('   ✓ Login bem-sucedido!');
      console.log(`   - User ID: ${data.user?.id}`);
      console.log(`   - Session: ${data.session ? '✓ Presente' : '✗ Ausente'}`);
    }
  } catch (e) {
    console.log(`   ❌ Exceção: ${e}`);
  }

  console.log('\n=== CORREÇÃO FINALIZADA ===');
  console.log(`\nCredenciais de teste:`);
  console.log(`  Email: ${TEST_EMAIL}`);
  console.log(`  Senha: ${TEST_PASSWORD}`);
}

main().catch(console.error);
