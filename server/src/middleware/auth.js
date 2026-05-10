const jwt = require('jsonwebtoken')
const { getSetting } = require('../utils/settings')

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const secret = await getSetting('jwt_secret')
    req.user = jwt.verify(token, secret)
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
