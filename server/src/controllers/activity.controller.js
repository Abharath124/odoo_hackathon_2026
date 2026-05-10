const { Op } = require('sequelize')
const Activity = require('../models/Activity')

// GET /api/activities?destination=Paris&type=place&category=Adventure
const getActivities = async (req, res) => {
  try {
    const { destination, type, category, search } = req.query
    const where = {}

    if (destination) where.destination = { [Op.like]: `%${destination}%` }
    if (type) where.type = type
    if (category) where.category = category
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { destination: { [Op.like]: `%${search}%` } },
      ]
    }

    const activities = await Activity.findAll({ where, order: [['rating', 'DESC']] })
    res.json({ activities })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/activities/suggestions?destination=Paris — for new trip page
const getSuggestions = async (req, res) => {
  try {
    const { destination } = req.query
    if (!destination) return res.json({ suggestions: [] })

    const suggestions = await Activity.findAll({
      where: { destination: { [Op.like]: `%${destination}%` } },
      order: [['rating', 'DESC']],
      limit: 6,
    })
    res.json({ suggestions })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    res.json({ activity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createActivity = async (req, res) => {
  try {
    const { name, type, category, destination, country, description, rating, duration } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null
    const activity = await Activity.create({ name, type, category, destination, country, description, image, rating, duration })
    res.status(201).json({ message: 'Activity created', activity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    const { name, type, category, destination, country, description, rating, duration } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : activity.image
    await activity.update({ name, type, category, destination, country, description, image, rating, duration })
    res.json({ message: 'Activity updated', activity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id)
    if (!activity) return res.status(404).json({ message: 'Activity not found' })
    await activity.destroy()
    res.json({ message: 'Activity deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getActivities, getSuggestions, getActivityById, createActivity, updateActivity, deleteActivity }
