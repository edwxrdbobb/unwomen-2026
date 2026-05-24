'use client'

import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { Users, Package, Building2, Tag, GitPullRequest, HeartHandshake, ShoppingBag, UserCheck } from 'lucide-react'

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: number | string; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const stats = useQuery(api.admin.getAnalytics)

  if (!stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide statistics at a glance</p>
      </div>

      {/* Main stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.users.total} icon={Users} color="bg-[#399edc]" />
        <StatCard label="Products" value={stats.products} icon={Package} color="bg-emerald-500" />
        <StatCard label="Businesses" value={stats.businesses} icon={Building2} color="bg-violet-500" />
        <StatCard label="Categories" value={stats.categories} icon={Tag} color="bg-amber-500" />
      </div>

      {/* Role breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide mb-5">User Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Buyers',   value: stats.users.buyers,  icon: ShoppingBag, color: 'bg-sky-100 text-sky-600' },
            { label: 'Vendors',  value: stats.users.vendors,  icon: Package,     color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Mentors',  value: stats.users.mentors,  icon: UserCheck,   color: 'bg-violet-100 text-violet-600' },
            { label: 'Admins',   value: stats.users.admins,   icon: Users,       color: 'bg-rose-100 text-rose-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color.split(' ')[0]}`}>
              <Icon className={`w-5 h-5 ${color.split(' ')[1]}`} />
              <div>
                <p className={`text-xl font-bold ${color.split(' ')[1]}`}>{value}</p>
                <p className="text-xs font-medium text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentorship & Requests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide mb-4">Mentorship Requests</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending',  value: stats.requests.pending,  dot: 'bg-yellow-400' },
              { label: 'Accepted', value: stats.requests.accepted, dot: 'bg-emerald-400' },
              { label: 'Rejected', value: stats.requests.rejected, dot: 'bg-red-400' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h2 className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wide mb-4">Active Mentorships</h2>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.mentorships.active}</p>
            <div className="mb-1">
              <HeartHandshake className="w-6 h-6 text-[#399edc]" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.mentorships.total - stats.mentorships.active} inactive / {stats.mentorships.total} total
          </p>
          <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#399edc] rounded-full transition-all"
              style={{ width: stats.mentorships.total > 0 ? `${(stats.mentorships.active / stats.mentorships.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
