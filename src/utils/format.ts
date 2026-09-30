const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const rubFormatterPrecise = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

export function formatRub(amount: number, precise = false): string {
  return (precise ? rubFormatterPrecise : rubFormatter).format(amount)
}

export function formatSignedRub(amount: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '−'
  return `${sign} ${formatRub(Math.abs(amount))}`
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function formatPercent(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(0)}%`
}

const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const dayShortFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' })
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })

export function formatDayLabel(isoDate: string): string {
  return dayFormatter.format(new Date(isoDate + 'T00:00:00'))
}

export function formatDayShort(isoDate: string): string {
  return dayShortFormatter.format(new Date(isoDate + 'T00:00:00'))
}

export function formatWeekday(isoDate: string): string {
  const s = weekdayFormatter.format(new Date(isoDate + 'T00:00:00'))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatMonthLabel(year: number, month: number): string {
  const s = monthFormatter.format(new Date(year, month, 1))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
