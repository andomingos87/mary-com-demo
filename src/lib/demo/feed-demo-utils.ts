/**
 * Formatação de tempo relativo em pt-BR para a demo do feed (sem dependência de lib externa).
 */
export function formatRelativeTimePtBr(iso: string, nowMs: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'

  const diffMs = Math.max(0, nowMs - t)
  const sec = Math.floor(diffMs / 1000)
  if (sec < 45) return 'agora há pouco'
  const min = Math.floor(sec / 60)
  if (min < 60) return min <= 1 ? 'há 1 min' : `há ${min} min`

  const hours = Math.floor(min / 60)
  if (hours < 24) return hours === 1 ? 'há 1h' : `há ${hours}h`

  const startOfToday = new Date(nowMs)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const eventDay = new Date(t)
  eventDay.setHours(0, 0, 0, 0)

  if (eventDay.getTime() === startOfYesterday.getTime()) return 'ontem'

  const days = Math.floor(hours / 24)
  if (days < 7) return days === 1 ? 'há 1 dia' : `há ${days} dias`

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso))
}
