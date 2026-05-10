const { Op } = require('sequelize')
const Post = require('../models/Post')
const PostLike = require('../models/PostLike')
const PostComment = require('../models/PostComment')
const User = require('../models/User')

// associations
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' })
Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' })
Post.hasMany(PostComment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' })
PostComment.belongsTo(User, { foreignKey: 'userId', as: 'author' })

const authorAttrs = ['id', 'name', 'avatar']

// GET /api/community?search=&groupBy=category|destination&filter=trip&sortBy=createdAt|likesCount&order=DESC
const getPosts = async (req, res) => {
  try {
    const { search, groupBy, filter, sortBy = 'createdAt', order = 'DESC', destination } = req.query

    const where = {}
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { destination: { [Op.like]: `%${search}%` } },
      ]
    }
    if (filter) where.category = filter
    if (destination) where.destination = { [Op.like]: `%${destination}%` }

    const posts = await Post.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: authorAttrs }],
      order: [[sortBy, order.toUpperCase()]],
    })

    if (groupBy === 'category') {
      const grouped = posts.reduce((acc, p) => {
        const key = p.category
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
      }, {})
      return res.json({ grouped, total: posts.length })
    }

    if (groupBy === 'destination') {
      const grouped = posts.reduce((acc, p) => {
        const key = p.destination || 'General'
        if (!acc[key]) acc[key] = []
        acc[key].push(p)
        return acc
      }, {})
      return res.json({ grouped, total: posts.length })
    }

    res.json({ posts, total: posts.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/community/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: authorAttrs },
        {
          model: PostComment, as: 'comments',
          include: [{ model: User, as: 'author', attributes: authorAttrs }],
          order: [['createdAt', 'ASC']],
        },
      ],
    })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ post })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/community
const createPost = async (req, res) => {
  try {
    const { title, content, category, destination, tripId } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null
    const post = await Post.create({ userId: req.user.id, title, content, category, destination, tripId, image })
    const result = await Post.findByPk(post.id, { include: [{ model: User, as: 'author', attributes: authorAttrs }] })
    res.status(201).json({ message: 'Post created', post: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/community/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const { title, content, category, destination } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : post.image
    await post.update({ title, content, category, destination, image })
    res.json({ message: 'Post updated', post })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/community/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    await post.destroy()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/community/:id/like — toggle like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const existing = await PostLike.findOne({ where: { postId: post.id, userId: req.user.id } })
    if (existing) {
      await existing.destroy()
      await post.update({ likesCount: Math.max(0, post.likesCount - 1) })
      return res.json({ message: 'Unliked', liked: false, likesCount: post.likesCount - 1 })
    }

    await PostLike.create({ postId: post.id, userId: req.user.id })
    await post.update({ likesCount: post.likesCount + 1 })
    res.json({ message: 'Liked', liked: true, likesCount: post.likesCount + 1 })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/community/:id/comments
const addComment = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const { content } = req.body
    if (!content) return res.status(422).json({ message: 'Content is required' })

    const comment = await PostComment.create({ postId: post.id, userId: req.user.id, content })
    await post.update({ commentsCount: post.commentsCount + 1 })

    const result = await PostComment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: authorAttrs }],
    })
    res.status(201).json({ message: 'Comment added', comment: result })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/community/:id/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const comment = await PostComment.findOne({
      where: { id: req.params.commentId, userId: req.user.id },
    })
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    const post = await Post.findByPk(req.params.id)
    await comment.destroy()
    if (post) await post.update({ commentsCount: Math.max(0, post.commentsCount - 1) })
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, toggleLike, addComment, deleteComment }
