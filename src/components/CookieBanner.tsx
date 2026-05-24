'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { Cookie, X, ShieldCheck } from 'lucide-react'

const CONSENT_KEY = 'cookieConsent'

export default function CookieBanner() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const upsertMeta = useMutation(api.userMetadata.upsert)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) setVisible(true)
  }, [])

  const dismiss = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(CONSENT_KEY, choice)
    if (user) {
      upsertMeta({ userId: user.id, cookieConsent: choice }).catch(() => {})
    }
    setLeaving(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[999] p-4 transition-transform duration-300 ${
        leaving ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Icon + text */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cookie className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    We use cookies &amp; local storage
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    UN Women Market Square uses cookies and browser storage to remember your preferences — including your theme (light/dark mode), wishlist, and recent searches — so your experience stays consistent across visits.
                    {user && ' As a logged-in user, your preferences are also synced across all your devices.'}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {[
                      'Authentication',
                      'Theme preference',
                      'Wishlist',
                      'Search history',
                    ].map((label) => (
                      <span key={label}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-2.5 h-2.5" /> {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => dismiss('accepted')}
                  className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm px-6 py-2.5 rounded-full transition-colors shadow-sm">
                  Accept All
                </button>
                <button
                  onClick={() => dismiss('declined')}
                  className="flex-1 sm:flex-none border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors">
                  Essential Only
                </button>
                <button
                  onClick={() => dismiss('declined')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
