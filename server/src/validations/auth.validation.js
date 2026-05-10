const { body } = require('express-validator')

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('additionalInfo').trim().optional(),
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
