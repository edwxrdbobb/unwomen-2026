'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import {
  GitPullRequest, CheckCircle, XCircle, Clock, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import type { Id } from '@cvx/_generated/dataModel'
import SearchableSelect from '@/components/ui/SearchableSelect'

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  accepted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}
const STATUS_ICONS: Record<string, React.ElementType> = {
  pending:  Clock,
  accepted: CheckCircle,
  rejected: XCircle,
}

export default function MentorshipRequestsPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [tab, setTab] = useState<StatusTab>('pending')
  const [assignMap, setAssignMap] = useState<Record<string, string>>({})
  const [processingId, setProcessingId] = useState<string | null>(null)

  const requests = useQuery(
    api.admin.listRequestsEnriched,
    tab === 'all' ? {} : { status: tab as Exclude<StatusTab, 'all'> }
  ) ?? []
  const mentors = useQuery(api.admin.listMentorsForAssign) ?? []

  const counts = {
    pending:  useQuery(api.admin.listRequestsEnriched, { status: 'pending'  })?.length ?? 0,
    accepted: useQuery(api.admin.listRequestsEnriched, { status: 'accepted' })?.length ?? 0,
    rejected: useQuery(api.admin.listRequestsEnriched, { status: 'rejected' })?.length ?? 0,
  }

  const handleAccept = async (id: Id<'mentorshipRequests'>, preselectedMentorId?: string | null) => {
    if (!admin) return
    const mentorId = assignMap[id] || preselectedMentorId || ''
    if (!mentorId) {
      toast.error('Assign a mentor before accepting')
      return
    }
    setProcessingId(id)
    try {
      await convex.mutation(api.mentorship.createMentorship, {
        requestId: id,
        adminUserId: String(admin.id),
        mentorId,
      })
      toast.success('Mentorship activated!')
      setAssignMap(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept request')
    } finally { setProcessingId(null) }
  }

  const handleReject = async (id: Id<'mentorshipRequests'>) => {
    if (!admin) return
    setProcessingId(id)
    try {
      await convex.mutation(api.mentorship.reviewRequest, {
        id,
        adminUserId: String(admin.id),
        status: 'rejected',
      })
      toast.success('Request rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    } finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/user/dashboard/admin/mentorship"
              className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-[#399edc] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Mentorship
            </Link>
            <span className="text-gray-300 dark:text-gray-600 text-xs">/</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Requests</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentorship Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review vendor requests and assign a mentor to activate each pairing
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Pending',  count: counts.pending,  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
          { label: 'Accepted', count: counts.accepted, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
          { label: 'Rejected', count: counts.rejected, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>
            <span>{count}</span> {label}
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
              tab === t
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={tab === t ? { backgroundColor: '#399edc' } : {}}
          >
            {t}
            {t !== 'all' && counts[t as keyof typeof counts] > 0 && (
              <span className={`ml-1.5 ${tab === t ? 'opacity-80' : 'opacity-60'}`}>
                ({counts[t as keyof typeof counts]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-16 text-center">
          <GitPullRequest className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            No {tab !== 'all' ? tab : ''} requests
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const StatusIcon = STATUS_ICONS[r.status]
            const isProcessing = processingId === r._id
            const assignedMentor = assignMap[r._id] || ''

            return (
              <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                <div className={`h-0.5 ${
                  r.status === 'pending'  ? 'bg-yellow-400' :
                  r.status === 'accepted' ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                          <StatusIcon className="w-3 h-3" /> {r.status}
                        </span>
                        {r.businessName && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            · {r.businessName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                        <span>
                          <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Vendor </span>
                          {r.vendorName}
                          <span className="text-gray-400 dark:text-gray-500 ml-1">({r.vendorEmail})</span>
                        </span>
                        {r.mentorName && (
                          <span>
                            <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Requested </span>
                            {r.mentorName}
                          </span>
                        )}
                      </div>

                      {r.message && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic max-w-lg leading-relaxed">
                          "{r.message}"
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Submitted {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Right: actions (pending only) */}
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <div className="w-52">
                          <SearchableSelect
                            options={mentors.map(m => ({
                              value: m.userId,
                              label: m.name,
                              sublabel: m.expertise ?? m.email,
                              avatar: m.profileImageUrl,
                            }))}
                            value={assignedMentor}
                            onChange={val => setAssignMap(prev => ({ ...prev, [r._id]: val }))}
                            placeholder="Assign mentor…"
                            emptyMessage="No mentors found"
                          />
                        </div>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleAccept(r._id, r.mentorId ?? null)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleReject(r._id)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-60"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
