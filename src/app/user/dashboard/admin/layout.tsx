'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import {
  LayoutDashboard, Users, Package, Building2,
  Tag, MessageSquare, Megaphone, HeartHandshake, GitPullRequest,
} from 'lucide-react'

const nav = [
  { name: 'Overview',    href: '/user/dashboard/admin',             icon: LayoutDashboard },
  { name: 'Users',       href: '/user/dashboard/admin/users',       icon: Users },
  { name: 'Products',    href: '/user/dashboard/admin/products',    icon: Package },
  { name: 'Businesses',  href: '/user/dashboard/admin/businesses',  icon: Building2 },
  { name: 'Categories',  href: '/user/dashboard/admin/categories',  icon: Tag },
  {
    name: 'Mentorship',
    href: '/user/dashboard/admin/mentorship',
    icon: HeartHandshake,
    children: [
      { name: 'Requests', href: '/user/dashboard/admin/mentorship/requests', icon: GitPullRequest },
    ],
  },
  { name: 'Messages',    href: '/user/dashboard/admin/messages',    icon: MessageSquare },
  { name: 'Broadcast',   href: '/user/dashboard/admin/broadcast',   icon: Megaphone },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.role !== 'super_admin') {
      router.replace('/')
    }
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'super_admin') return null

  return <DashboardLayout nav={nav} role="Admin">{children}</DashboardLayout>
}
