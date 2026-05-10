import { useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Heart, MessageCircle, Share2, Copy } from 'lucide-react'

const posts = [
  {
    id: 1, user: 'Sarah M.', initials: 'SM', color: '#4285F4',
    trip: 'Europe Tour', place: 'Paris, France',
    body: 'Just finished my 2-week Europe tour! Paris was absolutely magical — the Eiffel Tower at night is something you have to experience. Highly recommend the Seine river cruise for sunset views. Budget tip: grab a Paris Museum Pass for huge savings!',
    likes: 142, comments: 38, date: '2 days ago', tags: ['Paris', 'Europe', 'Budget Travel'],
  },
  {
    id: 2, user: 'James K.', initials: 'JK', color: '#34A853',
    trip: 'Asia Adventure', place: 'Tokyo, Japan',
    body: 'Tokyo blew my mind! The food scene alone is worth the trip. Tsukiji market in the morning, ramen in Shinjuku at night. The train system is incredibly efficient — get a Suica card on day one. Cherry blossom season in Ueno Park was breathtaking.',
    likes: 98, comments: 21, date: '4 days ago', tags: ['Tokyo', 'Japan', 'Food Tour'],
  },
  {
    id: 3, user: 'Priya R.', initials: 'PR', color: '#FBBC05',
    trip: 'Beach Getaway', place: 'Bali, Indonesia',
    body: 'Bali is pure paradise. Spent 7 days between Ubud and Seminyak — the rice terraces in Tegallalang are stunning. Don\'t miss the Tanah Lot temple at sunset. Scooter rental is the best way to get around and super affordable!',
    likes: 215, comments: 54, date: '1 week ago', tags: ['Bali', 'Beach', 'Culture'],
  },
  {
    id: 4, user: 'Carlos D.', initials: 'CD', color: '#EA4335',
    trip: 'Desert Safari', place: 'Dubai, UAE',
    body: 'Dubai exceeded every expectation. The desert safari at dusk was surreal — dune bashing, camel rides, and a traditional Bedouin dinner under the stars. Burj Khalifa observation deck is a must. The city is a perfect blend of tradition and futurism.',
    likes: 76, comments: 17, date: '2 weeks ago', tags: ['Dubai', 'Safari', 'Luxury'],
  },
]

export default function Community() {
  const [search, setSearch] = useState('')
  const [liked, setLiked] = useState([])
  const [copied, setCopied] = useState(null)

  const toggleLike = (id) => setLiked((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id])

  const handleCopy = (id) => {
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const filtered = posts.filter((p) =>
    p.user.toLowerCase().includes(search.toLowerCase()) ||
    p.trip.toLowerCase().includes(search.toLowerCase()) ||
    p.place.toLowerCase().includes(search.toLowerCase()) ||
    p.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Search + controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bar ......"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <LayoutGrid size={13} /> Group by
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <SlidersHorizontal size={13} /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <ArrowUpDown size={13} /> Sort by...
        </button>
      </div>

      {/* Title */}
      <h1 className="text-lg font-bold text-primary text-center">Community tab</h1>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-3xl">🌍</span>
            <p className="text-sm text-secondary">No posts found.</p>
          </div>
        ) : (
          filtered.map((post) => {
            const isLiked = liked.includes(post.id)
            return (
              <div key={post.id} className="flex items-start gap-4">

                {/* Avatar circle */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-1"
                  style={{ background: post.color }}
                >
                  {post.initials}
                </div>

                {/* Post card */}
                <div className="flex-1 bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{post.user}</span>
                        <span className="text-xs text-secondary">·</span>
                        <span className="text-xs text-secondary">{post.date}</span>
                      </div>
                      <p className="text-xs font-medium mt-0.5" style={{ color: post.color }}>
                        {post.trip} · {post.place}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(post.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shrink-0"
                    >
                      <Copy size={11} />
                      {copied === post.id ? 'Copied!' : 'Copy Trip'}
                    </button>
                  </div>

                  <p className="text-sm text-secondary leading-relaxed">{post.body}</p>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${post.color}15`, color: post.color }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-zinc-50">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: isLiked ? '#EA4335' : '#5F6368' }}
                    >
                      <Heart size={13} fill={isLiked ? '#EA4335' : 'none'} />
                      {post.likes + (isLiked ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-secondary hover:text-blue-600 transition-colors">
                      <MessageCircle size={13} />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-secondary hover:text-green-600 transition-colors ml-auto">
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
