import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { PageKey } from '../../App'
import AddTransactionModal from '../transactions/AddTransactionModal'
import WalletMoneyIcon from '../icons/WalletMoneyIcon'
import PlusIcon from '../icons/PlusIcon'

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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white p-1.5">
              <WalletMoneyIcon className="h-full w-full" />
            </div>
            <span className="font-semibold text-sm tracking-tight leading-tight">Мои финансы</span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-tight font-medium transition-colors whitespace-nowrap ${
                  page === item.key ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400'
                }`}
              >
                {page === item.key && (
                  <motion.div
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-xl bg-brand-500/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 text-lg">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white font-medium py-3 text-xs tracking-tight whitespace-nowrap hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
            <PlusIcon className="h-4 w-4" /> Добавить операцию
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 px-4 pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.75rem))] md:pt-6 pb-28 md:pb-10 max-w-3xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
        <div
          className="mx-3 rounded-t-3xl bg-white/90 dark:bg-[#12131c]/90 backdrop-blur-xl border border-b-0 border-black/5 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] flex items-stretch px-1.5 pt-2 relative"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex-1 flex items-stretch">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <NavButton key={item.key} item={item} active={page === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </div>
          <div className="w-[4.5rem] shrink-0" />
          <div className="flex-1 flex items-stretch">
            {NAV_ITEMS.slice(2).map((item) => (
              <NavButton key={item.key} item={item} active={page === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 -top-8 flex justify-center pointer-events-none">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setAddOpen(true)}
            className="pointer-events-auto h-[4.5rem] w-[4.5rem] rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/40"
            aria-label="Добавить операцию"
          >
            <PlusIcon className="h-8 w-8" />
          </motion.button>
        </div>
      </div>

      <AddTransactionModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={item.label} className="relative flex-1 basis-0 flex items-center justify-center py-2.5">
      {active && (
        <motion.div
          layoutId="nav-pill-mobile"
          className="absolute inset-0 m-auto h-11 w-11 rounded-2xl bg-brand-500/10"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className={`relative z-10 text-xl leading-none ${active ? '' : 'opacity-60'}`}>{item.icon}</span>
    </button>
  )
}
