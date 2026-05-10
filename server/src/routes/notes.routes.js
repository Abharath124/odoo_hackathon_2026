const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/notes.controller')

router.use(authMiddleware)

router.get('/:tripId', getNotes)
router.post('/:tripId', createNote)
router.put('/:tripId/:noteId', updateNote)
router.delete('/:tripId/:noteId', deleteNote)

module.exports = router
