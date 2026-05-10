const User = require('../models/User')

const adminMiddleware = async (req, res, next) => {
  try {
    let role = req.user?.role

    if (!role) {
      const user = await User.findByPk(req.user.id, { attributes: ['id', 'role'] })
      if (!user) return res.status(401).json({ message: 'Invalid token — please log in again' })
      role = user.role
      req.user.role = role
    }

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' })
    }

    next()
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = adminMiddleware
