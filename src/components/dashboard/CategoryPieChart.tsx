import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryBreakdownItem } from '../../utils/analytics'
import { formatRub } from '../../utils/format'

export default function CategoryPieChart({ items }: { items: CategoryBreakdownItem[] }) {
  const top = items.slice(0, 6)
  if (top.length === 0) {
    return <div className="h-48 flex items-center justify-center text-sm text-slate-400">Нет данных за период</div>
  }
  return (
    <div className="flex items-center gap-4">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={top} dataKey="total" nameKey="categoryId" innerRadius={42} outerRadius={68} paddingAngle={2} stroke="none">
              {top.map((item) => (
                <Cell key={item.categoryId} fill={item.category?.color ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => [formatRub(Number(value)), (entry?.payload as CategoryBreakdownItem | undefined)?.category?.name ?? '']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px -8px rgba(0,0,0,0.25)', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {top.map((item) => (
          <div key={item.categoryId} className="flex items-center gap-2 text-sm min-w-0">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.category?.color ?? '#94a3b8' }} />
            <span className="truncate flex-1 text-slate-600 dark:text-slate-300">
              {item.category?.icon} {item.category?.name ?? 'Без категории'}
            </span>
            <span className="font-semibold tabular-nums shrink-0">{formatRub(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
