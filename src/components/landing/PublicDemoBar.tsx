import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DemoPublicPath = '/' | '/invest' | '/sell-raise' | '/advise' | '/indicar'

const publicRoutes: Array<{ href: DemoPublicPath; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/invest', label: 'Investir' },
  { href: '/sell-raise', label: 'Vender ou Captar' },
  { href: '/advise', label: 'Assessorar' },
  { href: '/indicar', label: 'Indicar' },
]

const demoRoutes = [
  { href: '/demo/investor/dashboard', label: 'Demo investidor' },
  { href: '/demo/asset/mrs', label: 'Demo empresa' },
  { href: '/demo/advisor/dashboard', label: 'Demo advisor' },
] as const

export function PublicDemoBar({ currentPath }: { currentPath: DemoPublicPath }) {
  return (
    <div className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full px-3 py-1">Modo demo</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Começa na landing real
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Use as páginas públicas reais como entrada. Para áreas protegidas, os atalhos abaixo levam para os fluxos mockados já existentes.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/demo/investor/dashboard">Abrir demo mockado direto</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {publicRoutes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === currentPath ? 'default' : 'outline'}
                size="sm"
                className={cn(route.href === currentPath && 'pointer-events-none')}
                asChild
              >
                <Link href={`${route.href}?demo=1`}>{route.label}</Link>
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {demoRoutes.map((route) => (
              <Button key={route.href} variant="ghost" size="sm" asChild>
                <Link href={route.href}>{route.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
