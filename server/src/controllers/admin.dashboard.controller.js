const { Op, fn, col, literal } = require('sequelize')
const sequelize = require('../config/db')
const User = require('../models/User')
const Trip = require('../models/Trip')
const Activity = require('../models/Activity')
const Destination = require('../models/Destination')

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, activeTrips, totalCities, totalActivities] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Trip.count({ where: { status: { [Op.in]: ['planned', 'ongoing'] } } }),
      Destination.count(),
      Activity.count(),
    ])

    // users with trip counts
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: [
        'id', 'name', 'email', 'avatar', 'createdAt',
        [literal('(SELECT COUNT(*) FROM `Trips` WHERE `Trips`.`userId` = `User`.`id`)'), 'tripCount'],
      ],
      order: [['createdAt', 'DESC']],
    })

    // popular cities — destinations ordered by trip destination matches
    const cities = await Destination.findAll({
      attributes: [
        'id', 'name', 'country',
        [literal('(SELECT COUNT(*) FROM `Trips` WHERE `Trips`.`destination` LIKE CONCAT("%", `Destination`.`name`, "%"))'), 'visits'],
      ],
      order: [[literal('visits'), 'DESC']],
      limit: 10,
    })

    // popular activities — by category count
    const activities = await Activity.findAll({
      attributes: [
        'id', 'name', 'category',
        [literal('(SELECT COUNT(*) FROM `Activities` a2 WHERE a2.`category` = `Activity`.`category`)'), 'count'],
      ],
      order: [[literal('count'), 'DESC']],
    })

    // monthly trend — users and trips created per month (last 7 months)
    const months = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) })
    }

    const trendData = await Promise.all(months.map(async ({ year, month, label }) => {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 1)
      const [users, trips] = await Promise.all([
        User.count({ where: { role: 'user', createdAt: { [Op.gte]: start, [Op.lt]: end } } }),
        Trip.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } }),
      ])
      return { x: label, users, trips }
    }))

    res.json({
      stats: { totalUsers, activeTrips, totalCities, totalActivities },
      users,
      cities,
      activities,
      trendData,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getDashboard }
