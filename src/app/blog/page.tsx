'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { Clock, ArrowRight, BookOpen, Plus, PenLine } from 'lucide-react'

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

function readTime(content: string): string {
  const words = content.split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {category}
    </span>
  )
}

export default function BlogPage() {
  const { user } = useAuth()
  const posts = useQuery(api.blog.list, {})

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Market Square Blog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Stories, tips &amp; updates
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xl">
                News from our marketplace, vendor spotlights, and practical guides for women-led businesses in Sierra Leone.
              </p>
            </div>
            {user && (
              <Link href="/blog/create"
                className="flex-shrink-0 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Write a post
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Loading */}
        {posts === undefined && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card h-64" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card h-56" />)}
            </div>
          </div>
        )}

        {/* Empty */}
        {posts !== undefined && posts.length === 0 && (
          <div className="py-24 text-center">
            <PenLine className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No posts yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Be the first to share a story or guide.</p>
            {user && (
              <Link href="/blog/create"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
                <Plus className="w-4 h-4" /> Write the first post
              </Link>
            )}
          </div>
        )}

        {posts !== undefined && posts.length > 0 && (() => {
          const [featured, ...rest] = posts
          return (
            <>
              {/* Featured post */}
              <Link href={`/blog/${featured._id}`} className="group block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-80 flex-shrink-0">
                      <img
                        src={featured.imageUrl ?? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'}
                        alt={featured.title}
                        className="w-full h-52 sm:h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CategoryBadge category={featured.category} />
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Featured</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                          {featured.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(featured.createdAt)}</span>
                          <span>·</span>
                          <span>{readTime(featured.content)}</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
                          Read more <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Post grid */}
              {rest.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Latest Posts</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rest.map((post) => (
                      <Link key={post._id} href={`/blog/${post._id}`} className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full">
                          <div className="relative overflow-hidden h-40">
                            <img
                              src={post.imageUrl ?? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2">
                              <CategoryBadge category={post.category} />
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                <Clock className="w-3 h-3" />{timeAgo(post.createdAt)}
                              </span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">{readTime(post.content)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
