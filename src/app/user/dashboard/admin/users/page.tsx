'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Users, Plus, Shield, CheckCircle, Trash2, ChevronDown, X, Search, Pencil, Check } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

const ROLES = ['all', 'buyer', 'vendor', 'mentor', 'super_admin'] as const
type RoleFilter = typeof ROLES[number]

const ROLE_COLORS: Record<string, string> = {
  buyer:       'bg-sky-100 text-sky-700',
  vendor:      'bg-emerald-100 text-emerald-700',
  mentor:      'bg-violet-100 text-violet-700',
  super_admin: 'bg-rose-100 text-rose-700',
}

type EditForm = { name: string; email: string; phoneNo: string; location: string }

export default function AdminUsersPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', phoneNo: '', location: '' })
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'vendor' as const,
    phoneNo: '', location: '',
  })

  const users = useQuery(
    api.admin.listAllUsers,
    roleFilter === 'all' ? {} : { role: roleFilter as Exclude<RoleFilter, 'all'> }
  ) ?? []

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return
    setSaving(true)
    try {
      await convex.mutation(api.admin.createUser, {
        ...form,
        adminUserId: String(admin.id),
        phoneNo: form.phoneNo || undefined,
        location: form.location || undefined,
      })
      toast.success(`${form.role === 'super_admin' ? 'Admin' : form.role} user created!`)
      setForm({ name: '', email: '', password: '', role: 'vendor', phoneNo: '', location: '' })
      setShowCreate(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user')
    } finally { setSaving(false) }
  }

  const startEdit = (u: typeof users[0]) => {
    setEditForm({ name: u.name, email: u.email, phoneNo: u.phoneNo ?? '', location: u.location ?? '' })
    setEditingUserId(u.userId)
  }

  const handleEditSave = async (userId: string) => {
    if (!admin) return
    setSaving(true)
    try {
      await convex.mutation(api.admin.updateUser, {
        targetUserId: userId,
        adminUserId: String(admin.id),
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        phoneNo: editForm.phoneNo || undefined,
        location: editForm.location || undefined,
      })
      toast.success('User updated')
      setEditingUserId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user')
    } finally { setSaving(false) }
  }

  const handleVerify = async (targetUserId: string, isVerified: boolean) => {
    if (!admin) return
    try {
      await convex.mutation(api.profiles.setVerified, { targetUserId, adminUserId: String(admin.id), isVerified })
      toast.success(isVerified ? 'User verified' : 'Verification removed')
    } catch { toast.error('Failed to update verification') }
  }

  const handleRoleChange = async (targetUserId: string, role: string) => {
    if (!admin) return
    try {
      await convex.mutation(api.admin.updateUserRole, {
        targetUserId,
        role: role as 'buyer' | 'vendor' | 'mentor' | 'super_admin',
        adminUserId: String(admin.id),
      })
      toast.success('Role updated')
    } catch { toast.error('Failed to update role') }
  }

  const handleDelete = async (targetUserId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    if (!admin) return
    try {
      await convex.mutation(api.admin.deleteUser, { targetUserId, adminUserId: String(admin.id) })
      toast.success('User deleted')
    } catch { toast.error('Failed to delete user') }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage all platform users</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ backgroundColor: '#399edc' }}
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5" style={{ color: '#399edc' }} />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Create New User</h2>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Aminata Koroma"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Password *</label>
              <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as typeof form.role }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors">
                <option value="buyer">Buyer</option>
                <option value="vendor">Vendor</option>
                <option value="mentor">Mentor</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Phone</label>
              <input value={form.phoneNo} onChange={e => setForm(p => ({ ...p, phoneNo: e.target.value }))}
                placeholder="+232 79 000 000"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="Freetown, Sierra Leone"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: '#399edc' }}>
                {saving ? 'Creating...' : `Create ${form.role === 'super_admin' ? 'Admin' : form.role}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-800 dark:text-white transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                roleFilter === r
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={roleFilter === r ? { backgroundColor: '#399edc' } : {}}>
              {r === 'super_admin' ? 'Admins' : r === 'all' ? 'All' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Verified</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map(u => (
                <>
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profileImageUrl} name={u.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.userId, e.target.value)}
                          className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded-full cursor-pointer border-0 outline-none ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="vendor">Vendor</option>
                          <option value="mentor">Mentor</option>
                          <option value="super_admin">Admin</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{u.location ?? '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleVerify(u.userId, !u.isVerified)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          u.isVerified
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        <CheckCircle className="w-3 h-3" />
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editingUserId === u.userId ? setEditingUserId(null) : startEdit(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            editingUserId === u.userId
                              ? 'text-white bg-[#399edc]'
                              : 'text-gray-400 hover:text-[#399edc] hover:bg-[#eef7fd]'
                          }`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.userId !== String(admin?.id) && (
                          <button onClick={() => handleDelete(u.userId, u.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {editingUserId === u.userId && (
                    <tr key={`${u._id}-edit`} className="bg-[#eef7fd] dark:bg-[#1a3a50]/30">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                            <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                            <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                            <input value={editForm.phoneNo} onChange={e => setEditForm(p => ({ ...p, phoneNo: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
                            <input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button disabled={saving} onClick={() => handleEditSave(u.userId)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-60 transition-colors"
                            style={{ backgroundColor: '#399edc' }}>
                            <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => setEditingUserId(null)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white transition-colors">
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{filtered.length} user{filtered.length !== 1 ? 's' : ''} shown</p>
    </div>
  )
}
