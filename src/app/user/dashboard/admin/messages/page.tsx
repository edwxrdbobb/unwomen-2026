'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { MessageSquare, ArrowLeft, UserCircle, XCircle, User } from 'lucide-react'
import { cleanError } from '@/utils/formatError'
import type { Id } from '@cvx/_generated/dataModel'

export default function AdminMessagesPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [selectedMentorshipId, setSelectedMentorshipId] = useState<Id<'mentorships'> | null>(null)

  const mentorships = useQuery(api.admin.listMentorshipsEnriched) ?? []
  const messages = useQuery(
    api.admin.listMessagesEnriched,
    selectedMentorshipId ? { mentorshipId: selectedMentorshipId } : 'skip'
  ) ?? []

  const selected = mentorships.find(m => m._id === selectedMentorshipId)

  const handleEndMentorship = async (id: Id<'mentorships'>) => {
    if (!admin) return
    if (!confirm('End this mentorship? This cannot be undone.')) return
    try {
      await convex.mutation(api.mentorship.endMentorship, { id, adminUserId: String(admin.id) })
      toast.success('Mentorship ended')
      setSelectedMentorshipId(null)
    } catch (err) {
      toast.error(cleanError(err, 'Failed to end mentorship'))
    }
  }

  if (selectedMentorshipId && selected) {
    return (
      <div className="space-y-6">
        <Toaster position="top-right" />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedMentorshipId(null)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Message Thread</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {selected.mentorName} → {selected.menteeName}
                {selected.businessName && ` · ${selected.businessName}`}
              </p>
            </div>
          </div>
          {selected.isActive && (
            <button onClick={() => handleEndMentorship(selected._id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors">
              <XCircle className="w-4 h-4" /> End Mentorship
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          {messages.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {messages.map(msg => (
                <div key={msg._id} className="px-6 py-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.senderName}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                      {!msg.read && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#399edc] text-white">unread</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse all mentorship message threads</p>
      </div>

      {mentorships.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No mentorships yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mentor</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mentee</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Business</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Messages</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {mentorships.map(m => (
                <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{m.mentorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{m.menteeName}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{m.businessName ?? '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {m.isActive ? 'Active' : 'Ended'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="text-sm font-semibold" style={{ color: '#399edc' }}>{m.messageCount}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => setSelectedMentorshipId(m._id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ color: '#399edc', backgroundColor: '#eef7fd' }}>
                      View Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
