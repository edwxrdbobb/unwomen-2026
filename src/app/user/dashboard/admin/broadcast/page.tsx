'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Radio, Send, Trash2, Users, ShoppingBag, GraduationCap, Globe } from 'lucide-react'
import { cleanError } from '@/utils/formatError'
import type { Id } from '@cvx/_generated/dataModel'

const AUDIENCES = [
  { value: 'all',     label: 'Everyone',  Icon: Globe },
  { value: 'vendors', label: 'Vendors',   Icon: ShoppingBag },
  { value: 'mentors', label: 'Mentors',   Icon: GraduationCap },
  { value: 'buyers',  label: 'Buyers',    Icon: Users },
] as const

type Audience = typeof AUDIENCES[number]['value']

const blank = { subject: '', message: '', audience: 'all' as Audience }

export default function AdminBroadcastPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [form, setForm] = useState(blank)
  const [sending, setSending] = useState(false)

  const broadcasts = useQuery(api.broadcasts.list) ?? []

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return
    setSending(true)
    try {
      await convex.mutation(api.broadcasts.send, {
        adminUserId: String(admin.id),
        subject: form.subject,
        message: form.message,
        audience: form.audience,
      })
      toast.success('Broadcast sent!')
      setForm(blank)
    } catch (err) {
      toast.error(cleanError(err, 'Failed to send broadcast'))
    } finally { setSending(false) }
  }

  const handleDelete = async (id: Id<'broadcasts'>) => {
    if (!admin) return
    if (!confirm('Delete this broadcast record?')) return
    try {
      await convex.mutation(api.broadcasts.remove, { id, adminUserId: String(admin.id) })
      toast.success('Broadcast deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Send announcements to platform users</p>
      </div>

      {/* Compose */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Radio className="w-5 h-5" style={{ color: '#399edc' }} />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">New Broadcast</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Audience selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map(({ value, label, Icon }) => (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, audience: value }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    form.audience === value
                      ? 'border-[#399edc] text-white'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#399edc]'
                  }`}
                  style={form.audience === value ? { backgroundColor: '#399edc', borderColor: '#399edc' } : {}}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Subject *</label>
            <input required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="Announcement subject…"
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Message *</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Write your message to the selected audience…"
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors resize-none" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors"
              style={{ backgroundColor: '#399edc' }}>
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Broadcast History</h2>

        {broadcasts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-12 text-center">
            <Radio className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No broadcasts sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map(b => {
              const audienceItem = AUDIENCES.find(a => a.value === b.audience)
              const AudienceIcon = audienceItem?.Icon ?? Globe
              return (
                <div key={b._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{b.subject}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eef7fd] text-[#399edc]">
                          <AudienceIcon className="w-3 h-3" />
                          {audienceItem?.label ?? b.audience}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{b.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Sent {new Date(b.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(b._id as Id<'broadcasts'>)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
