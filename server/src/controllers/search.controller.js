const { Op } = require('sequelize')
const Activity = require('../models/Activity')
const Destination = require('../models/Destination')

// GET /api/search?q=Paragliding&type=activity|destination|all&groupBy=category|type|destination&filter=category&sortBy=name|rating&order=ASC|DESC
const search = async (req, res) => {
  try {
    const {
      q = '',
      type = 'all',
      groupBy,
      filter,
      sortBy = 'name',
      order = 'ASC',
      category,
      region,
    } = req.query

    const results = { activities: [], destinations: [] }

    // search activities
    if (type === 'all' || type === 'activity') {
      const where = {}
      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { destination: { [Op.like]: `%${q}%` } },
          { category: { [Op.like]: `%${q}%` } },
        ]
      }
      if (category) where.category = category
      if (filter) where.category = filter

      const activityOrder = sortBy === 'rating' ? [['rating', order.toUpperCase()]] : [['name', order.toUpperCase()]]
      results.activities = await Activity.findAll({ where, order: activityOrder })
    }

    // search destinations
    if (type === 'all' || type === 'destination') {
      const where = {}
      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { country: { [Op.like]: `%${q}%` } },
          { region: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ]
      }
      if (region) where.region = region

      results.destinations = await Destination.findAll({ where, order: [['name', order.toUpperCase()]] })
    }

    // flatten all results with a source tag
    let flat = [
      ...results.activities.map(a => ({ ...a.toJSON(), _source: 'activity' })),
      ...results.destinations.map(d => ({ ...d.toJSON(), _source: 'destination' })),
    ]

    // sort flat results
    if (sortBy === 'name') {
      flat.sort((a, b) => order === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
    } else if (sortBy === 'rating') {
      flat.sort((a, b) => order === 'ASC' ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0))
    }

    // group results
    if (groupBy === 'type') {
      const grouped = flat.reduce((acc, item) => {
        const key = item._source
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
      return res.json({ grouped, total: flat.length })
    }

    if (groupBy === 'category') {
      const grouped = flat.reduce((acc, item) => {
        const key = item.category || item.region || 'Other'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
      return res.json({ grouped, total: flat.length })
    }

    if (groupBy === 'destination') {
      const grouped = flat.reduce((acc, item) => {
        const key = item.destination || item.country || 'Other'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})
      return res.json({ grouped, total: flat.length })
    }

    res.json({ results: flat, total: flat.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { search }
