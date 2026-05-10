const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const upload = require('../middleware/upload')
const { getUsers, updateUser, resetUserPassword } = require('../controllers/admin.user.controller')
const { getSettings, updateSettings, getPublicSettings, uploadLogo } = require('../controllers/admin.settings.controller')
const { getDashboard } = require('../controllers/admin.dashboard.controller')

// public — no auth required
router.get('/settings/public', getPublicSettings)

// protected — admin only
router.use(authMiddleware, adminMiddleware)
router.get('/dashboard', getDashboard)
router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.put('/users/:id/reset-password', resetUserPassword)
router.get('/settings', getSettings)
router.put('/settings', updateSettings)
router.post('/settings/logo', upload.single('logo'), uploadLogo)

module.exports = router
