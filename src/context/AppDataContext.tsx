import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppSettings, Budget, Category, Goal, PiggyBank, SalarySettings, Transaction } from '../types'
import * as repo from '../db/repository'

interface AppDataState {
  ready: boolean
  transactions: Transaction[]
  categories: Category[]
  goals: Goal[]
  piggyBanks: PiggyBank[]
  budgets: Budget[]
  salary: SalarySettings
  appSettings: AppSettings
}

interface AppDataActions {
  refresh: () => Promise<void>
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (input: Omit<Category, 'id' | 'createdAt'>) => Promise<void>
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addGoal: (input: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addPiggyBank: (input: Omit<PiggyBank, 'id' | 'createdAt'>) => Promise<void>
  updatePiggyBank: (id: string, patch: Partial<Omit<PiggyBank, 'id' | 'createdAt'>>) => Promise<void>
  deletePiggyBank: (id: string) => Promise<void>
  upsertBudget: (input: Omit<Budget, 'id' | 'createdAt'> & { id?: string }) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  setSalarySettings: (settings: SalarySettings) => Promise<void>
  setAppSettings: (settings: AppSettings) => Promise<void>
  importData: (payload: repo.ExportPayload) => Promise<void>
  wipeAllData: () => Promise<void>
}

type AppDataContextValue = AppDataState & AppDataActions

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppDataState>({
    ready: false,
    transactions: [],
    categories: [],
    goals: [],
    piggyBanks: [],
    budgets: [],
    salary: { id: 'salary', enabled: false, amount: 0, payDay: 5, periodicity: 'monthly', categoryId: 'inc-salary' },
    appSettings: { id: 'app', theme: 'system', currency: 'RUB', onboarded: false },
  })

  const refresh = useCallback(async () => {
    const [transactions, categories, goals, piggyBanks, budgets, salary, appSettings] = await Promise.all([
      repo.listTransactions(),
      repo.listCategories(),
      repo.listGoals(),
      repo.listPiggyBanks(),
      repo.listBudgets(),
      repo.getSalarySettings(),
      repo.getAppSettings(),
    ])
    setState({ ready: true, transactions, categories, goals, piggyBanks, budgets, salary, appSettings })
  }, [])

  useEffect(() => {
    repo
      .ensureSeeded()
      .then(() => repo.syncSalaryIncome())
      .then(refresh)
  }, [refresh])

  const actions: AppDataActions = useMemo(
    () => ({
      refresh,
      addTransaction: async (input) => {
        await repo.addTransaction(input)
        await refresh()
      },
      updateTransaction: async (id, patch) => {
        await repo.updateTransaction(id, patch)
        await refresh()
      },
      deleteTransaction: async (id) => {
        await repo.deleteTransaction(id)
        await refresh()
      },
      addCategory: async (input) => {
        await repo.addCategory(input)
        await refresh()
      },
      updateCategory: async (id, patch) => {
        await repo.updateCategory(id, patch)
        await refresh()
      },
      deleteCategory: async (id) => {
        await repo.deleteCategory(id)
        await refresh()
      },
      addGoal: async (input) => {
        await repo.addGoal(input)
        await refresh()
      },
      updateGoal: async (id, patch) => {
        await repo.updateGoal(id, patch)
        await refresh()
      },
      deleteGoal: async (id) => {
        await repo.deleteGoal(id)
        await refresh()
      },
      addPiggyBank: async (input) => {
        await repo.addPiggyBank(input)
        await refresh()
      },
      updatePiggyBank: async (id, patch) => {
        await repo.updatePiggyBank(id, patch)
        await refresh()
      },
      deletePiggyBank: async (id) => {
        await repo.deletePiggyBank(id)
        await refresh()
      },
      upsertBudget: async (input) => {
        await repo.upsertBudget(input)
        await refresh()
      },
      deleteBudget: async (id) => {
        await repo.deleteBudget(id)
        await refresh()
      },
      setSalarySettings: async (settings) => {
        await repo.setSalarySettings(settings)
        await repo.syncSalaryIncome()
        await refresh()
      },
      setAppSettings: async (settings) => {
        await repo.setAppSettings(settings)
        await refresh()
      },
      importData: async (payload) => {
        await repo.importAllData(payload)
        await refresh()
      },
      wipeAllData: async () => {
        await repo.wipeAllData()
        await refresh()
      },
    }),
    [refresh],
  )

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
