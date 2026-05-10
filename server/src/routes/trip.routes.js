const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/trip.controller')

router.use(authMiddleware)

router.get('/', getTrips)
router.get('/:id', getTripById)
router.post('/', upload.single('image'), createTrip)
router.put('/:id', upload.single('image'), updateTrip)
router.delete('/:id', deleteTrip)

module.exports = router
