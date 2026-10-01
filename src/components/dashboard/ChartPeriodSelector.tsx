import { motion } from 'framer-motion'
import { CHART_PERIOD_OPTIONS, type ChartPeriod } from '../../hooks/useChartPeriod'

export default function ChartPeriodSelector({ value, onChange }: { value: ChartPeriod; onChange: (p: ChartPeriod) => void }) {
  return (
    <div className="flex gap-1 p-0.5 rounded-full bg-slate-100 dark:bg-white/5">
      {CHART_PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="relative w-9 py-1 rounded-full text-[11px] font-semibold"
        >
          {value === opt.value && (
            <motion.div
              layoutId="chart-period-pill"
              className="absolute inset-0 rounded-full bg-white dark:bg-white/10 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <span className={`relative z-10 ${value === opt.value ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400'}`}>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
