'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import type { DemoInvestorOnboardingStep2Value } from '@/lib/demo/platform-data'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function UsdRangePair({
  idPrefix,
  title,
  subtitle,
  globalMin,
  globalMax,
  step,
  min,
  max,
  onChange,
}: {
  idPrefix: string
  title: string
  subtitle: string
  globalMin: number
  globalMax: number
  step: number
  min: number
  max: number
  onChange: (next: { min: number; max: number }) => void
}) {
  const safeMin = clamp(min, globalMin, globalMax)
  const safeMax = clamp(max, globalMin, globalMax)

  const setMin = (raw: number) => {
    if (Number.isNaN(raw)) return
    let nextMin = clamp(raw, globalMin, globalMax)
    let nextMax = safeMax
    if (nextMin >= nextMax) {
      nextMax = clamp(nextMin + step, globalMin, globalMax)
    }
    onChange({ min: nextMin, max: nextMax })
  }

  const setMax = (raw: number) => {
    if (Number.isNaN(raw)) return
    let nextMax = clamp(raw, globalMin, globalMax)
    let nextMin = safeMin
    if (nextMax <= nextMin) {
      nextMin = clamp(nextMax - step, globalMin, globalMax)
    }
    onChange({ min: nextMin, max: nextMax })
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-3 px-1">
        <Slider
          value={[safeMin, safeMax]}
          onValueChange={(vals) => {
            if (vals.length !== 2) return
            const [a, b] = vals
            onChange({ min: Math.min(a, b), max: Math.max(a, b) })
          }}
          min={globalMin}
          max={globalMax}
          step={step}
          minStepsBetweenThumbs={1}
          aria-label={`${title}: faixa de mínimo a máximo em milhões USD`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min-num`} className="text-xs text-muted-foreground">
            Mínimo (US$ M)
          </Label>
          <Input
            id={`${idPrefix}-min-num`}
            inputMode="numeric"
            type="number"
            min={globalMin}
            max={globalMax}
            step={step}
            value={safeMin}
            onChange={(e) => setMin(Number(e.target.value))}
            className="rounded-lg bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-max-num`} className="text-xs text-muted-foreground">
            Máximo (US$ M)
          </Label>
          <Input
            id={`${idPrefix}-max-num`}
            inputMode="numeric"
            type="number"
            min={globalMin}
            max={globalMax}
            step={step}
            value={safeMax}
            onChange={(e) => setMax(Number(e.target.value))}
            className="rounded-lg bg-background"
          />
        </div>
      </div>
    </div>
  )
}

export function DemoInvestorOnboardingStep2Field({
  value,
  onChange,
  onComplete,
  completionAnchorId,
}: {
  value: DemoInvestorOnboardingStep2Value
  onChange: (next: DemoInvestorOnboardingStep2Value) => void
  onComplete?: () => void
  /** Elemento para scroll após “Concluir cadastro” (demo). */
  completionAnchorId?: string
}) {
  const patch = (partial: Partial<DemoInvestorOnboardingStep2Value>) => {
    onChange({ ...value, ...partial })
  }

  const sendInvite = () => {
    toast.success('Convite enviado ao advisor buy-side (simulação).')
  }

  const completeRegistration = () => {
    if (!value.termsAccepted) {
      toast.error('Aceite os termos para concluir (demo).')
      return
    }
    toast.success('Cadastro concluído com sucesso (demo).')
    onComplete?.()
    if (completionAnchorId) {
      requestAnimationFrame(() => {
        document.getElementById(completionAnchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <div className="space-y-6">
      <UsdRangePair
        idPrefix="demo-rob"
        title="ROB (receita operacional bruta, últimos 12 meses)"
        subtitle="Um controle com dois pontos (mín. e máx.); ajuste pelo traço ou pelos números abaixo."
        globalMin={1}
        globalMax={200}
        step={1}
        min={value.robMin}
        max={value.robMax}
        onChange={({ min: robMin, max: robMax }) => patch({ robMin, robMax })}
      />

      <div className="space-y-2">
        <Label htmlFor="demo-ebitda-pct" className="text-sm font-medium text-foreground">
          EBITDA mínimo da empresa-alvo (%)
        </Label>
        <div className="flex max-w-xs items-center gap-2">
          <Input
            id="demo-ebitda-pct"
            inputMode="decimal"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={value.ebitdaPct}
            onChange={(e) => {
              const raw = Number(e.target.value)
              if (Number.isNaN(raw)) return
              patch({ ebitdaPct: clamp(raw, 0, 100) })
            }}
            className="rounded-lg bg-background"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <UsdRangePair
        idPrefix="demo-cheque"
        title="Cheque (ticket de investimento)"
        subtitle="Um controle com dois pontos (mín. e máx.); ajuste pelo traço ou pelos números abaixo."
        globalMin={1}
        globalMax={120}
        step={1}
        min={value.chequeMin}
        max={value.chequeMax}
        onChange={({ min: chequeMin, max: chequeMax }) => patch({ chequeMin, chequeMax })}
      />

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">Já possui advisor buy-side?</p>
        <RadioGroup
          value={value.hasAdvisor ? 'yes' : 'no'}
          onValueChange={(v) => patch({ hasAdvisor: v === 'yes' })}
          className="flex flex-wrap gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="demo-adv-yes" />
            <Label htmlFor="demo-adv-yes" className="font-normal text-foreground">
              Sim
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="demo-adv-no" />
            <Label htmlFor="demo-adv-no" className="font-normal text-foreground">
              Não
            </Label>
          </div>
        </RadioGroup>

        {value.hasAdvisor ? (
          <div className="grid gap-4 border-t border-border pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="demo-advisor-name">Nome do advisor</Label>
                <Input
                  id="demo-advisor-name"
                  value={value.advisorName}
                  onChange={(e) => patch({ advisorName: e.target.value })}
                  className="rounded-lg bg-background"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-advisor-email">E-mail do advisor</Label>
                <Input
                  id="demo-advisor-email"
                  type="email"
                  inputMode="email"
                  value={value.advisorEmail}
                  onChange={(e) => patch({ advisorEmail: e.target.value })}
                  className="rounded-lg bg-background"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <Button type="button" variant="secondary" className="rounded-lg shadow-card" onClick={sendInvite}>
                Enviar convite ao advisor
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-start gap-3 rounded-lg border border-dashed border-border p-4">
        <Checkbox
          id="demo-investor-terms"
          checked={value.termsAccepted}
          onCheckedChange={(v) => patch({ termsAccepted: v === true })}
          aria-label="Aceite de termos e privacidade"
        />
        <Label htmlFor="demo-investor-terms" className="cursor-pointer font-normal leading-snug text-muted-foreground">
          Li e aceito os termos de uso e a política de privacidade (simulado na demo).
        </Label>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="button" className="rounded-lg shadow-elegant" onClick={completeRegistration}>
          Concluir cadastro
        </Button>
      </div>
    </div>
  )
}
