import type { ReactNode } from 'react'

export default function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: string
  tone?: 'positive' | 'negative' | 'neutral'
}) {
  const valueColor = tone === 'positive' ? 'text-emerald-500' : tone === 'negative' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className={`text-xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  )
}
