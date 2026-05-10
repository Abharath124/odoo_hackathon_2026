const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')
const { getTrips, getTripSummary, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/trip.controller')

router.use(authMiddleware)

router.get('/summary', getTripSummary)
router.get('/', getTrips)
router.get('/:id', getTripById)
router.post('/', upload.single('image'), createTrip)
router.put('/:id', upload.single('image'), updateTrip)
router.delete('/:id', deleteTrip)

module.exports = router
