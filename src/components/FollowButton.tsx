'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  targetId: string
  targetType: 'vendor' | 'business'
  className?: string
}

export default function FollowButton({ targetId, targetType, className = '' }: Props) {
  const { user } = useAuth()
  const [pending, setPending] = useState(false)

  const followerId = user ? String(user.id) : null
  const isFollowing = useQuery(
    api.follows.isFollowing,
    followerId ? { followerId, targetId } : 'skip'
  )
  const followerCount = useQuery(api.follows.countFollowers, { targetId })
  const toggleFollow = useMutation(api.follows.toggle)

  if (!user) return null

  const handleClick = async () => {
    if (String(user.id) === targetId) return
    setPending(true)
    try {
      const result = await toggleFollow({
        followerId: String(user.id),
        targetId,
        targetType,
        followerName: user.name,
      })
      toast.success(result.following ? 'Following!' : 'Unfollowed')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setPending(false)
    }
  }

  const following = isFollowing ?? false

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleClick}
        disabled={pending || isFollowing === undefined || String(user.id) === targetId}
        className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
          following
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
        } disabled:opacity-50`}
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : following ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {following ? 'Following' : 'Follow'}
      </button>

      {followerCount !== undefined && followerCount > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {followerCount} follower{followerCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
