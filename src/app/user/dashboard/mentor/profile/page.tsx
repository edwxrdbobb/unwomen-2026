'use client'

import { useState, useEffect, useRef } from 'react'
import { useConvex, useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Mail, Phone, MapPin, FileText, Camera, Edit2, CheckCircle, ArrowRight, Briefcase } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import { cleanError } from '@/utils/formatError'

const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide"
const inputClass = "w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-[#66b9e8] transition-colors"

function resizeImage(file: File, maxPx = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function MentorProfilePage() {
  const { user } = useAuth()
  const convex = useConvex()
  const profile = useQuery(api.profiles.get, user ? { userId: user.id } : 'skip')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading: uploadingPhoto } = useCloudinaryUpload()

  const [formData, setFormData] = useState({ bio: '', location: '', phoneNo: '', expertise: '', profileImageUrl: '' })
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (profile) setFormData({
      bio: profile.bio ?? '', location: profile.location ?? '',
      phoneNo: profile.phoneNo ?? '', expertise: profile.expertise ?? '',
      profileImageUrl: profile.profileImageUrl ?? '',
    })
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    try {
      const url = await upload(file, 'unwomen/profiles')
      setFormData((prev) => ({ ...prev, profileImageUrl: url }))
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await convex.mutation(api.profiles.update, {
        userId: user.id,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        phoneNo: formData.phoneNo || undefined,
        expertise: formData.expertise || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
      })
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(cleanError(err, 'Could not update profile'))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div className="p-6 text-gray-500">Please log in.</div>
  if (profile === undefined) return (
    <div className="space-y-4 animate-pulse max-w-2xl">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  )

  const avatarUrl = editing ? formData.profileImageUrl : profile?.profileImageUrl

  return (
    <div className="max-w-2xl space-y-6">
      <Toaster position="top-right" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />

      {/* Avatar card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <Avatar src={avatarUrl} name={user.name} size="xl" className="ring-4 ring-[#d0eaf8] dark:ring-[#1a5a8a]/50" />
          {profile?.isVerified && !editing && (
            <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-green-500 bg-white dark:bg-gray-800 rounded-full" />
          )}
          {editing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#399edc] hover:bg-[#2d8bc8] rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-60"
              title="Change photo"
            >
              {uploadingPhoto
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />}
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h2>
          <span className="inline-flex items-center text-xs font-semibold bg-[#eef7fd] dark:bg-[#1a5a8a]/30 text-[#399edc] px-2.5 py-0.5 rounded-full capitalize mt-0.5">
            {user.role}
          </span>
          {profile?.isVerified && (
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified mentor
            </p>
          )}
          {profile?.expertise && !editing && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {profile.expertise}
            </p>
          )}
          {editing && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              Tap the camera icon to change your photo
            </p>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#399edc] hover:text-[#2d8bc8] bg-[#eef7fd] dark:bg-[#1a5a8a]/30 hover:bg-[#d0eaf8] px-3 py-2 rounded-xl transition-colors flex-shrink-0">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {/* Info / Edit form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#399edc] to-yellow-400" />

        {!editing ? (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Profile Details</h3>
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'Phone', value: profile?.phoneNo ?? user.phoneNo ?? '—' },
              { icon: MapPin, label: 'Location', value: profile?.location ?? user.location ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef7fd] dark:bg-[#1a5a8a]/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#399edc]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
                </div>
              </div>
            ))}
            {profile?.expertise && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef7fd] dark:bg-[#1a5a8a]/30 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-[#399edc]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Expertise</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{profile.expertise}</p>
                </div>
              </div>
            )}
            {profile?.bio && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef7fd] dark:bg-[#1a5a8a]/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#399edc]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Bio</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{profile.bio}</p>
                </div>
              </div>
            )}
            {!profile?.bio && !profile?.expertise && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No profile details yet. Click Edit to add your bio and expertise.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Expertise</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="expertise" value={formData.expertise} onChange={handleChange}
                  placeholder="e.g. Business Finance, Marketing Strategy..."
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange}
                  placeholder="Tell mentees about your background and how you can help..."
                  className={`${inputClass} pl-10 resize-none`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="Freetown, Sierra Leone" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleChange}
                  placeholder="+232 79 000 000" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <>Save Changes <ArrowRight className="w-4 h-4" /></>}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="px-5 py-3 rounded-full border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
