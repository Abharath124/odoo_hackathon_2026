import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, Download, FileText, CheckCircle } from 'lucide-react'
import traveloopLogo from '../assets/travelloop-logo.jpeg'

const invoice = {
  id: 'INV-xyz-30290',
  generatedDate: 'May 20, 2025',
  trip: 'Trip to Europe Adventure',
  dates: 'May 35 – Jan 05, 2025 · 4 cities',
  createdBy: 'James',
  travelers: ['James', 'Arjun', 'Jerry', 'Cristina'],
  paymentStatus: 'pending',
  totalBudget: 20000,
  totalSpent: 22000,
  lineItems: [
    { id: 1, category: 'Hotel', description: 'Hotel booking Paris', qty: '3 nights', unitCost: 3000, amount: 9000 },
    { id: 2, category: 'Travel', description: 'Flight bookings (DEL → PAR)', qty: '1', unitCost: 12000, amount: 12000 },
  ],
  taxRate: 0.05,
  discount: 50,
}

const statusColors = { pending: '#FBBC05', paid: '#34A853', overdue: '#EA4335' }

// Simple SVG pie chart
function PieChart({ spent, budget }) {
  const total = Math.max(spent, budget)
  const spentPct = Math.min(spent / total, 1)
  const r = 40, cx = 50, cy = 50
  const circumference = 2 * Math.PI * r
  const spentDash = spentPct * circumference
  const budgetDash = circumference - spentDash
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8F0FE" strokeWidth="18" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4285F4" strokeWidth="18"
        strokeDasharray={`${(budget / total) * circumference} ${circumference}`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EA4335" strokeWidth="18"
        strokeDasharray={`${spentDash} ${budgetDash}`}
        strokeDashoffset={-((budget / total) * circumference)} />
    </svg>
  )
}

export default function ExpenseInvoice() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [paid, setPaid] = useState(invoice.paymentStatus === 'paid')
  const [downloaded, setDownloaded] = useState(false)

  const subtotal = invoice.lineItems.reduce((s, i) => s + i.amount, 0)
  const tax = Math.round(subtotal * invoice.taxRate)
  const grandTotal = subtotal + tax - invoice.discount
  const remaining = invoice.totalBudget - grandTotal

  const filtered = invoice.lineItems.filter((i) =>
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = () => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2000) }

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices......"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <SlidersHorizontal size={13} /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <ArrowUpDown size={13} /> Sort ↕
        </button>
      </div>

      {/* Back link */}
      <button onClick={() => navigate('/trips')} className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors self-start">
        <ArrowLeft size={13} /> back to My Trips
      </button>

      <div className="flex items-start gap-5">

        {/* Main invoice area */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Invoice header card */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex gap-5">
            {/* Trip image */}
            <div className="w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
              <img src={traveloopLogo} alt="Trip" className="w-full h-full object-cover object-top" />
            </div>

            {/* Trip info */}
            <div className="flex flex-col justify-center gap-1 min-w-0 pr-5 border-r border-zinc-100">
              <p className="text-sm font-bold text-primary">{invoice.trip}</p>
              <p className="text-xs text-secondary">{invoice.dates}</p>
              <p className="text-xs text-secondary">created by {invoice.createdBy}</p>
            </div>

            {/* Invoice meta */}
            <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3 pl-5">
              <div>
                <p className="text-xs text-secondary">Invoice Id</p>
                <p className="text-sm font-semibold text-primary">{invoice.id}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Generated date</p>
                <p className="text-sm font-semibold text-primary">{invoice.generatedDate}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Traveler Details:</p>
                <div className="flex flex-col gap-0.5">
                  {invoice.travelers.map((t) => (
                    <p key={t} className="text-xs text-primary">{t}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-start pt-1">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${statusColors[paid ? 'paid' : invoice.paymentStatus]}20`, color: statusColors[paid ? 'paid' : invoice.paymentStatus] }}
                >
                  Payment status – {paid ? 'paid' : invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {['#', 'Category', 'Description', 'Qty/details', 'Unit Cost', 'Amount'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-secondary text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-secondary">{item.id}</td>
                    <td className="px-4 py-3 text-xs text-primary font-medium">{item.category}</td>
                    <td className="px-4 py-3 text-xs text-primary">{item.description}</td>
                    <td className="px-4 py-3 text-xs text-secondary">{item.qty}</td>
                    <td className="px-4 py-3 text-xs text-primary">{item.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-primary">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Empty rows to match wireframe */}
                {Array.from({ length: Math.max(0, 4 - filtered.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-zinc-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3 text-xs text-transparent">–</td>
                    ))}
                  </tr>
                ))}
                {/* Subtotal / tax / discount */}
                <tr className="border-t border-zinc-200 bg-zinc-50">
                  <td colSpan={4} />
                  <td className="px-4 py-2 text-xs text-secondary">
                    <div className="flex flex-col gap-1">
                      <span>Subtotal</span>
                      <span>tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                      <span>Discount</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs font-semibold text-primary">
                    <div className="flex flex-col gap-1">
                      <span>$ {subtotal.toLocaleString()}</span>
                      <span>$ {tax.toLocaleString()}</span>
                      <span>$ {invoice.discount}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <td colSpan={4} />
                  <td className="px-4 py-3 text-sm font-bold text-primary">Grand Total</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: '#4285F4' }}>$ {grandTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all"
            >
              <Download size={14} /> {downloaded ? 'Downloaded!' : 'Download Invoice'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all">
              <FileText size={14} /> Export as PDF
            </button>
            <button
              onClick={() => setPaid(true)}
              disabled={paid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white ml-auto hover:opacity-90 transition-all disabled:opacity-60"
              style={{ background: paid ? '#34A853' : '#4285F4' }}
            >
              <CheckCircle size={14} /> {paid ? 'Paid ✓' : 'Mark as paid'}
            </button>
          </div>
        </div>

        {/* Budget Insights sidebar */}
        <div className="w-64 shrink-0 bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-primary">budget Insights</h3>

          <div className="flex items-center gap-4">
            <PieChart spent={grandTotal} budget={invoice.totalBudget} />
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#4285F4' }} />
                <span className="text-secondary">Total Budget: <span className="font-semibold text-primary">{invoice.totalBudget.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#EA4335' }} />
                <span className="text-secondary">total spent: <span className="font-semibold text-primary">{grandTotal.toLocaleString()}</span></span>
              </div>
              <div className="mt-1 pt-2 border-t border-zinc-100">
                <span className="text-secondary">Remaining: </span>
                <span className="font-bold" style={{ color: remaining < 0 ? '#EA4335' : '#34A853' }}>
                  {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/budget')}
            className="w-full py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            View Full Budget
          </button>
        </div>

      </div>
    </div>
  )
}
