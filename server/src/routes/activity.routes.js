const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const upload = require('../middleware/upload')
const {
  getActivities,
  getSuggestions,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activity.controller')

// public
router.get('/', getActivities)
router.get('/suggestions', getSuggestions)
router.get('/:id', getActivityById)

// admin only
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createActivity)
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateActivity)
router.delete('/:id', authMiddleware, adminMiddleware, deleteActivity)

module.exports = router
