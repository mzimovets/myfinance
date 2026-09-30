import { useEffect, useState } from 'react'
import { Switch, Input, Select, SelectItem, Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import type { SalaryPeriodicity } from '../../types'

const PERIODICITY_LABEL: Record<SalaryPeriodicity, string> = {
  monthly: 'Раз в месяц',
  biweekly: 'Раз в две недели',
  weekly: 'Раз в неделю',
}

export default function SalarySettingsCard() {
  const { salary, setSalarySettings, categories } = useAppData()
  const [enabled, setEnabled] = useState(salary.enabled)
  const [amount, setAmount] = useState(String(salary.amount || ''))
  const [payDay, setPayDay] = useState(String(salary.payDay))
  const [periodicity, setPeriodicity] = useState<SalaryPeriodicity>(salary.periodicity)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setEnabled(salary.enabled)
    setAmount(String(salary.amount || ''))
    setPayDay(String(salary.payDay))
    setPeriodicity(salary.periodicity)
    setDirty(false)
  }, [salary])

  function markDirty() {
    setDirty(true)
  }

  async function save() {
    await setSalarySettings({
      id: 'salary',
      enabled,
      amount: Number(amount) || 0,
      payDay: Number(payDay) || 1,
      periodicity,
      categoryId: salary.categoryId || 'inc-salary',
    })
    setDirty(false)
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Моя зарплата</h2>
          <p className="text-xs text-slate-400">Учитывается в аналитике и прогнозах</p>
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
        <div className="flex flex-col gap-3">
          <Input
            label="Размер зарплаты ₽"
            labelPlacement="outside"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              markDirty()
            }}
            variant="bordered"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="День выплаты"
              labelPlacement="outside"
              type="number"
              min={1}
              max={31}
              value={payDay}
              onChange={(e) => {
                setPayDay(e.target.value)
                markDirty()
              }}
              variant="bordered"
            />
            <Select
              label="Периодичность"
              labelPlacement="outside"
              selectedKeys={[periodicity]}
              onSelectionChange={(keys) => {
                setPeriodicity(Array.from(keys)[0] as SalaryPeriodicity)
                markDirty()
              }}
              variant="bordered"
            >
              {Object.entries(PERIODICITY_LABEL).map(([key, label]) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>
          </div>
          {incomeCategories.length > 0 && (
            <p className="text-[11px] text-slate-400">Зарплата будет учитываться в категории «💼 Зарплата»</p>
          )}
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
