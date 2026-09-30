import type { Insight } from '../../utils/insights'

const TONE_BG: Record<Insight['tone'], string> = {
  positive: 'bg-emerald-500/10',
  negative: 'bg-rose-500/10',
  warning: 'bg-amber-500/10',
  neutral: 'bg-slate-500/10',
}

export default function InsightsList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => (
        <div key={insight.id} className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${TONE_BG[insight.tone]}`}>
          <span className="text-lg leading-none mt-0.5">{insight.emoji}</span>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{insight.text}</p>
        </div>
      ))}
    </div>
  )
}
