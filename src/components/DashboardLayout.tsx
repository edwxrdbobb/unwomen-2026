'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LucideIcon, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logo from '@/images/unwomenlogo.png'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  children: React.ReactNode
  nav: NavItem[]
  role: string
}

export default function DashboardLayout({ children, nav, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#399edc' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/">
            <Image src={logo} alt="UN Women" width={110} height={40} className="h-8 w-auto brightness-0 invert" />
          </Link>
          <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mt-2">
            {role} Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href + '/') &&
                !nav.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.startsWith(item.href + '/') &&
                    (pathname === other.href || pathname.startsWith(other.href + '/'))
                ))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-white shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 flex-shrink-0`}
                  style={isActive ? { color: '#399edc' } : {}}
                />
                <span className={`flex-1 ${isActive ? 'text-gray-800 font-semibold' : ''}`}>
                  {item.name}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: '#399edc' }} />}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-white/50 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
              {role} Portal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-medium transition-colors" style={{ color: '#399edc' }}>
              ← Back to Store
            </Link>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
