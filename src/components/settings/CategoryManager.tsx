import { useEffect, useMemo, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalHeader, Input, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import type { Category, TransactionType } from '../../types'

const EMOJI_CHOICES = ['🍔', '🚗', '🏠', '🛒', '🎮', '☕', '💊', '📱', '💼', '💰', '🎁', '💵', '🐶', '✈️', '🎓', '🧴', '🧾', '🎵', '📚', '🧹']
const COLOR_CHOICES = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#a16207', '#ef4444', '#06b6d4', '#4361ee', '#6b7280']

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppData()
  const [type, setType] = useState<TransactionType>('expense')
  const [editing, setEditing] = useState<Category | null | undefined>(undefined)

  const filtered = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Категории</h2>
        <button onClick={() => setEditing(null)} className="text-xs font-semibold text-brand-500">
          + Добавить
        </button>
      </div>
      <div className="flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 text-xs font-medium w-fit">
        <button onClick={() => setType('expense')} className={`px-3 py-1.5 rounded-lg ${type === 'expense' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
          Расходы
        </button>
        <button onClick={() => setType('income')} className={`px-3 py-1.5 rounded-lg ${type === 'income' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
          Доходы
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => setEditing(c)} className="flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-50 dark:bg-white/5 text-left">
            <span className="text-lg">{c.icon}</span>
            <span className="text-sm truncate flex-1">{c.name}</span>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
          </button>
        ))}
      </div>

      <CategoryFormModal
        isOpen={editing !== undefined}
        category={editing}
        defaultType={type}
        onClose={() => setEditing(undefined)}
        onSave={async (payload) => {
          if (editing) await updateCategory(editing.id, payload)
          else await addCategory(payload)
          setEditing(undefined)
        }}
        onDelete={
          editing
            ? async () => {
                await deleteCategory(editing.id)
                setEditing(undefined)
              }
            : undefined
        }
      />
    </div>
  )
}

function CategoryFormModal({
  isOpen,
  category,
  defaultType,
  onClose,
  onSave,
  onDelete,
}: {
  isOpen: boolean
  category: Category | null | undefined
  defaultType: TransactionType
  onClose: () => void
  onSave: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? EMOJI_CHOICES[0])
  const [color, setColor] = useState(category?.color ?? COLOR_CHOICES[0])
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType)

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? '')
      setIcon(category?.icon ?? EMOJI_CHOICES[0])
      setColor(category?.color ?? COLOR_CHOICES[0])
      setType(category?.type ?? defaultType)
    }
  }, [isOpen, category, defaultType])

  const canSave = name.trim().length > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="bottom-center" scrollBehavior="inside" classNames={{ wrapper: 'items-end sm:items-center' }}>
      <ModalContent>
        <ModalHeader>{category ? 'Редактировать категорию' : 'Новая категория'}</ModalHeader>
        <ModalBody className="pb-6 flex flex-col gap-3">
          <Input label="Название" labelPlacement="outside" value={name} onChange={(e) => setName(e.target.value)} variant="bordered" />
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/5">
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`py-2 rounded-xl text-sm font-medium ${type === t ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-400'}`}>
                {t === 'expense' ? 'Расход' : 'Доход'}
              </button>
            ))}
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1.5">Иконка</div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {EMOJI_CHOICES.map((e) => (
                <button key={e} onClick={() => setIcon(e)} className={`h-9 w-9 rounded-lg flex items-center justify-center text-base border ${icon === e ? 'border-brand-500 bg-brand-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1.5">Цвет</div>
            <div className="flex gap-2">
              {COLOR_CHOICES.map((c) => (
                <button key={c} onClick={() => setColor(c)} className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: c }}>
                  {color === c && <span className="text-white text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {onDelete && !category?.isDefault && (
              <Button color="danger" variant="flat" onPress={onDelete}>
                Удалить
              </Button>
            )}
            <Button color="primary" className="flex-1 font-semibold" isDisabled={!canSave} onPress={() => onSave({ name: name.trim(), icon, color, type })}>
              Сохранить
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
