'use client'

import { useState, useMemo } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import {
  ShieldCheck, Mail, Phone, MapPin, CalendarDays,
  Loader2, CheckCircle, XCircle, Users, ChevronLeft, Search, X, User,
} from 'lucide-react'
import Link from 'next/link'

const ROLE_COLORS: Record<string, string> = {
  buyer:       'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  vendor:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  mentor:      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  super_admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function VerifyUsersPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()

  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const unverified = useQuery(api.profiles.listUnverified) ?? []

  const roleCounts = useMemo(() =>
    unverified.reduce<Record<string, number>>((acc, u) => {
      acc[u.role] = (acc[u.role] ?? 0) + 1
      return acc
    }, {}),
  [unverified])

  const filtered = useMemo(() => {
    let list = roleFilter === 'all' ? unverified : unverified.filter(u => u.role === roleFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.location ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [unverified, roleFilter, search])

  const allFilteredIds = filtered.map(u => u.userId)
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id))
  const someSelected = selected.size > 0

  const toggleOne = (userId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        allFilteredIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        allFilteredIds.forEach(id => next.add(id))
        return next
      })
    }
  }

  const clearSelection = () => setSelected(new Set())

  const handleApprove = async (targetUserId: string) => {
    if (!admin) return
    setProcessingId(targetUserId)
    try {
      await convex.mutation(api.profiles.setVerified, {
        targetUserId,
        adminUserId: String(admin.id),
        isVerified: true,
      })
      toast.success('User approved — notification sent')
      setSelected(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve user')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (targetUserId: string) => {
    if (!admin) return
    setProcessingId(targetUserId + '-decline')
    try {
      await convex.mutation(api.profiles.setVerified, {
        targetUserId,
        adminUserId: String(admin.id),
        isVerified: false,
      })
      toast('Verification declined', { icon: '🚫' })
      setSelected(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setProcessingId(null)
    }
  }

  const handleBulkApprove = async () => {
    if (!admin || selected.size === 0) return
    setBulkProcessing(true)
    const ids = Array.from(selected)
    let success = 0
    let failed = 0
    for (const targetUserId of ids) {
      try {
        await convex.mutation(api.profiles.setVerified, {
          targetUserId,
          adminUserId: String(admin.id),
          isVerified: true,
        })
        success++
      } catch {
        failed++
      }
    }
    setBulkProcessing(false)
    clearSelection()
    if (failed === 0) {
      toast.success(`${success} user${success !== 1 ? 's' : ''} approved — notifications sent`)
    } else {
      toast(`${success} approved, ${failed} failed`, { icon: '⚠️' })
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/user/dashboard/admin/users"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Users
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" style={{ color: '#399edc' }} />
            Verify Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {unverified.length} account{unverified.length !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['all', 'vendor', 'mentor', 'buyer'] as const).map(role => {
          const count = role === 'all' ? unverified.length : (roleCounts[role] ?? 0)
          return (
            <button key={role} onClick={() => { setRoleFilter(role); clearSelection() }}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                roleFilter === role
                  ? 'border-[#399edc] bg-[#eef7fd] dark:bg-[#1a3a50]/30'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
              }`}>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                {role === 'all' ? 'Total pending' : `${role}s`}
              </p>
            </button>
          )
        })}
      </div>

      {/* Search + bulk toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); clearSelection() }}
            placeholder="Search by name, email or location…"
            className="w-full pl-10 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-800 dark:text-white transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); clearSelection() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Select-all + bulk approve — only when results exist */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Select all toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#399edc] transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-[#399edc] cursor-pointer"
              />
              {allSelected ? 'Deselect all' : `Select all ${filtered.length}`}
            </label>

            {/* Bulk approve */}
            {someSelected && (
              <>
                <span className="text-xs font-semibold text-[#399edc] bg-[#eef7fd] dark:bg-[#1a3a50]/40 px-2.5 py-1 rounded-full">
                  {selected.size} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm"
                >
                  {bulkProcessing
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve {selected.size}
                </button>
                <button
                  onClick={clearSelection}
                  disabled={bulkProcessing}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-20 text-center">
          <Users className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {search ? `No results for "${search}"` : roleFilter === 'all' ? 'No pending verifications' : `No unverified ${roleFilter}s`}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {search ? 'Try a different search term' : 'New sign-ups will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const isProcessing = processingId === u.userId
            const isDeclining = processingId === u.userId + '-decline'
            const isSelected = selected.has(u.userId)
            return (
              <div
                key={u._id}
                onClick={() => toggleOne(u.userId)}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-[#399edc]' : 'hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-600'
                }`}
              >
                <div className={`h-0.5 ${isSelected ? 'bg-[#399edc]' : 'bg-yellow-400'}`} />
                <div className="p-5 flex items-start gap-4 flex-wrap">

                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-0.5" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(u.userId)}
                      className="w-4 h-4 rounded accent-[#399edc] cursor-pointer"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {u.profileImageUrl ? (
                      <img src={u.profileImageUrl} alt={u.name}
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
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                        Pending
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {u.email}
                      </span>
                      {u.phoneNo && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {u.phoneNo}
                        </span>
                      )}
                      {u.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {u.location}
                        </span>
                      )}
                    </div>

                    {u.bio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{u.bio}</p>
                    )}

                    {u.expertise && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Expertise:</span> {u.expertise}
                      </p>
                    )}

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Registered {timeAgo(u._creationTime)}
                    </p>
                  </div>

                  {/* Actions — stop propagation so clicking buttons doesn't toggle checkbox */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      disabled={isProcessing || isDeclining || bulkProcessing}
                      onClick={() => handleApprove(u.userId)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-60 shadow-sm"
                    >
                      {isProcessing
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      disabled={isProcessing || isDeclining || bulkProcessing}
                      onClick={() => handleDecline(u.userId)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {isDeclining
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <XCircle className="w-3.5 h-3.5" />}
                      Decline
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
          Showing {filtered.length} of {unverified.length} pending
          {someSelected && ` · ${selected.size} selected`}
        </p>
      )}
    </div>
  )
}
