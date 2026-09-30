import { useMemo } from 'react'
import type { DailyTotal } from '../../utils/analytics'
import { toISODate } from '../../utils/format'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function MonthCalendar({
  year,
  month,
  daily,
  selectedDate,
  onSelectDate,
}: {
  year: number
  month: number
  daily: DailyTotal[]
  selectedDate: string
  onSelectDate: (date: string) => void
}) {
  const dailyMap = useMemo(() => new Map(daily.map((d) => [d.date, d])), [daily])

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const items: { date: string | null }[] = []
    for (let i = 0; i < startOffset; i++) items.push({ date: null })
    for (let d = 1; d <= daysInMonth; d++) {
      items.push({ date: toISODate(new Date(year, month, d)) })
    }
    return items
  }, [year, month])

  const todayISO = toISODate(new Date())

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-slate-400 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />
          const entry = dailyMap.get(cell.date)
          const hasIncome = (entry?.income ?? 0) > 0
          const hasExpense = (entry?.expense ?? 0) > 0
          const isSelected = cell.date === selectedDate
          const isToday = cell.date === todayISO
          return (
            <button
              key={cell.date}
              onClick={() => onSelectDate(cell.date!)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-medium relative transition-colors ${
                isSelected ? 'bg-brand-500 text-white' : isToday ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
              }`}
            >
              {Number(cell.date.slice(-2))}
              <div className="flex gap-0.5 h-1">
                {hasIncome && <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />}
                {hasExpense && <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
