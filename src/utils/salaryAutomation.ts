import type { SalarySettings, Transaction } from '../types'
import { toISODate } from './format'

export interface PendingSalaryOccurrence {
  date: string
}

const BACKFILL_MONTHS = 6
const BACKFILL_WEEKS = 8

export function computeMissingSalaryOccurrences(salary: SalarySettings, transactions: Transaction[], now: Date = new Date()): PendingSalaryOccurrence[] {
  if (!salary.enabled || salary.amount <= 0) return []
  const existingDates = new Set(transactions.filter((t) => t.categoryId === salary.categoryId && t.type === 'income').map((t) => t.date))
  const occurrences: string[] = []

  if (salary.periodicity === 'monthly') {
    for (let i = BACKFILL_MONTHS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      const day = Math.min(Math.max(1, salary.payDay), daysInMonth)
      const occurrence = new Date(d.getFullYear(), d.getMonth(), day)
      if (occurrence <= now) occurrences.push(toISODate(occurrence))
    }
  } else {
    const stepDays = salary.periodicity === 'weekly' ? 7 : 14
    const weekday = Math.min(Math.max(0, salary.payDay), 6)
    // find most recent date matching weekday
    const cursor = new Date(now)
    while (cursor.getDay() !== weekday) {
      cursor.setDate(cursor.getDate() - 1)
    }
    const totalSteps = Math.floor(BACKFILL_WEEKS * 7 / stepDays)
    for (let i = totalSteps; i >= 0; i--) {
      const occurrence = new Date(cursor)
      occurrence.setDate(occurrence.getDate() - i * stepDays)
      if (occurrence <= now) occurrences.push(toISODate(occurrence))
    }
  }

  return occurrences.filter((d) => !existingDates.has(d)).map((date) => ({ date }))
}
