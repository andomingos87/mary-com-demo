import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserOrganizations } from '@/lib/actions/organizations';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const result = await getUserOrganizations();
  const organizations = result.success ? result.data || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Minhas Organizações
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas contas e participações
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organizations/new">
            Nova Organização
          </Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma organização encontrada</h3>
            <p className="text-muted-foreground mb-6">Você ainda não faz parte de nenhuma organização.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/organizations/new">
                Criar minha primeira organização
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.organization_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{org.organization_name}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      /{org.organization_slug}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    org.verification_status === 'verified' ? 'default' : 
                    org.verification_status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {org.verification_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="capitalize font-medium">{org.profile_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seu Papel</span>
                    <Badge variant="outline" className="capitalize">
                      {org.user_role}
                    </Badge>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button variant="secondary" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/organizations/${org.organization_id}`}>
                        Acessar
                      </Link>
                    </Button>
                    {(org.user_role === 'owner' || org.user_role === 'admin') && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/organizations/${org.organization_id}/members`}>
                          Membros
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

