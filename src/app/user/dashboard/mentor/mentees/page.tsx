'use client'

import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function MenteesPage() {
  const { user } = useAuth()
  const mentorId = user ? String(user.id) : ''
  const mentorships = useQuery(api.mentorship.listByMentor, mentorId ? { mentorId } : 'skip')

  const active = mentorships?.filter((m) => m.isActive) ?? []
  const past = mentorships?.filter((m) => !m.isActive) ?? []

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Mentees</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {mentorships ? `${mentorships.length} mentorship${mentorships.length !== 1 ? 's' : ''} total` : 'Loading...'}
        </p>
      </div>

      {/* Loading skeleton */}
      {mentorships === undefined && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Active mentees */}
      {mentorships !== undefined && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">Active Mentees</h2>
            <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 font-semibold px-2 py-0.5 rounded-full">
              {active.length} active
            </span>
          </div>

          {active.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No active mentees yet.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You will be assigned mentees by the admin team.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {active.map((m) => (
                <div key={m._id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Mentee ID: <span className="font-mono text-blue-500">…{m.menteeUserId.slice(-8)}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Started {new Date(m.startedAt).toLocaleDateString()}
                    </p>
                    {m.progressNotes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{m.progressNotes}</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full flex-shrink-0">
                    <Clock className="w-3 h-3" /> Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past mentees */}
      {mentorships !== undefined && past.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">Past Mentees</h2>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
              {past.length} completed
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {past.map((m) => (
              <div key={m._id} className="flex items-center gap-4 px-6 py-4 opacity-70">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Mentee ID: <span className="font-mono text-gray-500">…{m.menteeUserId.slice(-8)}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Started {new Date(m.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full flex-shrink-0">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
