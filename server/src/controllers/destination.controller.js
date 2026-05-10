const { Op } = require('sequelize')
const Destination = require('../models/Destination')

const getDestinations = async (req, res) => {
  try {
    const { search, region, popular } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
        { region: { [Op.like]: `%${search}%` } },
      ]
    }

    if (region) where.region = region
    if (popular === 'true') where.isPopular = true

    const destinations = await Destination.findAll({ where, order: [['name', 'ASC']] })
    res.json({ destinations })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getTopRegional = async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      where: { isPopular: true },
      order: [['name', 'ASC']],
      limit: 10,
    })
    res.json({ destinations })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createDestination = async (req, res) => {
  try {
    const { name, country, region, description, isPopular } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null
    const destination = await Destination.create({ name, country, region, description, image, isPopular })
    res.status(201).json({ message: 'Destination created', destination })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateDestination = async (req, res) => {
  try {
    const dest = await Destination.findByPk(req.params.id)
    if (!dest) return res.status(404).json({ message: 'Destination not found' })
    const { name, country, region, description, isPopular } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : dest.image
    await dest.update({ name, country, region, description, image, isPopular })
    res.json({ message: 'Destination updated', destination: dest })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteDestination = async (req, res) => {
  try {
    const dest = await Destination.findByPk(req.params.id)
    if (!dest) return res.status(404).json({ message: 'Destination not found' })
    await dest.destroy()
    res.json({ message: 'Destination deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getDestinations, getTopRegional, createDestination, updateDestination, deleteDestination }
