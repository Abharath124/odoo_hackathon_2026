const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const {
  getInvoices, getInvoice, createInvoice, updateInvoice,
  updatePaymentStatus, deleteInvoice,
  addItem, updateItem, deleteItem,
} = require('../controllers/invoice.controller')

router.use(authMiddleware)

router.get('/:tripId', getInvoices)
router.post('/:tripId', createInvoice)
router.get('/:tripId/:invoiceId', getInvoice)
router.put('/:tripId/:invoiceId', updateInvoice)
router.patch('/:tripId/:invoiceId/status', updatePaymentStatus)
router.delete('/:tripId/:invoiceId', deleteInvoice)

router.post('/:tripId/:invoiceId/items', addItem)
router.put('/:tripId/:invoiceId/items/:itemId', updateItem)
router.delete('/:tripId/:invoiceId/items/:itemId', deleteItem)

module.exports = router
