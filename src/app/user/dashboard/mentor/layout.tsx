'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { HomeIcon, UserIcon, Users } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const mentorId = user ? String(user.id) : ''

  const requests = useQuery(
    api.mentorship.listRequestsByMentor,
    mentorId ? { mentorId } : 'skip'
  ) ?? []

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const nav = [
    { name: 'Overview', href: '/user/dashboard/mentor', icon: HomeIcon },
    {
      name: 'My Mentees',
      href: '/user/dashboard/mentor/mentees',
      icon: Users,
      badge: pendingCount,
    },
    { name: 'My Profile', href: '/user/dashboard/mentor/profile', icon: UserIcon },
  ]

  return (
    <DashboardLayout nav={nav} role="Mentor">
      {children}
    </DashboardLayout>
  )
}
