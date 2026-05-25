'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import {
  HeartHandshake, UserCheck, Users, Building2,
  XCircle, CheckCircle, Loader2,
  Clock, GitPullRequest, Link2,
} from 'lucide-react'
import Link from 'next/link'
import type { Id } from '@cvx/_generated/dataModel'
import SearchableSelect from '@/components/ui/SearchableSelect'

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function AdminMentorshipPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()

  // form state
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [endingId, setEndingId] = useState<string | null>(null)

  const vendors  = useQuery(api.admin.listAllUsers, { role: 'vendor' })  ?? []
  const mentors  = useQuery(api.admin.listMentorsForAssign)               ?? []
  const businesses = useQuery(
    api.businesses.listByVendor,
    selectedVendorId ? { vendorUserId: selectedVendorId } : 'skip'
  ) ?? []
  const pairings = useQuery(api.admin.listMentorshipsEnriched) ?? []
  const pendingCount = useQuery(api.admin.listRequestsEnriched, { status: 'pending' })?.length ?? 0

  const handlePair = async () => {
    if (!admin || !selectedVendorId || !selectedMentorId) {
      toast.error('Select both a vendor and a mentor')
      return
    }
    setSubmitting(true)
    try {
      await convex.mutation(api.mentorship.connectDirectly, {
        adminUserId: String(admin.id),
        mentorId: selectedMentorId,
        menteeUserId: selectedVendorId,
        businessId: selectedBusinessId ? (selectedBusinessId as Id<'businesses'>) : undefined,
      })
      toast.success('Mentorship pairing created!')
      setSelectedVendorId('')
      setSelectedMentorId('')
      setSelectedBusinessId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create pairing')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEnd = async (id: Id<'mentorships'>) => {
    if (!admin) return
    setEndingId(id)
    try {
      await convex.mutation(api.mentorship.endMentorship, {
        id,
        adminUserId: String(admin.id),
      })
      toast.success('Mentorship ended')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to end mentorship')
    } finally {
      setEndingId(null) }
  }

  const activePairings   = pairings.filter(p => p.isActive)
  const inactivePairings = pairings.filter(p => !p.isActive)

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentorship Pairing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manually pair vendors with mentors, and manage active mentorships
          </p>
        </div>
        {pendingCount > 0 && (
          <Link
            href="/user/dashboard/admin/mentorship/requests"
            className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <GitPullRequest className="w-4 h-4" />
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Pairings', value: activePairings.length, icon: HeartHandshake, color: 'bg-[#399edc]' },
          { label: 'Total Pairings',  value: pairings.length,       icon: Link2,          color: 'bg-violet-500' },
          { label: 'Mentors',         value: mentors.length,        icon: UserCheck,       color: 'bg-emerald-500' },
          { label: 'Vendors',         value: vendors.length,        icon: Users,           color: 'bg-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create pairing form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden h-[450px] md:h-[350px] sm:h-[250px]">
        <div className="h-1 bg-gradient-to-r from-[#399edc] to-yellow-400" />
        <div className="p-6">
          <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide mb-5 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#399edc]" />
            Create New Pairing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto">
            {/* Vendor searchable select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Vendor
              </label>
              <SearchableSelect
                options={vendors.map(v => ({
                  value: v.userId,
                  label: v.name,
                  sublabel: v.email,
                  avatar: v.profileImageUrl,
                }))}
                value={selectedVendorId}
                onChange={val => { setSelectedVendorId(val); setSelectedBusinessId('') }}
                placeholder="Search vendors…"
                emptyMessage="No vendors found"
              />
            </div>

            {/* Mentor searchable select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Mentor
              </label>
              <SearchableSelect
                options={mentors.map(m => ({
                  value: m.userId,
                  label: m.name,
                  sublabel: m.expertise ?? m.email,
                  avatar: m.profileImageUrl,
                }))}
                value={selectedMentorId}
                onChange={setSelectedMentorId}
                placeholder="Search mentors…"
                emptyMessage="No mentors found"
              />
            </div>

            {/* Business searchable select (optional, locked until vendor chosen) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Business
                <span className="normal-case font-normal text-gray-400">(optional)</span>
              </label>
              <SearchableSelect
                options={businesses.map(b => ({
                  value: b._id,
                  label: b.businessName,
                  sublabel: b.businessLocation,
                }))}
                value={selectedBusinessId}
                onChange={setSelectedBusinessId}
                placeholder={selectedVendorId ? 'Search businesses…' : 'Select a vendor first'}
                disabled={!selectedVendorId}
                emptyMessage="No businesses for this vendor"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handlePair}
              disabled={submitting || !selectedVendorId || !selectedMentorId}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#399edc] hover:bg-[#2d8bc8] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <HeartHandshake className="w-4 h-4" />}
              Create Pairing
            </button>
            {(!selectedVendorId || !selectedMentorId) && (
              <p className="text-xs text-gray-400 dark:text-gray-500">Select a vendor and mentor to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* Active pairings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Active Pairings
            {activePairings.length > 0 && (
              <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {activePairings.length}
              </span>
            )}
          </h2>
        </div>

        {activePairings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-12 text-center">
            <HeartHandshake className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No active pairings yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create one using the form above</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Mentor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Vendor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden sm:table-cell">Business</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden md:table-cell">Started</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {activePairings.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                            {p.mentorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{p.mentorName}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{p.mentorEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {p.menteeName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{p.menteeName}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{p.menteeEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {p.businessName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          <Building2 className="w-3 h-3" /> {p.businessName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" /> {timeAgo(p.startedAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleEnd(p._id)}
                        disabled={endingId === p._id}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {endingId === p._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        End
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactive / past pairings */}
      {inactivePairings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <XCircle className="w-4 h-4 text-gray-400" />
            Past Pairings
            <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {inactivePairings.length}
            </span>
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden opacity-70">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {inactivePairings.map(p => (
                  <tr key={p._id} className="text-gray-400 dark:text-gray-500">
                    <td className="px-5 py-3 text-xs">{p.mentorName}</td>
                    <td className="px-5 py-3 text-xs">{p.menteeName}</td>
                    <td className="px-5 py-3 text-xs hidden sm:table-cell">{p.businessName ?? '—'}</td>
                    <td className="px-5 py-3 text-xs hidden md:table-cell">{timeAgo(p.startedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                        Ended
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
