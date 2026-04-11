import {
  DesignSystemSection,
  DemoSurface,
  DemoRow,
} from "@/components/design-system/design-system-demos";

const COLOR_SWATCHES: { label: string; bg: string; fg: string }[] = [
  { label: "background", bg: "bg-background", fg: "text-foreground" },
  { label: "foreground", bg: "bg-foreground", fg: "text-background" },
  { label: "card", bg: "bg-card", fg: "text-card-foreground" },
  { label: "popover", bg: "bg-popover", fg: "text-popover-foreground" },
  { label: "primary", bg: "bg-primary", fg: "text-primary-foreground" },
  { label: "secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
  { label: "muted", bg: "bg-muted", fg: "text-muted-foreground" },
  { label: "accent", bg: "bg-accent", fg: "text-accent-foreground" },
  { label: "destructive", bg: "bg-destructive", fg: "text-destructive-foreground" },
  { label: "success", bg: "bg-success", fg: "text-success-foreground" },
  { label: "border", bg: "bg-border", fg: "text-foreground" },
  { label: "input", bg: "bg-input", fg: "text-foreground" },
  { label: "ring (via focus)", bg: "bg-background ring-2 ring-ring", fg: "text-foreground" },
];

const SIDEBAR_SWATCHES: { label: string; classes: string }[] = [
  { label: "sidebar", classes: "bg-sidebar text-sidebar-foreground" },
  { label: "sidebar-primary", classes: "bg-sidebar-primary text-sidebar-primary-foreground" },
  { label: "sidebar-accent", classes: "bg-sidebar-accent text-sidebar-accent-foreground" },
];

export function DesignSystemFoundation() {
  return (
    <DesignSystemSection
      id="foundation"
      title="Fundação"
      description="Tokens semânticos (HSL) e utilitários de marca. Evite cores hardcoded; use sempre estes pares de superfície e texto."
    >
      <div className="space-y-12">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Cores</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_SWATCHES.map((row) => (
              <div
                key={row.label}
                className={`flex min-h-[4.5rem] items-end rounded-lg border border-border p-3 ${row.bg} ${row.fg}`}
              >
                <span className="text-xs font-medium">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Sidebar</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {SIDEBAR_SWATCHES.map((row) => (
              <div
                key={row.label}
                className={`flex min-h-[4rem] items-end rounded-lg border border-border p-3 ${row.classes}`}
              >
                <span className="text-xs font-medium">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Tipografia</h3>
          <DemoSurface className="space-y-3">
            <p className="text-4xl font-bold tracking-tight">Display bold</p>
            <p className="text-2xl font-semibold">Título semibold</p>
            <p className="text-lg font-medium">Subtítulo medium</p>
            <p className="text-base text-foreground">Corpo padrão (foreground)</p>
            <p className="text-sm text-muted-foreground">Texto secundário (muted-foreground)</p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Label / caption
            </p>
          </DemoSurface>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Sombras</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <DemoSurface className="shadow-card">
              <p className="text-sm font-medium">shadow-card</p>
              <p className="text-xs text-muted-foreground">Cards padrão</p>
            </DemoSurface>
            <DemoSurface className="shadow-elegant">
              <p className="text-sm font-medium">shadow-elegant</p>
              <p className="text-xs text-muted-foreground">Elevação</p>
            </DemoSurface>
            <DemoSurface className="shadow-glow">
              <p className="text-sm font-medium">shadow-glow</p>
              <p className="text-xs text-muted-foreground">Glow da marca</p>
            </DemoSurface>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Raio</h3>
          <DemoRow>
            <div className="flex h-14 w-24 items-center justify-center rounded-sm border border-border bg-muted text-xs">
              rounded-sm
            </div>
            <div className="flex h-14 w-24 items-center justify-center rounded-md border border-border bg-muted text-xs">
              rounded-md
            </div>
            <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-border bg-muted text-xs">
              rounded-lg
            </div>
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Transições</h3>
          <DemoRow>
            <div className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-smooth hover:opacity-90">
              transition-smooth
            </div>
            <div className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-bounce hover:scale-105">
              transition-bounce
            </div>
            <div className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-elegant hover:opacity-80">
              transition-elegant
            </div>
          </DemoRow>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Animações (Tailwind)</h3>
          <DemoRow>
            <div className="h-12 w-24 animate-fade-in rounded-lg bg-muted text-center text-xs leading-[3rem]">
              fade-in
            </div>
            <div className="h-12 w-24 animate-slide-in-right rounded-lg bg-muted text-center text-xs leading-[3rem]">
              slide-in-right
            </div>
            <div className="h-12 w-24 animate-glow rounded-lg bg-primary/20 text-center text-xs leading-[3rem] text-primary">
              glow
            </div>
          </DemoRow>
        </div>
      </div>
    </DesignSystemSection>
  );
}
