import { useEffect, useMemo, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalHeader, Input, Textarea, Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { useAppData } from '../../context/AppDataContext'
import type { Transaction, TransactionType } from '../../types'
import { todayISO } from '../../utils/format'

interface Props {
  isOpen: boolean
  onClose: () => void
  editingTransaction?: Transaction | null
}

export default function AddTransactionModal({ isOpen, onClose, editingTransaction }: Props) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useAppData()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [date, setDate] = useState(todayISO())
  const [description, setDescription] = useState('')

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
    }
  }, [isOpen, editingTransaction])

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  useEffect(() => {
    if (categoryId && !filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(null)
    }
  }, [filteredCategories, categoryId])

  const numericAmount = Number(amount.replace(',', '.'))
  const canSave = numericAmount > 0 && !!categoryId && !!date

  async function handleSave() {
    if (!canSave || !categoryId) return
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, {
        type,
        amount: numericAmount,
        categoryId,
        date,
        description: description || undefined,
      })
    } else {
      await addTransaction({
        type,
        amount: numericAmount,
        categoryId,
        date,
        description: description || undefined,
      })
    }
    onClose()
  }

  async function handleDelete() {
    if (editingTransaction) {
      await deleteTransaction(editingTransaction.id)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="bottom-center" size="md" scrollBehavior="inside" classNames={{ wrapper: 'items-end sm:items-center' }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{editingTransaction ? 'Редактировать операцию' : 'Новая операция'}</ModalHeader>
        <ModalBody className="pb-6">
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

          <Input
            type="date"
            label="Дата"
            labelPlacement="outside"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            variant="bordered"
          />

          <Textarea
            label="Описание"
            labelPlacement="outside"
            placeholder="Необязательно"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="bordered"
            minRows={1}
          />

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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
