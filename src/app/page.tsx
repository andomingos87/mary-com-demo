import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
  AlertDescription
} from "@/components/ui";
import { Building2, Briefcase, Users, ArrowRight, LogIn } from "lucide-react";
import { AgentsWaitlistCard } from "@/components/landing/AgentsWaitlistCard";

interface ProfileCardProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  href: string;
  variant: 'investor' | 'asset' | 'advisor';
  registerAsLabel: string;
}

function ProfileCard({ title, description, features, icon, href, variant, registerAsLabel }: ProfileCardProps) {
  const variantStyles = {
    investor: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    asset: 'hover:border-green-500/50 hover:shadow-green-500/10',
    advisor: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
  };

  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl ${variantStyles[variant]}`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full group/btn">
          <Link href={href}>
            {registerAsLabel} {title}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const t = await getTranslations("landing");
  const params = await Promise.resolve(searchParams);
  const error = params?.error;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Image
              src="/logotipo.png"
              alt="Mary"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t("login_cta")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            <span className="text-primary uppercase tracking-wider">{t("hero_title")}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("hero_subtitle")}
          </p>
        </div>
      </section>

      {/* Error Alert */}
      {error === 'profile-required' && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <Alert variant="destructive">
            <AlertDescription>
              {t("profile_required")}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Profile Selection Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {t("profile_select_title")}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("profile_select_subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Investor Card */}
            <ProfileCard
              title={t("profile_investor")}
              description={t("profile_investor_desc")}
              icon={<Briefcase className="h-8 w-8" />}
              href="/signup?profile=investor"
              variant="investor"
              registerAsLabel={t("register_as")}
              features={[
                t("feature_deal_flow"),
                t("feature_thesis"),
                t("feature_pipeline"),
                t("feature_dd"),
              ]}
            />

            {/* Asset Card */}
            <ProfileCard
              title={t("profile_asset")}
              description={t("profile_asset_desc")}
              icon={<Building2 className="h-8 w-8" />}
              href="/signup?profile=asset"
              variant="asset"
              registerAsLabel={t("register_as")}
              features={[
                t("feature_connect"),
                t("feature_valuation"),
                t("feature_vdr"),
                t("feature_ma"),
              ]}
            />

            {/* Advisor Card */}
            <ProfileCard
              title={t("profile_advisor")}
              description={t("profile_advisor_desc")}
              icon={<Users className="h-8 w-8" />}
              href="/signup?profile=advisor"
              variant="advisor"
              registerAsLabel={t("register_as")}
              features={[
                t("feature_deals"),
                t("feature_firewall"),
                t("feature_crm"),
                t("feature_analytics"),
              ]}
            />
          </div>
        </div>
      </section>

      {/* Rede de Profissionais (Parceiros) Coming Soon Section */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {t("professionals_title")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("professionals_subtitle")}
            </p>
          </div>
          <AgentsWaitlistCard />
        </div>
      </section>

      {/* Login CTA */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            {t("has_account")}
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              {t("do_login")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>{t("footer_copyright")}</p>
        </div>
      </footer>
    </main>
  );
}
