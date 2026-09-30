import { motion } from 'framer-motion'

export default function GoalProgressBar({ percent, color = '#4361ee' }: { percent: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
