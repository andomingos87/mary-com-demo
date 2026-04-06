import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'dev.test@mary.ai';

async function main() {
  console.log('=== LIMPEZA DE USUÁRIO CORROMPIDO ===\n');
  console.log('Alvo:', TARGET_EMAIL);

  // Método 1: Tentar buscar via getUserById (se soubermos o ID)
  console.log('\n1. Tentando buscar usuário por email via RPC...');
  
  // Executar SQL direto para encontrar o usuário
  const { data: userData, error: userError } = await adminClient.rpc('exec_sql', {
    sql: `SELECT id, email, encrypted_password FROM auth.users WHERE email = '${TARGET_EMAIL}'`
  });
  
  if (userError) {
    console.log('   RPC exec_sql não disponível:', userError.message);
  } else {
    console.log('   Resultado:', userData);
  }

  // Método 2: Tentar via tabela profiles (se existir)
  console.log('\n2. Verificando tabela profiles...');
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('email', TARGET_EMAIL);
  
  if (profilesError) {
    console.log('   Erro:', profilesError.message);
  } else if (profiles && profiles.length > 0) {
    console.log('   Encontrado em profiles:', profiles);
  } else {
    console.log('   Não encontrado em profiles');
  }

  // Método 3: Criar novo usuário de teste com email diferente
  console.log('\n3. Criando usuário de teste alternativo...');
  const NEW_EMAIL = 'dev.admin@mary.ai';
  const NEW_PASSWORD = 'DevAdmin123!@#';
  
  // Primeiro tentar deletar se existir
  const { data: existingUsers } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });
  
  const existing = existingUsers?.users?.find(u => u.email === NEW_EMAIL);
  if (existing) {
    console.log('   Usuário já existe, deletando...');
    await adminClient.auth.admin.deleteUser(existing.id);
  }
  
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: NEW_EMAIL,
    password: NEW_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Dev Admin' }
  });
  
  if (createError) {
    console.log('   ❌ Erro:', createError.message);
  } else {
    console.log('   ✓ Usuário criado!');
    console.log(`   - Email: ${NEW_EMAIL}`);
    console.log(`   - Senha: ${NEW_PASSWORD}`);
    console.log(`   - ID: ${newUser.user?.id}`);
    
    // Testar login
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const { error: loginError } = await anonClient.auth.signInWithPassword({
      email: NEW_EMAIL,
      password: NEW_PASSWORD
    });
    
    if (loginError) {
      console.log('   ❌ Login falhou:', loginError.message);
    } else {
      console.log('   ✓ Login OK!');
    }
  }

  console.log('\n=== FIM ===');
  console.log('\nUse estas credenciais para testar:');
  console.log(`  Email: ${NEW_EMAIL}`);
  console.log(`  Senha: ${NEW_PASSWORD}`);
}

main().catch(console.error);
