import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { sumByType } from '../utils/analytics'
import GoalCard from '../components/goals/GoalCard'
import GoalFormModal from '../components/goals/GoalFormModal'
import type { Goal } from '../types'

export default function GoalsPage() {
  const { goals, transactions } = useAppData()
  const [modalGoal, setModalGoal] = useState<Goal | null | undefined>(undefined)

  const avgMonthlySaving = useMemo(() => {
    if (transactions.length === 0) return 0
    const first = transactions.reduce((min, t) => (t.date < min ? t.date : min), transactions[0].date)
    const now = new Date()
    const firstDate = new Date(first + 'T00:00:00')
    const months = Math.max(1, (now.getFullYear() - firstDate.getFullYear()) * 12 + (now.getMonth() - firstDate.getMonth()) + 1)
    const net = sumByType(transactions, 'income') - sumByType(transactions, 'expense')
    return net / months
  }, [transactions])

  const active = goals.filter((g) => g.currentAmount < g.targetAmount)
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Финансовые цели</h1>
        <button onClick={() => setModalGoal(null)} className="h-9 px-4 rounded-xl bg-brand-500 text-white text-sm font-semibold">
          + Цель
        </button>
      </header>

      {goals.length === 0 ? (
        <div className="card-surface rounded-2xl p-8 text-center text-sm text-slate-400">
          Пока нет целей. Создайте первую — например, «Накопить на отпуск».
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {active.map((g) => (
              <GoalCard key={g.id} goal={g} avgMonthlySaving={avgMonthlySaving} onClick={() => setModalGoal(g)} />
            ))}
          </div>
          {completed.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold px-1 text-sm text-slate-400">Достигнутые</h2>
              {completed.map((g) => (
                <GoalCard key={g.id} goal={g} avgMonthlySaving={avgMonthlySaving} onClick={() => setModalGoal(g)} compact />
              ))}
            </div>
          )}
        </>
      )}

      <GoalFormModal isOpen={modalGoal !== undefined} onClose={() => setModalGoal(undefined)} goal={modalGoal} />
    </div>
  )
}
