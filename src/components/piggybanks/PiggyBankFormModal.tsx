import { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalBody, ModalHeader, Input, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import type { PiggyBank } from '../../types'
import { formatRub } from '../../utils/format'

const ICONS = ['🐷', '🏺', '💰', '🧸', '🍯', '🧰', '🎒', '🔒', '🧧', '🪙']
const COLORS = ['#4361ee', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4']

export default function PiggyBankFormModal({ isOpen, onClose, piggyBank }: { isOpen: boolean; onClose: () => void; piggyBank?: PiggyBank | null }) {
  const { addPiggyBank, updatePiggyBank, deletePiggyBank } = useAppData()
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [initialBalance, setInitialBalance] = useState('0')
  const [adjustAmount, setAdjustAmount] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle(piggyBank?.title ?? '')
      setIcon(piggyBank?.icon ?? ICONS[0])
      setColor(piggyBank?.color ?? COLORS[0])
      setInitialBalance(piggyBank ? String(piggyBank.balance) : '0')
      setAdjustAmount('')
    }
  }, [isOpen, piggyBank])

  const canSave = title.trim().length > 0

  async function handleSave() {
    if (!canSave) return
    if (piggyBank) {
      await updatePiggyBank(piggyBank.id, { title: title.trim(), icon, color })
    } else {
      await addPiggyBank({ title: title.trim(), icon, color, balance: Number(initialBalance) || 0 })
    }
    onClose()
  }

  async function handleDelete() {
    if (piggyBank) {
      await deletePiggyBank(piggyBank.id)
      onClose()
    }
  }

  async function applyAdjustment(sign: 1 | -1) {
    if (!piggyBank) return
    const delta = Number(adjustAmount.replace(',', '.'))
    if (!delta || delta <= 0) return
    const nextBalance = Math.max(0, piggyBank.balance + sign * delta)
    await updatePiggyBank(piggyBank.id, { balance: nextBalance })
    setAdjustAmount('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="bottom-center" scrollBehavior="inside" classNames={{ wrapper: 'items-end sm:items-center' }}>
      <ModalContent>
        <ModalHeader>{piggyBank ? 'Копилка' : 'Новая копилка'}</ModalHeader>
        <ModalBody className="pb-6 flex flex-col gap-3">
          <Input label="Название" labelPlacement="outside" placeholder="Например, «На чёрный день»" value={title} onChange={(e) => setTitle(e.target.value)} variant="bordered" />

          {piggyBank ? (
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 flex flex-col gap-2">
              <div className="text-sm text-slate-400">Баланс копилки</div>
              <div className="text-2xl font-bold tabular-nums">{formatRub(piggyBank.balance)}</div>
              <div className="flex items-center gap-2 pt-1">
                <Input aria-label="Сумма" placeholder="0 ₽" inputMode="decimal" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value.replace(/[^0-9.,]/g, ''))} variant="bordered" size="sm" className="flex-1" />
                <Button size="sm" color="success" variant="flat" onPress={() => applyAdjustment(1)}>
                  + Пополнить
                </Button>
                <Button size="sm" color="danger" variant="flat" onPress={() => applyAdjustment(-1)}>
                  − Снять
                </Button>
              </div>
            </div>
          ) : (
            <Input label="Начальная сумма ₽" labelPlacement="outside" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} variant="bordered" />
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
            {piggyBank && (
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
