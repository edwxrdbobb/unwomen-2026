'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { Users, CheckCircle, MapPin, Briefcase, X, Send, AlertCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import toast from 'react-hot-toast'

type Mentor = NonNullable<ReturnType<typeof useQuery<typeof api.profiles.listByRole>>>[number]

function RequestModal({ mentor, onClose }: { mentor: Mentor; onClose: () => void }) {
  const { user } = useAuth()
  const createRequest = useMutation(api.mentorship.createRequest)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to request a mentor.')
      return
    }
    setLoading(true)
    try {
      await createRequest({
        vendorUserId: String(user.id),
        mentorId: mentor.userId,
        message: message.trim() || undefined,
      })
      setSent(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Request Access</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Request sent!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {mentor.name} will review your request and respond in their dashboard.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Mentor preview */}
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <Avatar src={mentor.profileImageUrl} name={mentor.name} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{mentor.name}</p>
                {mentor.expertise && <p className="text-xs text-blue-500 truncate">{mentor.expertise}</p>}
              </div>
            </div>

            {!user && (
              <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">You need to be logged in to send a mentorship request.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Message <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and describe what kind of support you're looking for..."
                rows={4}
                className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !user}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl py-2.5 transition-colors"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Send Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function MentorsPage() {
  const mentors = useQuery(api.profiles.listByRole, { role: 'mentor' })
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Our Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">Browse Mentors</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xl">
            Connect with experienced mentors who support women-led businesses across Sierra Leone.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Loading state */}
        {mentors === undefined && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 animate-pulse space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {mentors !== undefined && mentors.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No mentors yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mentors will appear here once they complete their profiles.</p>
          </div>
        )}

        {/* Mentor grid */}
        {mentors !== undefined && mentors.length > 0 && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {mentors.length} mentor{mentors.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.map((mentor) => (
                <div key={mentor._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden group hover:shadow-card-hover transition-all duration-300">
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
                  <div className="p-5">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <Avatar src={mentor.profileImageUrl} name={mentor.name} size="lg" className="ring-4 ring-blue-50 dark:ring-blue-900/30" />
                        {mentor.isVerified && (
                          <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-white dark:bg-gray-800 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{mentor.name}</h3>
                        {mentor.isVerified && (
                          <p className="text-xs text-green-500 font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </p>
                        )}
                        {!mentor.isVerified && (
                          <span className="inline-block text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2 py-0.5 rounded-full mt-0.5">
                            Mentor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expertise */}
                    {mentor.expertise && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{mentor.expertise}</span>
                      </div>
                    )}

                    {/* Location */}
                    {mentor.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{mentor.location}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {mentor.bio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {mentor.bio}
                      </p>
                    )}

                    {/* Request Access button */}
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="mt-4 flex items-center justify-center gap-1.5 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Request Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedMentor && (
        <RequestModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  )
}
