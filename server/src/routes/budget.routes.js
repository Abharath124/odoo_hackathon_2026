const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const {
  getBudget,
  addDayPlan, updateDayPlan, deleteDayPlan,
  addExpense, updateExpense, deleteExpense,
} = require('../controllers/budget.controller')

router.use(authMiddleware)

// itinerary budget view
router.get('/:itineraryId', getBudget)

// day plans
router.post('/:itineraryId/days', addDayPlan)
router.put('/:itineraryId/days/:dayId', updateDayPlan)
router.delete('/:itineraryId/days/:dayId', deleteDayPlan)

// expenses per day
router.post('/:itineraryId/days/:dayId/expenses', addExpense)
router.put('/:itineraryId/days/:dayId/expenses/:expenseId', updateExpense)
router.delete('/:itineraryId/days/:dayId/expenses/:expenseId', deleteExpense)

module.exports = router
