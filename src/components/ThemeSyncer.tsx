'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

/**
 * Invisible component that syncs the user's saved theme from Convex
 * to the local ThemeContext when they log in or switch devices.
 * Place inside both AuthProvider and ConvexClientProvider.
 */
export default function ThemeSyncer() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const metadata = useQuery(api.userMetadata.get, user ? { userId: user.id } : 'skip')
  const synced = useRef(false)

  useEffect(() => {
    // Only apply the Convex theme once per login session,
    // so subsequent local toggles are not overridden by stale data.
    if (!synced.current && metadata?.theme && metadata.theme !== theme) {
      setTheme(metadata.theme)
      synced.current = true
    }
    // Reset the sync flag when user logs out
    if (!user) synced.current = false
  }, [metadata, user]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
