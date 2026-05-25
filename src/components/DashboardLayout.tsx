'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LucideIcon, LogOut, ChevronRight, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logo from '@/images/unwomenlogo.png'
import { useState, useEffect } from 'react'

interface NavChild {
  name: string
  href: string
  icon?: LucideIcon
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
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

  const isParentActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))) return true
    if (
      pathname.startsWith(item.href + '/') &&
      !nav.some(
        other =>
          other.href !== item.href &&
          other.href.startsWith(item.href + '/') &&
          (pathname === other.href || pathname.startsWith(other.href + '/'))
      )
    ) return true
    return false
  }

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    nav.forEach(item => {
      if (item.children) {
        init[item.href] = item.children.some(
          c => pathname === c.href || pathname.startsWith(c.href + '/')
        )
      }
    })
    return init
  })

  useEffect(() => {
    setExpanded(prev => {
      const next = { ...prev }
      nav.forEach(item => {
        if (item.children) {
          const childActive = item.children.some(
            c => pathname === c.href || pathname.startsWith(c.href + '/')
          )
          if (childActive) next[item.href] = true
        }
      })
      return next
    })
  }, [pathname, nav])

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
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = isParentActive(item)
            const hasChildren = !!item.children?.length
            const isExpanded = expanded[item.href] ?? false

            return (
              <div key={item.href}>
                {/* Parent item */}
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active && !hasChildren
                        ? 'bg-white shadow-sm'
                        : active && hasChildren
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className="w-4 h-4 flex-shrink-0"
                      style={active && !hasChildren ? { color: '#399edc' } : {}}
                    />
                    <span className={`flex-1 ${active && !hasChildren ? 'text-gray-800 font-semibold' : ''}`}>
                      {item.name}
                    </span>
                    {active && !hasChildren && (
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#399edc' }} />
                    )}
                  </Link>

                  {/* Expand/collapse toggle for items with children */}
                  {hasChildren && (
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [item.href]: !prev[item.href] }))}
                      className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all ml-0.5"
                      aria-label="Toggle"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-white/20 pl-3">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                      const ChildIcon = child.icon
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            childActive
                              ? 'bg-white shadow-sm text-gray-800 font-semibold'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {ChildIcon && (
                            <ChildIcon
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={childActive ? { color: '#399edc' } : {}}
                            />
                          )}
                          <span>{child.name}</span>
                          {childActive && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: '#399edc' }} />}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
