import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  LayoutDashboard,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { MarketingShell } from '@/components/landing/MarketingShell'
import { DEMO_MARKETING_NAV } from '@/components/demo/demoLandingRoutes'

const heroStats = [
  { value: '+500', label: 'Empresas', hint: 'mapeadas na base demo' },
  { value: '+120', label: 'Deals', hint: 'simulados na narrativa' },
  { value: '+80', label: 'Advisors', hint: 'em exemplos do ecossistema' },
  { value: '4', label: 'Jornadas', hint: 'publicas dentro do demo' },
]

const journeyCards = [
  {
    title: 'Investidor',
    description: 'Comece pela landing, avance para cadastro, onboarding e siga até dashboard, teses, radar, feed e pipeline.',
    href: '/demo/investor',
    icon: Briefcase,
    cta: 'Abrir jornada do investidor',
  },
  {
    title: 'Empresa',
    description: 'Veja a jornada de venda ou captação com landing, cadastro, onboarding, cockpit, MRS e projetos.',
    href: '/demo/asset',
    icon: Building2,
    cta: 'Abrir jornada da empresa',
  },
  {
    title: 'Advisor',
    description: 'Entre pela landing do advisor e navegue até dashboard, radar, feed, projetos e perfil consultivo.',
    href: '/demo/advisor',
    icon: Users,
    cta: 'Abrir jornada do advisor',
  },
  {
    title: 'Indicações',
    description: 'Acesse a landing do programa de indicações e a proposta comercial já integrada ao fluxo do demo.',
    href: '/demo/indicar',
    icon: Handshake,
    cta: 'Abrir jornada de indicações',
  },
]

const demoSteps = [
  {
    title: 'Landing por perfil',
    description: 'Cada entrada em /demo já cai na narrativa comercial correta, sem sair do fluxo da apresentação.',
    icon: Sparkles,
  },
  {
    title: 'Cadastro e onboarding mockados',
    description: 'Os CTAs públicos entram direto nas telas de signup e onboarding do próprio demo.',
    icon: Workflow,
  },
  {
    title: 'Área logada navegável',
    description: 'Dashboard, radar, MRS, projetos, feed e pipeline continuam dentro de /demo com dados mockados.',
    icon: LayoutDashboard,
  },
]

const quickLinks = [
  { href: '/demo/investor/dashboard', label: 'Dashboard investidor' },
  { href: '/demo/asset/mrs', label: 'MRS empresa' },
  { href: '/demo/advisor/dashboard', label: 'Dashboard advisor' },
] as const

export async function DemoHomeLandingPage() {
  return (
    <MarketingShell
      currentPath="/demo"
      loginLabel="Entrar"
      loginHref="/demo/investor/dashboard"
      homeHref="/demo"
      navItems={DEMO_MARKETING_NAV}
      primaryCtaHref="#perfis"
    >
      <section className="relative overflow-hidden border-b border-border/50 px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm">
              <Globe2 className="h-3.5 w-3.5" />
              Demo guiado da Mary
            </div>

            <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Explore a Mary ponta a ponta,
              <span className="block text-primary">sem sair do fluxo do demo.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A entrada comercial, os cadastros, o onboarding e as áreas logadas estão conectados em
              uma única jornada de demonstração sob <code>/demo</code>.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="min-w-[220px]" asChild>
                <Link href="#perfis">
                  Começar pelas jornadas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
                <Link href="/demo/investor/dashboard">Ir direto para a área logada</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/70 bg-background/90 px-6 py-5 shadow-sm backdrop-blur">
                <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{stat.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="perfis" className="border-y border-border/60 bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="rounded-full px-3 py-1">Jornadas</Badge>
            <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Escolha a entrada do demo e siga até as telas já existentes.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Cada card abre uma landing realocada para o demo, com CTAs apontando para signup,
              onboarding e navegação logada da própria apresentação.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {journeyCards.map((card) => {
              const Icon = card.icon

              return (
                <Card key={card.title} className="h-full rounded-2xl border-border/70 bg-background shadow-sm transition-elegant hover:-translate-y-1 hover:shadow-elegant">
                  <CardHeader className="items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">{card.title}</CardTitle>
                    <CardDescription className="text-sm leading-6">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={card.href}>{card.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              O demo agora segue uma linha única de navegação.
            </h2>
          </div>

          <div className="relative mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
            {demoSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <div key={step.title} className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    {index === 0 ? <Target className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-amber-50/60 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Acessos rápidos para as telas mais importantes do demo.
            </h2>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {quickLinks.map((link) => (
              <Button key={link.href} variant="outline" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Toda a apresentação da Mary agora vive dentro do demo.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Você pode abrir a narrativa comercial, testar as transições e mostrar as telas logadas
            sem misturar rotas públicas e rotas mockadas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="min-w-[240px]" asChild>
              <Link href="/demo/investor">
                Abrir primeira jornada
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[240px]" asChild>
              <Link href="/demo/advisor/dashboard">Abrir dashboard advisor</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
