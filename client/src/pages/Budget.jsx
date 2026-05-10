import { Plane, Hotel, Utensils, Ticket, AlertCircle } from 'lucide-react'

const categories = [
  { label: 'Transport', icon: Plane, amount: 1200, total: 5500, color: '#4285F4' },
  { label: 'Stay', icon: Hotel, amount: 2000, total: 5500, color: '#34A853' },
  { label: 'Meals', icon: Utensils, amount: 800, total: 5500, color: '#FBBC05' },
  { label: 'Activities', icon: Ticket, amount: 1500, total: 5500, color: '#EA4335' },
]

const totalBudget = 6000
const totalSpent = categories.reduce((s, c) => s + c.amount, 0)
const overBudget = totalSpent > totalBudget

const perDayBreakdown = [
  { day: 'Day 1', amount: 320, over: false },
  { day: 'Day 2', amount: 780, over: true },
  { day: 'Day 3', amount: 410, over: false },
  { day: 'Day 4', amount: 290, over: false },
  { day: 'Day 5', amount: 650, over: true },
]

export default function Budget() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-xl font-bold text-primary">Trip Budget</h1>
        <p className="text-sm text-secondary mt-0.5">Cost breakdown and estimates</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-secondary font-medium">Total Budget</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#4285F4' }}>${totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-secondary font-medium">Total Spent</p>
          <p className="text-2xl font-bold mt-1" style={{ color: overBudget ? '#EA4335' : '#34A853' }}>${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-secondary font-medium">Remaining</p>
          <p className="text-2xl font-bold mt-1" style={{ color: overBudget ? '#EA4335' : '#34A853' }}>
            {overBudget ? '-' : ''}${Math.abs(totalBudget - totalSpent).toLocaleString()}
          </p>
        </div>
      </div>

      {overBudget && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#EA433515', color: '#EA4335' }}>
          <AlertCircle size={15} /> You're over budget by ${(totalSpent - totalBudget).toLocaleString()}
        </div>
      )}

      {/* Category breakdown */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Breakdown by Category</h2>
        <div className="flex flex-col gap-4">
          {categories.map(({ label, icon: Icon, amount, total, color }) => {
            const pct = Math.round((amount / total) * 100)
            return (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <span className="text-sm text-primary font-medium">{label}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color }}>${amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="text-xs text-secondary">{pct}% of total</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per day */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Average Cost Per Day</h2>
        <div className="flex flex-col gap-2">
          {perDayBreakdown.map(({ day, amount, over }) => (
            <div key={day} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
              <span className="text-sm text-secondary">{day}</span>
              <div className="flex items-center gap-2">
                {over && <AlertCircle size={13} style={{ color: '#EA4335' }} />}
                <span className="text-sm font-semibold" style={{ color: over ? '#EA4335' : '#34A853' }}>${amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
