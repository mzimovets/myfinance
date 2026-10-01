import type { SalaryPart, SalarySettings, Transaction } from '../types'
import { toISODate } from './format'

export interface PendingSalaryOccurrence {
  id: string
  partId: string
  date: string
  amount: number
  label: string
}

const BACKFILL_MONTHS = 6
const BACKFILL_WEEKS = 8

function occurrenceDatesForPart(part: SalaryPart, now: Date): string[] {
  const dates: string[] = []

  if (part.periodicity === 'monthly') {
    for (let i = BACKFILL_MONTHS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      const day = Math.min(Math.max(1, part.payDay), daysInMonth)
      const occurrence = new Date(d.getFullYear(), d.getMonth(), day)
      if (occurrence <= now) dates.push(toISODate(occurrence))
    }
  } else {
    const stepDays = part.periodicity === 'weekly' ? 7 : 14
    const weekday = Math.min(Math.max(0, part.payDay), 6)
    const cursor = new Date(now)
    while (cursor.getDay() !== weekday) {
      cursor.setDate(cursor.getDate() - 1)
    }
    const totalSteps = Math.floor((BACKFILL_WEEKS * 7) / stepDays)
    for (let i = totalSteps; i >= 0; i--) {
      const occurrence = new Date(cursor)
      occurrence.setDate(occurrence.getDate() - i * stepDays)
      if (occurrence <= now) dates.push(toISODate(occurrence))
    }
  }

  return dates
}

export function salaryTransactionId(partId: string, date: string): string {
  return `salary-${partId}-${date}`
}

export function computeMissingSalaryOccurrences(salary: SalarySettings, transactions: Transaction[], now: Date = new Date()): PendingSalaryOccurrence[] {
  if (!salary.enabled || salary.parts.length === 0) return []
  const existingIds = new Set(transactions.map((t) => t.id))
  const result: PendingSalaryOccurrence[] = []

  for (const part of salary.parts) {
    if (part.amount <= 0) continue
    for (const date of occurrenceDatesForPart(part, now)) {
      const id = salaryTransactionId(part.id, date)
      if (!existingIds.has(id)) {
        result.push({ id, partId: part.id, date, amount: part.amount, label: part.label || 'Зарплата' })
      }
    }
  }

  return result
}
