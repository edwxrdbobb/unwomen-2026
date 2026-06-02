"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConvex, useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { cleanError } from '@/utils/formatError'
import { toast } from 'react-hot-toast'

export default function CreateProfileForm() {
  const { user } = useAuth()
  const router = useRouter()
  const convex = useConvex()
  const existing = useQuery(api.profiles.get, user ? { userId: user.id } : 'skip')

  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    location: '',
    profileImageUrl: '',
    phoneNo: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setFormData({
        bio: existing.bio ?? '',
        expertise: existing.expertise ?? '',
        location: existing.location ?? '',
        profileImageUrl: existing.profileImageUrl ?? '',
        phoneNo: existing.phoneNo ?? '',
      })
    }
  }, [existing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await convex.mutation(api.profiles.update, {
        userId: user.id,
        bio: formData.bio || undefined,
        expertise: formData.expertise || undefined,
        location: formData.location || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        phoneNo: formData.phoneNo || undefined,
      })
      toast.success('Profile saved!')
      router.push('/user/dashboard/mentor/profile')
    } catch (err) {
      toast.error(cleanError(err, 'Could not save profile'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-400 focus:outline-none text-sm"

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {existing?.bio ? 'Edit Mentor Profile' : 'Create Your Mentor Profile'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio / About Me</label>
          <textarea id="bio" name="bio" rows={4} className={inputClass} value={formData.bio} onChange={handleChange} placeholder="Tell businesses about yourself..." />
        </div>
        <div>
          <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">Expertise & Skills</label>
          <input type="text" id="expertise" name="expertise" className={inputClass} value={formData.expertise} onChange={handleChange} placeholder="e.g. Business development, Finance, Marketing" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" id="location" name="location" className={inputClass} value={formData.location} onChange={handleChange} placeholder="Freetown, Sierra Leone" />
        </div>
        <div>
          <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input type="tel" id="phoneNo" name="phoneNo" className={inputClass} value={formData.phoneNo} onChange={handleChange} placeholder="+232 79 000 000" />
        </div>
        <div>
          <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
          <input type="url" id="profileImageUrl" name="profileImageUrl" className={inputClass} value={formData.profileImageUrl} onChange={handleChange} placeholder="https://..." />
        </div>
        <button type="submit" disabled={saving}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
