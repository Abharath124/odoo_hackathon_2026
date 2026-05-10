const { body } = require('express-validator')

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
]

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

const verifyOtpValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required'),
]

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyOtpValidation,
}
