import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { dailyTotals, endOfMonth, filterByRange, startOfMonth, toISO } from '../utils/analytics'
import { formatDayLabel, formatMonthLabel, formatRub, formatWeekday, todayISO } from '../utils/format'
import MonthCalendar from '../components/journal/MonthCalendar'
import TransactionRow from '../components/transactions/TransactionRow'
import AddTransactionModal from '../components/transactions/AddTransactionModal'
import type { Transaction } from '../types'

export default function JournalPage() {
  const { transactions, categories } = useAppData()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [viewAll, setViewAll] = useState(false)

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const startISO = toISO(startOfMonth(year, month))
  const endISO = toISO(endOfMonth(year, month))
  const monthTx = useMemo(() => filterByRange(transactions, startISO, endISO), [transactions, startISO, endISO])
  const daily = useMemo(() => dailyTotals(monthTx, startISO, endISO), [monthTx, startISO, endISO])

  const dayTx = useMemo(() => transactions.filter((t) => t.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt), [transactions, selectedDate])
  const dayIncome = dayTx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const dayExpense = dayTx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const biggestDayTx = dayTx.slice().sort((a, b) => b.amount - a.amount)[0]
  const topDayCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of dayTx.filter((t) => t.type === 'expense')) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount)
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    return sorted[0] ? catById.get(sorted[0][0]) : undefined
  }, [dayTx, catById])

  function goMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  const groupedAll = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of transactions) {
      const arr = map.get(t.date) ?? []
      arr.push(t)
      map.set(t.date, arr)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [transactions])

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Операции</h1>
        <div className="flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-xs font-medium">
          <button onClick={() => setViewAll(false)} className={`px-3 py-1.5 rounded-lg ${!viewAll ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
            Календарь
          </button>
          <button onClick={() => setViewAll(true)} className={`px-3 py-1.5 rounded-lg ${viewAll ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
            Список
          </button>
        </div>
      </header>

      {!viewAll ? (
        <>
          <div className="card-surface rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => goMonth(-1)} className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
                ‹
              </button>
              <div className="font-semibold text-sm">{formatMonthLabel(year, month)}</div>
              <button onClick={() => goMonth(1)} className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
                ›
              </button>
            </div>
            <MonthCalendar year={year} month={month} daily={daily} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="card-surface rounded-2xl p-4">
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <div className="font-semibold">{formatWeekday(selectedDate)}</div>
                <div className="text-xs text-slate-400">{formatDayLabel(selectedDate)}</div>
              </div>
              <div className={`text-lg font-bold tabular-nums ${dayIncome - dayExpense >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatRub(dayIncome - dayExpense)}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-400 mb-3">
              <span>Доход: {formatRub(dayIncome)}</span>
              <span>Расход: {formatRub(dayExpense)}</span>
              {biggestDayTx && <span>Крупнее всего: {formatRub(biggestDayTx.amount)}</span>}
              {topDayCategory && <span>Топ: {topDayCategory.icon} {topDayCategory.name}</span>}
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {dayTx.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">В этот день записей нет</div>
              ) : (
                dayTx.map((t) => <TransactionRow key={t.id} transaction={t} category={catById.get(t.categoryId)} onClick={() => setEditing(t)} />)
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedAll.length === 0 && <div className="py-10 text-center text-sm text-slate-400">Пока нет операций</div>}
          {groupedAll.map(([date, txs]) => {
            const income = txs.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
            const expense = txs.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
            return (
              <div key={date} className="card-surface rounded-2xl p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="font-semibold text-sm">{formatDayLabel(date)}</div>
                  <div className={`text-sm font-bold tabular-nums ${income - expense >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatRub(income - expense)}</div>
                </div>
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {txs.map((t) => (
                    <TransactionRow key={t.id} transaction={t} category={catById.get(t.categoryId)} onClick={() => setEditing(t)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddTransactionModal isOpen={!!editing} onClose={() => setEditing(null)} editingTransaction={editing} />
    </div>
  )
}
