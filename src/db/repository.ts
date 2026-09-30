import { getDB } from './database'
import { DEFAULT_CATEGORIES } from './defaultCategories'
import { computeMissingSalaryOccurrences } from '../utils/salaryAutomation'
import type { AppSettings, Budget, Category, Goal, SalarySettings, Transaction } from '../types'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export async function ensureSeeded(): Promise<void> {
  const db = await getDB()
  const count = await db.count('categories')
  if (count === 0) {
    const tx = db.transaction('categories', 'readwrite')
    await Promise.all(DEFAULT_CATEGORIES.map((c) => tx.store.put(c)))
    await tx.done
  }
  const appSettings = await db.get('settings', 'app')
  if (!appSettings) {
    await db.put('settings', { id: 'app', theme: 'system', currency: 'RUB', onboarded: false } satisfies AppSettings)
  }
  const salary = await db.get('settings', 'salary')
  if (!salary) {
    await db.put('settings', {
      id: 'salary',
      enabled: false,
      amount: 0,
      payDay: 5,
      periodicity: 'monthly',
      categoryId: 'inc-salary',
    } satisfies SalarySettings)
  }
}

// ---------- Transactions ----------

export async function listTransactions(): Promise<Transaction[]> {
  const db = await getDB()
  const all = await db.getAll('transactions')
  return all.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
}

export async function addTransaction(input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
  const db = await getDB()
  const now = Date.now()
  const tx: Transaction = { ...input, id: uid(), createdAt: now, updatedAt: now }
  await db.put('transactions', tx)
  return tx
}

export async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('transactions', id)
  if (!existing) return
  await db.put('transactions', { ...existing, ...patch, updatedAt: Date.now() })
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('transactions', id)
}

// ---------- Categories ----------

export async function listCategories(): Promise<Category[]> {
  const db = await getDB()
  return db.getAll('categories')
}

export async function addCategory(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const db = await getDB()
  const category: Category = { ...input, id: uid(), createdAt: Date.now() }
  await db.put('categories', category)
  return category
}

export async function updateCategory(id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('categories', id)
  if (!existing) return
  await db.put('categories', { ...existing, ...patch })
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('categories', id)
}

// ---------- Goals ----------

export async function listGoals(): Promise<Goal[]> {
  const db = await getDB()
  const all = await db.getAll('goals')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function addGoal(input: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
  const db = await getDB()
  const goal: Goal = { ...input, id: uid(), createdAt: Date.now() }
  await db.put('goals', goal)
  return goal
}

export async function updateGoal(id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('goals', id)
  if (!existing) return
  await db.put('goals', { ...existing, ...patch })
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('goals', id)
}

// ---------- Budgets ----------

export async function listBudgets(): Promise<Budget[]> {
  const db = await getDB()
  return db.getAll('budgets')
}

export async function upsertBudget(input: Omit<Budget, 'id' | 'createdAt'> & { id?: string }): Promise<Budget> {
  const db = await getDB()
  const existing = input.id ? await db.get('budgets', input.id) : undefined
  const budget: Budget = existing
    ? { ...existing, ...input }
    : { ...input, id: uid(), createdAt: Date.now() }
  await db.put('budgets', budget)
  return budget
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('budgets', id)
}

// ---------- Settings ----------

export async function getSalarySettings(): Promise<SalarySettings> {
  const db = await getDB()
  const s = await db.get('settings', 'salary')
  return (s as SalarySettings) ?? { id: 'salary', enabled: false, amount: 0, payDay: 5, periodicity: 'monthly', categoryId: 'inc-salary' }
}

export async function setSalarySettings(settings: SalarySettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB()
  const s = await db.get('settings', 'app')
  return (s as AppSettings) ?? { id: 'app', theme: 'system', currency: 'RUB', onboarded: false }
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}

export async function syncSalaryIncome(): Promise<void> {
  const salary = await getSalarySettings()
  if (!salary.enabled) return
  const transactions = await listTransactions()
  const missing = computeMissingSalaryOccurrences(salary, transactions)
  if (missing.length === 0) return
  const db = await getDB()
  const tx = db.transaction('transactions', 'readwrite')
  const now = Date.now()
  await Promise.all(
    missing.map((m, i) =>
      tx.store.put({
        id: `salary-${m.date}-${now}-${i}`,
        type: 'income',
        amount: salary.amount,
        categoryId: salary.categoryId,
        date: m.date,
        description: 'Зарплата (автоматически)',
        createdAt: now,
        updatedAt: now,
      } satisfies Transaction),
    ),
  )
  await tx.done
}

// ---------- Import / Export ----------

export interface ExportPayload {
  version: 1
  exportedAt: string
  transactions: Transaction[]
  categories: Category[]
  goals: Goal[]
  budgets: Budget[]
  salary: SalarySettings
  appSettings: AppSettings
}

export async function exportAllData(): Promise<ExportPayload> {
  const [transactions, categories, goals, budgets, salary, appSettings] = await Promise.all([
    listTransactions(),
    listCategories(),
    listGoals(),
    listBudgets(),
    getSalarySettings(),
    getAppSettings(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    goals,
    budgets,
    salary,
    appSettings,
  }
}

export async function importAllData(payload: ExportPayload): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['transactions', 'categories', 'goals', 'budgets', 'settings'], 'readwrite')
  await Promise.all([
    ...payload.transactions.map((t) => tx.objectStore('transactions').put(t)),
    ...payload.categories.map((c) => tx.objectStore('categories').put(c)),
    ...payload.goals.map((g) => tx.objectStore('goals').put(g)),
    ...payload.budgets.map((b) => tx.objectStore('budgets').put(b)),
    tx.objectStore('settings').put(payload.salary),
    tx.objectStore('settings').put(payload.appSettings),
  ])
  await tx.done
}

export async function wipeAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['transactions', 'categories', 'goals', 'budgets', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('transactions').clear(),
    tx.objectStore('categories').clear(),
    tx.objectStore('goals').clear(),
    tx.objectStore('budgets').clear(),
    tx.objectStore('settings').clear(),
  ])
  await tx.done
  await ensureSeeded()
}
