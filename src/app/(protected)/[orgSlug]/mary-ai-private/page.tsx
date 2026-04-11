import Link from 'next/link'
import { ArrowRight, MessageCircleMore, Sparkles, Workflow, ShieldCheck, FileText } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface MaryAiPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function MaryAiPage({ params }: MaryAiPageProps) {
  const { orgSlug } = await params

  const highlights = [
    {
      icon: Sparkles,
      title: 'Resumo executivo',
      description: 'A Mary AI resume contexto do projeto, próximos passos e pontos de atenção em linguagem direta.',
    },
    {
      icon: Workflow,
      title: 'Fluxo assistido',
      description: 'Sugere ações, organiza documentos e aponta a próxima etapa sem substituir a decisão humana.',
    },
    {
      icon: FileText,
      title: 'Q&A e documentos',
      description: 'Ajuda a consultar materiais, organizar respostas e consolidar dúvidas em um único lugar.',
    },
    {
      icon: ShieldCheck,
      title: 'Governança',
      description: 'Mantém o discurso alinhado ao contexto da organização e evita exposição indevida de dados.',
    },
  ]

  const summaryPoints = [
    'Botão flutuante vermelho no canto inferior direito para abertura rápida da Mary AI.',
    'Resumo da página para validação com cliente antes da entrega final.',
    'Entrada contextual por organização, projeto e página corrente.',
    'Fluxo focado em apoio, não em execução automática de ações críticas.',
  ]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.08),_transparent_30%),linear-gradient(180deg,#fff8f7_0%,#f8fafc_55%,#eef2f6_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card className="overflow-hidden rounded-[32px] border-red-200/70 bg-white/90 shadow-elegant backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                <MessageCircleMore className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-3xl">Mary AI</CardTitle>
                <CardDescription className="text-base leading-7">
                  Resumo de validação para o cliente, dentro da própria página.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-lg leading-8 text-muted-foreground">
                Esta página concentra o que a Mary AI deve entregar no contexto da organização <span className="font-medium text-foreground">{orgSlug}</span>.
                O objetivo é deixar claro o escopo, o comportamento esperado e o ponto de entrada visual
                da assistente antes de seguir para a implementação final.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/${orgSlug}/dashboard`}>
                    Ir para dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/${orgSlug}/profile`}>Ver perfil da organização</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Resumo rápido</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {summaryPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="rounded-2xl border-border/70 bg-white/90 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </section>

        <Card className="rounded-[32px] border-dashed border-red-300 bg-white/80 shadow-none">
          <CardContent className="px-8 py-8">
            <p className="text-center text-sm leading-7 text-muted-foreground">
              A partir daqui, a validação com o cliente pode acontecer nesta página sem perder contexto:
              o ícone flutuante abre a Mary AI, e o conteúdo acima resume o escopo que ainda está em revisão.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: MaryAiPageProps) {
  const { orgSlug } = await params
  return {
    title: `Mary AI | ${orgSlug}`,
  }
}
