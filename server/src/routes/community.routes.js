const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')
const { getPosts, getPostById, createPost, updatePost, deletePost, toggleLike, addComment, deleteComment } = require('../controllers/community.controller')

router.get('/', getPosts)
router.get('/:id', getPostById)

router.use(authMiddleware)
router.post('/', upload.single('image'), createPost)
router.put('/:id', upload.single('image'), updatePost)
router.delete('/:id', deletePost)
router.post('/:id/like', toggleLike)
router.post('/:id/comments', addComment)
router.delete('/:id/comments/:commentId', deleteComment)

module.exports = router
