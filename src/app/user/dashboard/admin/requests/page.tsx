'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { GitPullRequest, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'
import type { Id } from '@cvx/_generated/dataModel'

const STATUS_TABS = ['all', 'pending', 'accepted', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}
const STATUS_ICONS: Record<string, React.ElementType> = {
  pending:  Clock,
  accepted: CheckCircle,
  rejected: XCircle,
}

export default function AdminRequestsPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [tab, setTab] = useState<StatusTab>('pending')
  const [assignMentorId, setAssignMentorId] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const requests = useQuery(
    api.admin.listRequestsEnriched,
    tab === 'all' ? {} : { status: tab as Exclude<StatusTab, 'all'> }
  ) ?? []

  const mentors = useQuery(api.admin.listMentorsForAssign) ?? []

  const handleAccept = async (id: Id<'mentorshipRequests'>, mentorId?: string) => {
    if (!admin) return
    setProcessingId(id)
    try {
      await convex.mutation(api.mentorship.createMentorship, {
        requestId: id,
        adminUserId: admin.id,
        mentorId: mentorId ?? assignMentorId,
      })
      toast.success('Mentorship activated!')
      setAssignMentorId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept request')
    } finally { setProcessingId(null) }
  }

  const handleReject = async (id: Id<'mentorshipRequests'>) => {
    if (!admin) return
    setProcessingId(id)
    try {
      await convex.mutation(api.mentorship.reviewRequest, {
        id, adminUserId: admin.id, status: 'rejected',
      })
      toast.success('Request rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    } finally { setProcessingId(null) }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentorship Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review and action vendor mentorship requests</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            style={tab === t ? { backgroundColor: '#399edc' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-16 text-center">
          <GitPullRequest className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No {tab !== 'all' ? tab : ''} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const StatusIcon = STATUS_ICONS[r.status]
            const isProcessing = processingId === r._id
            return (
              <div key={r._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                        <StatusIcon className="w-3 h-3" />{r.status}
                      </span>
                      {r.businessName && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">· {r.businessName}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                      <span><strong>Vendor:</strong> {r.vendorName} <span className="text-gray-400">({r.vendorEmail})</span></span>
                      {r.mentorName && (
                        <span><strong>Requested mentor:</strong> {r.mentorName}</span>
                      )}
                    </div>
                    {r.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 max-w-lg">"{r.message}"</p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Submitted {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <select value={assignMentorId}
                          onChange={e => setAssignMentorId(e.target.value)}
                          className="appearance-none text-xs pl-3 pr-7 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white">
                          <option value="">Assign mentor…</option>
                          {mentors.map(m => (
                            <option key={m._id} value={m.userId}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                      <button disabled={isProcessing} onClick={() => handleAccept(r._id, assignMentorId || r.mentorId || undefined)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-60">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button disabled={isProcessing} onClick={() => handleReject(r._id)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
