import { useState } from 'react'
import { Calendar } from '@heroui/react'
import { parseDate, type CalendarDate } from '@internationalized/date'
import { formatDayLabel } from '../../utils/format'

export default function DateField({ label, value, onChange }: { label: string; value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="text-xs text-slate-400 mb-1.5">{label}</div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border-2 border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-sm"
      >
        <span className="font-medium">{formatDayLabel(value)}</span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div className="mt-2 flex justify-center rounded-2xl bg-slate-50 dark:bg-white/5 p-2">
          <Calendar
            aria-label={label}
            value={parseDate(value)}
            onChange={(date: CalendarDate) => {
              onChange(date.toString())
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
