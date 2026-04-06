import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserOrganization } from '@/types/database';

export default async function EpicValidationEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=%2Fvalidacao-epicos');
  }

  const { data: orgs, error: orgError } = (await supabase.rpc('get_user_organizations', {
    p_user_id: user.id,
  })) as { data: UserOrganization[] | null; error: Error | null };

  if (orgError || !orgs || orgs.length === 0) {
    redirect('/onboarding');
  }

  redirect(`/${orgs[0].organization_slug}/validacao-epicos`);
}
