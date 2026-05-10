const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendOtpEmail, sendResetEmail } = require('../utils/email')
const { generateOtp, otpExpiresAt } = require('../utils/otp')
const { getSetting } = require('../utils/settings')

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, country, additionalInfo, password } = req.body

    const existing = await User.findOne({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const name = `${firstName} ${lastName}`

    const user = await User.create({ 
      firstName, 
      lastName, 
      name, 
      email, 
      password: hashed, 
      phone, 
      city, 
      country, 
      additionalInfo,
      isVerified: true 
    })

    res.status(201).json({ message: 'Registration successful. You can now log in.' })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })
    if (new Date() > user.otpExpiresAt) return res.status(400).json({ message: 'OTP expired' })

    await user.update({ isVerified: true, otp: null, otpExpiresAt: null })

    const secret = await getSetting('jwt_secret')
    const expiresIn = await getSetting('jwt_expires_in')
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn }
    )

    res.json({
      message: 'Email verified successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const secret = await getSetting('jwt_secret')
    const expiresIn = await getSetting('jwt_expires_in')
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'No account found with this email' })

    const otp = generateOtp()
    await user.update({ otp, otpExpiresAt: otpExpiresAt() })
    
    try {
      await sendResetEmail(email, otp)
    } catch (emailErr) {
      console.error('[forgotPassword sendResetEmail]', emailErr)
      return res.status(500).json({ message: 'Failed to send reset email. Please check email configuration.' })
    }

    res.json({ message: 'Password reset OTP sent to your email' })
  } catch (err) {
    console.error('[forgotPassword]', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })
    if (new Date() > user.otpExpiresAt) return res.status(400).json({ message: 'OTP expired' })

    const hashed = await bcrypt.hash(password, 10)
    await user.update({ password: hashed, otp: null, otpExpiresAt: null })

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' })
}

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'avatar'],
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { register, verifyOtp, login, forgotPassword, resetPassword, logout, me }
