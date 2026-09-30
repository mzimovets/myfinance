import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { PageKey } from '../../App'
import AddTransactionModal from '../transactions/AddTransactionModal'

interface NavItem {
  key: PageKey
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Главная', icon: '🏠' },
  { key: 'journal', label: 'Операции', icon: '📒' },
  { key: 'analytics', label: 'Аналитика', icon: '📊' },
  { key: 'goals', label: 'Цели', icon: '🎯' },
  { key: 'more', label: 'Ещё', icon: '⚙️' },
]

export default function AppShell({
  page,
  onNavigate,
  children,
}: {
  page: PageKey
  onNavigate: (p: PageKey) => void
  children: ReactNode
}) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl px-4 py-6">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold">₽</div>
            <span className="font-semibold text-lg">Мои финансы</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  page === item.key
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                    : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white font-medium py-3 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
            <span className="text-lg leading-none">+</span> Добавить операцию
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 px-4 pt-6 pb-28 md:pb-10 max-w-3xl mx-auto w-full">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 safe-bottom">
        <div className="mx-3 mb-3 rounded-2xl bg-white/90 dark:bg-[#12131c]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] flex items-center justify-between px-2 py-2 relative">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavButton key={item.key} item={item} active={page === item.key} onClick={() => onNavigate(item.key)} />
          ))}
          <div className="w-14" />
          {NAV_ITEMS.slice(2).map((item) => (
            <NavButton key={item.key} item={item} active={page === item.key} onClick={() => onNavigate(item.key)} />
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setAddOpen(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-6 h-14 w-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-2xl font-light flex items-center justify-center shadow-lg shadow-brand-500/40"
            aria-label="Добавить операцию"
          >
            +
          </motion.button>
        </div>
      </div>

      <AddTransactionModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium ${active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400'}`}>
      <span className="text-lg leading-none">{item.icon}</span>
      {item.label}
    </button>
  )
}
