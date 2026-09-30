import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import JournalPage from './pages/JournalPage'
import AnalyticsPage from './pages/AnalyticsPage'
import GoalsPage from './pages/GoalsPage'
import MorePage from './pages/MorePage'
import { useAppData } from './context/AppDataContext'

export type PageKey = 'dashboard' | 'journal' | 'analytics' | 'goals' | 'more'

function App() {
  const [page, setPage] = useState<PageKey>('dashboard')
  const { ready } = useAppData()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] dark:bg-[#0b0d14]">
        <div className="h-10 w-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AppShell page={page} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
          {page === 'journal' && <JournalPage />}
          {page === 'analytics' && <AnalyticsPage />}
          {page === 'goals' && <GoalsPage />}
          {page === 'more' && <MorePage />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default App
