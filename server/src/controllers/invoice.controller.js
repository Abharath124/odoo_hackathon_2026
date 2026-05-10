const { Op } = require('sequelize')
const crypto = require('crypto')
const Invoice = require('../models/Invoice')
const InvoiceItem = require('../models/InvoiceItem')
const Trip = require('../models/Trip')
const User = require('../models/User')

// associations
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' })
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' })

const ownsTrip = async (tripId, userId) => {
  return !!(await Trip.findOne({ where: { id: tripId, userId } }))
}

const calcTotals = (items, taxPercent, discount) => {
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)
  const tax = parseFloat(((subtotal * parseFloat(taxPercent || 0)) / 100).toFixed(2))
  const disc = parseFloat(discount || 0)
  const grandTotal = parseFloat((subtotal + tax - disc).toFixed(2))
  return { subtotal, tax, discount: disc, grandTotal }
}

// GET /api/invoices/:tripId — list all invoices for a trip
const getInvoices = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const { search, filter, sortBy = 'generatedAt', order = 'DESC' } = req.query
    const where = { tripId, userId: req.user.id }
    if (filter) where.paymentStatus = filter
    if (search) where.invoiceNumber = { [Op.like]: `%${search}%` }

    const invoices = await Invoice.findAll({
      where,
      include: [{ model: InvoiceItem, as: 'items', order: [['order', 'ASC']] }],
      order: [[sortBy, order.toUpperCase()]],
    })

    const result = invoices.map(inv => {
      const totals = calcTotals(inv.items, inv.taxPercent, inv.discount)
      return { ...inv.toJSON(), ...totals }
    })

    res.json({ invoices: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/invoices/:tripId/:invoiceId — single invoice with budget insights
const getInvoice = async (req, res) => {
  try {
    const { tripId, invoiceId } = req.params
    const trip = await Trip.findOne({ where: { id: tripId, userId: req.user.id } })
    if (!trip) return res.status(403).json({ message: 'Forbidden' })

    const invoice = await Invoice.findOne({
      where: { id: invoiceId, tripId, userId: req.user.id },
      include: [{ model: InvoiceItem, as: 'items', order: [['order', 'ASC']] }],
    })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    const totals = calcTotals(invoice.items, invoice.taxPercent, invoice.discount)

    // budget insights: trip.budget vs invoice grand total
    const budgetInsights = {
      totalBudget: parseFloat(trip.budget || 0),
      totalSpent: totals.grandTotal,
      remaining: parseFloat((parseFloat(trip.budget || 0) - totals.grandTotal).toFixed(2)),
    }

    res.json({ invoice: { ...invoice.toJSON(), ...totals }, trip, budgetInsights })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/invoices/:tripId — create invoice
const createInvoice = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const { travelers, taxPercent, discount, items } = req.body
    const invoiceNumber = `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    const invoice = await Invoice.create({
      invoiceNumber,
      tripId,
      userId: req.user.id,
      travelers: travelers || [],
      taxPercent: taxPercent || 0,
      discount: discount || 0,
    })

    if (Array.isArray(items) && items.length) {
      await InvoiceItem.bulkCreate(
        items.map((item, i) => ({ ...item, invoiceId: invoice.id, order: i }))
      )
    }

    const created = await Invoice.findByPk(invoice.id, {
      include: [{ model: InvoiceItem, as: 'items', order: [['order', 'ASC']] }],
    })
    const totals = calcTotals(created.items, created.taxPercent, created.discount)

    res.status(201).json({ invoice: { ...created.toJSON(), ...totals } })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/invoices/:tripId/:invoiceId — update invoice meta (travelers, tax, discount)
const updateInvoice = async (req, res) => {
  try {
    const { tripId, invoiceId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const invoice = await Invoice.findOne({ where: { id: invoiceId, tripId, userId: req.user.id } })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    const { travelers, taxPercent, discount } = req.body
    await invoice.update({
      travelers: travelers ?? invoice.travelers,
      taxPercent: taxPercent ?? invoice.taxPercent,
      discount: discount ?? invoice.discount,
    })

    const updated = await Invoice.findByPk(invoiceId, {
      include: [{ model: InvoiceItem, as: 'items', order: [['order', 'ASC']] }],
    })
    const totals = calcTotals(updated.items, updated.taxPercent, updated.discount)

    res.json({ invoice: { ...updated.toJSON(), ...totals } })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PATCH /api/invoices/:tripId/:invoiceId/status — mark as paid / pending / cancelled
const updatePaymentStatus = async (req, res) => {
  try {
    const { tripId, invoiceId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const invoice = await Invoice.findOne({ where: { id: invoiceId, tripId, userId: req.user.id } })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    const { paymentStatus } = req.body
    if (!['pending', 'paid', 'cancelled'].includes(paymentStatus))
      return res.status(422).json({ message: 'Invalid payment status' })

    await invoice.update({ paymentStatus })
    res.json({ message: `Invoice marked as ${paymentStatus}`, paymentStatus })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/invoices/:tripId/:invoiceId
const deleteInvoice = async (req, res) => {
  try {
    const { tripId, invoiceId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const invoice = await Invoice.findOne({ where: { id: invoiceId, tripId, userId: req.user.id } })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    await invoice.destroy()
    res.json({ message: 'Invoice deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/invoices/:tripId/:invoiceId/items
const addItem = async (req, res) => {
  try {
    const { tripId, invoiceId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const invoice = await Invoice.findOne({ where: { id: invoiceId, tripId, userId: req.user.id } })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    const { category, description, qtyDetails, unitCost, amount } = req.body
    if (!category || !description) return res.status(422).json({ message: 'Category and description are required' })

    const count = await InvoiceItem.count({ where: { invoiceId } })
    const item = await InvoiceItem.create({ invoiceId, category, description, qtyDetails, unitCost, amount, order: count })
    res.status(201).json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/invoices/:tripId/:invoiceId/items/:itemId
const updateItem = async (req, res) => {
  try {
    const { tripId, invoiceId, itemId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const item = await InvoiceItem.findOne({ where: { id: itemId, invoiceId } })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    const { category, description, qtyDetails, unitCost, amount, order } = req.body
    await item.update({ category, description, qtyDetails, unitCost, amount, order })
    res.json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/invoices/:tripId/:invoiceId/items/:itemId
const deleteItem = async (req, res) => {
  try {
    const { tripId, invoiceId, itemId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const item = await InvoiceItem.findOne({ where: { id: itemId, invoiceId } })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    await item.destroy()
    res.json({ message: 'Item deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getInvoices, getInvoice, createInvoice, updateInvoice,
  updatePaymentStatus, deleteInvoice,
  addItem, updateItem, deleteItem,
}
