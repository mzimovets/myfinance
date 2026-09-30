import { useRef, useState } from 'react'
import { Button } from '@heroui/react'
import { useAppData } from '../../context/AppDataContext'
import { exportAllData, type ExportPayload } from '../../db/repository'

export default function DataManagement() {
  const { importData, wipeAllData } = useAppData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmWipe, setConfirmWipe] = useState(false)

  async function handleExport() {
    const payload = await exportAllData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-diary-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const payload = JSON.parse(text) as ExportPayload
      if (!payload.transactions || !payload.categories) throw new Error('invalid')
      await importData(payload)
      setMessage('Данные успешно импортированы')
    } catch {
      setMessage('Не удалось прочитать файл. Убедитесь, что это экспорт из этого приложения.')
    }
    setTimeout(() => setMessage(null), 4000)
  }

  return (
    <div className="card-surface rounded-2xl p-4 flex flex-col gap-3">
      <h2 className="font-semibold">Данные</h2>
      <p className="text-xs text-slate-400">Все данные хранятся только на этом устройстве (IndexedDB). Экспортируйте их для резервной копии или переноса.</p>
      <div className="flex gap-2">
        <Button variant="flat" className="flex-1" onPress={handleExport}>
          ⬇️ Экспорт
        </Button>
        <Button variant="flat" className="flex-1" onPress={() => fileRef.current?.click()}>
          ⬆️ Импорт
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {message && <p className="text-xs text-brand-500">{message}</p>}

      <div className="pt-2 border-t border-black/5 dark:border-white/10">
        {!confirmWipe ? (
          <button onClick={() => setConfirmWipe(true)} className="text-xs text-rose-500 font-medium">
            Удалить все данные
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-500">Точно удалить всё без возможности восстановления?</span>
            <Button size="sm" color="danger" onPress={() => wipeAllData().then(() => setConfirmWipe(false))}>
              Да, удалить
            </Button>
            <Button size="sm" variant="flat" onPress={() => setConfirmWipe(false)}>
              Отмена
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
