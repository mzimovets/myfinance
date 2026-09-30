import type { Goal } from '../../types'
import { formatRub } from '../../utils/format'
import { forecastGoalDate } from '../../utils/insights'
import GoalProgressBar from './GoalProgressBar'

export default function GoalCard({
  goal,
  avgMonthlySaving,
  onClick,
  compact = false,
}: {
  goal: Goal
  avgMonthlySaving: number
  onClick?: () => void
  compact?: boolean
}) {
  const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  const { etaLabel } = forecastGoalDate(goal.currentAmount, goal.targetAmount, avgMonthlySaving)
  const monthlyNeeded = goal.deadline ? monthsUntil(goal.deadline) : null
  const suggestedMonthly = monthlyNeeded && monthlyNeeded > 0 ? remaining / monthlyNeeded : null

  return (
    <button onClick={onClick} className="card-surface rounded-2xl p-4 flex flex-col gap-3 text-left w-full">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${goal.color}20` }}>
          {goal.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{goal.title}</div>
          <div className="text-xs text-slate-400">
            {formatRub(goal.currentAmount)} из {formatRub(goal.targetAmount)}
          </div>
        </div>
        <div className="text-sm font-bold tabular-nums" style={{ color: goal.color }}>
          {percent.toFixed(0)}%
        </div>
      </div>
      <GoalProgressBar percent={percent} color={goal.color} />
      {!compact && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          {percent < 100 && <span>Осталось: {formatRub(remaining)}</span>}
          {percent >= 100 ? (
            <span className="text-emerald-500 font-medium">🎉 Цель достигнута!</span>
          ) : (
            <span>Прогноз: {etaLabel}</span>
          )}
          {suggestedMonthly && percent < 100 && <span>Нужно откладывать ~{formatRub(suggestedMonthly)}/мес</span>}
        </div>
      )}
    </button>
  )
}

function monthsUntil(deadlineISO: string): number {
  const now = new Date()
  const deadline = new Date(deadlineISO + 'T00:00:00')
  const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
  return Math.max(1, months)
}
