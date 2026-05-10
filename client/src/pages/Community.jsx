import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Heart, MessageCircle, Share2, Plus, X } from 'lucide-react'
import api from '../utils/api'

const postSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  destination: z.string().optional(),
  category: z.enum(['trip', 'activity', 'food', 'hotel', 'general']).optional(),
})

const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9C27B0']
const categoryOptions = [
  { value: 'trip', label: 'Trip' },
  { value: 'activity', label: 'Activity' },
  { value: 'food', label: 'Food' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'general', label: 'General' },
]

function PostCard({ post, currentUserId, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isLiked = post.isLiked
  const color = colors[post.id % 5]
  const initials = post.author?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const submitComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/community/${post.id}/comments`, { content: commentText })
      setComments(prev => [...prev, data.comment])
      setCommentText('')
    } catch (err) {
      console.error('Comment error:', err)
    }
    setSubmitting(false)
  }

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/community/${post.id}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Delete comment error:', err)
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1 overflow-hidden" style={{ background: color }}>
        {post.author?.avatar
          ? <img src={`http://localhost:5000${post.author.avatar}`} className="w-full h-full object-cover" alt={post.author.name} />
          : initials}
      </div>

      <div className="flex-1 bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">{post.author?.name}</span>
              <span className="text-xs text-secondary">·</span>
              <span className="text-xs text-secondary">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {(post.destination || post.category) && (
              <p className="text-xs font-medium mt-0.5" style={{ color }}>
                {[post.category, post.destination].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {currentUserId === post.userId && (
            <button onClick={() => onDelete(post.id)} className="p-1 rounded text-secondary hover:text-red-500 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-primary mb-1">{post.title}</p>
          <p className="text-sm text-secondary leading-relaxed">{post.content}</p>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-zinc-50">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: isLiked ? '#EA4335' : '#5F6368' }}>
            <Heart size={13} fill={isLiked ? '#EA4335' : 'none'} />
            {post.likesCount || 0}
          </button>
          <button onClick={() => setShowComments(v => !v)} className="flex items-center gap-1.5 text-xs text-secondary hover:text-blue-600 transition-colors">
            <MessageCircle size={13} />
            {post.commentsCount || 0}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-secondary hover:text-green-600 transition-colors ml-auto">
            <Share2 size={13} /> Share
          </button>
        </div>

        {showComments && (
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-50">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2 group">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                  {c.author?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-primary">{c.author?.name}</p>
                  <p className="text-xs text-secondary">{c.content}</p>
                </div>
                {currentUserId === c.userId && (
                  <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 p-1 text-secondary hover:text-red-500 transition-all">
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="Write a comment..."
                className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
              />
              <button onClick={submitComment} disabled={submitting} className="text-xs font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-50" style={{ background: '#4285F4' }}>
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Community() {
  const { user } = useSelector(state => state.auth)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [likedIds, setLikedIds] = useState([])
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError: setFormError } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', content: '', destination: '', category: 'general' },
  })

  const fetchPosts = async (q = '') => {
    setLoading(true)
    try {
      const params = q ? `?search=${q}` : ''
      const { data } = await api.get(`/community${params}`)
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Fetch posts error:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const onSubmit = async (data) => {
    try {
      setError('')
      const { data: res } = await api.post('/community', {
        title: data.title,
        content: data.content,
        destination: data.destination || null,
        category: data.category || 'general',
      })
      setPosts(prev => [res.post, ...prev])
      reset()
      setShowForm(false)
    } catch (err) {
      console.error('Post creation error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create post'
      setError(errorMsg)
      setFormError('root', { message: errorMsg })
    }
  }

  const handleLike = async (postId) => {
    try {
      const { data } = await api.post(`/community/${postId}/like`)
      setLikedIds(prev => data.liked ? [...prev, postId] : prev.filter(id => id !== postId))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: data.likesCount, isLiked: data.liked } : p))
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/community/${postId}`)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPosts(search)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Community</h1>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all" style={{ background: '#4285F4' }}>
          <Plus size={14} /> {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <input {...register('title')} placeholder="Post title *" className={`w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.title ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'}`} />
            {errors.title && <p className="text-xs text-red-400 mt-0.5">{errors.title.message}</p>}
          </div>
          <div>
            <textarea {...register('content')} rows={3} placeholder="Share your travel experience... *" className={`w-full border rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.content ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'}`} />
            {errors.content && <p className="text-xs text-red-400 mt-0.5">{errors.content.message}</p>}
          </div>
          <div className="flex gap-3">
            <input {...register('destination')} placeholder="Destination (e.g. Paris)" className="flex-1 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
            <select {...register('category')} className="flex-1 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all">
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50" style={{ background: '#4285F4' }}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); reset(); setError('') }} className="px-4 py-2 rounded-lg text-sm font-medium text-secondary border border-zinc-200 hover:bg-zinc-50 transition-all">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><span className="text-sm text-secondary">Loading...</span></div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-3xl">🌍</span>
          <p className="text-sm text-secondary">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={{ ...post, isLiked: likedIds.includes(post.id) }}
              currentUserId={user?.id}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
