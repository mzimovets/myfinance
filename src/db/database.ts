import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AppSettings, Budget, Category, Goal, SalarySettings, Transaction } from '../types'

interface FinanceDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction
    indexes: { 'by-date': string; 'by-category': string }
  }
  categories: {
    key: string
    value: Category
    indexes: { 'by-type': string }
  }
  goals: {
    key: string
    value: Goal
  }
  budgets: {
    key: string
    value: Budget
    indexes: { 'by-category': string }
  }
  settings: {
    key: string
    value: SalarySettings | AppSettings
  }
}

const DB_NAME = 'finance-diary'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<FinanceDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FinanceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
          store.createIndex('by-category', 'categoryId')
        }
        if (!db.objectStoreNames.contains('categories')) {
          const store = db.createObjectStore('categories', { keyPath: 'id' })
          store.createIndex('by-type', 'type')
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('budgets')) {
          const store = db.createObjectStore('budgets', { keyPath: 'id' })
          store.createIndex('by-category', 'categoryId')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export type { FinanceDB }
