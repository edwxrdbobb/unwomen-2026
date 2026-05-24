'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, PenLine, Image as ImageIcon, Tag, FileText, AlignLeft } from 'lucide-react'

const CATEGORIES = [
  'Business Growth',
  'New Vendor',
  'Community',
  'Tips & Guides',
  'Mentorship',
  'Announcements',
]

export default function CreateBlogPostPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const createPost = useMutation(api.blog.create)

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <PenLine className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sign in to write</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">You need an account to create blog posts.</p>
          <Link href="/auth/login"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const id = await createPost({
        authorUserId: String(user.id),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
      })
      toast.success('Post published!')
      router.push(`/blog/${id}`)
    } catch {
      toast.error('Failed to publish post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/blog"
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
            <PenLine className="w-4 h-4 text-blue-500" /> New Post
          </div>
          <button
            type="submit"
            form="create-post-form"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <form id="create-post-form" onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
            <div className="p-5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                <FileText className="w-3.5 h-3.5" /> Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a compelling title…"
                className="w-full text-lg font-bold text-gray-900 dark:text-white dark:bg-transparent outline-none placeholder-gray-300 dark:placeholder-gray-600"
                maxLength={150}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/150</p>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
            <div className="p-5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                <AlignLeft className="w-3.5 h-3.5" /> Summary / Excerpt *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary shown on the blog listing page…"
                rows={3}
                className="w-full text-sm text-gray-700 dark:text-gray-200 dark:bg-transparent outline-none resize-none placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
                maxLength={300}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{excerpt.length}/300</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
            <div className="p-5">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                <PenLine className="w-3.5 h-3.5" /> Full Content *
              </label>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">
                Tip: use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">**Bold heading**</code> on its own line for section headers.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your full post here…&#10;&#10;**Section Heading**&#10;Your paragraph text goes here…"
                rows={14}
                className="w-full text-sm text-gray-700 dark:text-gray-200 dark:bg-transparent outline-none resize-none placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed font-mono"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">{content.split(/\s+/).filter(Boolean).length} words</p>
            </div>
          </div>

          {/* Category + Image */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
              <div className="p-5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-800 outline-none border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:border-blue-400">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
              <div className="p-5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full text-sm text-gray-700 dark:text-gray-200 dark:bg-transparent outline-none border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:border-blue-400 placeholder-gray-300 dark:placeholder-gray-600"
                />
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="mt-3 w-full h-28 object-cover rounded-xl" />
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/blog"
              className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm">
              <PenLine className="w-4 h-4" />
              {submitting ? 'Publishing…' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
