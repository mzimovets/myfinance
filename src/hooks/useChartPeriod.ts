import { useEffect, useState } from 'react'

export type ChartPeriod = '7d' | '30d' | '90d' | '365d'

export const CHART_PERIOD_OPTIONS: { value: ChartPeriod; label: string; days: number }[] = [
  { value: '7d', label: '7Д', days: 7 },
  { value: '30d', label: '30Д', days: 30 },
  { value: '90d', label: '90Д', days: 90 },
  { value: '365d', label: '1Г', days: 365 },
]

const STORAGE_KEY = 'finance-diary-chart-period'
const DEFAULT_PERIOD: ChartPeriod = '30d'

function isChartPeriod(value: string | null): value is ChartPeriod {
  return value === '7d' || value === '30d' || value === '90d' || value === '365d'
}

export function useChartPeriod(): [ChartPeriod, (p: ChartPeriod) => void] {
  const [period, setPeriodState] = useState<ChartPeriod>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return isChartPeriod(stored) ? stored : DEFAULT_PERIOD
    } catch {
      return DEFAULT_PERIOD
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, period)
    } catch {
      // ignore
    }
  }, [period])

  return [period, setPeriodState]
}

export function periodDays(period: ChartPeriod): number {
  return CHART_PERIOD_OPTIONS.find((o) => o.value === period)?.days ?? 30
}
