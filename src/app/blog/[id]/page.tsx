'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Clock, Heart, MessageCircle, Send, Trash2, BookOpen, User } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  'Business Growth': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'New Vendor':      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Community':       'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Tips & Guides':   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Mentorship':      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  'Announcements':   'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function readTime(content: string) {
  return `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-gray-900 dark:text-white mt-5 mb-1">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.trim() === '') return <div key={i} className="h-3" />
    return <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">{line}</p>
  })
}

function LikeButton({ postId, userId }: { postId: string; userId?: string }) {
  const liked = useQuery(api.blog.isLiked, userId ? { postId, userId } : 'skip')
  const count = useQuery(api.blog.likeCount, { postId })
  const toggleLike = useMutation(api.blog.toggleLike)

  const handleLike = async () => {
    if (!userId) { toast.error('Sign in to like posts'); return }
    await toggleLike({ postId, userId })
  }

  return (
    <button onClick={handleLike}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        liked
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
      }`}>
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      {count ?? 0}
    </button>
  )
}

function CommentsSection({ postId, userId }: { postId: string; userId?: string }) {
  const comments = useQuery(api.blog.listComments, { postId })
  const authorProfiles = useQuery(api.profiles.listByRole, { role: 'mentor' })
  const addComment = useMutation(api.blog.addComment)
  const deleteComment = useMutation(api.blog.deleteComment)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!userId) { toast.error('Sign in to comment'); return }
    setSubmitting(true)
    try {
      await addComment({ postId, authorUserId: userId, content: text.trim() })
      setText('')
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!userId) return
    try {
      await deleteComment({ commentId, authorUserId: userId })
      toast.success('Comment deleted')
    } catch {
      toast.error('Cannot delete this comment')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-5">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Comments {comments !== undefined ? `(${comments.length})` : ''}
        </h3>

        {/* Comment form */}
        {userId ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 outline-none focus:border-blue-400 resize-none placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={submitting || !text.trim()}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-5 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            <Link href="/auth/login" className="text-blue-500 font-semibold hover:underline">Sign in</Link> to leave a comment
          </div>
        )}

        {/* Comments list */}
        {comments === undefined && (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
          </div>
        )}
        {comments !== undefined && comments.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No comments yet. Be the first!</p>
        )}
        {comments !== undefined && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {comment.authorUserId === userId ? 'You' : 'Community member'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{timeAgo(comment.createdAt)}</span>
                      {comment.authorUserId === userId && (
                        <button onClick={() => handleDelete(comment._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw

  const post = useQuery(api.blog.getById, id ? { id: String(id) } : 'skip')
  const userId = user ? String(user.id) : undefined

  if (!id) return <div className="p-8 text-gray-500">Invalid link.</div>
  if (post === undefined) return <Loader />
  if (!post) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Post not found.</p>
        <Link href="/blog" className="mt-4 inline-block text-sm text-blue-500 hover:underline">← Back to blog</Link>
      </div>
    </div>
  )

  const catCls = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={post.imageUrl ?? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
        <div className="absolute top-4 left-4 sm:left-8">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 max-w-3xl mx-auto">
          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${catCls}`}>
            {post.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{post.title}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Meta bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{timeAgo(post.createdAt)}</span>
            <span>·</span>
            <span>{readTime(post.content)}</span>
          </div>
          <LikeButton postId={post._id} userId={userId} />
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
          <div className="p-6 sm:p-8 space-y-1 text-sm leading-relaxed">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Comments */}
        <CommentsSection postId={post._id} userId={userId} />
      </div>
    </div>
  )
}
