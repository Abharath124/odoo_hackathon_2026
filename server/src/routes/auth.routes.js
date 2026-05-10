const router = require('express').Router()
const { register, verifyOtp, login, forgotPassword, resetPassword, logout, me } = require('../controllers/auth.controller')
const validate = require('../middleware/validate')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyOtpValidation,
} = require('../validations/auth.validation')

router.post('/register', upload.single('avatar'), registerValidation, validate, register)
router.post('/verify-otp', verifyOtpValidation, validate, verifyOtp)
router.post('/login', loginValidation, validate, login)
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword)
router.post('/reset-password', resetPasswordValidation, validate, resetPassword)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, me)

module.exports = router
