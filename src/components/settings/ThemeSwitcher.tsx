import { useTheme, type ThemeMode } from '../../context/ThemeContext'

const OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: 'light', label: 'Светлая', icon: '☀️' },
  { key: 'dark', label: 'Тёмная', icon: '🌙' },
  { key: 'system', label: 'Системная', icon: '💻' },
]

export default function ThemeSwitcher() {
  const { mode, setMode } = useTheme()
  return (
    <div className="card-surface rounded-2xl p-4">
      <h2 className="font-semibold mb-3">Оформление</h2>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setMode(o.key)}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium border ${
              mode === o.key ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'border-transparent bg-slate-100 dark:bg-white/5 text-slate-500'
            }`}
          >
            <span className="text-lg">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
