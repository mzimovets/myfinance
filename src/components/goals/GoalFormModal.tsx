import { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalHeader, Input, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import DateField from '../common/DateField'
import { todayISO } from '../../utils/format'
import type { Goal } from '../../types'

const ICONS = ['🎯', '✈️', '📱', '🚗', '🏠', '💻', '🎓', '💍', '🏖️', '🎁']
const COLORS = ['#4361ee', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4']

export default function GoalFormModal({ isOpen, onClose, goal }: { isOpen: boolean; onClose: () => void; goal?: Goal | null }) {
  const { addGoal, updateGoal, deleteGoal } = useAppData()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (isOpen) {
      setTitle(goal?.title ?? '')
      setTarget(goal ? String(goal.targetAmount) : '')
      setCurrent(goal ? String(goal.currentAmount) : '0')
      setDeadline(goal?.deadline ?? '')
      setIcon(goal?.icon ?? ICONS[0])
      setColor(goal?.color ?? COLORS[0])
    }
  }, [isOpen, goal])

  const canSave = title.trim().length > 0 && Number(target) > 0

  async function handleSave() {
    if (!canSave) return
    const payload = {
      title: title.trim(),
      icon,
      color,
      targetAmount: Number(target),
      currentAmount: Number(current) || 0,
      deadline: deadline || undefined,
    }
    if (goal) {
      await updateGoal(goal.id, payload)
    } else {
      await addGoal(payload)
    }
    onClose()
  }

  async function handleDelete() {
    if (goal) {
      await deleteGoal(goal.id)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="bottom-center" scrollBehavior="inside" classNames={{ wrapper: 'items-end sm:items-center' }}>
      <ModalContent>
        <ModalHeader>{goal ? 'Редактировать цель' : 'Новая цель'}</ModalHeader>
        <ModalBody className="pb-6 flex flex-col gap-3">
          <Input label="Название" labelPlacement="outside" placeholder="Например, отпуск" value={title} onChange={(e) => setTitle(e.target.value)} variant="bordered" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-400 mb-1.5">Нужная сумма ₽</div>
              <input
                inputMode="decimal"
                placeholder="0"
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1.5">Уже накоплено ₽</div>
              <input
                inputMode="decimal"
                placeholder="0"
                value={current}
                onChange={(e) => setCurrent(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>
          {deadline ? (
            <div>
              <DateField label="Дедлайн" value={deadline} onChange={setDeadline} />
              <button onClick={() => setDeadline('')} className="text-xs text-slate-400 mt-1.5">
                Убрать дедлайн
              </button>
            </div>
          ) : (
            <button onClick={() => setDeadline(todayISO())} className="self-start text-xs font-semibold text-brand-500">
              + Добавить дедлайн
            </button>
          )}

          <div>
            <div className="text-xs text-slate-400 mb-1.5">Иконка</div>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button key={i} onClick={() => setIcon(i)} className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg border ${icon === i ? 'border-brand-500 bg-brand-500/10' : 'border-transparent bg-slate-100 dark:bg-white/5'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1.5">Цвет</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: c }}>
                  {color === c && <span className="text-white text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {goal && (
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
