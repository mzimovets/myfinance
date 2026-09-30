import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { sumByType } from '../utils/analytics'
import { formatRub } from '../utils/format'
import GoalCard from '../components/goals/GoalCard'
import GoalFormModal from '../components/goals/GoalFormModal'
import PiggyBankCard from '../components/piggybanks/PiggyBankCard'
import PiggyBankFormModal from '../components/piggybanks/PiggyBankFormModal'
import type { Goal, PiggyBank } from '../types'

type Tab = 'goals' | 'piggy'

export default function GoalsPage() {
  const { goals, piggyBanks, transactions, updatePiggyBank } = useAppData()
  const [tab, setTab] = useState<Tab>('goals')
  const [modalGoal, setModalGoal] = useState<Goal | null | undefined>(undefined)
  const [modalPiggy, setModalPiggy] = useState<PiggyBank | null | undefined>(undefined)

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
  const totalPiggyBalance = piggyBanks.reduce((acc, p) => acc + p.balance, 0)

  async function quickDeposit(piggyBank: PiggyBank) {
    const input = window.prompt(`Пополнить «${piggyBank.title}» на сумму, ₽`, '1000')
    const amount = Number(input?.replace(',', '.'))
    if (input && amount > 0) {
      await updatePiggyBank(piggyBank.id, { balance: piggyBank.balance + amount })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Цели и копилки</h1>
        <button
          onClick={() => (tab === 'goals' ? setModalGoal(null) : setModalPiggy(null))}
          className="h-9 px-4 rounded-xl bg-brand-500 text-white text-sm font-semibold"
        >
          {tab === 'goals' ? '+ Цель' : '+ Копилка'}
        </button>
      </header>

      <div className="flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-sm font-medium w-fit">
        <button onClick={() => setTab('goals')} className={`px-4 py-1.5 rounded-lg ${tab === 'goals' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
          🎯 Цели
        </button>
        <button onClick={() => setTab('piggy')} className={`px-4 py-1.5 rounded-lg ${tab === 'piggy' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
          🐷 Копилки
        </button>
      </div>

      {tab === 'goals' ? (
        goals.length === 0 ? (
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
        )
      ) : piggyBanks.length === 0 ? (
        <div className="card-surface rounded-2xl p-8 text-center text-sm text-slate-400">
          Пока нет копилок. Создайте первую, чтобы откладывать деньги без привязки к цели или дедлайну.
        </div>
      ) : (
        <>
          <div className="card-surface rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-slate-400">Всего в копилках</span>
            <span className="text-lg font-bold tabular-nums">{formatRub(totalPiggyBalance)}</span>
          </div>
          <div className="flex flex-col gap-3">
            {piggyBanks.map((p) => (
              <PiggyBankCard key={p.id} piggyBank={p} onClick={() => setModalPiggy(p)} onQuickDeposit={() => quickDeposit(p)} />
            ))}
          </div>
        </>
      )}

      <GoalFormModal isOpen={modalGoal !== undefined} onClose={() => setModalGoal(undefined)} goal={modalGoal} />
      <PiggyBankFormModal isOpen={modalPiggy !== undefined} onClose={() => setModalPiggy(undefined)} piggyBank={modalPiggy} />
    </div>
  )
}
