'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import {
  Users, Clock, CheckCircle, XCircle, Building2,
  Mail, Phone, MapPin, Loader2, GitPullRequest,
  MessageSquare, CalendarDays, User,
} from 'lucide-react'
import Link from 'next/link'
import { cleanError } from '@/utils/formatError'
import type { Id } from '@cvx/_generated/dataModel'

const TABS = ['requests', 'active', 'past'] as const
type Tab = typeof TABS[number]

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function MenteesPage() {
  const { user } = useAuth()
  const convex = useConvex()
  const mentorId = user ? String(user.id) : ''

  const [tab, setTab] = useState<Tab>('requests')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const requests   = useQuery(api.mentorship.listRequestsByMentor, mentorId ? { mentorId } : 'skip') ?? []
  const mentorships = useQuery(api.mentorship.listByMentor, mentorId ? { mentorId } : 'skip') ?? []

  const pending  = requests.filter(r => r.status === 'pending')
  const active   = mentorships.filter(m => m.isActive)
  const past     = mentorships.filter(m => !m.isActive)

  const handleRespond = async (id: Id<'mentorshipRequests'>, status: 'accepted' | 'rejected') => {
    if (!mentorId) return
    setProcessingId(id)
    try {
      await convex.mutation(api.mentorship.respondToRequest, { id, mentorId, status })
      toast.success(status === 'accepted' ? 'Mentorship accepted!' : 'Request declined')
      if (status === 'accepted') setTab('active')
    } catch (err) {
      toast.error(cleanError(err, 'Something went wrong'))
    } finally {
      setProcessingId(null)
    }
  }

  const tabLabel = (t: Tab) => {
    if (t === 'requests') return `Requests${pending.length > 0 ? ` (${pending.length})` : ''}`
    if (t === 'active')   return `Active${active.length > 0 ? ` (${active.length})` : ''}`
    return `Past${past.length > 0 ? ` (${past.length})` : ''}`
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Mentees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {active.length} active · {pending.length} pending · {past.length} completed
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors relative ${
              tab === t
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={tab === t ? { backgroundColor: '#399edc' } : {}}
          >
            {tabLabel(t)}
            {t === 'requests' && pending.length > 0 && tab !== 'requests' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Requests tab ── */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-14 text-center">
              <GitPullRequest className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No pending requests</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                New assignments will appear here when admin or vendors request you
              </p>
            </div>
          ) : (
            pending.map(r => {
              const profile = r.requesterProfile
              const isProcessing = processingId === r._id
              return (
                <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                  <div className="h-0.5 bg-yellow-400" />
                  <div className="p-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {profile?.profileImageUrl ? (
                          <img src={profile.profileImageUrl} alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-200 dark:ring-yellow-800" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ring-2 ring-yellow-200 dark:ring-yellow-800">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {profile?.name ?? 'Unknown Vendor'}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
                            Pending your response
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {profile?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {profile.email}
                            </span>
                          )}
                          {profile?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {profile.location}
                            </span>
                          )}
                          {profile?.phoneNo && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {profile.phoneNo}
                            </span>
                          )}
                        </div>

                        {r.message && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                            "{r.message}"
                          </p>
                        )}

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Requested {timeAgo(r.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleRespond(r._id, 'accepted')}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                        >
                          {isProcessing
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle className="w-3.5 h-3.5" />}
                          Accept
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleRespond(r._id, 'rejected')}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-60"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Active mentees tab ── */}
      {tab === 'active' && (
        <div className="space-y-3">
          {active.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-14 text-center">
              <Users className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No active mentees</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Accept a request to start a mentorship
              </p>
            </div>
          ) : (
            active.map(m => {
              const profile = m.menteeProfile
              return (
                <div key={m._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                  <div className="h-0.5 bg-emerald-400" />
                  <div className="p-5 flex items-start gap-4 flex-wrap">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {profile?.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={profile?.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-200 dark:ring-emerald-800" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ring-2 ring-emerald-200 dark:ring-emerald-800">
                          <User className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {profile?.name ?? 'Vendor'}
                        </h3>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" /> Active
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {profile?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {profile.email}
                          </span>
                        )}
                        {profile?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {profile.location}
                          </span>
                        )}
                      </div>

                      {profile?.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{profile.bio}</p>
                      )}

                      <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Started {timeAgo(m.startedAt)}
                      </p>

                      {m.progressNotes && (
                        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">Progress notes</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{m.progressNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Quick links */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {profile?._id && (
                        <Link href={`/user/${profile._id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-[#399edc] hover:text-white text-gray-600 dark:text-gray-300 rounded-xl transition-colors">
                          <Users className="w-3.5 h-3.5" /> Profile
                        </Link>
                      )}
                      {m.businessId && (
                        <Link href={`/business/${m.businessId}`}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-[#399edc] hover:text-white text-gray-600 dark:text-gray-300 rounded-xl transition-colors">
                          <Building2 className="w-3.5 h-3.5" /> Business
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Past mentees tab ── */}
      {tab === 'past' && (
        <div className="space-y-3">
          {past.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-14 text-center">
              <CheckCircle className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No completed mentorships yet</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50 dark:divide-gray-700/50">
              {past.map(m => {
                const profile = m.menteeProfile
                return (
                  <div key={m._id} className="flex items-center gap-4 px-5 py-4 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {profile?.name ?? 'Unknown Vendor'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(m.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full flex-shrink-0">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
