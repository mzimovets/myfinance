export type TransactionType = 'expense' | 'income'

export interface Category {
  id: string
  type: TransactionType
  name: string
  icon: string
  color: string
  isDefault?: boolean
  createdAt: number
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  date: string // YYYY-MM-DD
  description?: string
  createdAt: number
  updatedAt: number
}

export type SalaryPeriodicity = 'monthly' | 'biweekly' | 'weekly'

export interface SalarySettings {
  id: 'salary'
  enabled: boolean
  amount: number
  payDay: number // day of month (1-31) for monthly; day of week (0-6) for weekly
  periodicity: SalaryPeriodicity
  categoryId: string
}

export interface Goal {
  id: string
  title: string
  icon: string
  color: string
  targetAmount: number
  currentAmount: number
  deadline?: string // YYYY-MM-DD
  createdAt: number
  completedAt?: number
}

export interface Budget {
  id: string
  categoryId: string
  monthlyLimit: number
  createdAt: number
}

export interface AppSettings {
  id: 'app'
  theme: 'light' | 'dark' | 'system'
  currency: string
  onboarded: boolean
}
