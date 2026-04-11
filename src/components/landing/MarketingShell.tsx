import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarketingShellProps {
  children: React.ReactNode
  currentPath: string
  loginLabel: string
  primaryCtaHref: string
  homeHref?: string
  loginHref?: string
  navItems?: ReadonlyArray<{ href: string; label: string }>
}

const defaultNavItems = [
  { href: '/invest', label: 'Investir' },
  { href: '/sell-raise', label: 'Vender ou Captar' },
  { href: '/advise', label: 'Assessorar' },
  { href: '/indicar', label: 'Indicar' },
] as const

export function MarketingShell({
  children,
  currentPath,
  loginLabel,
  primaryCtaHref,
  homeHref = '/',
  loginHref = '/login',
  navItems = defaultNavItems,
}: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={homeHref} className="flex items-center">
            <Image src="/logotipo.png" alt="Mary" width={96} height={36} className="h-8 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  item.href === currentPath && 'font-semibold text-primary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={loginHref}>{loginLabel}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={loginHref}>Mary AI</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={primaryCtaHref}>Comece Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-border bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Perfis</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                {navItems.map((item) => (
                  <p key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">Plataforma</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  <Link href={homeHref} className="transition-colors hover:text-foreground">
                    Home
                  </Link>
                </p>
                <p>
                  <Link href={loginHref} className="transition-colors hover:text-foreground">
                    Mary AI
                  </Link>
                </p>
                <p>
                  <Link href={primaryCtaHref} className="transition-colors hover:text-foreground">
                    Comece Agora
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
                  <Link href={loginHref} className="transition-colors hover:text-foreground">
                    {loginLabel}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>Mary é uma infraestrutura de Market Network nativa em IA, liderada por pessoas, que impulsiona os mercados privados em escala global.</p>
            <p>© {new Date().getFullYear()} Mary. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
