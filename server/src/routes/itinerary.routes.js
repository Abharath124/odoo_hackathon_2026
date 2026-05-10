const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  addSection,
  updateSection,
  deleteSection,
} = require('../controllers/itinerary.controller')

router.use(authMiddleware)

// itinerary CRUD
router.get('/', getItineraries)
router.get('/:id', getItineraryById)
router.post('/', createItinerary)
router.put('/:id', updateItinerary)
router.delete('/:id', deleteItinerary)

// section management
router.post('/:id/sections', addSection)
router.put('/:id/sections/:sectionId', updateSection)
router.delete('/:id/sections/:sectionId', deleteSection)

module.exports = router
