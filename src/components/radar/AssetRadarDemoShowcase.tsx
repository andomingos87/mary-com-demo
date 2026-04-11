import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DEMO_ASSET_INVESTORS } from '@/lib/demo/radar-mock-data'
import { TrendingUp } from 'lucide-react'

/** Investidores fictícios na visão espelhada do ativo (demo). */
export function AssetRadarDemoShowcase() {
  return (
    <div className="space-y-4">
      <Card className="border-dashed border-primary/30 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Investidores aderentes (exemplo)</CardTitle>
          <CardDescription>
            Prévia de como investidores compatíveis aparecerão quando o matching estiver ativo para o seu
            projeto.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_ASSET_INVESTORS.map((inv) => (
          <Card key={inv.id} className="shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{inv.label}</CardTitle>
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <TrendingUp className="h-3 w-3" />
                  {inv.match}%
                </Badge>
              </div>
              <CardDescription className="text-xs">{inv.thesis}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ticket declarado: <span className="font-medium text-foreground">{inv.ticket}</span>
              </p>
              <Badge variant="outline" className="mt-3 text-xs">
                Demo
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
