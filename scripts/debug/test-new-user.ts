import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  const email = 'mary-test-' + Date.now() + '@test.com';
  const password = 'Test123!@#';
  
  console.log('Criando usuário:', email);
  const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (createErr) {
    console.log('Erro ao criar:', createErr.message);
    return;
  }
  
  console.log('Criado! ID:', user.user?.id);
  
  console.log('Testando login...');
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.log('Login falhou:', error.message);
  } else {
    console.log('Login OK! Session:', !!data.session);
  }
  
  // Limpar
  if (user.user?.id) {
    await adminClient.auth.admin.deleteUser(user.user.id);
    console.log('Usuário removido');
  }
}

test();
