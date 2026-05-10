const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const upload = require('../middleware/upload')
const {
  getDestinations,
  getTopRegional,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destination.controller')

// public
router.get('/', getDestinations)
router.get('/top-regional', getTopRegional)

// admin only
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createDestination)
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateDestination)
router.delete('/:id', authMiddleware, adminMiddleware, deleteDestination)

module.exports = router
