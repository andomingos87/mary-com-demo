import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { AgentsWaitlistCard } from "@/components/landing/AgentsWaitlistCard";
import {
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  Building2,
  CheckCircle2,
  CircleOff,
  Clock3,
  FileSpreadsheet,
  Globe2,
  Handshake,
  Network,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  hint: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  cta: string;
}

function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div id={id} className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({ value, label, hint }: StatItem) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/90 px-6 py-5 shadow-sm backdrop-blur">
      <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{value}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  tone = "default",
}: FeatureItem & { tone?: "default" | "danger" | "warning" | "success" }) {
  const toneStyles = {
    default: "border-border/80 bg-background",
    danger: "border-rose-200 bg-rose-50/90",
    warning: "border-amber-200 bg-amber-50/70",
    success: "border-emerald-200 bg-emerald-50/80",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    danger: "bg-rose-100 text-rose-600",
    warning: "bg-amber-100 text-amber-600",
    success: "bg-emerald-100 text-emerald-600",
  };

  return (
    <Card className={`h-full rounded-2xl shadow-sm transition-elegant hover:-translate-y-1 hover:shadow-elegant ${toneStyles[tone]}`}>
      <CardHeader className="space-y-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconStyles[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight">{title}</CardTitle>
          <CardDescription className="text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function ProfileCard({ title, description, href, icon: Icon, cta }: ProfileCardProps) {
  return (
    <Card className="h-full rounded-2xl border-border/70 bg-background shadow-sm transition-elegant hover:-translate-y-1 hover:shadow-elegant">
      <CardHeader className="items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="max-w-xs text-sm leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const t = await getTranslations("landing");
  const params = await Promise.resolve(searchParams);
  const error = params?.error;

  const heroStats: StatItem[] = [
    { value: "+500", label: "Empresas", hint: "na plataforma" },
    { value: "+80", label: "Advisors", hint: "certificados" },
    { value: "+120", label: "Deals", hint: "em andamento" },
    { value: "100%", label: "Compliance", hint: "LGPD e padrões internacionais" },
  ];

  const problemItems: FeatureItem[] = [
    {
      title: "Oportunidades fragmentadas e desalinhadas",
      description: "Busca manual por deals dispersos em múltiplas fontes sem coordenação entre os participantes.",
      icon: SearchX,
    },
    {
      title: "Meses para fechar um deal",
      description: "Processos burocráticos que se arrastam sem visibilidade clara sobre prioridades e próximos passos.",
      icon: Clock3,
    },
    {
      title: "Processos burocráticos e caros",
      description: "Custos elevados com ferramentas isoladas, retrabalho operacional e baixa padronização.",
      icon: BadgeDollarSign,
    },
    {
      title: "Falta de transparência em dados críticos",
      description: "Informações sensíveis circulando em planilhas e e-mails sem governança adequada.",
      icon: ShieldAlert,
    },
  ];

  const workflowItems: FeatureItem[] = [
    {
      title: "Cadastre seu perfil",
      description: "Investidor, empresa, advisor ou agente entram com contexto certo desde o primeiro clique.",
      icon: Users,
    },
    {
      title: "Defina sua tese ou objetivo",
      description: "Venda, captação, investimento, assessoria ou indicação com critérios claros e estruturados.",
      icon: Target,
    },
    {
      title: "Receba recomendações inteligentes",
      description: "IA + curadoria organizam matching, priorização, readiness e próximas ações do processo.",
      icon: Network,
    },
    {
      title: "Gerencie tudo em um só lugar",
      description: "Contatos, pipeline, VDR, teses, contratos, assinaturas e comunicação sob a mesma governança.",
      icon: Workflow,
    },
  ];

  const riskItems: FeatureItem[] = [
    {
      title: "Continuará preso a ciclos longos e caros",
      description: "Processos seguem por meses sem eficiência operacional proporcional ao esforço investido.",
      icon: Clock3,
    },
    {
      title: "Vai perder oportunidades para concorrentes mais ágeis",
      description: "Enquanto você organiza a operação manualmente, outros fecham negócios antes.",
      icon: TrendingUp,
    },
    {
      title: "Corre risco de deals desalinhados e valuations injustos",
      description: "Sem critérios, dados e histórico consolidados, a qualidade das decisões cai.",
      icon: CircleOff,
    },
    {
      title: "Desperdiçará tempo precioso em planilhas e e-mails",
      description: "Gestão manual de informações críticas consome o tempo que deveria estar no estratégico.",
      icon: FileSpreadsheet,
    },
  ];

  const benefitItems: FeatureItem[] = [
    {
      title: "Feche transações com muito mais velocidade",
      description: "Processos mais enxutos, automações úteis e menos fricção entre originação, diligência e execução.",
      icon: Sparkles,
    },
    {
      title: "Aumente a precisão no matching",
      description: "Mais aderência entre tese, perfil e oportunidade com base em dados estruturados.",
      icon: Target,
    },
    {
      title: "Capture mais valor por deal",
      description: "Mais contexto, mais transparência e melhor preparação elevam a qualidade da negociação.",
      icon: TrendingUp,
    },
    {
      title: "Substitua ferramentas soltas por um hub",
      description: "A plataforma centraliza o processo inteiro sem quebrar governança, rastreabilidade e segurança.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/logotipo.png" alt="Mary" width={96} height={36} className="h-8 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/invest" className="transition-colors hover:text-foreground">
              Investir
            </Link>
            <Link href="/sell-raise" className="transition-colors hover:text-foreground">
              Vender ou Captar
            </Link>
            <Link href="/advise" className="transition-colors hover:text-foreground">
              Assessorar
            </Link>
            <Link href="/indicar" className="transition-colors hover:text-foreground">
              Indicar
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t("login_cta")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="#perfis">Comece Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/50 px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-sm">
              <Globe2 className="h-3.5 w-3.5" />
              Preview público
            </div>

            <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Unlocking{" "}
              <span className="block text-primary">private markets, globally.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Conecte investidores, empresas, advisors e agentes em um ecossistema de M&A
              inteligente, transparente, eficiente e orientado por dados.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="min-w-[210px]" asChild>
                <Link href="#perfis">
                  Comece Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[210px]" asChild>
                <Link href="#como-funciona">Como Funciona</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {error === "profile-required" ? (
        <div className="mx-auto max-w-4xl px-4 pt-8">
          <Alert variant="destructive">
            <AlertDescription>{t("profile_required")}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="M&A tradicional"
            title="O modelo tradicional de M&A é lento, caro e burocrático."
            subtitle="Fechar um deal deveria ser rápido, leve e eficiente. Na prática, o mercado ainda opera com fricção desnecessária."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {problemItems.map((item) => (
              <FeatureCard key={item.title} {...item} tone="danger" />
            ))}
          </div>

          <p className="mt-10 text-center text-base text-muted-foreground">
            No fim, investidores, empresas e advisors perdem tempo, dinheiro e oportunidades valiosas.
          </p>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="A Mary é a parceira que organiza o caos do M&A."
            subtitle="Criamos a Mary para transformar um mercado historicamente fechado em um ecossistema mais inteligente, vivo, acessível e justo."
          />

          <Card className="mx-auto mt-10 max-w-4xl rounded-3xl border-primary/15 bg-background/95 shadow-elegant">
            <CardContent className="px-8 py-10 text-center sm:px-12">
              <p className="text-lg leading-8 text-muted-foreground">
                Combinamos <span className="font-semibold text-foreground">IA</span>,{" "}
                <span className="font-semibold text-foreground">curadoria</span> e{" "}
                <span className="font-semibold text-foreground">governança legal</span> para que
                cada perfil tenha clareza, segurança e resultado ao longo de toda a jornada.
              </p>
              <Button variant="outline" className="mt-8" asChild>
                <Link href="#como-funciona">Descubra Como Funciona</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Fechar deals nunca foi tão simples."
            subtitle="Com a Mary, você elimina ruído e ganha eficiência em uma operação estruturada em quatro movimentos claros."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {workflowItems.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button size="lg" asChild>
              <Link href="#perfis">Cadastre-se Gratuitamente</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-amber-50/70 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="E se você continuar no modelo tradicional?"
            subtitle="O custo de não organizar o processo é maior do que parece, e ele aparece tanto no tempo quanto na qualidade do deal."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {riskItems.map((item) => (
              <FeatureCard key={item.title} {...item} tone="warning" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Com a Mary, o futuro do M&A já começou."
            subtitle="Benefícios concretos para quem quer operar com mais precisão, velocidade e governança."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {benefitItems.map((item) => (
              <FeatureCard key={item.title} {...item} tone="success" />
            ))}
          </div>

          <Card className="mt-8 rounded-3xl border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,240,0.96))] shadow-sm">
            <CardContent className="px-8 py-10 text-center sm:px-14">
              <div className="mb-6 flex items-center justify-center gap-3 text-primary">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Handshake className="h-5 w-5" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Network className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">Visão aspiracional</h3>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                Imagine participar de um ecossistema global em que cada conexão é transparente,
                rastreável e confiável. Seja você investidor, sócio, fundador, executivo, advisor
                ou agente, a Mary transforma potencial em negócio real.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="perfis" className="border-y border-border/60 bg-muted/30 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Um ecossistema para todos os perfis do M&A."
            subtitle="Cada entrada pública da plataforma já leva o usuário para a jornada certa, com contexto, onboarding e proposta de valor específicos."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ProfileCard
              title={t("profile_investor")}
              description={t("profile_investor_desc")}
              href="/invest"
              icon={Briefcase}
              cta="Saiba Mais sobre Investir"
            />
            <ProfileCard
              title={t("profile_asset")}
              description={t("profile_asset_desc")}
              href="/sell-raise"
              icon={Building2}
              cta="Saiba Mais sobre Vender/Captar"
            />
            <ProfileCard
              title={t("profile_advisor")}
              description={t("profile_advisor_desc")}
              href="/advise"
              icon={Users}
              cta="Saiba Mais sobre Assessorar"
            />
            <Card className="rounded-2xl border-primary/15 bg-background shadow-sm transition-elegant hover:-translate-y-1 hover:shadow-elegant">
              <CardHeader className="items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Handshake className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Agentes</CardTitle>
                <CardDescription className="max-w-xs text-sm leading-6">
                  Indique negócios, ative sua rede e participe da originação com remuneração e rastreabilidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/indicar">Saiba Mais sobre Indicar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div id="indicar" className="mt-8">
            <AgentsWaitlistCard className="rounded-2xl border-primary/15 bg-background shadow-sm" />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Números que falam por si."
            subtitle="Milhares de investidores, empresas, advisors e agentes já confiam na Mary para acelerar suas transações de M&A."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard value="500+" label="Investidores ativos" hint="teses qualificadas no ecossistema" />
            <StatCard value="R$ 2.5B+" label="Em oportunidades" hint="volume monitorado em processos" />
            <StatCard value="150+" label="Advisors certificados" hint="operações com mais governança" />
            <StatCard value="250+" label="Agentes conectados" hint="originação com inteligência de rede" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Carlos Silva</CardTitle>
                <CardDescription>Managing Partner, Norte Capital</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  &quot;A Mary revolucionou nossa forma de identificar oportunidades. Fechamos três
                  deals em seis meses que antes levariam anos.&quot;
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Maria Santos</CardTitle>
                <CardDescription>CEO, TechStart</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  &quot;Conseguimos captar com mais clareza e muito menos ruído. O matching e a
                  estrutura do processo foram decisivos.&quot;
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">João Oliveira</CardTitle>
                <CardDescription>Senior Advisor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  &quot;Como advisor, a Mary me deu acesso a uma rede qualificada e a uma operação
                  muito mais organizada. Minha produtividade aumentou de forma visível.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-8 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Está pronto para transformar seu jeito de fazer M&A?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Junte-se a investidores, empresas, advisors e agentes que já utilizam a Mary para
            acelerar transações com mais qualidade operacional e mais confiança entre as partes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="min-w-[240px]" asChild>
              <Link href="#perfis">
                Comece Agora Gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[240px]" asChild>
              <Link href="#como-funciona">Descubra Como Funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Perfis</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <Link href="/invest" className="transition-colors hover:text-foreground">
                    Investir
                  </Link>
                </p>
                <p>
                  <Link href="/sell-raise" className="transition-colors hover:text-foreground">
                    Vender ou Captar
                  </Link>
                </p>
                <p>
                  <Link href="/advise" className="transition-colors hover:text-foreground">
                    Assessorar
                  </Link>
                </p>
                <p>
                  <Link href="/indicar" className="transition-colors hover:text-foreground">
                    Indicar
                  </Link>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Plataforma</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <Link href="#como-funciona" className="transition-colors hover:text-foreground">
                    Como funciona
                  </Link>
                </p>
                <p>
                  <Link href="#perfis" className="transition-colors hover:text-foreground">
                    Jornadas públicas
                  </Link>
                </p>
                <p>
                  <Link href="/login" className="transition-colors hover:text-foreground">
                    Mary AI
                  </Link>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Suporte</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <Link href="/terms" className="transition-colors hover:text-foreground">
                    Termos
                  </Link>
                </p>
                <p>
                  <Link href="/privacy" className="transition-colors hover:text-foreground">
                    Privacidade
                  </Link>
                </p>
                <p>
                  <Link href="/login" className="transition-colors hover:text-foreground">
                    {t("login_cta")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>Mary é uma infraestrutura de Market Network nativa em IA, liderada por pessoas, que impulsiona os mercados privados em escala global.</p>
            <p>{t("footer_copyright")}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
