import type { Category, Transaction } from '../types'
import {
  computeMonthStats,
  filterByRange,
  groupByCategory,
  last30DaysRange,
  percentChange,
  previousMonth,
  sumByType,
} from './analytics'
import { formatPercent, formatRub } from './format'

export interface Insight {
  id: string
  emoji: string
  text: string
  tone: 'positive' | 'negative' | 'neutral' | 'warning'
}

export function generateInsights(transactions: Transaction[], categories: Category[], now: Date = new Date()): Insight[] {
  const insights: Insight[] = []
  const year = now.getFullYear()
  const month = now.getMonth()
  const current = computeMonthStats(transactions, categories, year, month, now)
  const prevYm = previousMonth(year, month)
  const prev = computeMonthStats(transactions, categories, prevYm.year, prevYm.month, now)

  if (current.income === 0 && current.expense === 0) {
    insights.push({
      id: 'empty',
      emoji: '👋',
      text: 'В этом месяце пока нет операций. Добавьте первую запись, чтобы увидеть аналитику.',
      tone: 'neutral',
    })
    return insights
  }

  // Average daily spend
  if (current.avgExpensePerDay > 0) {
    insights.push({
      id: 'avg-expense',
      emoji: '📊',
      text: `В среднем вы тратите ${formatRub(current.avgExpensePerDay)} в день в этом месяце.`,
      tone: 'neutral',
    })
  }

  // Savings rate
  if (current.income > 0) {
    const tone = current.savedPercent >= 20 ? 'positive' : current.savedPercent >= 0 ? 'neutral' : 'negative'
    insights.push({
      id: 'saved-percent',
      emoji: current.savedPercent >= 0 ? '💾' : '⚠️',
      text:
        current.savedPercent >= 0
          ? `В этом месяце вы сохранили ${current.savedPercent.toFixed(0)}% дохода.`
          : `В этом месяце расходы превышают доходы на ${formatRub(Math.abs(current.net))}.`,
      tone,
    })
  }

  // Top category vs previous month
  if (current.topExpenseCategory?.category) {
    const catName = current.topExpenseCategory.category.name
    const catIcon = current.topExpenseCategory.category.icon
    insights.push({
      id: 'top-category',
      emoji: catIcon,
      text: `Самая большая статья расходов — «${catName}»: ${formatRub(current.topExpenseCategory.total)} (${current.topExpenseCategory.percent.toFixed(0)}% всех расходов).`,
      tone: 'neutral',
    })

    const prevCategoryEntry = prev.expenseByCategory.find((c) => c.categoryId === current.topExpenseCategory!.categoryId)
    const change = percentChange(current.topExpenseCategory.total, prevCategoryEntry?.total ?? 0)
    if (change !== null && Math.abs(change) >= 10 && prevCategoryEntry) {
      insights.push({
        id: 'top-category-change',
        emoji: change > 0 ? '📈' : '📉',
        text: `Расходы на «${catName}» ${change > 0 ? 'выросли' : 'снизились'} на ${Math.abs(change).toFixed(0)}% по сравнению с прошлым месяцем.`,
        tone: change > 0 ? 'warning' : 'positive',
      })
    }
  }

  // Overall expense change
  const expenseChange = percentChange(current.expense, prev.expense)
  if (expenseChange !== null && prev.expense > 0 && Math.abs(expenseChange) >= 5) {
    insights.push({
      id: 'expense-change',
      emoji: expenseChange > 0 ? '📈' : '📉',
      text: `Общие расходы ${expenseChange > 0 ? 'выросли' : 'снизились'} на ${Math.abs(expenseChange).toFixed(0)}% по сравнению с прошлым месяцем.`,
      tone: expenseChange > 0 ? 'warning' : 'positive',
    })
  }

  // Biggest purchase
  if (current.biggestPurchase) {
    const cat = categories.find((c) => c.id === current.biggestPurchase!.categoryId)
    insights.push({
      id: 'biggest-purchase',
      emoji: '💸',
      text: `Самая крупная покупка в этом месяце — ${formatRub(current.biggestPurchase.amount)}${cat ? ` (${cat.icon} ${cat.name})` : ''}.`,
      tone: 'neutral',
    })
  }

  // Last 30 days on a specific category (coffee-like insight), pick top category over last 30 days if notable
  const { startISO, endISO } = last30DaysRange(now)
  const last30 = filterByRange(transactions, startISO, endISO)
  const byCat30 = groupByCategory(last30, categories, 'expense')
  const coffee = byCat30.find((c) => c.category?.icon === '☕')
  if (coffee && coffee.total > 0) {
    insights.push({
      id: 'coffee-30d',
      emoji: '☕',
      text: `За последние 30 дней на «${coffee.category?.name}» потрачено ${formatRub(coffee.total)}.`,
      tone: 'neutral',
    })
  }

  return insights
}

// ---------- Forecasts ----------

export interface MonthForecast {
  projectedExpense: number
  projectedIncome: number
  projectedNet: number
  confidence: 'low' | 'medium' | 'high'
}

export function forecastMonthEnd(transactions: Transaction[], now: Date = new Date()): MonthForecast {
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysElapsed = Math.max(now.getDate(), 1)
  const startISO = new Date(year, month, 1).toISOString().slice(0, 10)
  const endISO = now.toISOString().slice(0, 10)
  const monthTxSoFar = filterByRange(transactions, startISO, endISO)
  const expenseSoFar = sumByType(monthTxSoFar, 'expense')
  const incomeSoFar = sumByType(monthTxSoFar, 'income')
  const avgExpense = expenseSoFar / daysElapsed
  const avgIncome = incomeSoFar / daysElapsed
  const projectedExpense = avgExpense * daysInMonth
  const projectedIncome = avgIncome * daysInMonth
  const confidence = daysElapsed >= 10 ? 'high' : daysElapsed >= 4 ? 'medium' : 'low'
  return {
    projectedExpense,
    projectedIncome,
    projectedNet: projectedIncome - projectedExpense,
    confidence,
  }
}

export function forecastGoalDate(currentAmount: number, targetAmount: number, avgMonthlySaving: number): { monthsNeeded: number | null; etaLabel: string } {
  const remaining = targetAmount - currentAmount
  if (remaining <= 0) return { monthsNeeded: 0, etaLabel: 'Цель уже достигнута' }
  if (avgMonthlySaving <= 0) return { monthsNeeded: null, etaLabel: 'Нужно откладывать деньги, чтобы увидеть прогноз' }
  const months = Math.ceil(remaining / avgMonthlySaving)
  const eta = new Date()
  eta.setMonth(eta.getMonth() + months)
  const label = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(eta)
  return { monthsNeeded: months, etaLabel: label.charAt(0).toUpperCase() + label.slice(1) }
}

// ---------- Suggested goal allocations when splitting income ----------

export interface GoalAllocationInput {
  id: string
  title: string
  icon: string
  color: string
  currentAmount: number
  targetAmount: number
  deadline?: string
}

export interface SuggestedAllocation {
  goalId: string
  amount: number
}

const MAX_ALLOCATION_SHARE = 0.4 // never suggest putting away more than 40% of an income entry
const FALLBACK_GOAL_SHARE = 0.1 // for goals without a deadline, suggest ~10% of what's left

export function suggestGoalAllocations(totalAmount: number, goals: GoalAllocationInput[], now: Date = new Date()): SuggestedAllocation[] {
  const active = goals.filter((g) => g.currentAmount < g.targetAmount)
  if (active.length === 0 || totalAmount <= 0) return []

  const raw = active.map((g) => {
    const remaining = g.targetAmount - g.currentAmount
    let monthlyNeed: number
    if (g.deadline) {
      const deadline = new Date(g.deadline + 'T00:00:00')
      const months = Math.max(1, (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()))
      monthlyNeed = remaining / months
    } else {
      monthlyNeed = remaining * FALLBACK_GOAL_SHARE
    }
    return { goalId: g.id, amount: Math.min(monthlyNeed, remaining) }
  })

  const totalSuggested = raw.reduce((acc, r) => acc + r.amount, 0)
  const cap = totalAmount * MAX_ALLOCATION_SHARE
  const scale = totalSuggested > cap && totalSuggested > 0 ? cap / totalSuggested : 1

  return raw
    .map((r) => ({ goalId: r.goalId, amount: Math.round((r.amount * scale) / 10) * 10 }))
    .filter((r) => r.amount > 0)
}

// ---------- Simple local Q&A engine (no LLM) ----------

export interface QAResult {
  answer: string
}

export function answerQuestion(question: string, transactions: Transaction[], categories: Category[], goals: { title: string; currentAmount: number; targetAmount: number }[], now: Date = new Date()): QAResult {
  const q = question.toLowerCase()
  const year = now.getFullYear()
  const month = now.getMonth()
  const current = computeMonthStats(transactions, categories, year, month, now)

  if (/потратил.*больше|больше всего|топ.*категор/.test(q)) {
    if (!current.topExpenseCategory?.category) return { answer: 'Пока недостаточно данных о расходах в этом месяце.' }
    return {
      answer: `Больше всего в этом месяце потрачено на «${current.topExpenseCategory.category.name}»: ${formatRub(current.topExpenseCategory.total)} (${current.topExpenseCategory.percent.toFixed(0)}% расходов).`,
    }
  }

  if (/почему.*выросл|почему.*расход/.test(q)) {
    const prevYm = previousMonth(year, month)
    const prev = computeMonthStats(transactions, categories, prevYm.year, prevYm.month, now)
    const change = percentChange(current.expense, prev.expense)
    if (change === null || prev.expense === 0) return { answer: 'Недостаточно данных за прошлый месяц для сравнения.' }
    const topCat = current.topExpenseCategory?.category?.name ?? 'разные категории'
    return {
      answer:
        change > 0
          ? `Расходы выросли на ${change.toFixed(0)}% по сравнению с прошлым месяцем. Основной вклад внесла категория «${topCat}».`
          : `На самом деле расходы снизились на ${Math.abs(change).toFixed(0)}% по сравнению с прошлым месяцем — хороший результат!`,
    }
  }

  if (/сколько.*накопил|сколько.*сбереж|остаток/.test(q)) {
    const totalIncome = sumByType(transactions, 'income')
    const totalExpense = sumByType(transactions, 'expense')
    return { answer: `Всего накоплено ${formatRub(totalIncome - totalExpense)} (доходы минус расходы за всё время).` }
  }

  if (/сколько.*трачу.*день|средн.*расход/.test(q)) {
    return { answer: `В среднем вы тратите ${formatRub(current.avgExpensePerDay)} в день в этом месяце.` }
  }

  if (/когда.*накоплю|когда.*достигну|когда.*цел/.test(q)) {
    const amountMatch = q.match(/(\d[\d\s]{2,})/)
    const target = amountMatch ? Number(amountMatch[1].replace(/\s/g, '')) : goals[0]?.targetAmount
    if (!target) return { answer: 'Уточните сумму цели, например: «Когда я накоплю 100000 ₽?»' }
    const totalIncome = sumByType(transactions, 'income')
    const totalExpense = sumByType(transactions, 'expense')
    const net = totalIncome - totalExpense
    const monthsTracked = Math.max(1, monthsBetweenFirstTxAndNow(transactions, now))
    const avgMonthlySaving = net / monthsTracked
    const { etaLabel } = forecastGoalDate(0, target, avgMonthlySaving)
    return { answer: avgMonthlySaving > 0 ? `При текущем темпе накоплений (~${formatRub(avgMonthlySaving)}/мес) вы достигнете ${formatRub(target)} примерно к: ${etaLabel}.` : 'Сейчас вы не откладываете деньги в среднем — увеличьте доходы или сократите расходы, чтобы увидеть прогноз.' }
  }

  return {
    answer: `За этот месяц: доходы ${formatRub(current.income)}, расходы ${formatRub(current.expense)}, итог ${formatSignedForQA(current.net)}. Попробуйте спросить конкретнее, например «На что я потратил больше всего?».`,
  }
}

function formatSignedForQA(net: number): string {
  return `${net >= 0 ? '+' : ''}${formatRub(net)}`
}

function monthsBetweenFirstTxAndNow(transactions: Transaction[], now: Date): number {
  if (transactions.length === 0) return 1
  const firstDate = transactions.reduce((min, t) => (t.date < min ? t.date : min), transactions[0].date)
  const first = new Date(firstDate + 'T00:00:00')
  const months = (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1
  return Math.max(1, months)
}

export { formatPercent }
