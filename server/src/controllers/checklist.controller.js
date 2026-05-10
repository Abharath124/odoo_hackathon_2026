const PackingChecklist = require('../models/PackingChecklist')
const Trip = require('../models/Trip')

const ownsTrip = async (tripId, userId) => {
  const trip = await Trip.findOne({ where: { id: tripId, userId } })
  return !!trip
}

const getChecklist = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const items = await PackingChecklist.findAll({
      where: { tripId },
      order: [['category', 'ASC'], ['createdAt', 'ASC']],
    })
    res.json({ items })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const addItem = async (req, res) => {
  try {
    const { tripId } = req.params
    const { itemName, category } = req.body
    if (!itemName?.trim()) return res.status(422).json({ message: 'Item name is required' })
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const item = await PackingChecklist.create({ tripId, itemName: itemName.trim(), category: category?.trim() || 'General' })
    res.status(201).json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const toggleItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const item = await PackingChecklist.findOne({ where: { id: itemId, tripId } })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    await item.update({ isPacked: !item.isPacked })
    res.json({ item })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const deleteItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const item = await PackingChecklist.findOne({ where: { id: itemId, tripId } })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    await item.destroy()
    res.json({ message: 'Item deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetChecklist = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    await PackingChecklist.update({ isPacked: false }, { where: { tripId } })
    res.json({ message: 'Checklist reset' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const shareChecklist = async (req, res) => {
  try {
    const { tripId } = req.params
    if (!await ownsTrip(tripId, req.user.id))
      return res.status(403).json({ message: 'Forbidden' })

    const items = await PackingChecklist.findAll({
      where: { tripId },
      order: [['category', 'ASC'], ['createdAt', 'ASC']],
    })

    const grouped = {}
    items.forEach(item => {
      const cat = item.category || 'General'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ name: item.itemName, packed: item.isPacked })
    })

    res.json({ tripId, checklist: grouped })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getChecklist, addItem, toggleItem, deleteItem, resetChecklist, shareChecklist }
