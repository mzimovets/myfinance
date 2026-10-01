import { useEffect, useMemo, useState } from 'react'
import { Drawer, DrawerContent, DrawerBody, DrawerHeader, Input, Textarea, Button, Select, SelectItem } from '@heroui/react'
import { motion } from 'framer-motion'
import { useAppData } from '../../context/AppDataContext'
import type { Transaction, TransactionType } from '../../types'
import { formatRub, todayISO } from '../../utils/format'
import { suggestGoalAllocations, suggestPiggyBankAllocations } from '../../utils/insights'
import DateField from '../common/DateField'
import PlusIcon from '../icons/PlusIcon'

interface Props {
  isOpen: boolean
  onClose: () => void
  editingTransaction?: Transaction | null
}

interface SplitPart {
  id: string
  categoryId: string | null
  amount: string
}

function newPart(categoryId: string | null = null, amount = ''): SplitPart {
  return { id: Math.random().toString(36).slice(2), categoryId, amount }
}

export default function AddTransactionModal({ isOpen, onClose, editingTransaction }: Props) {
  const { categories, goals, piggyBanks, addTransaction, updateTransaction, deleteTransaction, updateGoal, updatePiggyBank } = useAppData()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')
  const [splitEnabled, setSplitEnabled] = useState(false)
  const [parts, setParts] = useState<SplitPart[]>([newPart()])
  const [goalAllocations, setGoalAllocations] = useState<Record<string, string>>({})
  const [piggyAllocations, setPiggyAllocations] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type)
        setAmount(String(editingTransaction.amount))
        setCategoryId(editingTransaction.categoryId)
        setDate(editingTransaction.date)
        setDescription(editingTransaction.description ?? '')
      } else {
        setType('expense')
        setAmount('')
        setCategoryId(null)
        setDate(todayISO())
        setDescription('')
      }
      setSplitEnabled(false)
      setParts([newPart()])
      setGoalAllocations({})
      setPiggyAllocations({})
    }
  }, [isOpen, editingTransaction])

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  useEffect(() => {
    if (categoryId && !filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(null)
    }
  }, [filteredCategories, categoryId])

  useEffect(() => {
    // reset split UI if switching to expense while editing not allowed / type changes
    setParts((prev) => prev.map((p) => (p.categoryId && filteredCategories.some((c) => c.id === p.categoryId) ? p : { ...p, categoryId: null })))
  }, [filteredCategories])

  const numericAmount = Number(amount.replace(',', '.'))
  const partsTotal = parts.reduce((acc, p) => acc + (Number(p.amount.replace(',', '.')) || 0), 0)
  const activeGoals = useMemo(() => goals.filter((g) => g.currentAmount < g.targetAmount), [goals])
  const canSplit = type === 'income' && !editingTransaction
  const totalForAllocation = splitEnabled ? partsTotal : numericAmount

  const canSave = splitEnabled
    ? parts.some((p) => p.categoryId && Number(p.amount.replace(',', '.')) > 0)
    : numericAmount > 0 && !!categoryId && !!date

  function updatePart(id: string, patch: Partial<SplitPart>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addPartRow() {
    setParts((prev) => [...prev, newPart()])
  }

  function removePartRow(id: string) {
    setParts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev))
  }

  const goalAllocationTotal = Object.values(goalAllocations).reduce((acc, v) => acc + (Number(v) || 0), 0)
  const piggyAllocationTotal = Object.values(piggyAllocations).reduce((acc, v) => acc + (Number(v) || 0), 0)
  const spendable = totalForAllocation - goalAllocationTotal - piggyAllocationTotal

  function applyAllocationSuggestions() {
    if (totalForAllocation <= 0) return
    const goalSuggestions = suggestGoalAllocations(totalForAllocation, activeGoals)
    const afterGoals = totalForAllocation - goalSuggestions.reduce((acc, s) => acc + s.amount, 0)
    const piggySuggestions = suggestPiggyBankAllocations(afterGoals, piggyBanks, totalForAllocation)

    const nextGoals: Record<string, string> = {}
    for (const s of goalSuggestions) nextGoals[s.goalId] = String(s.amount)
    setGoalAllocations(nextGoals)

    const nextPiggy: Record<string, string> = {}
    for (const s of piggySuggestions) nextPiggy[s.piggyBankId] = String(s.amount)
    setPiggyAllocations(nextPiggy)
  }

  async function applyAllocations() {
    const goalEntries = Object.entries(goalAllocations).filter(([, v]) => Number(v) > 0)
    for (const [goalId, v] of goalEntries) {
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) continue
      await updateGoal(goalId, { currentAmount: goal.currentAmount + Number(v) })
    }
    const piggyEntries = Object.entries(piggyAllocations).filter(([, v]) => Number(v) > 0)
    for (const [piggyBankId, v] of piggyEntries) {
      const piggyBank = piggyBanks.find((p) => p.id === piggyBankId)
      if (!piggyBank) continue
      await updatePiggyBank(piggyBankId, { balance: piggyBank.balance + Number(v) })
    }
  }

  async function handleSave() {
    if (!canSave) return
    if (editingTransaction) {
      if (!categoryId) return
      await updateTransaction(editingTransaction.id, {
        type,
        amount: numericAmount,
        categoryId,
        date,
        description: description || undefined,
      })
      onClose()
      return
    }

    if (splitEnabled) {
      const validParts = parts.filter((p) => p.categoryId && Number(p.amount.replace(',', '.')) > 0)
      await Promise.all(
        validParts.map((p) =>
          addTransaction({
            type,
            amount: Number(p.amount.replace(',', '.')),
            categoryId: p.categoryId!,
            date,
            description: description || undefined,
          }),
        ),
      )
    } else {
      if (!categoryId) return
      await addTransaction({
        type,
        amount: numericAmount,
        categoryId,
        date,
        description: description || undefined,
      })
    }

    await applyAllocations()
    onClose()
  }

  async function handleDelete() {
    if (editingTransaction) {
      await deleteTransaction(editingTransaction.id)
      onClose()
    }
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom" size="lg" radius="lg">
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1">{editingTransaction ? 'Редактировать операцию' : 'Новая операция'}</DrawerHeader>
        <DrawerBody className="pb-6">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/5">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`relative py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  type === t ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {type === t && (
                  <motion.div
                    layoutId="type-pill"
                    className={`absolute inset-0 rounded-xl ${t === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    transition={{ type: 'spring', duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{t === 'expense' ? 'Расход' : 'Доход'}</span>
              </button>
            ))}
          </div>

          {canSplit && (
            <button
              onClick={() => setSplitEnabled((v) => !v)}
              className={`self-start text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                splitEnabled ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
              }`}
            >
              🧩 Разделить на части
            </button>
          )}

          {!splitEnabled ? (
            <>
              <div className="text-center py-3">
                <input
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="0"
                  className="w-full text-center text-5xl font-bold bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-white/15"
                />
                <div className="text-slate-400 text-sm mt-1">₽</div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all ${
                      categoryId === c.id
                        ? 'border-brand-500 bg-brand-500/10 scale-[1.03]'
                        : 'border-transparent bg-slate-100 dark:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center px-1">{c.name}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {parts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Select
                    aria-label="Категория"
                    placeholder="Категория"
                    selectedKeys={p.categoryId ? [p.categoryId] : []}
                    onSelectionChange={(keys) => updatePart(p.id, { categoryId: (Array.from(keys)[0] as string) ?? null })}
                    variant="bordered"
                    className="flex-1"
                  >
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id}>{`${c.icon} ${c.name}`}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    aria-label="Сумма"
                    placeholder="0 ₽"
                    inputMode="decimal"
                    value={p.amount}
                    onChange={(e) => updatePart(p.id, { amount: e.target.value.replace(/[^0-9.,]/g, '') })}
                    variant="bordered"
                    className="w-28"
                  />
                  {parts.length > 1 && (
                    <button onClick={() => removePartRow(p.id)} className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-black/5 dark:hover:bg-white/5">
                      ✕
                    </button>
                  )}
                  {i === parts.length - 1 && parts.length < 8 && (
                    <span className="sr-only">last</span>
                  )}
                </div>
              ))}
              <button onClick={addPartRow} aria-label="Добавить часть" className="self-start h-7 w-7 rounded-full flex items-center justify-center text-brand-500 bg-brand-500/10">
                <PlusIcon className="h-4 w-4" />
              </button>
              <div className="text-right text-sm text-slate-400">
                Итого: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatRub(partsTotal)}</span>
              </div>
            </div>
          )}

          <DateField label="Дата" value={date} onChange={setDate} />

          <Textarea
            label="Описание"
            labelPlacement="outside"
            placeholder="Необязательно"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="bordered"
            minRows={1}
          />

          {type === 'income' && !editingTransaction && (activeGoals.length > 0 || piggyBanks.length > 0) && totalForAllocation > 0 && (
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Куда отложить?</span>
                <button onClick={applyAllocationSuggestions} className="text-xs font-semibold text-brand-500">
                  🤖 Предложить
                </button>
              </div>
              <p className="text-[11px] text-slate-400 -mt-1">Не влияет на сумму дохода — просто резервирует часть денег на цели и копилки.</p>

              {activeGoals.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Цели</span>
                  {activeGoals.map((g) => (
                    <div key={g.id} className="flex items-center gap-2">
                      <span className="text-sm w-28 truncate shrink-0">
                        {g.icon} {g.title}
                      </span>
                      <Input
                        aria-label={`Отложить в ${g.title}`}
                        placeholder="0 ₽"
                        inputMode="decimal"
                        value={goalAllocations[g.id] ?? ''}
                        onChange={(e) => setGoalAllocations((prev) => ({ ...prev, [g.id]: e.target.value.replace(/[^0-9.,]/g, '') }))}
                        variant="bordered"
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              )}

              {piggyBanks.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Копилки</span>
                  {piggyBanks.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-sm w-28 truncate shrink-0">
                        {p.icon} {p.title}
                      </span>
                      <Input
                        aria-label={`Отложить в ${p.title}`}
                        placeholder="0 ₽"
                        inputMode="decimal"
                        value={piggyAllocations[p.id] ?? ''}
                        onChange={(e) => setPiggyAllocations((prev) => ({ ...prev, [p.id]: e.target.value.replace(/[^0-9.,]/g, '') }))}
                        variant="bordered"
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5 dark:border-white/10 text-sm">
                <span className="text-slate-500">💳 Оставить на траты</span>
                <span className={`font-semibold tabular-nums ${spendable < 0 ? 'text-rose-500' : ''}`}>{formatRub(spendable)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {editingTransaction && (
              <Button color="danger" variant="flat" onPress={handleDelete}>
                Удалить
              </Button>
            )}
            <Button color="primary" className="flex-1 font-semibold" isDisabled={!canSave} onPress={handleSave}>
              Сохранить
            </Button>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
