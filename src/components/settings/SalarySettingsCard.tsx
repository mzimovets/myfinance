import { useEffect, useState } from 'react'
import { Switch, Input, Select, SelectItem, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import type { SalaryPart, SalaryPeriodicity } from '../../types'

const PERIODICITY_LABEL: Record<SalaryPeriodicity, string> = {
  monthly: 'Раз в месяц',
  biweekly: 'Раз в две недели',
  weekly: 'Раз в неделю',
}

function newPart(label = ''): SalaryPart {
  return { id: `part-${Math.random().toString(36).slice(2, 9)}`, label, amount: 0, payDay: 5, periodicity: 'monthly' }
}

export default function SalarySettingsCard() {
  const { salary, setSalarySettings } = useAppData()
  const [enabled, setEnabled] = useState(salary.enabled)
  const [parts, setParts] = useState<SalaryPart[]>(salary.parts)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setEnabled(salary.enabled)
    setParts(salary.parts)
    setDirty(false)
  }, [salary])

  function markDirty() {
    setDirty(true)
  }

  function updatePart(id: string, patch: Partial<SalaryPart>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    markDirty()
  }

  function addPart() {
    const label = parts.length === 0 ? 'Зарплата' : parts.length === 1 ? 'Аванс' : `Часть ${parts.length + 1}`
    setParts((prev) => [...prev, newPart(label)])
    markDirty()
  }

  function removePart(id: string) {
    setParts((prev) => prev.filter((p) => p.id !== id))
    markDirty()
  }

  async function save() {
    await setSalarySettings({
      id: 'salary',
      enabled,
      categoryId: salary.categoryId || 'inc-salary',
      parts: parts.filter((p) => p.label.trim().length > 0),
    })
    setDirty(false)
  }

  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Моя зарплата</h2>
          <p className="text-xs text-slate-400">Можно разбить на несколько выплат — аванс, зарплата и т.д.</p>
        </div>
        <Switch
          isSelected={enabled}
          onValueChange={(v) => {
            setEnabled(v)
            markDirty()
          }}
        />
      </div>
      {enabled && (
        <div className="flex flex-col gap-4">
          {parts.length === 0 && (
            <p className="text-xs text-slate-400">Пока нет ни одной выплаты. Добавьте первую — например, «Зарплата» или «Аванс».</p>
          )}
          {parts.map((part) => (
            <div key={part.id} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Название выплаты"
                  placeholder="Например, «Аванс»"
                  value={part.label}
                  onChange={(e) => updatePart(part.id, { label: e.target.value })}
                  variant="bordered"
                  size="sm"
                  className="flex-1"
                />
                <button onClick={() => removePart(part.id)} className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-black/5 dark:hover:bg-white/5">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Сумма ₽"
                  labelPlacement="outside"
                  type="number"
                  value={part.amount ? String(part.amount) : ''}
                  onChange={(e) => updatePart(part.id, { amount: Number(e.target.value) || 0 })}
                  variant="bordered"
                  size="sm"
                />
                <Input
                  label="День"
                  labelPlacement="outside"
                  type="number"
                  min={1}
                  max={31}
                  value={String(part.payDay)}
                  onChange={(e) => updatePart(part.id, { payDay: Number(e.target.value) || 1 })}
                  variant="bordered"
                  size="sm"
                />
                <Select
                  label="Период"
                  labelPlacement="outside"
                  selectedKeys={[part.periodicity]}
                  onSelectionChange={(keys) => updatePart(part.id, { periodicity: Array.from(keys)[0] as SalaryPeriodicity })}
                  variant="bordered"
                  size="sm"
                >
                  {Object.entries(PERIODICITY_LABEL).map(([key, label]) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          ))}
          <button onClick={addPart} className="self-start text-xs font-semibold text-brand-500">
            + Добавить выплату
          </button>
          <p className="text-[11px] text-slate-400">
            Суммы можно пересчитывать в любой момент — обновите их здесь перед очередной выплатой, либо отредактируйте уже созданную операцию в «Операциях». Учитывается в категории «💼 Зарплата».
          </p>
        </div>
      )}
      {dirty && (
        <Button color="primary" size="sm" onPress={save} className="self-end font-medium">
          Сохранить
        </Button>
      )}
    </div>
  )
}
