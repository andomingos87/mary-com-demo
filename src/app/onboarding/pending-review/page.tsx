/**
 * Pending Review Page
 *
 * Displayed when a user's eligibility check requires manual review.
 * This happens when their experience/deals don't meet the automatic criteria.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, Button } from '@/components/ui'
import { Clock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function PendingReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get organization info for context
  const { data: org } = await supabase
    .from('organizations')
    .select('name, profile_type, onboarding_step')
    .eq('created_by', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // If org is not in pending_review, redirect appropriately
  if (org && org.onboarding_step !== 'pending_review') {
    const stepSlug = org.onboarding_step?.replace(/_/g, '-')
    if (org.onboarding_step === 'completed') {
      redirect('/dashboard')
    }
    redirect(`/onboarding/${stepSlug}`)
  }

  const supportEmail = 'suporte@mary.com.br'
  const reviewTime = '48 horas úteis'
  const orgName = org?.name?.trim()
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Cadastro em Análise</h1>
          <p className="text-muted-foreground">
            Suas informações foram enviadas para revisão manual.
            Nossa equipe entrará em contato em até <strong>{reviewTime}</strong>.
          </p>
        </div>

        {/* Organization Info */}
        {orgName && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="text-muted-foreground">Organização: </span>
            <span className="font-medium">{orgName}</span>
          </div>
        )}

        {/* Next Steps */}
        <div className="p-4 bg-muted rounded-lg text-left space-y-3">
          <p className="font-medium text-sm">Próximos passos:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Aguarde o contato da nossa equipe</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Verifique sua caixa de entrada e spam</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Você receberá um e-mail quando sua conta for aprovada</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>Dúvidas? Entre em contato:</span>
          <a
            href={`mailto:${supportEmail}`}
            className="text-primary hover:underline font-medium"
          >
            {supportEmail}
          </a>
        </div>

        {/* Back Button */}
        <Button variant="outline" asChild className="w-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Link>
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4 border-t">
          © {currentYear} Mary Digital Ecosystem.
        </p>
      </Card>
    </div>
  )
}

// Metadata
export const metadata = {
  title: 'Cadastro em Análise | Mary',
  description: 'Seu cadastro está sendo analisado pela equipe Mary.',
}
