'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  style?: React.CSSProperties
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

const ICON_CLASSES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
}

/**
 * Avatar with graceful fallback:
 * - Shows profile image if available and loads successfully
 * - Falls back to the first letter of the user's name on a branded background
 * - Falls back to a User icon if no name is available
 */
export function Avatar({ src, name, className = '', size = 'md', style }: AvatarProps) {
  const [failed, setFailed] = useState(false)

  const sizeClass = SIZE_CLASSES[size]
  const iconClass = ICON_CLASSES[size]
  const initial = name?.trim().charAt(0).toUpperCase()

  if (!src || failed) {
    return (
      <div
        className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none ${sizeClass} ${className}`}
        style={{ backgroundColor: '#399edc', ...style }}
      >
        {initial ? (
          <span>{initial}</span>
        ) : (
          <User className={`${iconClass} opacity-80`} />
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name ?? 'User'}
      className={`rounded-full object-cover flex-shrink-0 ${sizeClass} ${className}`}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}
