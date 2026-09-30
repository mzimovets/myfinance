import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import {
  computeMonthStats,
  dailyTotals,
  last30DaysRange,
  percentChange,
  previousMonth,
} from '../utils/analytics'
import { formatMonthLabel, formatPercent, formatRub } from '../utils/format'
import { answerQuestion, forecastMonthEnd } from '../utils/insights'
import StatCard from '../components/common/StatCard'
import CashflowChart from '../components/dashboard/CashflowChart'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'

const SUGGESTED_QUESTIONS = [
  'На что я потратил больше всего?',
  'Почему выросли расходы?',
  'Сколько я накопил?',
  'Сколько я трачу в среднем в день?',
]

export default function AnalyticsPage() {
  const { transactions, categories, goals } = useAppData()
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)

  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth()

  const stats = useMemo(() => computeMonthStats(transactions, categories, year, month, now), [transactions, categories, year, month])
  const prevYm = previousMonth(year, month)
  const prevStats = useMemo(() => computeMonthStats(transactions, categories, prevYm.year, prevYm.month, now), [transactions, categories, prevYm])

  const { startISO: last30Start, endISO: last30End } = last30DaysRange(now)
  const daily90 = useMemo(() => dailyTotals(transactions, stats.startISO, stats.endISO), [transactions, stats])

  const expenseChange = percentChange(stats.expense, prevStats.expense)
  const incomeChange = percentChange(stats.income, prevStats.income)

  const forecast = useMemo(() => (monthOffset === 0 ? forecastMonthEnd(transactions, now) : null), [transactions, monthOffset])

  function handleAsk(q: string) {
    setQuestion(q)
    const result = answerQuestion(q, transactions, categories, goals, now)
    setAnswer(result.answer)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Аналитика</h1>
      </header>

      <div className="card-surface rounded-2xl p-3 flex items-center justify-between">
        <button onClick={() => setMonthOffset((o) => o - 1)} className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          ‹
        </button>
        <div className="font-semibold text-sm">{formatMonthLabel(year, month)}</div>
        <button onClick={() => setMonthOffset((o) => Math.min(0, o + 1))} className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30" disabled={monthOffset === 0}>
          ›
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Доходы" value={formatRub(stats.income)} sub={incomeChange !== null ? `${formatPercent(incomeChange)} к прошлому мес.` : undefined} tone={incomeChange !== null && incomeChange >= 0 ? 'positive' : 'neutral'} icon="💵" />
        <StatCard label="Расходы" value={formatRub(stats.expense)} sub={expenseChange !== null ? `${formatPercent(expenseChange)} к прошлому мес.` : undefined} tone={expenseChange !== null && expenseChange <= 0 ? 'positive' : 'negative'} icon="💸" />
        <StatCard label="Чистый результат" value={formatRub(stats.net)} tone={stats.net >= 0 ? 'positive' : 'negative'} icon="⚖️" />
        <StatCard label="% дохода сохранено" value={`${stats.savedPercent.toFixed(0)}%`} tone={stats.savedPercent >= 20 ? 'positive' : stats.savedPercent >= 0 ? 'neutral' : 'negative'} icon="🏦" />
        <StatCard label="Средний расход/день" value={formatRub(stats.avgExpensePerDay)} icon="📆" />
        <StatCard label="Средний доход/день" value={formatRub(stats.avgIncomePerDay)} icon="📅" />
        <StatCard label="Самая дорогая категория" value={stats.topExpenseCategory ? `${stats.topExpenseCategory.category?.icon ?? ''} ${stats.topExpenseCategory.category?.name ?? '—'}` : '—'} sub={stats.topExpenseCategory ? formatRub(stats.topExpenseCategory.total) : undefined} icon="🏆" />
        <StatCard label="Самая крупная покупка" value={stats.biggestPurchase ? formatRub(stats.biggestPurchase.amount) : '—'} icon="💎" />
      </div>

      {stats.biggestExpenseDay && (
        <StatCard label="Самый дорогой день" value={formatRub(stats.biggestExpenseDay.total)} sub={stats.biggestExpenseDay.date} icon="🔥" />
      )}

      {forecast && (
        <section className="card-surface rounded-2xl p-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <span>🔮</span> Прогноз до конца месяца
          </h2>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">Это прогноз на основе текущих трат, а не факт</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Ожидаемые расходы" value={formatRub(forecast.projectedExpense)} icon="📉" />
            <StatCard label="Ожидаемый остаток" value={formatRub(forecast.projectedNet)} tone={forecast.projectedNet >= 0 ? 'positive' : 'negative'} icon="💰" />
          </div>
        </section>
      )}

      <section className="card-surface rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Динамика за месяц</h2>
        <CashflowChart data={daily90} />
      </section>

      {stats.expenseByCategory.length > 0 && (
        <section className="card-surface rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Расходы по категориям</h2>
          <CategoryPieChart items={stats.expenseByCategory} />
        </section>
      )}

      <section className="card-surface rounded-2xl p-4 flex flex-col gap-3">
        <h2 className="font-semibold flex items-center gap-2">
          <span>🤖</span> Спросите у финансового помощника
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} onClick={() => handleAsk(q)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (question.trim()) handleAsk(question)
          }}
          className="flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Спросите что-нибудь о своих финансах…"
            className="flex-1 rounded-xl bg-slate-100 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" className="rounded-xl bg-brand-500 text-white px-4 text-sm font-medium">
            →
          </button>
        </form>
        {answer && (
          <div className="rounded-2xl bg-brand-500/10 p-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{answer}</div>
        )}
        <p className="text-[11px] text-slate-400">Работает полностью локально, на основе ваших данных — без интернета и внешних серверов.</p>
      </section>

      <p className="text-[11px] text-slate-400 text-center pb-2">
        Последние 30 дней: {last30Start} — {last30End}
      </p>
    </div>
  )
}
