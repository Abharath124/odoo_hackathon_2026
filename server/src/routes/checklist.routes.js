const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const { getChecklist, addItem, toggleItem, deleteItem, resetChecklist, shareChecklist } = require('../controllers/checklist.controller')

router.use(authMiddleware)

router.get('/:tripId/share', shareChecklist)
router.post('/:tripId/reset', resetChecklist)
router.get('/:tripId', getChecklist)
router.post('/:tripId', addItem)
router.patch('/:tripId/:itemId/toggle', toggleItem)
router.delete('/:tripId/:itemId', deleteItem)

module.exports = router
