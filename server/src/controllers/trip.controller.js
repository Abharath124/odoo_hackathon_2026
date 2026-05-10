const { Op, literal } = require('sequelize')
const Trip = require('../models/Trip')

// status display order for the listing screen
const STATUS_ORDER = ['ongoing', 'planned', 'completed', 'cancelled']

const buildWhere = (userId, { search, status, startDate, endDate }) => {
  const where = { userId }

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { destination: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ]
  }

  if (status) where.status = status
  if (startDate) where.startDate = { [Op.gte]: startDate }
  if (endDate) where.endDate = { [Op.lte]: endDate }

  return where
}

// GET /api/trips — flat list with search/filter/sort
// GET /api/trips?groupBy=status — grouped by status (for listing screen)
const getTrips = async (req, res) => {
  try {
    const {
      search, status, startDate, endDate,
      sortBy = 'startDate', order = 'ASC',
      groupBy,
    } = req.query

    const where = buildWhere(req.user.id, { search, status, startDate, endDate })

    const trips = await Trip.findAll({
      where,
      order: [[sortBy, order.toUpperCase()]],
    })

    if (groupBy === 'status') {
      // group in defined order: ongoing → planned → completed → cancelled
      const grouped = STATUS_ORDER.reduce((acc, s) => {
        const items = trips.filter(t => t.status === s)
        if (items.length) acc[s] = items
        return acc
      }, {})
      return res.json({ grouped })
    }

    if (groupBy === 'destination') {
      const grouped = trips.reduce((acc, trip) => {
        const key = trip.destination
        if (!acc[key]) acc[key] = []
        acc[key].push(trip)
        return acc
      }, {})
      return res.json({ grouped })
    }

    res.json({ trips })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/trips/summary — counts per status for home screen
const getTripSummary = async (req, res) => {
  try {
    const userId = req.user.id
    const counts = await Promise.all(
      STATUS_ORDER.map(async (status) => {
        const count = await Trip.count({ where: { userId, status } })
        return { status, count }
      })
    )
    const total = await Trip.count({ where: { userId } })
    res.json({ summary: counts, total })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })
    res.json({ trip })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createTrip = async (req, res) => {
  try {
    const { title, destination, description, startDate, endDate, status, budget, groupSize } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    const trip = await Trip.create({
      userId: req.user.id,
      title,
      destination,
      description,
      image,
      startDate,
      endDate,
      status: status || 'planned',
      budget,
      groupSize,
    })

    res.status(201).json({ message: 'Trip created', trip })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const { title, destination, description, startDate, endDate, status, budget, groupSize } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : trip.image

    await trip.update({ title, destination, description, image, startDate, endDate, status, budget, groupSize })
    res.json({ message: 'Trip updated', trip })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })
    await trip.destroy()
    res.json({ message: 'Trip deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getTrips, getTripSummary, getTripById, createTrip, updateTrip, deleteTrip }
