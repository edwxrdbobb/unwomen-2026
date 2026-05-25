'use client'

import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const upsertMeta = useMutation(api.userMetadata.upsert)

  const handleToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    toggle()
    if (user) {
      upsertMeta({ userId: user.id, theme: next }).catch(() => {})
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
    >
      {theme === 'dark'
        ? <Sun className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5 text-gray-600" />}
    </button>
  )
}
