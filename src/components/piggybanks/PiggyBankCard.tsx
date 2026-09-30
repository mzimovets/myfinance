import type { PiggyBank } from '../../types'
import { formatRub } from '../../utils/format'

export default function PiggyBankCard({
  piggyBank,
  onClick,
  onQuickDeposit,
}: {
  piggyBank: PiggyBank
  onClick?: () => void
  onQuickDeposit?: () => void
}) {
  return (
    <div className="card-surface rounded-2xl p-4 flex items-center gap-3">
      <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${piggyBank.color}20` }}>
          {piggyBank.icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">{piggyBank.title}</div>
          <div className="text-sm text-slate-400 tabular-nums">{formatRub(piggyBank.balance)}</div>
        </div>
      </button>
      {onQuickDeposit && (
        <button onClick={onQuickDeposit} className="h-9 w-9 rounded-full bg-brand-500/10 text-brand-500 font-bold text-lg shrink-0 flex items-center justify-center">
          +
        </button>
      )}
    </div>
  )
}
