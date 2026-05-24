'use client'

import Link from 'next/link'
import { Users, ArrowRight, CheckCircle, Clock, UserCheck, BookOpen } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const mentorId = user ? String(user.id) : ''

  const mentorships = useQuery(api.mentorship.listByMentor, mentorId ? { mentorId } : 'skip')
  const profile = useQuery(api.profiles.get, mentorId ? { userId: mentorId } : 'skip')

  const activeMentorships = mentorships?.filter((m) => m.isActive) ?? []
  const pastMentorships = mentorships?.filter((m) => !m.isActive) ?? []

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name ?? 'Mentor'}</h1>
        <p className="text-white/70 text-sm mt-1">
          {profile?.bio ?? 'Help women entrepreneurs grow their businesses.'}
        </p>
        {!profile?.bio && (
          <Link href="/user/dashboard/mentor/profile"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
            Complete profile <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={UserCheck} label="Active Mentees" value={activeMentorships.length}
          sub="currently mentoring" color="bg-blue-50 dark:bg-blue-900/30 text-blue-500" />
        <StatCard icon={CheckCircle} label="Completed" value={pastMentorships.length}
          sub="past mentorships" color="bg-green-50 dark:bg-green-900/30 text-green-500" />
        <StatCard icon={BookOpen} label="Profile"
          value={profile?.isVerified ? 'Verified' : 'Pending'}
          sub={profile?.expertise ?? 'Add your expertise'}
          color={profile?.isVerified ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'} />
      </div>

      {/* Quick action */}
      <Link href="/user/dashboard/mentor/profile"
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
        <div className="w-12 h-12 bg-yellow-400 group-hover:bg-yellow-500 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
          <UserCheck className="w-6 h-6 text-gray-900" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Update Your Profile</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add expertise, bio, and contact info</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
      </Link>

      {/* Active Mentorships */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">Active Mentorships</h2>
          <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-500 font-semibold px-2 py-0.5 rounded-full">
            {activeMentorships.length} active
          </span>
        </div>

        {mentorships === undefined ? (
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeMentorships.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No active mentorships yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You will be assigned mentees by the admin team.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activeMentorships.map((m) => (
              <div key={m._id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Mentee ID: {m.menteeUserId.slice(-8)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Started {new Date(m.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
