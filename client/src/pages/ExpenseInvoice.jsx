import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, Download, FileText, CheckCircle, Plus, Trash2, Edit2 } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const statusColors = { pending: '#FBBC05', paid: '#34A853', cancelled: '#EA4335' }

const addItemSchema = z.object({
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(2, 'Description is required'),
  qtyDetails: z.string().optional(),
  unitCost: z.coerce.number().min(0, 'Must be 0 or greater'),
  amount: z.coerce.number().min(0, 'Must be 0 or greater'),
})

function PieChart({ spent, budget }) {
  const total = Math.max(spent, budget, 1)
  const r = 40, cx = 50, cy = 50
  const circumference = 2 * Math.PI * r
  const spentPct = Math.min(spent / total, 1)
  const spentDash = spentPct * circumference
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8F0FE" strokeWidth="18" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4285F4" strokeWidth="18" strokeDasharray={`${(budget / total) * circumference} ${circumference}`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EA4335" strokeWidth="18" strokeDasharray={`${spentDash} ${circumference - spentDash}`} strokeDashoffset={-((budget / total) * circumference)} />
    </svg>
  )
}

export default function ExpenseInvoice() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState('')
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [budgetInsights, setBudgetInsights] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(addItemSchema),
    defaultValues: { category: '', description: '', qtyDetails: '', unitCost: 0, amount: 0 },
  })

  useEffect(() => {
    api.get('/trips').then((r) => {
      const list = r.data.trips || []
      setTrips(list)
      if (list.length) setSelectedTripId(String(list[0].id))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedTripId) return
    setLoading(true)
    api.get(`/invoices/${selectedTripId}`).then((r) => {
      const list = r.data.invoices || []
      console.log('Invoices loaded:', list)
      setInvoices(list)
      if (list.length) loadInvoice(selectedTripId, list[0].id)
      else { setSelectedInvoice(null); setBudgetInsights(null) }
    }).catch((err) => {
      console.error('Error loading invoices:', err)
    }).finally(() => setLoading(false))
  }, [selectedTripId])

  const loadInvoice = async (tripId, invoiceId) => {
    try {
      const { data } = await api.get(`/invoices/${tripId}/${invoiceId}`)
      setSelectedInvoice(data.invoice)
      setBudgetInsights(data.budgetInsights)
    } catch (_) {}
  }

  const markPaid = async (method) => {
    if (!selectedInvoice) return
    try {
      await api.patch(`/invoices/${selectedTripId}/${selectedInvoice.id}/status`, { 
        paymentStatus: 'paid',
        paymentMethod: method 
      })
      setSelectedInvoice((prev) => ({ ...prev, paymentStatus: 'paid', paymentMethod: method }))
      setShowPaymentModal(false)
    } catch (_) {}
  }

  const handleMarkPaidClick = () => {
    setShowPaymentModal(true)
  }

  const createInvoice = async () => {
    if (!selectedTripId) return
    try {
      const { data } = await api.post(`/invoices/${selectedTripId}`, { travelers: [], taxPercent: 5, discount: 0, items: [] })
      setInvoices((prev) => [...prev, data.invoice])
      loadInvoice(selectedTripId, data.invoice.id)
      setShowCreateModal(false)
    } catch (_) {}
  }

  const addItem = async (data) => {
    if (!selectedInvoice) return
    try {
      await api.post(`/invoices/${selectedTripId}/${selectedInvoice.id}/items`, data)
      reset()
      setShowAddItemModal(false)
      loadInvoice(selectedTripId, selectedInvoice.id)
    } catch (_) {}
  }

  const deleteItem = async (itemId) => {
    if (!selectedInvoice) return
    try {
      await api.delete(`/invoices/${selectedTripId}/${selectedInvoice.id}/items/${itemId}`)
      loadInvoice(selectedTripId, selectedInvoice.id)
    } catch (_) {}
  }

  const downloadInvoicePDF = () => {
    console.log('Download PDF clicked')
    if (!selectedInvoice) {
      console.error('No invoice selected')
      alert('No invoice selected')
      return
    }

    try {
      const doc = new jsPDF()
      const trip = trips.find((t) => String(t.id) === selectedTripId)
      const pageWidth = doc.internal.pageSize.width

      // Header with gradient effect (blue background)
      doc.setFillColor(66, 133, 244)
      doc.rect(0, 0, pageWidth, 50, 'F')
      
      // Logo - Circular design with airplane icon
      doc.setFillColor(255, 255, 255)
      doc.circle(25, 20, 8, 'F')
      doc.setFillColor(66, 133, 244)
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('✈', 25, 23, { align: 'center' })

      // Brand name
      doc.setFontSize(24)
      doc.setTextColor(255, 255, 255)
      doc.setFont(undefined, 'bold')
      doc.text('TravelLoop', 38, 22)
      
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.text('Your Journey, Our Priority', 38, 28)

      // INVOICE text on right
      doc.setFontSize(32)
      doc.setFont(undefined, 'bold')
      doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' })

      // Decorative line
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.5)
      doc.line(20, 45, pageWidth - 20, 45)

      // Invoice info box
      doc.setFillColor(248, 249, 250)
      doc.rect(15, 60, 85, 35, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.rect(15, 60, 85, 35, 'S')

      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont(undefined, 'normal')
      doc.text('Invoice Number:', 20, 68)
      doc.text('Date:', 20, 78)
      doc.text('Status:', 20, 88)

      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'bold')
      doc.text(selectedInvoice.invoiceNumber, 55, 68)
      doc.text(new Date(selectedInvoice.generatedAt || selectedInvoice.createdAt).toLocaleDateString(), 55, 78)
      
      // Status badge
      const statusColor = selectedInvoice.paymentStatus === 'paid' ? [52, 168, 83] : 
                         selectedInvoice.paymentStatus === 'pending' ? [251, 188, 5] : [234, 67, 53]
      doc.setFillColor(...statusColor)
      doc.roundedRect(53, 83, 25, 6, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text(selectedInvoice.paymentStatus.toUpperCase(), 65.5, 87.5, { align: 'center' })

      // Trip info box
      doc.setFillColor(248, 249, 250)
      doc.rect(110, 60, 85, 35, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.rect(110, 60, 85, 35, 'S')

      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont(undefined, 'normal')
      doc.text('Trip:', 115, 68)
      doc.text('Destination:', 115, 78)

      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'bold')
      doc.text(trip?.title || 'N/A', 115, 73)
      doc.text(trip?.destination || 'N/A', 115, 83)

      // Travelers section
      if (selectedInvoice.travelers && selectedInvoice.travelers.length > 0) {
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont(undefined, 'normal')
        doc.text('Travelers:', 20, 103)
        doc.setTextColor(0, 0, 0)
        doc.text(selectedInvoice.travelers.join(', '), 45, 103)
      }

      // Items table
      const tableData = (selectedInvoice.items || []).map((item, idx) => [
        idx + 1,
        item.category,
        item.description,
        item.qtyDetails || '-',
        Number(item.unitCost || 0).toFixed(2),
        Number(item.amount || 0).toFixed(2),
      ])

      autoTable(doc, {
        startY: 115,
        head: [['#', 'Category', 'Description', 'Qty/Details', 'Unit Cost', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 133, 244],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 25, fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 }
      })

      // Totals section with box
      const finalY = doc.lastAutoTable.finalY + 15
      const totalsX = 130
      
      doc.setFillColor(248, 249, 250)
      doc.rect(totalsX - 5, finalY - 5, 65, 40, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.rect(totalsX - 5, finalY - 5, 65, 40, 'S')

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont(undefined, 'normal')
      doc.text('Subtotal:', totalsX, finalY)
      doc.text(`Tax (${selectedInvoice.taxPercent}%):`, totalsX, finalY + 8)
      doc.text('Discount:', totalsX, finalY + 16)

      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'bold')
      doc.text(Number(selectedInvoice.subtotal || 0).toFixed(2), 185, finalY, { align: 'right' })
      doc.text(Number(selectedInvoice.tax || 0).toFixed(2), 185, finalY + 8, { align: 'right' })
      doc.text(Number(selectedInvoice.discount || 0).toFixed(2), 185, finalY + 16, { align: 'right' })

      // Grand total with highlight
      doc.setDrawColor(66, 133, 244)
      doc.setLineWidth(0.5)
      doc.line(totalsX, finalY + 20, 190, finalY + 20)

      doc.setFontSize(12)
      doc.setTextColor(66, 133, 244)
      doc.setFont(undefined, 'bold')
      doc.text('Grand Total:', totalsX, finalY + 28)
      doc.setFontSize(14)
      doc.text(Number(selectedInvoice.grandTotal || 0).toFixed(2), 185, finalY + 28, { align: 'right' })

      // Footer with brand
      doc.setDrawColor(66, 133, 244)
      doc.setLineWidth(0.3)
      doc.line(20, 270, pageWidth - 20, 270)
      
      doc.setFontSize(9)
      doc.setTextColor(66, 133, 244)
      doc.setFont(undefined, 'bold')
      doc.text('TravelLoop', pageWidth / 2, 278, { align: 'center' })
      
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont(undefined, 'normal')
      doc.text('Thank you for choosing TravelLoop for your travel needs!', pageWidth / 2, 283, { align: 'center' })
      
      doc.setFontSize(7)
      doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, 288, { align: 'center' })

      // Save PDF
      doc.save(`Invoice-${selectedInvoice.invoiceNumber}.pdf`)
      console.log('PDF generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error.message)
    }
  }

  const filtered = (selectedInvoice?.items || []).filter((i) =>
    i.category?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort ↕</button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/trips')} className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors">
          <ArrowLeft size={13} /> back to My Trips
        </button>
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all">
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        {invoices.length > 1 && (
          <select onChange={(e) => loadInvoice(selectedTripId, e.target.value)} className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all">
            {invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.invoiceNumber}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="text-sm text-secondary">Loading...</span></div>
      ) : !selectedInvoice ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-3xl">🧾</span>
          <p className="text-sm text-secondary">No invoices found for this trip.</p>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:opacity-90 transition-all mt-2">
            <Plus size={14} /> Create Invoice
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-5">
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex gap-5">
              <div className="w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-zinc-100 flex items-center justify-center text-3xl bg-zinc-50">✈️</div>
              <div className="flex flex-col justify-center gap-1 min-w-0 pr-5 border-r border-zinc-100">
                <p className="text-sm font-bold text-primary">{trips.find((t) => String(t.id) === selectedTripId)?.title}</p>
                <p className="text-xs text-secondary">{trips.find((t) => String(t.id) === selectedTripId)?.destination}</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3 pl-5">
                <div><p className="text-xs text-secondary">Invoice Id</p><p className="text-sm font-semibold text-primary">{selectedInvoice.invoiceNumber}</p></div>
                <div><p className="text-xs text-secondary">Generated date</p><p className="text-sm font-semibold text-primary">{new Date(selectedInvoice.generatedAt || selectedInvoice.createdAt).toLocaleDateString()}</p></div>
                <div>
                  <p className="text-xs text-secondary mb-1">Travelers:</p>
                  {(selectedInvoice.travelers || []).map((t) => <p key={t} className="text-xs text-primary">{t}</p>)}
                </div>
                <div className="flex items-start pt-1">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${statusColors[selectedInvoice.paymentStatus]}20`, color: statusColors[selectedInvoice.paymentStatus] }}>
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    {['#', 'Category', 'Description', 'Qty/details', 'Unit Cost', 'Amount', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-secondary text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-secondary">{item.order + 1}</td>
                      <td className="px-4 py-3 text-xs text-primary font-medium">{item.category}</td>
                      <td className="px-4 py-3 text-xs text-primary">{item.description}</td>
                      <td className="px-4 py-3 text-xs text-secondary">{item.qtyDetails}</td>
                      <td className="px-4 py-3 text-xs text-primary">{Number(item.unitCost || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-primary">{Number(item.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteItem(item.id)} className="p-1 rounded text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-zinc-200 bg-zinc-50">
                    <td colSpan={4} />
                    <td className="px-4 py-2 text-xs text-secondary"><div className="flex flex-col gap-1"><span>Subtotal</span><span>Tax ({selectedInvoice.taxPercent}%)</span><span>Discount</span></div></td>
                    <td className="px-4 py-2 text-xs font-semibold text-primary"><div className="flex flex-col gap-1"><span>{Number(selectedInvoice.subtotal || 0).toFixed(2)}</span><span>{Number(selectedInvoice.tax || 0).toFixed(2)}</span><span>{Number(selectedInvoice.discount || 0).toFixed(2)}</span></div></td>
                  </tr>
                  <tr className="border-t border-zinc-200">
                    <td colSpan={4} />
                    <td className="px-4 py-3 text-sm font-bold text-primary">Grand Total</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#4285F4' }}>{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowAddItemModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:opacity-90 transition-all"><Plus size={14} /> Add Expense Item</button>
              <button onClick={downloadInvoicePDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all"><Download size={14} /> Download Invoice</button>
              <button onClick={downloadInvoicePDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all"><FileText size={14} /> Export as PDF</button>
              <button onClick={handleMarkPaidClick} disabled={selectedInvoice.paymentStatus === 'paid'} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white ml-auto hover:opacity-90 transition-all disabled:opacity-60 bg-primary">
                <CheckCircle size={14} /> {selectedInvoice.paymentStatus === 'paid' ? 'Paid ✓' : 'Mark as paid'}
              </button>
            </div>
          </div>

          {budgetInsights && (
            <div className="w-64 shrink-0 bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-primary">Budget Insights</h3>
              <div className="flex items-center gap-4">
                <PieChart spent={budgetInsights.totalSpent} budget={budgetInsights.totalBudget} />
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#4285F4' }} /><span className="text-secondary">Budget: <span className="font-semibold text-primary">${Number(budgetInsights.totalBudget).toLocaleString()}</span></span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#EA4335' }} /><span className="text-secondary">Spent: <span className="font-semibold text-primary">${Number(budgetInsights.totalSpent).toLocaleString()}</span></span></div>
                  <div className="mt-1 pt-2 border-t border-zinc-100"><span className="text-secondary">Remaining: </span><span className="font-bold" style={{ color: budgetInsights.remaining < 0 ? '#EA4335' : '#34A853' }}>{budgetInsights.remaining < 0 ? '-' : ''}${Math.abs(budgetInsights.remaining).toLocaleString()}</span></div>
                </div>
              </div>
              <button onClick={() => navigate('/budget')} className="w-full py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">View Full Budget</button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">Create New Invoice</h3>
            <p className="text-sm text-secondary mb-6">A new invoice will be created for this trip. You can add expense items after creation.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={createInvoice} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:opacity-90 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}

      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowAddItemModal(false); reset() }}>
          <div className="bg-white rounded-2xl p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">Add Expense Item</h3>
            <form onSubmit={handleSubmit(addItem)} className="flex flex-col gap-3 mb-6">
              <Input
                id="category"
                placeholder="Category (e.g., Hotel, Food, Transport)"
                error={errors.category?.message}
                {...register('category')}
              />
              <Input
                id="description"
                placeholder="Description"
                error={errors.description?.message}
                {...register('description')}
              />
              <Input
                id="qtyDetails"
                placeholder="Quantity/Details (e.g., 2 nights, 3 meals)"
                {...register('qtyDetails')}
              />
              <div className="flex gap-3">
                <Input
                  id="unitCost"
                  placeholder="Unit Cost"
                  type="number"
                  step="0.01"
                  error={errors.unitCost?.message}
                  {...register('unitCost')}
                />
                <Input
                  id="amount"
                  placeholder="Total Amount"
                  type="number"
                  step="0.01"
                  error={errors.amount?.message}
                  {...register('amount')}
                />
              </div>
            </form>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowAddItemModal(false); reset() }} className="!w-auto flex-1">
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit(addItem)} disabled={isSubmitting} className="!w-auto flex-1">
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-2">Select Payment Method</h3>
            <p className="text-sm text-secondary mb-6">Amount to pay: <span className="font-bold text-primary">₹{Number(selectedInvoice?.grandTotal || 0).toFixed(2)}</span></p>
            
            <div className="flex flex-col gap-3 mb-6">
              {[
                { id: 'credit_card', label: 'Credit Card', icon: '💳' },
                { id: 'debit_card', label: 'Debit Card', icon: '🏦' },
                { id: 'upi', label: 'UPI', icon: '📱' },
                { id: 'net_banking', label: 'Net Banking', icon: '🏛️' },
                { id: 'wallet', label: 'Digital Wallet', icon: '👛' },
                { id: 'cash', label: 'Cash', icon: '💵' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => markPaid(method.id)}
                  className="w-full p-4 rounded-lg border-2 border-zinc-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left flex items-center gap-3"
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-primary">{method.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setShowPaymentModal(false)} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}