import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyTotal } from '../../utils/analytics'
import { formatCompactNumber, formatDayShort, formatRub } from '../../utils/format'

export default function CashflowChart({ data }: { data: DailyTotal[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayShort}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis tickFormatter={(v) => formatCompactNumber(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            formatter={(value, name) => [formatRub(Number(value)), name === 'income' ? 'Доход' : 'Расход']}
            labelFormatter={(label) => formatDayShort(label as string)}
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px -8px rgba(0,0,0,0.25)', fontSize: 12 }}
          />
          <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
