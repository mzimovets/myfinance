import type { Category, Transaction } from '../types'

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

export function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isInRange(dateISO: string, startISO: string, endISO: string): boolean {
  return dateISO >= startISO && dateISO <= endISO
}

export function filterByRange(transactions: Transaction[], startISO: string, endISO: string): Transaction[] {
  return transactions.filter((t) => isInRange(t.date, startISO, endISO))
}

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0)
}

export interface CategoryBreakdownItem {
  categoryId: string
  category?: Category
  total: number
  count: number
  percent: number
}

export function groupByCategory(
  transactions: Transaction[],
  categories: Category[],
  type: Transaction['type'],
): CategoryBreakdownItem[] {
  const filtered = transactions.filter((t) => t.type === type)
  const total = filtered.reduce((acc, t) => acc + t.amount, 0)
  const map = new Map<string, { total: number; count: number }>()
  for (const t of filtered) {
    const cur = map.get(t.categoryId) ?? { total: 0, count: 0 }
    cur.total += t.amount
    cur.count += 1
    map.set(t.categoryId, cur)
  }
  const catById = new Map(categories.map((c) => [c.id, c]))
  return Array.from(map.entries())
    .map(([categoryId, v]) => ({
      categoryId,
      category: catById.get(categoryId),
      total: v.total,
      count: v.count,
      percent: total > 0 ? (v.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export interface DailyTotal {
  date: string
  income: number
  expense: number
  net: number
}

export function dailyTotals(transactions: Transaction[], startISO: string, endISO: string): DailyTotal[] {
  const map = new Map<string, { income: number; expense: number }>()
  let cursor = new Date(startISO + 'T00:00:00')
  const end = new Date(endISO + 'T00:00:00')
  while (cursor <= end) {
    map.set(toISO(cursor), { income: 0, expense: 0 })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  }
  for (const t of transactions) {
    const entry = map.get(t.date)
    if (!entry) continue
    if (t.type === 'income') entry.income += t.amount
    else entry.expense += t.amount
  }
  return Array.from(map.entries()).map(([date, v]) => ({ date, income: v.income, expense: v.expense, net: v.income - v.expense }))
}

export interface MonthStats {
  year: number
  month: number
  startISO: string
  endISO: string
  income: number
  expense: number
  net: number
  savedPercent: number
  avgExpensePerDay: number
  avgIncomePerDay: number
  daysElapsed: number
  daysInMonth: number
  daysWithActivity: number
  topExpenseCategory?: CategoryBreakdownItem
  biggestPurchase?: Transaction
  biggestExpenseDay?: { date: string; total: number }
  expenseByCategory: CategoryBreakdownItem[]
  incomeByCategory: CategoryBreakdownItem[]
}

export function computeMonthStats(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number,
  now: Date = new Date(),
): MonthStats {
  const start = startOfMonth(year, month)
  const end = endOfMonth(year, month)
  const startISO = toISO(start)
  const endISO = toISO(end)
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
  const daysInMonth = end.getDate()
  const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth

  const monthTx = filterByRange(transactions, startISO, endISO)
  const income = sumByType(monthTx, 'income')
  const expense = sumByType(monthTx, 'expense')
  const net = income - expense
  const savedPercent = income > 0 ? (net / income) * 100 : 0

  const expenseByCategory = groupByCategory(monthTx, categories, 'expense')
  const incomeByCategory = groupByCategory(monthTx, categories, 'income')

  const expenseTx = monthTx.filter((t) => t.type === 'expense')
  const biggestPurchase = expenseTx.slice().sort((a, b) => b.amount - a.amount)[0]

  const daily = dailyTotals(monthTx, startISO, endISO)
  const daysWithActivity = daily.filter((d) => d.income > 0 || d.expense > 0).length
  const biggestExpenseDayEntry = daily.slice().sort((a, b) => b.expense - a.expense)[0]

  return {
    year,
    month,
    startISO,
    endISO,
    income,
    expense,
    net,
    savedPercent,
    avgExpensePerDay: daysElapsed > 0 ? expense / daysElapsed : 0,
    avgIncomePerDay: daysElapsed > 0 ? income / daysElapsed : 0,
    daysElapsed,
    daysInMonth,
    daysWithActivity,
    topExpenseCategory: expenseByCategory[0],
    biggestPurchase,
    biggestExpenseDay: biggestExpenseDayEntry && biggestExpenseDayEntry.expense > 0 ? { date: biggestExpenseDayEntry.date, total: biggestExpenseDayEntry.expense } : undefined,
    expenseByCategory,
    incomeByCategory,
  }
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export function previousMonth(year: number, month: number): { year: number; month: number } {
  return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
}

export function last30DaysRange(now: Date = new Date()): { startISO: string; endISO: string } {
  const end = new Date(now)
  const start = new Date(now)
  start.setDate(start.getDate() - 29)
  return { startISO: toISO(start), endISO: toISO(end) }
}
