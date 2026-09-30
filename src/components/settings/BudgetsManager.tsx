import { useMemo, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalHeader, Input, Select, SelectItem, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import { computeMonthStats } from '../../utils/analytics'
import { formatRub } from '../../utils/format'
import GoalProgressBar from '../goals/GoalProgressBar'
import type { Budget } from '../../types'

export default function BudgetsManager() {
  const { budgets, categories, transactions, upsertBudget, deleteBudget } = useAppData()
  const [modalBudget, setModalBudget] = useState<Budget | null | undefined>(undefined)
  const now = new Date()
  const stats = useMemo(() => computeMonthStats(transactions, categories, now.getFullYear(), now.getMonth(), now), [transactions, categories])
  const spentByCategory = useMemo(() => new Map(stats.expenseByCategory.map((c) => [c.categoryId, c.total])), [stats])
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const usedCategoryIds = new Set(budgets.map((b) => b.categoryId))
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.has(c.id) || c.id === modalBudget?.categoryId)

  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Бюджеты по категориям</h2>
        <button onClick={() => setModalBudget(null)} className="text-xs font-semibold text-brand-500">
          + Добавить
        </button>
      </div>
      {budgets.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">Установите месячный лимит для категории, чтобы отслеживать траты.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((b) => {
            const category = categories.find((c) => c.id === b.categoryId)
            const spent = spentByCategory.get(b.categoryId) ?? 0
            const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0
            const over = spent > b.monthlyLimit
            return (
              <button key={b.id} onClick={() => setModalBudget(b)} className="text-left flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {category?.icon} {category?.name ?? 'Категория'}
                  </span>
                  <span className={`font-medium tabular-nums ${over ? 'text-rose-500' : 'text-slate-500'}`}>
                    {formatRub(spent)} / {formatRub(b.monthlyLimit)}
                  </span>
                </div>
                <GoalProgressBar percent={percent} color={over ? '#f43f5e' : percent >= 80 ? '#f59e0b' : (category?.color ?? '#4361ee')} />
                {over && <span className="text-[11px] text-rose-500">Бюджет превышен на {formatRub(spent - b.monthlyLimit)}</span>}
                {!over && percent >= 80 && <span className="text-[11px] text-amber-500">Скоро лимит будет достигнут</span>}
              </button>
            )
          })}
        </div>
      )}

      <BudgetFormModal
        isOpen={modalBudget !== undefined}
        budget={modalBudget}
        categories={availableCategories}
        onClose={() => setModalBudget(undefined)}
        onSave={async (categoryId, limit) => {
          await upsertBudget({ id: modalBudget?.id, categoryId, monthlyLimit: limit })
          setModalBudget(undefined)
        }}
        onDelete={
          modalBudget
            ? async () => {
                await deleteBudget(modalBudget.id)
                setModalBudget(undefined)
              }
            : undefined
        }
      />
    </div>
  )
}

function BudgetFormModal({
  isOpen,
  budget,
  categories,
  onClose,
  onSave,
  onDelete,
}: {
  isOpen: boolean
  budget: Budget | null | undefined
  categories: { id: string; name: string; icon: string }[]
  onClose: () => void
  onSave: (categoryId: string, limit: number) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? categories[0]?.id ?? '')
  const [limit, setLimit] = useState(String(budget?.monthlyLimit ?? ''))

  const canSave = !!categoryId && Number(limit) > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="bottom-center" classNames={{ wrapper: 'items-end sm:items-center' }}>
      <ModalContent>
        <ModalHeader>{budget ? 'Редактировать бюджет' : 'Новый бюджет'}</ModalHeader>
        <ModalBody className="pb-6 flex flex-col gap-3">
          <Select label="Категория" labelPlacement="outside" selectedKeys={categoryId ? [categoryId] : []} onSelectionChange={(keys) => setCategoryId(Array.from(keys)[0] as string)} variant="bordered">
            {categories.map((c) => (
              <SelectItem key={c.id}>{`${c.icon} ${c.name}`}</SelectItem>
            ))}
          </Select>
          <Input label="Месячный лимит ₽" labelPlacement="outside" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} variant="bordered" />
          <div className="flex gap-2 pt-2">
            {onDelete && (
              <Button color="danger" variant="flat" onPress={onDelete}>
                Удалить
              </Button>
            )}
            <Button color="primary" className="flex-1 font-semibold" isDisabled={!canSave} onPress={() => onSave(categoryId, Number(limit))}>
              Сохранить
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
