'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { HomeIcon, UserIcon, Users } from 'lucide-react'

const nav = [
  { name: 'Overview', href: '/user/dashboard/mentor', icon: HomeIcon },
  { name: 'My Mentees', href: '/user/dashboard/mentor/mentees', icon: Users },
  { name: 'My Profile', href: '/user/dashboard/mentor/profile', icon: UserIcon },
]

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout nav={nav} role="Mentor">
      {children}
    </DashboardLayout>
  )
}
