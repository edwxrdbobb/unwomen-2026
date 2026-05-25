'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CheckCheck, Megaphone, Package, UserPlus, CheckCircle, X } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { Id } from '@cvx/_generated/dataModel'
import Link from 'next/link'

type NotifType = 'broadcast' | 'new_follower' | 'new_product' | 'account_approved'

interface Notification {
  _id: Id<'notifications'>
  userId: string
  type: NotifType
  title: string
  body: string
  read: boolean
  createdAt: number
  relatedProductId?: Id<'products'>
  relatedBusinessId?: Id<'businesses'>
  fromUserId?: string
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function NotifIcon({ type }: { type: NotifType }) {
  const cls = 'w-4 h-4 flex-shrink-0'
  switch (type) {
    case 'broadcast':    return <Megaphone className={`${cls} text-yellow-500`} />
    case 'new_follower': return <UserPlus className={`${cls} text-blue-500`} />
    case 'new_product':  return <Package className={`${cls} text-green-500`} />
    case 'account_approved': return <CheckCircle className={`${cls} text-emerald-500`} />
  }
}

function linkForNotif(n: Notification): string | null {
  if (n.type === 'new_product' && n.relatedProductId) return `/products/${n.relatedProductId}`
  if (n.type === 'new_follower' && n.fromUserId) return `/user/${n.fromUserId}`
  return null
}

interface Props {
  userId: string
}

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const notifications = useQuery(api.notifications.listByUser, { userId }) as Notification[] | undefined
  const unread = useQuery(api.notifications.unreadCount, { userId }) ?? 0
  const markRead = useMutation(api.notifications.markRead)
  const markAllRead = useMutation(api.notifications.markAllRead)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => setOpen((v) => !v)

  const handleItemClick = (n: Notification) => {
    if (!n.read) markRead({ id: n._id, userId })
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-blue-900/30 transition-colors"
        aria-label="Notifications"
      >
        {unread > 0
          ? <BellRing className="w-5 h-5 text-gray-600 dark:text-white" />
          : <Bell className="w-5 h-5 text-gray-600 dark:text-white" />
        }
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[300]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={() => markAllRead({ userId })}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
            {!notifications && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notifications && notifications.length === 0 && (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No notifications yet</p>
              </div>
            )}

            {notifications && notifications.map((n) => {
              const href = linkForNotif(n)
              const content = (
                <div
                  className={`flex gap-3 px-4 py-3 transition-colors ${
                    n.read
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    n.read
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'bg-white dark:bg-gray-700 shadow-sm'
                  }`}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-snug ${n.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              )

              return href ? (
                <Link key={n._id} href={href} onClick={() => handleItemClick(n)}>
                  {content}
                </Link>
              ) : (
                <div key={n._id} className="cursor-default" onClick={() => handleItemClick(n)}>
                  {content}
                </div>
              )
            })}
          </div>

          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · {unread} unread
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
