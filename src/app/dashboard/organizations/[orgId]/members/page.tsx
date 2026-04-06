import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrganization } from '@/lib/actions/organizations';
import { listOrganizationMembers, getCurrentMembership } from '@/lib/actions/members';
import { listPendingInvites } from '@/lib/actions/invites';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Separator,
} from '@/components/ui';

interface MembersPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if organization exists and user has access
  const orgResult = await getOrganization(orgId);
  if (!orgResult.success || !orgResult.data) {
    notFound();
  }
  const org = orgResult.data;

  // Check user permission
  const membershipResult = await getCurrentMembership(orgId);
  if (!membershipResult.success || !membershipResult.data) {
    redirect('/dashboard/organizations');
  }
  const userMembership = membershipResult.data;
  const canManage = userMembership.role === 'owner' || userMembership.role === 'admin';

  // Fetch members and invites
  const [membersResult, invitesResult] = await Promise.all([
    listOrganizationMembers(orgId),
    canManage ? listPendingInvites(orgId) : Promise.resolve({ success: true, data: [] }),
  ]);

  const members = membersResult.success ? membersResult.data || [] : [];
  const invites = invitesResult.success ? invitesResult.data || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard/organizations" className="hover:text-foreground">Organizações</Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/organizations/${org.id}`} className="hover:text-foreground">{org.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">Membros</span>
      </nav>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Membros da Organização
          </h2>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso a {org.name}
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href={`/dashboard/organizations/${org.id}/members/invite`}>
              Convidar Membro
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Active Members */}
        <Card>
          <CardHeader>
            <CardTitle>Membros Ativos</CardTitle>
            <CardDescription>Pessoas que já aceitaram o convite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-primary font-bold">
                        {member.user?.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.user?.user_metadata?.full_name || member.user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                    <Badge variant={
                      member.verification_status === 'verified' ? 'default' : 
                      member.verification_status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {member.verification_status}
                    </Badge>
                    {canManage && member.user_id !== user.id && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Editar</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Remover</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites (Admin/Owner only) */}
        {canManage && invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>Aguardando aceite do usuário</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {invites.map((invite) => (
                  <div key={invite.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="capitalize">
                        {invite.role}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Reenviar</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Cancelar</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

