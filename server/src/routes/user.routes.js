const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')
const { getProfile, updateProfile, updateAvatar, changePassword } = require('../controllers/user.controller')

router.use(authMiddleware)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/avatar', upload.single('avatar'), updateAvatar)
router.put('/change-password', changePassword)

module.exports = router
