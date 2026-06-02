'use client'

import Image from "next/image"
import logo from '@/images/unwomenlogo.png'
import { useEffect, useState, useRef } from 'react'
import { Heart, Menu, X, Search, LayoutGrid, Plus, Clock } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'

const LOCAL_HISTORY_KEY = 'searchHistory'

function getLocalHistory(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]') } catch { return [] }
}

function saveLocalHistory(query: string) {
  const h = getLocalHistory().filter(x => x.toLowerCase() !== query.toLowerCase())
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([query, ...h].slice(0, 10)))
}

function removeLocalHistory(query: string) {
  const h = getLocalHistory().filter(x => x !== query)
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(h))
}

export default function Header() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [localHistory, setLocalHistory] = useState<string[]>([])
  const desktopRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const saveHistory = useMutation(api.search.saveHistory)

  useEffect(() => {
    const updateCounts = () => {
      const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlistCount(wishlistItems.length)
    }
    updateCounts()
    window.addEventListener('storage', updateCounts)
    return () => window.removeEventListener('storage', updateCounts)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        desktopRef.current && !desktopRef.current.contains(target) &&
        mobileRef.current && !mobileRef.current.contains(target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleFocus = () => {
    setLocalHistory(getLocalHistory())
    setShowDropdown(true)
  }

  const handleSearch = (term?: string) => {
    const q = (term ?? searchQuery).trim()
    if (!q) return
    saveLocalHistory(q)
    setLocalHistory(getLocalHistory())
    if (user) {
      saveHistory({ userId: String(user.id), query: q }).catch(() => {})
    }
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchQuery('')
    setShowDropdown(false)
    setIsMenuOpen(false)
  }

  const removeHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeLocalHistory(term)
    setLocalHistory(getLocalHistory())
  }

  const recentItems = localHistory.slice(0, 5)

  const SearchDropdown = () => (
    showDropdown && recentItems.length > 0 && !searchQuery ? (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[200]">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Recent searches</span>
          <button
            onClick={() => { localStorage.setItem(LOCAL_HISTORY_KEY, '[]'); setLocalHistory([]); setShowDropdown(false) }}
            className="text-[10px] text-[#399edc] hover:text-[#2d8bc8] font-semibold">
            Clear all
          </button>
        </div>
        {recentItems.map((term) => (
          <div key={term} onClick={() => handleSearch(term)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-colors">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{term}</span>
            <button onClick={(e) => removeHistoryItem(term, e)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    ) : null
  )

  const renderAvatar = () => (
    <Avatar src={user?.profileImageUrl} name={user?.name} size="sm" className="ring-2 ring-yellow-400" />
  )

  const renderAuthLinks = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-16 h-5 bg-gray-200 dark:bg-white/20 animate-pulse rounded-full" />
          <div className="w-20 h-8 bg-gray-200 dark:bg-white/20 animate-pulse rounded-full" />
        </div>
      )
    }

    if (user) {
      const dashboardHref =
        user.role === 'super_admin' ? '/user/dashboard/admin' :
        user.role === 'vendor' ? '/user/dashboard/vendor' :
        user.role === 'mentor' ? '/user/dashboard/mentor' :
        '/user/profile'

      return (
        <Link href={dashboardHref} className="flex items-center gap-2">
          {renderAvatar()}
          <div className="hidden lg:block text-left">
            <p className="text-[11px] text-gray-500 dark:text-white/70 leading-none">Welcome back</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mt-0.5">{user.name}</p>
          </div>
        </Link>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="text-sm font-medium text-white hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#399edc] bg-[#399edc]">
          Login
        </Link>
        <Link href="/auth/signup">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm">
            Sign Up
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-50">
      {/* ── Main Header Row ── */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src={logo} alt="UN Women Market Square" width={120} height={44} className="h-9 w-auto" />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-4">
            <div ref={desktopRef} className="relative w-full">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}
                className="flex w-full rounded-full border-2 border-white/40 focus-within:border-yellow-400 transition-colors overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleFocus}
                  placeholder="Search products, categories..."
                  className="flex-1 px-5 py-2.5 text-sm text-gray-700 bg-white outline-none placeholder-gray-400"
                />
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-5 flex items-center justify-center transition-colors" aria-label="Search">
                  <Search className="w-4 h-4 text-gray-900" />
                </button>
              </form>
              <SearchDropdown />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto sm:ml-0">
            {/* Add Product — vendor only */}
            {user?.role === 'vendor' && (
              <Link href="/user/dashboard/vendor/products/create"
                className="hidden sm:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/20 dark:hover:bg-white/30 border border-gray-300 dark:border-white/40 text-gray-700 dark:text-white text-xs font-bold px-3 py-2 rounded-full transition-colors flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </Link>
            )}

            {/* Wishlist */}
            {user && (
              <Link href="/wishlist" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-blue-900/30 transition-colors group">
                <Heart className="w-5 h-5 text-gray-600 dark:text-white" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {user && <NotificationBell userId={String(user.id)} />}

            {/* Dark mode toggle */}
            <ThemeToggle />

            <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-white/30 mx-1" />

            <div className="hidden sm:flex items-center">
              {renderAuthLinks()}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen
                ? <X className="w-5 h-5 text-gray-600 dark:text-white" />
                : <Menu className="w-5 h-5 text-gray-600 dark:text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Search ── */}
      <div className="sm:hidden bg-[#399edc] border-b border-white/20 px-4 py-2">
        <div ref={mobileRef} className="relative">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}
            className="flex rounded-full border-2 border-white/40 overflow-hidden focus-within:border-yellow-400 transition-colors">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-white text-gray-700 placeholder-gray-400"
            />
            <button type="submit" className="bg-yellow-400 px-4 flex items-center justify-center">
              <Search className="w-4 h-4 text-gray-900" />
            </button>
          </form>
          <SearchDropdown />
        </div>
      </div>

      {/* ── Category Nav Row ── */}
      <nav className="bg-[#399edc] shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-5 h-11 overflow-x-auto sm:overflow-visible scrollbar-hide">
          <Link
            href="/products/shop"
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full flex-shrink-0 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Shop
          </Link>

          <div className="h-4 w-px bg-white/30 flex-shrink-0" />

          {[
            { href: '/products/shop/category/business/SME',   label: 'SME',   full: 'Small & Medium Enterprise' },
            { href: '/products/shop/category/business/SOHO',  label: 'SOHO',  full: 'Small Office / Home Office' },
            { href: '/products/shop/category/business/MICRO', label: 'Micro', full: 'Micro (< 10 employees)' },
            { href: '/products/shop/category/business/MACRO', label: 'Macro', full: 'Macro (large-scale)' },
          ].map(({ href, label, full }) => (
            <div key={href} className="relative group flex-shrink-0">
              <Link
                href={href}
                className="text-xs font-semibold text-white/80 hover:text-white whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-yellow-400 pb-0.5 block"
              >
                {label}
              </Link>
              <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-[200] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-gray-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {full}
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </div>
          ))}

          <div className="h-4 w-px bg-white/30 flex-shrink-0" />
          <Link href="/blog" className="text-xs font-semibold text-white/80 hover:text-white whitespace-nowrap flex-shrink-0 transition-colors">Blog</Link>
          <Link href="/mentors" className="text-xs font-semibold text-white/80 hover:text-white whitespace-nowrap flex-shrink-0 transition-colors">Mentors</Link>

          <div className="ml-auto hidden sm:flex items-center gap-1 text-xs text-white/60 flex-shrink-0">
            <span className="font-semibold text-white/80">Support 24/7</span>
            <span>· +232 79 366 751</span>
          </div>
        </div>
      </nav>

      {/* ── Mobile Dropdown ── */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/products/shop', label: 'Store' },
              { href: '/blog', label: 'Blog' },
              { href: '/mentors', label: 'Mentors' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#eef7fd] dark:hover:bg-[#1a5a8a]/30 hover:text-[#2d8bc8] rounded-lg transition-colors">
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              {renderAuthLinks()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
