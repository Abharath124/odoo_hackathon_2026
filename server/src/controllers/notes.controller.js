const { Op } = require('sequelize')
const Note = require('../models/Note')
const Trip = require('../models/Trip')
const TripStop = require('../models/TripStop')

const ownsTrip = async (tripId, userId) => {
  const trip = await Trip.findOne({ where: { id: tripId, userId } })
  return trip || null
}

// GET /api/notes/:tripId?view=all|day|stop&dayNumber=&stopId=&search=&sortBy=&order=
const getNotes = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const { view, dayNumber, stopId, search, sortBy = 'createdAt', order = 'DESC' } = req.query
    const where = { tripId }

    if (view === 'day' && dayNumber) where.dayNumber = dayNumber
    if (view === 'stop' && stopId) where.stopId = stopId

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { noteText: { [Op.like]: `%${search}%` } },
      ]
    }

    const notes = await Note.findAll({
      where,
      order: [[sortBy, order.toUpperCase()]],
    })

    res.json({ notes })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/notes/:tripId
const createNote = async (req, res) => {
  try {
    const { tripId } = req.params
    const trip = await ownsTrip(tripId, req.user.id)
    if (!trip) return res.status(403).json({ message: 'Forbidden' })

    const { title, noteText, dayNumber, stopId } = req.body
    if (!noteText?.trim()) return res.status(422).json({ message: 'Note text is required' })

    const note = await Note.create({
      tripId,
      title: title?.trim() || null,
      noteText: noteText.trim(),
      dayNumber: dayNumber || null,
      stopId: stopId || null,
    })

    res.status(201).json({ note })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/notes/:tripId/:noteId
const updateNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const note = await Note.findOne({ where: { id: noteId, tripId } })
    if (!note) return res.status(404).json({ message: 'Note not found' })

    const { title, noteText, dayNumber, stopId } = req.body
    if (noteText !== undefined && !noteText?.trim())
      return res.status(422).json({ message: 'Note text cannot be empty' })

    await note.update({
      title: title !== undefined ? title?.trim() || null : note.title,
      noteText: noteText?.trim() ?? note.noteText,
      dayNumber: dayNumber !== undefined ? dayNumber || null : note.dayNumber,
      stopId: stopId !== undefined ? stopId || null : note.stopId,
    })

    res.json({ note })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/notes/:tripId/:noteId
const deleteNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const note = await Note.findOne({ where: { id: noteId, tripId } })
    if (!note) return res.status(404).json({ message: 'Note not found' })

    await note.destroy()
    res.json({ message: 'Note deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote }
