const Itinerary = require('../models/Itinerary')
const ItinerarySection = require('../models/ItinerarySection')
const Trip = require('../models/Trip')

// associations
Itinerary.hasMany(ItinerarySection, { foreignKey: 'itineraryId', as: 'sections', onDelete: 'CASCADE' })
ItinerarySection.belongsTo(Itinerary, { foreignKey: 'itineraryId' })

// GET /api/itineraries?tripId=1
const getItineraries = async (req, res) => {
  try {
    const { tripId } = req.query
    const where = { userId: req.user.id }
    if (tripId) where.tripId = tripId

    const itineraries = await Itinerary.findAll({
      where,
      include: [{ model: ItinerarySection, as: 'sections', order: [['order', 'ASC']] }],
      order: [['createdAt', 'DESC']],
    })
    res.json({ itineraries })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/itineraries/:id
const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: ItinerarySection, as: 'sections', order: [['order', 'ASC']] }],
    })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })
    res.json({ itinerary })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/itineraries — create itinerary with sections
const createItinerary = async (req, res) => {
  try {
    const { tripId, title, notes, sections = [] } = req.body

    // verify trip belongs to user
    const trip = await Trip.findOne({ where: { id: tripId, userId: req.user.id } })
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const itinerary = await Itinerary.create({ tripId, userId: req.user.id, title, notes })

    if (sections.length) {
      const sectionData = sections.map((s, i) => ({ ...s, itineraryId: itinerary.id, order: i }))
      await ItinerarySection.bulkCreate(sectionData)
    }

    const result = await Itinerary.findByPk(itinerary.id, {
      include: [{ model: ItinerarySection, as: 'sections', order: [['order', 'ASC']] }],
    })
    res.status(201).json({ message: 'Itinerary created', itinerary: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/itineraries/:id — update itinerary + replace all sections
const updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const { title, notes, sections } = req.body
    await itinerary.update({ title, notes })

    if (sections) {
      await ItinerarySection.destroy({ where: { itineraryId: itinerary.id } })
      const sectionData = sections.map((s, i) => ({ ...s, itineraryId: itinerary.id, order: i }))
      await ItinerarySection.bulkCreate(sectionData)
    }

    const result = await Itinerary.findByPk(itinerary.id, {
      include: [{ model: ItinerarySection, as: 'sections', order: [['order', 'ASC']] }],
    })
    res.json({ message: 'Itinerary updated', itinerary: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/itineraries/:id
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })
    await itinerary.destroy()
    res.json({ message: 'Itinerary deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/itineraries/:id/sections — add a single section
const addSection = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const count = await ItinerarySection.count({ where: { itineraryId: itinerary.id } })
    const { title, description, type, startDate, endDate, budget } = req.body

    const section = await ItinerarySection.create({
      itineraryId: itinerary.id,
      title,
      description,
      type,
      startDate,
      endDate,
      budget,
      order: count,
    })
    res.status(201).json({ message: 'Section added', section })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/itineraries/:id/sections/:sectionId — update a section
const updateSection = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const section = await ItinerarySection.findOne({ where: { id: req.params.sectionId, itineraryId: itinerary.id } })
    if (!section) return res.status(404).json({ message: 'Section not found' })

    const { title, description, type, startDate, endDate, budget, order } = req.body
    await section.update({ title, description, type, startDate, endDate, budget, order })
    res.json({ message: 'Section updated', section })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/itineraries/:id/sections/:sectionId
const deleteSection = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const section = await ItinerarySection.findOne({ where: { id: req.params.sectionId, itineraryId: itinerary.id } })
    if (!section) return res.status(404).json({ message: 'Section not found' })

    await section.destroy()
    res.json({ message: 'Section deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getItineraries, getItineraryById, createItinerary, updateItinerary, deleteItinerary, addSection, updateSection, deleteSection }
