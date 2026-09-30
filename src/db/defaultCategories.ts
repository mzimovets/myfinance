import type { Category } from '../types'

function cat(partial: Omit<Category, 'createdAt' | 'isDefault'>): Category {
  return { ...partial, isDefault: true, createdAt: Date.now() }
}

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  cat({ id: 'exp-food', type: 'expense', name: 'Еда', icon: '🍔', color: '#f97316' }),
  cat({ id: 'exp-transport', type: 'expense', name: 'Транспорт', icon: '🚗', color: '#3b82f6' }),
  cat({ id: 'exp-home', type: 'expense', name: 'Дом', icon: '🏠', color: '#8b5cf6' }),
  cat({ id: 'exp-shopping', type: 'expense', name: 'Покупки', icon: '🛒', color: '#ec4899' }),
  cat({ id: 'exp-fun', type: 'expense', name: 'Развлечения', icon: '🎮', color: '#22c55e' }),
  cat({ id: 'exp-coffee', type: 'expense', name: 'Кофе', icon: '☕', color: '#a16207' }),
  cat({ id: 'exp-health', type: 'expense', name: 'Здоровье', icon: '💊', color: '#ef4444' }),
  cat({ id: 'exp-subs', type: 'expense', name: 'Подписки', icon: '📱', color: '#06b6d4' }),
  cat({ id: 'exp-other', type: 'expense', name: 'Другое', icon: '📦', color: '#6b7280' }),
]

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  cat({ id: 'inc-salary', type: 'income', name: 'Зарплата', icon: '💼', color: '#4361ee' }),
  cat({ id: 'inc-side', type: 'income', name: 'Подработка', icon: '💰', color: '#22c55e' }),
  cat({ id: 'inc-gift', type: 'income', name: 'Подарки', icon: '🎁', color: '#ec4899' }),
  cat({ id: 'inc-other', type: 'income', name: 'Другое', icon: '💵', color: '#6b7280' }),
]

export const DEFAULT_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
