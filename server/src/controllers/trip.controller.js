const { Op } = require('sequelize')
const Trip = require('../models/Trip')

const getTrips = async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', order = 'DESC', groupBy } = req.query

    const where = { userId: req.user.id }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { destination: { [Op.like]: `%${search}%` } },
      ]
    }

    if (status) where.status = status

    const trips = await Trip.findAll({
      where,
      order: [[sortBy, order.toUpperCase()]],
    })

    if (groupBy === 'status') {
      const grouped = trips.reduce((acc, trip) => {
        const key = trip.status
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
      status,
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

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip }
