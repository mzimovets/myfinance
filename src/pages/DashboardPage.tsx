import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { computeMonthStats, dailyTotals, sumByType, trailingDaysRange } from '../utils/analytics'
import { formatMonthLabel, formatRub } from '../utils/format'
import { generateInsights } from '../utils/insights'
import { periodDays, useChartPeriod } from '../hooks/useChartPeriod'
import StatCard from '../components/common/StatCard'
import CashflowChart from '../components/dashboard/CashflowChart'
import ChartPeriodSelector from '../components/dashboard/ChartPeriodSelector'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'
import InsightsList from '../components/dashboard/InsightsList'
import TransactionRow from '../components/transactions/TransactionRow'
import GoalCard from '../components/goals/GoalCard'
import type { PageKey } from '../App'

export default function DashboardPage({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { transactions, categories, goals, piggyBanks, salary } = useAppData()
  const now = new Date()
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const stats = useMemo(() => computeMonthStats(transactions, categories, now.getFullYear(), now.getMonth(), now), [transactions, categories])
  const totalIncome = useMemo(() => sumByType(transactions, 'income'), [transactions])
  const totalExpense = useMemo(() => sumByType(transactions, 'expense'), [transactions])
  const balance = totalIncome - totalExpense
  const [chartPeriod, setChartPeriod] = useChartPeriod()
  const chartRange = useMemo(() => trailingDaysRange(periodDays(chartPeriod), now), [chartPeriod])
  const daily = useMemo(() => dailyTotals(transactions, chartRange.startISO, chartRange.endISO), [transactions, chartRange])
  const insights = useMemo(() => generateInsights(transactions, categories, now), [transactions, categories])
  const recent = transactions.slice(0, 6)
  const totalSavings = useMemo(() => piggyBanks.reduce((acc, p) => acc + p.balance, 0), [piggyBanks])

  const avgMonthlySaving = useMemo(() => {
    if (transactions.length === 0) return 0
    const first = transactions.reduce((min, t) => (t.date < min ? t.date : min), transactions[0].date)
    const months = Math.max(1, monthsBetween(new Date(first), now))
    return balance / months
  }, [transactions, balance])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <div className="text-xs text-slate-400 font-medium">{formatMonthLabel(now.getFullYear(), now.getMonth())}</div>
          <h1 className="text-2xl font-bold">Привет! 👋</h1>
        </div>
      </header>

      <div className="card-surface rounded-3xl p-5 bg-gradient-to-br from-brand-500 to-brand-700 text-white flex flex-col gap-1 relative overflow-hidden">
        <div className="text-white/70 text-xs font-medium">Баланс</div>
        <div className="text-3xl font-extrabold tabular-nums">{formatRub(balance)}</div>
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <div className="text-white/60 text-xs">Доходы за месяц</div>
            <div className="font-semibold tabular-nums">{formatRub(stats.income)}</div>
          </div>
          <div>
            <div className="text-white/60 text-xs">Расходы за месяц</div>
            <div className="font-semibold tabular-nums">{formatRub(stats.expense)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Остаток за месяц" value={formatRub(stats.net)} tone={stats.net >= 0 ? 'positive' : 'negative'} icon="💡" />
        <StatCard
          label="Зарплата"
          value={salary.enabled && salary.parts.length > 0 ? formatRub(salary.parts.reduce((acc, p) => acc + p.amount, 0)) : '—'}
          sub={salary.enabled && salary.parts.length > 0 ? salary.parts.map((p) => `${p.label} ${p.payDay} ч.`).join(', ') : 'Не настроена'}
          icon="💼"
        />
        <StatCard
          label="Накопления"
          value={formatRub(totalSavings)}
          sub={piggyBanks.length > 0 ? `${piggyBanks.length} ${piggyBanks.length === 1 ? 'копилка' : 'копилки'}` : 'Нет копилок'}
          icon="🐷"
        />
        <StatCard label="Цели" value={`${goals.filter((g) => g.currentAmount >= g.targetAmount).length}/${goals.length || 0}`} sub={goals.length > 0 ? 'достигнуто' : 'Нет целей'} icon="🎯" />
      </div>

      <section className="card-surface rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Доходы и расходы</h2>
          <ChartPeriodSelector value={chartPeriod} onChange={setChartPeriod} />
        </div>
        <CashflowChart data={daily} />
      </section>

      {stats.expenseByCategory.length > 0 && (
        <section className="card-surface rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Расходы по категориям</h2>
          <CategoryPieChart items={stats.expenseByCategory} />
        </section>
      )}

      {insights.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold px-1">Инсайты</h2>
          <InsightsList insights={insights} />
        </section>
      )}

      {goals.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold">Финансовые цели</h2>
            <button onClick={() => onNavigate('goals')} className="text-xs text-brand-500 font-medium">
              Все →
            </button>
          </div>
          {goals.slice(0, 2).map((g) => (
            <GoalCard key={g.id} goal={g} avgMonthlySaving={avgMonthlySaving} compact />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Последние операции</h2>
          <button onClick={() => onNavigate('journal')} className="text-xs text-brand-500 font-medium">
            Все →
          </button>
        </div>
        <div className="card-surface rounded-2xl px-4">
          {recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Пока нет операций</div>
          ) : (
            recent.map((t) => <TransactionRow key={t.id} transaction={t} category={catById.get(t.categoryId)} />)
          )}
        </div>
      </section>
    </div>
  )
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1
}
