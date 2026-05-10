const { Op } = require('sequelize')
const Itinerary = require('../models/Itinerary')
const DayPlan = require('../models/DayPlan')
const Expense = require('../models/Expense')
const Trip = require('../models/Trip')

// associations
DayPlan.hasMany(Expense, { foreignKey: 'dayPlanId', as: 'expenses', onDelete: 'CASCADE' })
Expense.belongsTo(DayPlan, { foreignKey: 'dayPlanId' })
Itinerary.hasMany(DayPlan, { foreignKey: 'itineraryId', as: 'dayPlans', onDelete: 'CASCADE' })
DayPlan.belongsTo(Itinerary, { foreignKey: 'itineraryId' })

// GET /api/budget/:itineraryId — full itinerary view with days + expenses + totals
const getBudget = async (req, res) => {
  try {
    const { itineraryId } = req.params
    const { search, groupBy, filter, sortBy = 'dayNumber', order = 'ASC' } = req.query

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, userId: req.user.id },
      include: [{ model: Trip, as: 'trip', attributes: ['id', 'title', 'budget'] }],
    })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const dayPlans = await DayPlan.findAll({
      where: { itineraryId },
      order: [[sortBy, order.toUpperCase()]],
      include: [{
        model: Expense,
        as: 'expenses',
        where: search ? {
          [Op.or]: [
            { activity: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
            { category: { [Op.like]: `%${search}%` } },
          ]
        } : undefined,
        required: false,
        where: filter ? { category: filter } : undefined,
        order: [['order', 'ASC']],
      }],
    })

    // calculate totals
    const totalBudget = dayPlans.reduce((sum, day) => {
      return sum + day.expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0)
    }, 0)

    const byCategory = {}
    dayPlans.forEach(day => {
      day.expenses.forEach(e => {
        if (!byCategory[e.category]) byCategory[e.category] = 0
        byCategory[e.category] += parseFloat(e.amount || 0)
      })
    })

    // group by category if requested
    if (groupBy === 'category') {
      const grouped = {}
      dayPlans.forEach(day => {
        day.expenses.forEach(e => {
          if (!grouped[e.category]) grouped[e.category] = []
          grouped[e.category].push({ ...e.toJSON(), dayNumber: day.dayNumber, date: day.date })
        })
      })
      return res.json({ itinerary, grouped, totalBudget, byCategory })
    }

    res.json({ itinerary, dayPlans, totalBudget, byCategory })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/budget/:itineraryId/days — add a day plan
const addDayPlan = async (req, res) => {
  try {
    const { itineraryId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const { dayNumber, date, title, notes } = req.body
    const dayPlan = await DayPlan.create({ itineraryId, dayNumber, date, title, notes })
    res.status(201).json({ message: 'Day plan added', dayPlan })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/budget/:itineraryId/days/:dayId
const updateDayPlan = async (req, res) => {
  try {
    const { itineraryId, dayId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const dayPlan = await DayPlan.findOne({ where: { id: dayId, itineraryId } })
    if (!dayPlan) return res.status(404).json({ message: 'Day plan not found' })

    const { dayNumber, date, title, notes } = req.body
    await dayPlan.update({ dayNumber, date, title, notes })
    res.json({ message: 'Day plan updated', dayPlan })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/budget/:itineraryId/days/:dayId
const deleteDayPlan = async (req, res) => {
  try {
    const { itineraryId, dayId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const dayPlan = await DayPlan.findOne({ where: { id: dayId, itineraryId } })
    if (!dayPlan) return res.status(404).json({ message: 'Day plan not found' })

    await dayPlan.destroy()
    res.json({ message: 'Day plan deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/budget/:itineraryId/days/:dayId/expenses — add expense
const addExpense = async (req, res) => {
  try {
    const { itineraryId, dayId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const dayPlan = await DayPlan.findOne({ where: { id: dayId, itineraryId } })
    if (!dayPlan) return res.status(404).json({ message: 'Day plan not found' })

    const count = await Expense.count({ where: { dayPlanId: dayId } })
    const { activity, description, category, amount, currency } = req.body

    const expense = await Expense.create({
      dayPlanId: dayId,
      itineraryId,
      activity,
      description,
      category,
      amount,
      currency,
      order: count,
    })
    res.status(201).json({ message: 'Expense added', expense })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/budget/:itineraryId/days/:dayId/expenses/:expenseId
const updateExpense = async (req, res) => {
  try {
    const { itineraryId, dayId, expenseId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const expense = await Expense.findOne({ where: { id: expenseId, dayPlanId: dayId } })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })

    const { activity, description, category, amount, currency, order } = req.body
    await expense.update({ activity, description, category, amount, currency, order })
    res.json({ message: 'Expense updated', expense })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/budget/:itineraryId/days/:dayId/expenses/:expenseId
const deleteExpense = async (req, res) => {
  try {
    const { itineraryId, dayId, expenseId } = req.params
    const itinerary = await Itinerary.findOne({ where: { id: itineraryId, userId: req.user.id } })
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' })

    const expense = await Expense.findOne({ where: { id: expenseId, dayPlanId: dayId } })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })

    await expense.destroy()
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getBudget, addDayPlan, updateDayPlan, deleteDayPlan, addExpense, updateExpense, deleteExpense }
