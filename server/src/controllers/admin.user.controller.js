const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const User = require('../models/User')

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt'],
      order: [['createdAt', 'DESC']],
    })
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin' })

    await user.update({ name, email })
    res.json({ message: 'User updated', user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body

    if (!password || password.length < 8) {
      return res.status(422).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin' })

    const hashed = await bcrypt.hash(password, 10)
    await user.update({ password: hashed })
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getUsers, updateUser, resetUserPassword }
