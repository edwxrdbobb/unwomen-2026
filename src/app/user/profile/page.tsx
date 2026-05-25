"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { Avatar } from '@/components/ui/Avatar'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const profile = useQuery(api.profiles.get, user ? { userId: user.id } : 'skip')

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (!user) {
    return <div className="flex max-w-6xl mx-auto py-10 px-4 text-center text-lg text-gray-600">Please log in to view your profile.</div>
  }

  return (
    <div className="flex max-w-6xl mx-auto py-10 px-4">
      <aside className="w-1/4 p-4 border-r">
        <nav className="space-y-4">
          <button className="block w-full text-left p-2 text-gray-700 font-bold">Dashboard</button>
          <button onClick={() => router.push('/wishlist')} className="block w-full text-left p-2 text-gray-500">Wishlist</button>
          <button className="block w-full text-left p-2 text-gray-500">Settings</button>
          <button className="block w-full text-left p-2 text-red-500 hover:bg-red-50" onClick={handleLogout}>Log out</button>
        </nav>
      </aside>
      <main className="w-3/4 p-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Avatar src={profile?.profileImageUrl} name={user.name} size="xl" className="mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-[#2d8bc8]">{user.name}</h2>
                <p className="text-gray-600 capitalize">{user.role}</p>
                <button className="text-green-600 mt-2">Edit Profile</button>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-[#2d8bc8]">Contact Info</h3>
            {(profile?.location ?? user.location) && <p className="text-gray-600 my-2">{profile?.location ?? user.location}</p>}
            <p className="text-gray-600 my-2">{user.email}</p>
            {(profile?.phoneNo ?? user.phoneNo) && <p className="text-gray-600 my-2">{profile?.phoneNo ?? user.phoneNo}</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
