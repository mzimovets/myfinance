import type { Category, Transaction } from '../../types'
import { formatSignedRub } from '../../utils/format'

export default function TransactionRow({
  transaction,
  category,
  onClick,
}: {
  transaction: Transaction
  category?: Category
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 text-left group">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ background: `${category?.color ?? '#94a3b8'}20` }}
      >
        {category?.icon ?? '💠'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{category?.name ?? 'Без категории'}</div>
        {transaction.description && <div className="text-xs text-slate-400 truncate">{transaction.description}</div>}
      </div>
      <div className={`text-sm font-semibold tabular-nums shrink-0 ${transaction.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
        {formatSignedRub(transaction.amount, transaction.type)}
      </div>
    </button>
  )
}
