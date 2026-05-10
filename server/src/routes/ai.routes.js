const express = require('express')
const { generateItinerary, getMyItineraries, getItinerary } = require('../controllers/ai.controller')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/itinerary', auth, generateItinerary)
router.get('/itineraries', auth, getMyItineraries)
router.get('/itineraries/:id', auth, getItinerary)

module.exports = router
