'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Copy,
  Eye,
  FolderKanban,
  Handshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Radar,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle2,
  UserPlus,
  Workflow,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createDemoMaryAiNavigationContext } from '@/lib/demo/mary-ai-demo-navigation'
import type { MrsStepId } from '@/types/projects'
import { OrganizationProvider } from '@/components/providers/OrganizationProvider'
import { MaryAiProvider, useMaryAi, useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { MaryAiQuickChatSheet } from '@/components/mary-ai/MaryAiQuickChatSheet'
import { MaryAiEntryFallback } from '@/components/mary-ai/MaryAiEntryFallback'
import { createDefaultMrsSteps } from '@/lib/readiness'
import { MrsRadarChart } from '@/components/mrs/MrsRadarChart'
import { MrsStepItemsPanel } from '@/components/mrs/MrsStepItemsPanel'
import { mrsStepNavButtonClass } from '@/components/mrs/mrs-step-helpers'
import { OpportunitiesList } from '@/components/radar/OpportunitiesList'
import { PipelineBoard } from '@/components/projects/PipelineBoard'
import { DemoAiQueueCard } from '@/components/demo/DemoAiQueueCard'
import { DemoInvestorFeed } from '@/components/demo/DemoInvestorFeed'
import { DemoGeographyPicker } from '@/components/demo/DemoGeographyPicker'
import { DemoInvestorOnboardingStep2Field } from '@/components/demo/DemoInvestorOnboardingStep2Field'
import { DemoTagsField } from '@/components/demo/DemoTagsField'
import { DemoInvestorProjectsKanban } from '@/components/demo/DemoInvestorProjectsKanban'
import { DemoInvestorProjectMrsTab } from '@/components/demo/DemoInvestorProjectMrsTab'
import { DemoInvestorProjectMoreInfoTab } from '@/components/demo/DemoInvestorProjectMoreInfoTab'
import { createInvestorPlaceholderProject } from '@/lib/demo/demo-investor-kanban'
import {
  DEMO_HOME_PROFILES,
  DEMO_PLATFORM,
  type DemoFormField,
  type DemoFormFieldValue,
  type DemoInvestorOnboardingStep2Value,
  type DemoPanel,
  type DemoProfileExperience,
  type DemoProfileKey,
  type DemoRouteKey,
  type DemoStep,
  type DemoTable,
} from '@/lib/demo/platform-data'

const PROFILE_ICON = {
  investor: Target,
  asset: Building2,
  advisor: Briefcase,
} satisfies Record<DemoProfileKey, typeof Target>

const ROUTE_ICON = {
  landing: Home,
  signup: ShieldCheck,
  onboarding: Workflow,
  dashboard: LayoutDashboard,
  thesis: Target,
  radar: Radar,
  feed: Compass,
  pipeline: Handshake,
  mrs: Sparkles,
  projects: FolderKanban,
  project: FolderKanban,
  profile: UserCircle2,
  settings: Settings,
} satisfies Record<DemoRouteKey, typeof Home>

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function resolveRoute(segments: string[]): { key: DemoRouteKey; codename?: string } | null {
  if (segments.length === 0) return { key: 'landing' }
  const [first, second] = segments
  if (first === 'signup') return { key: 'signup' }
  if (first === 'onboarding') return { key: 'onboarding' }
  if (first === 'dashboard') return { key: 'dashboard' }
  if (first === 'thesis') return { key: 'thesis' }
  if (first === 'radar') return { key: 'radar' }
  if (first === 'feed') return { key: 'feed' }
  if (first === 'pipeline') return { key: 'pipeline' }
  if (first === 'mrs') return { key: 'mrs' }
  if (first === 'profile') return { key: 'profile' }
  if (first === 'settings') return { key: 'settings' }
  if (first === 'projects' && second) return { key: 'project', codename: second }
  if (first === 'projects') return { key: 'projects' }
  return null
}

function sectionTitle(experience: DemoProfileExperience, routeKey: DemoRouteKey) {
  if (routeKey === 'landing') return experience.landing.title
  if (routeKey === 'signup') return experience.signup.title
  if (routeKey === 'onboarding') return experience.onboarding.title
  if (routeKey === 'dashboard') return experience.dashboard?.title ?? 'Dashboard'
  if (routeKey === 'thesis') return experience.thesis?.title ?? 'Teses'
  if (routeKey === 'radar') return experience.radar?.title ?? 'Radar'
  if (routeKey === 'feed') return experience.feed?.title ?? 'Feed'
  if (routeKey === 'pipeline') return experience.pipeline?.title ?? 'Pipeline'
  if (routeKey === 'mrs') return experience.mrs?.title ?? 'MRS'
  if (routeKey === 'projects') return experience.projects?.title ?? 'Projetos'
  if (routeKey === 'project') return experience.project?.title ?? 'Projeto'
  if (routeKey === 'profile') return experience.profilePage?.title ?? 'Perfil'
  if (routeKey === 'settings') return experience.settings?.title ?? 'Configurações'
  return experience.label
}

function renderField(field: DemoFormField) {
  const value = field.value

  if (Array.isArray(value) || field.kind === 'tags') {
    const items = Array.isArray(value) ? value : [String(value)]
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="rounded-full px-3 py-1">
            {item}
          </Badge>
        ))}
      </div>
    )
  }

  if (field.kind === 'textarea') {
    return <Textarea value={String(value)} disabled className="min-h-[112px] resize-none" />
  }

  if (field.kind === 'boolean' || field.kind === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <Badge className={cn(value ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white')}>
          {value ? 'Sim' : 'Não'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {field.kind === 'checkbox' ? 'aceite registrado' : 'resposta mockada'}
        </span>
      </div>
    )
  }

  return <Input value={String(value)} disabled />
}

function FieldsGrid({ fields, columns = 2 }: { fields: DemoFormField[]; columns?: 1 | 2 }) {
  return (
    <TooltipProvider delayDuration={250}>
      <div className={cn('grid gap-4', columns === 2 && 'lg:grid-cols-2')}>
        {fields.map((field) => (
          <div key={field.label} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <p className="text-sm font-medium text-foreground">{field.label}</p>
                {field.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Ajuda: ${field.label}`}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-left leading-snug">
                      {field.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {field.saved ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Salvo
                  </span>
                ) : null}
                {field.note ? <p className="text-xs text-muted-foreground">{field.note}</p> : null}
              </div>
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}

function cloneDemoSteps(steps: DemoStep[]): DemoStep[] {
  return JSON.parse(JSON.stringify(steps)) as DemoStep[]
}

function computeOnboardingProgress(current: DemoStep[], baseline: DemoStep[]): number {
  if (baseline.length === 0 || current.length === 0) return 0
  let total = 0
  let changed = 0
  for (let i = 0; i < current.length; i++) {
    const cf = current[i]?.fields ?? []
    const bf = baseline[i]?.fields ?? []
    for (let j = 0; j < cf.length; j++) {
      total++
      if (JSON.stringify(cf[j]?.value) !== JSON.stringify(bf[j]?.value)) {
        changed++
      }
    }
  }
  if (total === 0) return 0
  return Math.round((changed / total) * 100)
}

function renderOnboardingField(
  field: DemoFormField,
  onChange: (v: DemoFormFieldValue) => void,
  options?: { completionAnchorId?: string }
) {
  const value = field.value

  if (field.kind === 'investor-step2-bundle') {
    const v = value as DemoInvestorOnboardingStep2Value
    return (
      <DemoInvestorOnboardingStep2Field
        value={v}
        onChange={onChange}
        completionAnchorId={options?.completionAnchorId}
      />
    )
  }

  if (field.kind === 'geography') {
    const codes = Array.isArray(value) ? value.map(String) : []
    return <DemoGeographyPicker value={codes} onChange={(v) => onChange(v)} />
  }

  if (Array.isArray(value) || field.kind === 'tags') {
    const items = Array.isArray(value) ? value : [String(value)]
    return <DemoTagsField value={items} onChange={(next) => onChange(next)} tagOptions={field.tagOptions} />
  }

  if (field.kind === 'textarea') {
    return (
      <Textarea
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[112px] resize-none rounded-lg"
      />
    )
  }

  if (field.kind === 'boolean') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v === true)}
          aria-label={field.label}
        />
        <span className="text-sm text-muted-foreground">Ajuste conforme o seu caso.</span>
      </div>
    )
  }

  if (field.kind === 'checkbox') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v === true)}
          aria-label={field.label}
        />
        <span className="text-sm text-muted-foreground">Aceite (simulado na demo).</span>
      </div>
    )
  }

  return <Input value={String(value)} onChange={(e) => onChange(e.target.value)} className="rounded-lg" />
}

function OnboardingStepFields({
  fields,
  onFieldChange,
  investorCompletionAnchorId,
}: {
  fields: DemoFormField[]
  onFieldChange: (label: string, value: DemoFormFieldValue) => void
  investorCompletionAnchorId?: string
}) {
  return (
    <div className={cn('grid gap-4', 'lg:grid-cols-2')}>
      {fields.map((field) => (
        <div
          key={field.label}
          className={cn(
            'space-y-2',
            field.kind === 'geography' && 'lg:col-span-2',
            field.kind === 'investor-step2-bundle' && 'lg:col-span-2'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-sm font-medium text-foreground">{field.label}</p>
              {field.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Ajuda: ${field.label}`}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-left leading-snug">
                    {field.tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
          {renderOnboardingField(field, (v) => onFieldChange(field.label, v), {
            completionAnchorId: investorCompletionAnchorId,
          })}
        </div>
      ))}
    </div>
  )
}

function MetricsGrid({ metrics }: { metrics: Array<{ label: string; value: string; helper: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics?.map((metric) => (
        <Card key={metric.label} className="rounded-3xl border-white/70 bg-white/90 shadow-card">
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-3xl">{metric.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{metric.helper}</CardContent>
        </Card>
      ))}
    </div>
  )
}

function PanelGrid({ panels }: { panels: DemoPanel[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {panels.map((panel) => (
        <Card key={panel.title} className="rounded-3xl border-white/70 bg-white/90 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">{panel.title}</CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">{panel.body}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {panel.badges?.length ? (
              <div className="flex flex-wrap gap-2">
                {panel.badges.map((badge) => (
                  <Badge key={badge} variant="outline" className="rounded-full">
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : null}
            {panel.bullets?.length ? (
              <div className="space-y-2">
                {panel.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DataTable({ table }: { table: DemoTable }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-white/90 shadow-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/60 text-left text-muted-foreground">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="border-t border-border">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DemoPlatformHome() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(122,32,59,0.16),_transparent_38%),linear-gradient(180deg,#fff7f3_0%,#f8fafc_45%,#eff5f2_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-8 max-w-3xl space-y-4">
          <Badge className="rounded-full bg-primary px-4 py-1 text-primary-foreground">Modo demo público · 100% mockado</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Plataforma completa da Mary para apresentar os 3 perfis ponta a ponta.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cada perfil abre uma shell navegável com landing, cadastro, onboarding e área logada. Tudo usa dados fictícios e não depende de Supabase.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {DEMO_HOME_PROFILES.map((item) => {
            const Icon = PROFILE_ICON[item.profile]
            return (
              <Card key={item.profile} className="rounded-[28px] border-white/70 bg-white/90 shadow-elegant">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">{item.subtitle}</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="mt-2 text-base leading-7">{item.summary}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full rounded-2xl">
                    <Link href={item.href}>
                      Abrir jornada
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PlatformDemoChrome({ profile, segments = [] }: { profile: DemoProfileKey; segments?: string[] }) {
  const experience = DEMO_PLATFORM[profile]
  const route = resolveRoute(segments)
  const current = useMemo(() => route ?? { key: 'landing' as DemoRouteKey }, [route])
  const Icon = PROFILE_ICON[profile]
  const CurrentIcon = ROUTE_ICON[current.key]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(122,32,59,0.12),_transparent_28%),linear-gradient(180deg,#fff7f3_0%,#f8fafc_42%,#eef4f7_100%)]">
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-4 md:px-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[32px] border border-white/80 bg-white/85 p-4 shadow-elegant backdrop-blur">
          <div className={cn('rounded-[28px] bg-gradient-to-br p-5 text-white', experience.accent)}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-white/20 p-3">
                <Icon className="h-7 w-7" />
              </div>
              <Badge className="border-white/20 bg-white/15 text-white">{experience.label}</Badge>
            </div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/70">mary demo</p>
            <h2 className="mt-2 text-2xl font-semibold">{experience.label}</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">{experience.audience}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Jornada pública</p>
            {experience.publicFlow.map((item) => (
              <SidebarLink key={item.href} item={item} active={current.key === item.key && item.key !== 'project'} />
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Area logada</p>
            {experience.appFlow.map((item) => (
              <SidebarLink key={item.href} item={item} active={current.key === item.key} />
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <header className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-elegant backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    100% mockado
                  </Badge>
                  <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                    {experience.tone}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <CurrentIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{experience.label}</p>
                    <h1 className="text-3xl font-semibold tracking-tight">{sectionTitle(experience, current.key)}</h1>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DemoMaryAiTrigger />
                {DEMO_HOME_PROFILES.map((item) => (
                  <Button key={item.profile} asChild variant={item.profile === profile ? 'default' : 'outline'} className="rounded-2xl">
                    <Link href={item.href}>{item.title}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </header>

          {renderRoute(experience, current)}
        </main>
      </div>

      <MaryAiEntryFallback />
    </div>
  )
}

function DemoMaryAiSheetHost() {
  const { isOpen, setOpen } = useMaryAi()
  return <MaryAiQuickChatSheet open={isOpen} onOpenChange={setOpen} />
}

function DemoMaryAiTrigger() {
  const { isOpen, toggle } = useMaryAiToggle()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5 rounded-lg border-destructive bg-background text-destructive shadow-card transition-smooth hover:bg-destructive/5 hover:text-destructive"
      onClick={toggle}
      aria-label={isOpen ? 'Fechar Mary AI' : 'Abrir Mary AI'}
      aria-expanded={isOpen}
    >
      Mary AI
      <ChevronDown className={cn('h-4 w-4 transition-smooth', isOpen && 'rotate-180')} aria-hidden />
    </Button>
  )
}

export function PlatformDemo({ profile, segments = [] }: { profile: DemoProfileKey; segments?: string[] }) {
  const initialContext = useMemo(() => createDemoMaryAiNavigationContext(profile), [profile])
  return (
    <OrganizationProvider initialContext={initialContext} initialUser={{ id: 'demo-user', email: 'demo@mary.ai' }}>
      <MaryAiProvider>
        <DemoMaryAiSheetHost />
        <PlatformDemoChrome profile={profile} segments={segments} />
      </MaryAiProvider>
    </OrganizationProvider>
  )
}

function SidebarLink({ item, active }: { item: { label: string; href: string }; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-smooth',
        active ? 'border-primary bg-primary text-primary-foreground shadow-card' : 'border-border bg-white text-foreground hover:bg-muted/60'
      )}
    >
      <span>{item.label}</span>
      <ChevronRight className="h-4 w-4" />
    </Link>
  )
}

function renderRoute(experience: DemoProfileExperience, route: { key: DemoRouteKey; codename?: string }) {
  if (route.key === 'landing') return <LandingView experience={experience} />
  if (route.key === 'signup') return <SignupView experience={experience} />
  if (route.key === 'onboarding') return <OnboardingView experience={experience} />
  if (route.key === 'dashboard' && experience.dashboard) return <DashboardView experience={experience} />
  if (route.key === 'thesis' && experience.thesis) return <ThesisView experience={experience} />
  if (route.key === 'radar' && experience.radar) return <RadarView experience={experience} />
  if (route.key === 'feed' && experience.feed) return <FeedView experience={experience} />
  if (route.key === 'pipeline' && experience.pipeline) return <PipelineView experience={experience} />
  if (route.key === 'mrs' && experience.mrs) return <MrsView experience={experience} />
  if (route.key === 'projects' && experience.projects) return <ProjectsView experience={experience} />
  if (
    route.key === 'project' &&
    experience.profile === 'investor' &&
    route.codename
  ) {
    if (experience.project && route.codename === experience.project.codename) {
      return <ProjectView experience={experience} />
    }
    const kanbanCard = experience.projects?.kanbanCards?.find((c) => c.codename === route.codename)
    if (kanbanCard) {
      return (
        <ProjectView
          experience={{
            ...experience,
            project: createInvestorPlaceholderProject(kanbanCard),
          }}
        />
      )
    }
  }
  if (route.key === 'project' && experience.project && route.codename === experience.project.codename)
    return <ProjectView experience={experience} />
  if (route.key === 'profile' && experience.profilePage) return <ProfileView experience={experience} />
  if (route.key === 'settings' && experience.settings) return <SettingsView experience={experience} />

  return (
    <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
      <CardHeader>
        <CardTitle>Tela não mapeada</CardTitle>
        <CardDescription>Essa rota não faz parte da navegação mockada para este perfil.</CardDescription>
      </CardHeader>
    </Card>
  )
}

function LandingView({ experience }: { experience: DemoProfileExperience }) {
  return (
    <div className="space-y-6">
      <Card className={cn('overflow-hidden rounded-[32px] border-0 bg-gradient-to-br p-1 text-white shadow-elegant', experience.accent)}>
        <div className="rounded-[28px] bg-black/15 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-white/70">{experience.landing.eyebrow}</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">{experience.landing.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">{experience.landing.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-2xl">
              <Link href={experience.landing.ctaPrimary.href}>{experience.landing.ctaPrimary.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href={experience.landing.ctaSecondary.href}>{experience.landing.ctaSecondary.label}</Link>
            </Button>
          </div>
        </div>
      </Card>
      <MetricsGrid metrics={experience.landing.stats} />
      <PanelGrid panels={experience.landing.previewPanels} />
    </div>
  )
}

function SignupView({ experience }: { experience: DemoProfileExperience }) {
  const cta = experience.signup.ctaBanner

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-elegant">
        <CardHeader>
          <CardTitle>{experience.signup.title}</CardTitle>
          <CardDescription className="text-base leading-7">{experience.signup.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cta ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-card">
              <p className="text-base font-medium leading-7 text-foreground">{cta.message}</p>
              <div className="mt-4">
                <Button asChild className="rounded-2xl">
                  <Link href={cta.ctaHref}>{cta.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          ) : null}
          <FieldsGrid fields={experience.signup.fields} />
        </CardContent>
      </Card>
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>Regras e automações</CardTitle>
          <CardDescription>
            Comportamento de produto, padrões Mary e validações técnicas esperadas (mock, antes de auth real).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {experience.signup.validations.map((validation) => (
            <div key={validation} className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <span>{validation}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function OnboardingView({ experience }: { experience: DemoProfileExperience }) {
  const baselineRef = useRef<DemoStep[] | null>(null)
  const [steps, setSteps] = useState<DemoStep[]>(() => {
    const initial = cloneDemoSteps(experience.onboarding.steps)
    baselineRef.current = initial
    return initial
  })

  useEffect(() => {
    const next = cloneDemoSteps(experience.onboarding.steps)
    baselineRef.current = next
    setSteps(next)
    // Baseline vem de DEMO_PLATFORM por perfil; intencionalmente não dependemos de `experience.onboarding.steps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience.profile])

  const progressDelta = useMemo(() => {
    const base = baselineRef.current ?? steps
    return computeOnboardingProgress(steps, base)
  }, [steps])

  const handleFieldChange = (stepId: string, label: string, value: DemoFormFieldValue) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id !== stepId) return step
        return {
          ...step,
          fields: step.fields.map((f) => (f.label === label ? { ...f, value } : f)),
        }
      })
    )
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{experience.onboarding.title}</CardTitle>
          <CardDescription className="text-base leading-7">{experience.onboarding.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {steps.length} passo{steps.length === 1 ? '' : 's'} · campos editáveis (exemplo inicial pode ser alterado)
            </span>
            <span>{progressDelta}% alterado em relação ao exemplo</span>
          </div>
          <Progress value={progressDelta} className="h-2" />
        </CardContent>
      </Card>

      {steps.map((step, index) => (
        <div
          key={step.id}
          className="space-y-6"
          id={experience.profile === 'investor' && index === 1 ? 'demo-investor-onboarding-step-2' : undefined}
        >
          <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
            <CardHeader>
              <div className="flex flex-wrap items-start gap-2">
                <CardTitle className="flex-1">{step.title}</CardTitle>
                {step.titleTooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Ajuda: ${step.title}`}
                      >
                        <HelpCircle className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-left leading-snug">
                      {step.titleTooltip}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              <CardDescription className="text-base leading-7">{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingStepFields
                fields={step.fields}
                onFieldChange={(label, value) => handleFieldChange(step.id, label, value)}
                investorCompletionAnchorId={
                  experience.profile === 'investor' ? 'demo-investor-onboarding-completion' : undefined
                }
              />
            </CardContent>
          </Card>

          {experience.profile === 'asset' && index === 0 ? (
            <MockPopupCard text="Com base nas informações fornecidas, identificamos investidores potencialmente compatíveis com seu perfil. Continue para refinar seu perfil e se preparar." />
          ) : null}

          {experience.profile === 'investor' && index === 0 ? (
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card md:flex-row md:items-center md:justify-between md:gap-6">
              <p className="text-base leading-7">{INVESTOR_BRIDGE_COPY}</p>
              <Button
                type="button"
                className="shrink-0 rounded-2xl"
                onClick={() =>
                  document.getElementById('demo-investor-onboarding-step-2')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
              >
                Passo 2
              </Button>
            </div>
          ) : null}

          {experience.profile === 'asset' && index === 2 ? (
            <MockPopupCard text="Você está a um passo de conhecer seu Market Readiness Score e depois conectar-se com investidores qualificados." />
          ) : null}
        </div>
      ))}

      <CompletionPopupCard
        id={experience.profile === 'investor' ? 'demo-investor-onboarding-completion' : undefined}
        title={experience.onboarding.completionTitle}
        body={experience.onboarding.completionBody}
        href={experience.onboarding.completionHref}
        cta={experience.onboarding.completionCta}
      />
      </div>
    </TooltipProvider>
  )
}

const INVESTOR_BRIDGE_COPY =
  'Com base nas informações fornecidas, identificamos ativos potencialmente compatíveis com seu perfil. Continue para refinar sua tese de investimento.'

function MockPopupCard({ text }: { text: string }) {
  return (
    <Card className="mx-auto max-w-2xl rounded-[28px] border-primary/25 bg-white/95 shadow-elegant">
      <CardContent className="pt-6">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center text-base leading-7 text-foreground">
          <div className="mb-3 flex items-center justify-center">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          {text}
        </div>
      </CardContent>
    </Card>
  )
}

function CompletionPopupCard({
  id,
  title,
  body,
  href,
  cta,
}: {
  id?: string
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <Card
      id={id}
      className="mx-auto max-w-2xl scroll-mt-8 rounded-[28px] border-primary/25 bg-white/95 shadow-elegant"
    >
      <CardContent className="pt-6">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center text-foreground">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mx-auto mt-3 max-w-xl whitespace-pre-line text-base leading-7 text-muted-foreground">{body}</p>
          <div className="mt-6 flex justify-center">
            <Button asChild className="rounded-2xl">
              <Link href={href}>{cta}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardView({ experience }: { experience: DemoProfileExperience }) {
  const dashboard = experience.dashboard!

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{dashboard.title}</CardTitle>
          <CardDescription className="text-base leading-7">{dashboard.summary}</CardDescription>
        </CardHeader>
      </Card>
      <MetricsGrid metrics={dashboard.metrics} />
      <PanelGrid panels={dashboard.panels} />
      <DemoAiQueueCard prompts={dashboard.aiQueue} />
    </div>
  )
}

function ThesisView({ experience }: { experience: DemoProfileExperience }) {
  const thesis = experience.thesis!
  const [approvedByThesisId, setApprovedByThesisId] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{thesis.title}</CardTitle>
          <CardDescription className="text-base leading-7">{thesis.summary}</CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue={thesis.theses[0]?.id} className="space-y-4">
        <TabsList className="h-auto flex-wrap rounded-2xl p-1">
          {thesis.theses.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="rounded-xl">
              {item.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {thesis.theses.map((item) => (
          <TabsContent key={item.id} value={item.id}>
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle>{item.name}</CardTitle>
                    <Badge>{item.status}</Badge>
                    <Badge variant="outline">{item.matchCount}</Badge>
                  </div>
                  <CardDescription className="text-base leading-7">{item.summary}</CardDescription>
                </div>
                <ProjectTabHeaderActions
                  actions={['share', 'approve', 'edit']}
                  tabId={item.id}
                  approvedAriaLabel={`Tese ${item.name} aprovada (demo)`}
                  isApproved={Boolean(approvedByThesisId[item.id])}
                  onShare={async () => {
                    const url = `https://mary.ai/demo/investor/thesis?thesis=${item.id}`
                    try {
                      await navigator.clipboard.writeText(url)
                      toast.success('Link copiado (demo).')
                    } catch {
                      toast.message('Link (demo)', { description: url })
                    }
                  }}
                  onEdit={() => toast.success('Alterações salvas localmente (demo).')}
                  onApprove={() => {
                    setApprovedByThesisId((prev) => ({ ...prev, [item.id]: true }))
                    toast.success(`Tese "${item.name}" marcada como aprovada (demo).`)
                  }}
                />
              </CardHeader>
              <CardContent>
                <FieldsGrid fields={item.fields} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      <DemoAiQueueCard prompts={thesis.aiActions} />
    </div>
  )
}

function RadarView({ experience }: { experience: DemoProfileExperience }) {
  const radar = experience.radar!
  const thesisList = experience.thesis?.theses ?? []
  const initialThesisId =
    thesisList.find((t) => t.status === 'Ativa')?.id ?? thesisList[0]?.id ?? 'edtech-growth'
  const [selectedThesisId, setSelectedThesisId] = useState(initialThesisId)
  const [minMrs, setMinMrs] = useState(0)

  const filteredOpportunities = useMemo(() => {
    const list = radar.opportunities ?? []
    return list.filter((o) => {
      const mrs = o.mrsScore ?? o.matchScore
      if (mrs < minMrs) return false
      if (o.thesisIds?.length) return o.thesisIds.includes(selectedThesisId)
      return true
    })
  }, [radar.opportunities, minMrs, selectedThesisId])

  const showInvestorOpportunityRadar = radar.opportunities != null

  return (
    <div className="space-y-6">
      {showInvestorOpportunityRadar ? (
        <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
          <CardHeader>
            <CardTitle>{radar.title}</CardTitle>
            <CardDescription className="text-base leading-7">{radar.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="demo-radar-thesis" className="text-sm font-medium">
                  {radar.selectorLabel}
                </Label>
                <Select value={selectedThesisId} onValueChange={setSelectedThesisId}>
                  <SelectTrigger id="demo-radar-thesis" className="w-full max-w-md rounded-lg">
                    <SelectValue placeholder="Selecione uma tese" />
                  </SelectTrigger>
                  <SelectContent>
                    {thesisList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.status !== 'Ativa' ? ` (${t.status})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 flex-1 space-y-3 lg:max-w-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="demo-radar-mrs" className="text-sm font-medium">
                    MRS mínimo
                  </Label>
                  <span className="text-sm tabular-nums text-muted-foreground">{minMrs}</span>
                </div>
                <Slider
                  id="demo-radar-mrs"
                  min={0}
                  max={100}
                  step={1}
                  value={[minMrs]}
                  onValueChange={(v) => setMinMrs(v[0] ?? 0)}
                  className="w-full"
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {filteredOpportunities.length} oportunidade
              {filteredOpportunities.length === 1 ? '' : 's'} com os filtros atuais
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
          <CardHeader>
            <CardTitle>{radar.title}</CardTitle>
            <CardDescription className="text-base leading-7">{radar.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{radar.selectorLabel}</p>
            <div className="flex flex-wrap gap-2">
              {radar.selectorValues.map((value) => (
                <Badge key={value} variant="secondary" className="rounded-full px-3 py-1">
                  {value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {radar.opportunities ? (
        <OpportunitiesList
          key={`demo-radar-${selectedThesisId}-${minMrs}`}
          organizationId={`demo-${experience.profile}`}
          opportunities={filteredOpportunities}
          readOnlyMode={false}
          fallbackUsed={false}
          demoMode
        />
      ) : radar.matches ? (
        <PanelGrid panels={radar.matches} />
      ) : null}

      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>Notas de fluxo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {radar.notes.map((note) => (
            <div key={note} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="mt-0.5 h-4 w-4 text-primary" />
              <span>{note}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function FeedView({ experience }: { experience: DemoProfileExperience }) {
  const feed = experience.feed!

  if (experience.profile === 'investor' && feed.filterTabs?.length) {
    return <DemoInvestorFeed feed={feed} />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
      <div className="space-y-6">
        <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
          <CardHeader>
            <CardTitle>{feed.title}</CardTitle>
            <CardDescription className="text-base leading-7">{feed.summary}</CardDescription>
          </CardHeader>
          {feed.filters.length > 0 ? (
            <CardContent className="flex flex-wrap gap-2">
              {feed.filters.map((filter) => (
                <Badge key={filter} variant="outline" className="rounded-full px-3 py-1">
                  {filter}
                </Badge>
              ))}
            </CardContent>
          ) : null}
        </Card>

        {feed.items.map((item) => (
          <Card key={item.id} className="rounded-[28px] border-white/80 bg-white/90 shadow-card">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{item.tag}</Badge>
                <CardDescription>{formatDateTime(item.at)}</CardDescription>
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
          </Card>
        ))}
      </div>
      <DemoAiQueueCard prompts={feed.aiPrompts} />
    </div>
  )
}

function PipelineView({ experience }: { experience: DemoProfileExperience }) {
  const pipeline = experience.pipeline!

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{pipeline.title}</CardTitle>
          <CardDescription className="text-base leading-7">{pipeline.summary}</CardDescription>
        </CardHeader>
      </Card>
      <MetricsGrid metrics={pipeline.metrics} />
      <PipelineBoard orgSlug={`demo/${experience.profile}`} initialProjects={pipeline.projects} readOnlyMode={false} demoMode />
      <PanelGrid panels={pipeline.stageRules} />
    </div>
  )
}

function MrsView({ experience }: { experience: DemoProfileExperience }) {
  const mrs = experience.mrs!
  const radarAxes = mrs.radarAxes
  const hasRadar = Boolean(radarAxes && radarAxes.length >= 3)
  const canonicalSteps = useMemo(() => createDefaultMrsSteps(), [])
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const maxIdx = Math.min(mrs.steps.length, canonicalSteps.length) - 1
  const safeIdx = Math.min(Math.max(0, activeStepIdx), Math.max(0, maxIdx))
  const activeCanonical = canonicalSteps[safeIdx]!
  const narrative = mrs.steps[safeIdx]

  const stepButtonRow = (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {mrs.steps.map((step, idx) => {
        const stepId = (idx + 1) as MrsStepId
        return (
          <button
            key={step.title}
            type="button"
            onClick={() => setActiveStepIdx(idx)}
            aria-pressed={safeIdx === idx}
            className={mrsStepNavButtonClass(stepId, safeIdx === idx)}
          >
            Passo {idx + 1}
          </button>
        )
      })}
    </div>
  )

  const narrativeAndChecklist = (
    <div className="space-y-4 scroll-mt-28" id="demo-mrs-step-detail">
      {narrative ? (
        <div
          className="rounded-lg border border-border bg-card px-3 py-2 shadow-none"
          title={narrative.body}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Regras do passo</p>
          <p className="text-sm font-medium leading-tight text-card-foreground">{narrative.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{narrative.body}</p>
          {narrative.bullets?.length ? (
            <ul className="mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {narrative.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium leading-none text-foreground"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{activeCanonical.name}</p>
        <MrsStepItemsPanel step={activeCanonical} mode="demo" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-elegant">
        <CardHeader>
          <CardTitle>{mrs.title}</CardTitle>
          <CardDescription className="text-base leading-7">{mrs.summary}</CardDescription>
        </CardHeader>
        {!hasRadar ? (
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Score atual</p>
                <p className="text-5xl font-semibold">{mrs.score}</p>
              </div>
              <Badge className="rounded-full bg-primary px-4 py-2 text-primary-foreground">Market Readiness Score</Badge>
            </div>
            <Progress value={mrs.score} className="h-2" />
          </CardContent>
        ) : null}
      </Card>

      {hasRadar && radarAxes ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Score Total Mary</CardDescription>
                <CardTitle className="text-4xl">
                  {mrs.score}
                  <span className="text-lg font-normal text-muted-foreground">/100</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={mrs.score} className="h-2" />
              </CardContent>
            </Card>
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>Benchmark do setor</CardDescription>
                  <CardTitle
                    className={cn(
                      'text-4xl',
                      mrs.benchmarkScore == null && 'text-muted-foreground'
                    )}
                  >
                    {mrs.benchmarkScore != null ? (
                      <>
                        {mrs.benchmarkScore}
                        <span className="text-lg font-normal text-muted-foreground">/100</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </CardTitle>
                </div>
                {mrs.benchmarkScore == null ? (
                  <Badge variant="secondary" className="rounded-full">
                    Em breve
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent>
                <Progress
                  value={mrs.benchmarkScore ?? 0}
                  className={cn('h-2', mrs.benchmarkScore == null && 'opacity-40')}
                />
              </CardContent>
            </Card>
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Status global</CardDescription>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <CardTitle className="text-xl">{mrs.globalStatus?.label ?? '—'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {mrs.globalStatus?.detail ?? ''}
              </CardContent>
            </Card>
          </div>
          <MrsRadarChart
            axes={radarAxes}
            className="rounded-[32px] border-white/80 bg-white/90 shadow-card"
          />
          {stepButtonRow}
        </>
      ) : (
        <>
          <MetricsGrid metrics={mrs.dimensions} />
          {stepButtonRow}
        </>
      )}

      {narrativeAndChecklist}
      <ProjectDocsCard docs={mrs.docs} />
      <DemoAiQueueCard prompts={mrs.aiPrompts} />
    </div>
  )
}

function demoProjectMatchBadgeClass(score: number) {
  if (score >= 82) {
    return 'border-success/45 bg-success/15 text-success'
  }
  return 'border-amber-500/50 bg-amber-500/12 text-amber-950 dark:text-amber-100'
}

function projectListCountLabel(profile: DemoProfileKey, count: number) {
  if (profile === 'investor') return `${count} Oportunidades encontradas`
  if (profile === 'asset') return `${count} Projetos encontrados`
  return `${count} Mandatos encontrados`
}

function ProjectsView({ experience }: { experience: DemoProfileExperience }) {
  const projects = experience.projects!

  if (experience.profile === 'investor' && projects.kanbanCards?.length) {
    return (
      <DemoInvestorProjectsKanban
        profileSlug="investor"
        title={projects.title}
        summary={projects.summary}
        cards={projects.kanbanCards}
      />
    )
  }

  const gridCards = projects.cards ?? []
  const count = gridCards.length

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{projects.title}</CardTitle>
          <CardDescription className="text-base leading-7">{projects.summary}</CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {projectListCountLabel(experience.profile, count)}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {gridCards.map((project) => {
          const matchPct = project.matchScore ?? 72
          const readiness =
            project.readinessScore ?? Math.min(100, Math.round(matchPct * 0.75))
          const location = project.location?.trim() ? project.location : '—'
          const hasDetailLink = Boolean(experience.project && project.codename === experience.project.codename)
          const revenueDisplay = project.annualRevenue ?? project.value
          const revenueLabel = project.annualRevenue ? 'Receita Anual' : 'Valor alvo'

          return (
            <div
              key={project.codename}
              className="flex flex-col rounded-lg border border-border bg-card p-4 text-card-foreground shadow-card"
            >
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug text-foreground">{project.name}</p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                        demoProjectMatchBadgeClass(matchPct)
                      )}
                    >
                      {matchPct}%
                    </span>
                  </div>

                  {project.sector || project.sectorTag ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {project.sector ? (
                        <span className="text-sm text-muted-foreground">{project.sector}</span>
                      ) : null}
                      {project.sectorTag ? (
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-normal">
                          {project.sectorTag}
                        </Badge>
                      ) : null}
                    </div>
                  ) : project.typeLabel ? (
                    <Badge variant="outline" className="w-fit rounded-full px-2.5 py-0.5 text-xs font-normal">
                      {project.typeLabel}
                    </Badge>
                  ) : null}

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{project.stage}</span>
                  </div>

                  <div className="rounded-lg border border-border bg-background/80 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Readiness Score</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {readiness}/100
                      </span>
                    </div>
                    <Progress value={readiness} className="mt-2 h-2 bg-secondary" />
                  </div>

                  <div className="rounded-lg bg-muted/80 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">{revenueLabel}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">
                      {revenueDisplay}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {hasDetailLink ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-lg border-border bg-background font-medium shadow-none transition-smooth hover:bg-muted/50"
                  >
                    <Link
                      href={`/demo/${experience.profile}/projects/${project.codename}`}
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                      Ver detalhes
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg border-border bg-background font-medium shadow-none transition-smooth hover:bg-muted/50"
                    onClick={() =>
                      toast.message('Ver detalhes', {
                        description: 'Demo: página de detalhe disponível apenas para o projeto principal mockado.',
                      })
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" aria-hidden />
                    Ver detalhes
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Matriz demo: Resumo → share+edit; Investidores → nenhum; Teaser/Valuation/Deck/+Info → share+approve+edit; demais ids → nenhum */
type ProjectTabSecondaryAction = 'share' | 'approve' | 'edit'

type ProjectDemoModal = 'invite' | 'share' | 'edit' | 'approve' | null

function getProjectTabSecondaryActions(tabId: string): ProjectTabSecondaryAction[] {
  switch (tabId) {
    case 'summary':
      return ['share', 'edit']
    case 'mrs':
      return ['share', 'approve', 'edit']
    case 'investors':
      return []
    case 'teaser':
    case 'valuation':
    case 'deck':
    case 'info':
      return ['share', 'approve', 'edit']
    default:
      return []
  }
}

function ProjectTabHeaderActions({
  actions,
  tabId,
  isApproved,
  onShare,
  onEdit,
  onApprove,
  approvedAriaLabel,
}: {
  actions: ProjectTabSecondaryAction[]
  tabId: string
  isApproved: boolean
  onShare: () => void
  onEdit: () => void
  onApprove: () => void
  approvedAriaLabel?: string
}) {
  if (actions.length === 0) return null

  const approvedLabel =
    approvedAriaLabel ?? `Material da aba ${tabId} aprovado (demo)`

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {actions.includes('share') ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg border-border bg-background shadow-none transition-smooth hover:bg-muted/60"
          onClick={onShare}
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden />
          Compartilhar
        </Button>
      ) : null}
      {actions.includes('approve') ? (
        isApproved ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled
            className="rounded-lg border border-border/80 bg-muted/50 text-muted-foreground shadow-none"
            aria-label={approvedLabel}
          >
            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" aria-hidden />
            Aprovado
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg border-border bg-background shadow-none transition-smooth hover:bg-muted/60"
            onClick={onApprove}
          >
            <BadgeCheck className="mr-2 h-4 w-4" aria-hidden />
            Aprovar
          </Button>
        )
      ) : null}
      {actions.includes('edit') ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-lg text-foreground transition-smooth hover:bg-muted/60"
          onClick={onEdit}
        >
          <Pencil className="mr-2 h-4 w-4" aria-hidden />
          Editar
        </Button>
      ) : null}
    </div>
  )
}

function ProjectView({ experience }: { experience: DemoProfileExperience }) {
  const project = experience.project!
  const defaultTabId = project.tabs[0]?.id ?? 'summary'
  const [activeTabId, setActiveTabId] = useState(defaultTabId)
  const [openModal, setOpenModal] = useState<ProjectDemoModal>(null)
  /** Aba alvo para Compartilhar, Editar e Aprovar (mock) */
  const [modalTabId, setModalTabId] = useState(defaultTabId)
  const [approvedByTabId, setApprovedByTabId] = useState<Record<string, boolean>>({})
  const [inviteEmail, setInviteEmail] = useState('')
  const [editDraft, setEditDraft] = useState('')

  const tabLabel = (id: string) => project.tabs.find((t) => t.id === id)?.label ?? id
  const mockShareUrl = `https://mary.ai/demo/${experience.profile}/projects/${project.codename}/preview?tab=${modalTabId}`

  const openForTab = (tabId: string, kind: Exclude<ProjectDemoModal, null>) => {
    setModalTabId(tabId)
    setOpenModal(kind)
  }

  const handleInviteSend = () => {
    toast.success('Convite simulado enviado (demo).')
    setOpenModal(null)
    setInviteEmail('')
  }

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(mockShareUrl)
      toast.success('Link copiado (demo).')
    } catch {
      toast.message('Link (demo)', { description: mockShareUrl })
    }
  }

  const handleEditSave = () => {
    toast.success('Alterações salvas localmente (demo).')
    setOpenModal(null)
  }

  const handleApproveConfirm = () => {
    setApprovedByTabId((prev) => ({ ...prev, [modalTabId]: true }))
    toast.success(`Material "${tabLabel(modalTabId)}" marcado como aprovado (demo).`)
    setOpenModal(null)
  }

  const kanbanCardForProject = experience.projects?.kanbanCards?.find(
    (c) => c.codename === project.codename
  )
  /** Sem card no Kanban (ex.: Tiger só em `project`), assume NDA para narrativa demo. */
  const investorDemoHasNda = kanbanCardForProject ? kanbanCardForProject.column !== 'teaser' : true

  return (
    <div className="space-y-6">
      <PanelGrid panels={project.summary} />
      <Tabs value={activeTabId} onValueChange={setActiveTabId} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <TabsList className="h-auto w-fit max-w-full shrink-0 flex-wrap rounded-2xl p-1">
            {project.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            type="button"
            size="sm"
            className="shrink-0 rounded-lg transition-smooth"
            onClick={() => setOpenModal('invite')}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden />
            + Convidar investidores
          </Button>
        </div>
        {project.tabs.map((tab) => {
          const isInvestorProject =
            experience.profile === 'investor' && experience.mrs && tab.id === 'mrs'
          const isInvestorMoreInfo =
            experience.profile === 'investor' &&
            tab.id === 'info' &&
            Boolean(tab.moreInfoSections?.length)

          if (isInvestorProject) {
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <CardDescription className="text-base leading-7">{tab.intro}</CardDescription>
                    <ProjectTabHeaderActions
                      actions={getProjectTabSecondaryActions(tab.id)}
                      tabId={tab.id}
                      isApproved={Boolean(approvedByTabId[tab.id])}
                      onShare={() => openForTab(tab.id, 'share')}
                      onEdit={() => {
                        setEditDraft('')
                        openForTab(tab.id, 'edit')
                      }}
                      onApprove={() => openForTab(tab.id, 'approve')}
                    />
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <DemoInvestorProjectMrsTab
                      mrs={experience.mrs!}
                      kpiScoreOverride={project.kpiScoreOverride}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )
          }

          if (isInvestorMoreInfo) {
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <CardTitle>{tab.label}</CardTitle>
                      <CardDescription className="text-base leading-7">{tab.intro}</CardDescription>
                    </div>
                    <ProjectTabHeaderActions
                      actions={getProjectTabSecondaryActions(tab.id)}
                      tabId={tab.id}
                      isApproved={Boolean(approvedByTabId[tab.id])}
                      onShare={() => openForTab(tab.id, 'share')}
                      onEdit={() => {
                        setEditDraft('')
                        openForTab(tab.id, 'edit')
                      }}
                      onApprove={() => openForTab(tab.id, 'approve')}
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DemoInvestorProjectMoreInfoTab
                      sections={tab.moreInfoSections!}
                      visibility={{ hasNda: investorDemoHasNda }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )
          }

          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <CardTitle>{tab.label}</CardTitle>
                    <CardDescription className="text-base leading-7">{tab.intro}</CardDescription>
                  </div>
                  <ProjectTabHeaderActions
                    actions={getProjectTabSecondaryActions(tab.id)}
                    tabId={tab.id}
                    isApproved={Boolean(approvedByTabId[tab.id])}
                    onShare={() => openForTab(tab.id, 'share')}
                    onEdit={() => {
                      setEditDraft('')
                      openForTab(tab.id, 'edit')
                    }}
                    onApprove={() => openForTab(tab.id, 'approve')}
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  {tab.panels?.length ? <PanelGrid panels={tab.panels} /> : null}
                  {tab.table ? <DataTable table={tab.table} /> : null}
                  {tab.docs?.length ? <ProjectDocsCard docs={tab.docs} /> : null}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={openModal === 'invite'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar investidores</DialogTitle>
            <DialogDescription>
              Demonstração: nenhum e-mail é enviado de verdade. Preencha para simular o fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="demo-invite-email">E-mail</Label>
            <Input
              id="demo-invite-email"
              type="email"
              placeholder="investidor@exemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setOpenModal(null)}>
              Cancelar
            </Button>
            <Button type="button" className="rounded-lg" onClick={handleInviteSend}>
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === 'share'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar material</DialogTitle>
            <DialogDescription>
              Link fictício para a aba <span className="font-medium text-foreground">{tabLabel(modalTabId)}</span>. Apenas
              demonstração.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="demo-share-url">URL</Label>
            <Input id="demo-share-url" readOnly value={mockShareUrl} className="rounded-lg font-mono text-xs" />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-lg" onClick={handleCopyShareLink}>
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copiar link
            </Button>
            <Button type="button" className="rounded-lg" onClick={() => setOpenModal(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === 'edit'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar · {tabLabel(modalTabId)}</DialogTitle>
            <DialogDescription>Alterações ficam só no navegador nesta sessão (demo).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="demo-edit-notes">Notas</Label>
            <Textarea
              id="demo-edit-notes"
              placeholder="Ajustes ou comentários internos (mock)…"
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="min-h-[120px] resize-none rounded-lg"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setOpenModal(null)}>
              Cancelar
            </Button>
            <Button type="button" className="rounded-lg" onClick={handleEditSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === 'approve'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar aprovação</DialogTitle>
            <DialogDescription>
              O material da aba <span className="font-medium text-foreground">{tabLabel(modalTabId)}</span> será
              marcado como aprovado nesta demonstração. Você pode recarregar a página para recomeçar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setOpenModal(null)}>
              Cancelar
            </Button>
            <Button type="button" className="rounded-lg" onClick={handleApproveConfirm}>
              <BadgeCheck className="mr-2 h-4 w-4" aria-hidden />
              Confirmar aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProfileView({ experience }: { experience: DemoProfileExperience }) {
  const profilePage = experience.profilePage!

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{profilePage.title}</CardTitle>
          <CardDescription className="text-base leading-7">{profilePage.summary}</CardDescription>
        </CardHeader>
      </Card>
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader><CardTitle>Identidade</CardTitle></CardHeader>
        <CardContent><FieldsGrid fields={profilePage.identity} /></CardContent>
      </Card>
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader><CardTitle>Track record</CardTitle></CardHeader>
        <CardContent><FieldsGrid fields={profilePage.trackRecord} /></CardContent>
      </Card>
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader><CardTitle>Preferências operacionais</CardTitle></CardHeader>
        <CardContent><FieldsGrid fields={profilePage.preferences} /></CardContent>
      </Card>
      <DemoAiQueueCard prompts={profilePage.aiQueue} />
    </div>
  )
}

function SettingsView({ experience }: { experience: DemoProfileExperience }) {
  const s = experience.settings!

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{s.title}</CardTitle>
          <CardDescription className="text-base leading-7">{s.summary}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="h-auto w-fit max-w-full flex-wrap rounded-2xl p-1">
          <TabsTrigger value="account" className="rounded-xl">
            Conta
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl">
            Faturamento
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl">
            Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>{s.account.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Perfil</p>
                <FieldsGrid fields={s.account.profile} />
              </div>
              {s.account.security.length ? <PanelGrid panels={s.account.security} /> : null}
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Preferências</p>
                <FieldsGrid fields={s.account.preferences} />
              </div>
              <PanelGrid panels={[s.account.organization]} />
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-border"
                onClick={() => toast.message('Sessão encerrada (demo)', { description: 'Nenhuma ação real foi executada.' })}
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Sair da sessão (demo)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
            <CardHeader>
              <CardTitle>Plano e uso</CardTitle>
              <CardDescription>
                {s.billing.plan.name} · {s.billing.plan.status} · {s.billing.plan.renewal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MetricsGrid metrics={s.billing.usage} />
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Pagamento</p>
                <FieldsGrid fields={s.billing.payment} columns={1} />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Faturas recentes</p>
                <DataTable table={s.billing.invoices} />
              </div>
              <p className="text-sm text-muted-foreground">{s.billing.fiscalNote}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Equipe</CardTitle>
                <CardDescription className="text-base leading-7">{s.team.rolesHelp}</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 rounded-lg"
                onClick={() => toast.success('Convite de membro simulado (demo).')}
              >
                Convidar membro
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable table={s.team.members} />
              {s.team.externalNote ? (
                <p className="text-sm text-muted-foreground">{s.team.externalNote}</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectDocsCard({ docs }: { docs: { name: string; status: string; note: string }[] }) {
  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.name} className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">{doc.name}</p>
            <p className="text-sm text-muted-foreground">{doc.note}</p>
          </div>
          <Badge variant={doc.status === 'Bloqueado' ? 'outline' : 'secondary'}>{doc.status}</Badge>
        </div>
      ))}
    </div>
  )
}

