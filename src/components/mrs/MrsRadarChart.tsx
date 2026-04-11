import { cn } from '@/lib/utils'

export interface MrsRadarChartAxis {
  label: string
  value: number
}

type MrsRadarChartProps = {
  axes: MrsRadarChartAxis[]
  maxValue?: number
  className?: string
  title?: string
  subtitle?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function MrsRadarChart({
  axes,
  maxValue = 5,
  className,
  title = 'Market Readiness Score',
  subtitle = 'Visão consolidada por eixo (escala 0-5)',
}: MrsRadarChartProps) {
  if (axes.length < 3) {
    return null
  }

  const cx = 120
  const cy = 120
  const radiusMax = 72
  const labelRadius = 102
  const n = axes.length

  const angleAt = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n

  const pointAt = (i: number, r: number) => {
    const a = angleAt(i)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const gridLevels = [1, 2, 3, 4, 5]
  const gridPolygons = gridLevels.map((level) => {
    const r = radiusMax * (level / maxValue)
    return Array.from({ length: n }, (_, i) => {
      const p = pointAt(i, r)
      return `${p.x},${p.y}`
    }).join(' ')
  })

  const dataPoints = axes.map((axis, i) => {
    const t = clamp(axis.value / maxValue, 0, 1)
    return pointAt(i, radiusMax * t)
  })
  const dataPolygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className={cn('rounded-lg border border-border bg-card shadow-card', className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="p-4">
        <svg
          viewBox="0 0 240 240"
          className="mx-auto w-full max-w-md"
          role="img"
          aria-label={`${title}. ${subtitle}`}
        >
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              className="stroke-border"
              strokeWidth={0.75}
            />
          ))}
          {axes.map((_, i) => {
            const outer = pointAt(i, radiusMax)
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                className="stroke-border"
                strokeWidth={0.75}
              />
            )
          })}
          <g className="text-primary">
            <polygon
              points={dataPolygonPoints}
              fill="currentColor"
              fillOpacity={0.22}
              stroke="currentColor"
              strokeWidth={2}
            />
          </g>
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3.5} className="fill-primary" />
          ))}
          {axes.map((axis, i) => {
            const p = pointAt(i, labelRadius)
            return (
              <text
                key={axis.label}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {axis.label}
              </text>
            )
          })}
        </svg>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
            0-2 Crítico
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            3-4 Parcial
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            5 Completo
          </span>
        </div>
      </div>
    </div>
  )
}
