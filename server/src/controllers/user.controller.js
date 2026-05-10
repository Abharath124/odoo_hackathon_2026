const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Trip = require('../models/Trip')

// GET /api/users/profile — user details + preplanned + previous trips
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'avatar', 'createdAt'],
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const [preplanned, previous] = await Promise.all([
      Trip.findAll({
        where: { userId: req.user.id, status: 'planned' },
        order: [['startDate', 'ASC']],
      }),
      Trip.findAll({
        where: { userId: req.user.id, status: 'completed' },
        order: [['endDate', 'DESC']],
      }),
    ])

    res.json({ user, preplanned, previous })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/users/profile — update name and email
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } })
      if (exists) return res.status(409).json({ message: 'Email already in use' })
    }

    await user.update({ name, email })
    res.json({
      message: 'Profile updated',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/users/avatar — update profile photo
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const avatar = `/uploads/${req.file.filename}`
    await user.update({ avatar })
    res.json({
      message: 'Avatar updated',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(422).json({ message: 'Current and new password are required' })
    }
    if (newPassword.length < 8) {
      return res.status(422).json({ message: 'New password must be at least 8 characters' })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await user.update({ password: hashed })
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getProfile, updateProfile, updateAvatar, changePassword }
