'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Building2, Trash2, Search, Globe, Mail, Phone, Pencil, Plus, X, Check } from 'lucide-react'
import type { Id } from '@cvx/_generated/dataModel'

const BUSINESS_CATEGORIES = ['SME', 'MACRO', 'MICRO', 'SOHO'] as const
const CATEGORY_COLORS: Record<string, string> = {
  SME:   'bg-blue-100 text-blue-700',
  MACRO: 'bg-amber-100 text-amber-700',
  MICRO: 'bg-emerald-100 text-emerald-700',
  SOHO:  'bg-violet-100 text-violet-700',
}

const blankBiz = {
  businessName: '', businessLocation: '', category: 'SME' as const,
  description: '', contactEmail: '', contactPhone: '', website: '',
}

type BizForm = typeof blankBiz
type EditBizForm = Omit<BizForm, 'category'> & { category: string }

export default function AdminBusinessesPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<BizForm & { vendorUserId: string }>({ ...blankBiz, vendorUserId: '' })
  const [editingId, setEditingId] = useState<Id<'businesses'> | null>(null)
  const [editForm, setEditForm] = useState<EditBizForm>({ ...blankBiz })
  const [saving, setSaving] = useState(false)

  const businesses = useQuery(api.businesses.list) ?? []
  const vendors = useQuery(api.admin.listAllUsers, { role: 'vendor' }) ?? []

  const filtered = businesses.filter(b => {
    const matchesCat = catFilter === 'all' || b.category === catFilter
    const matchesSearch = !search ||
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.businessLocation.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return
    if (!createForm.vendorUserId) { toast.error('Please select a vendor'); return }
    setSaving(true)
    try {
      await convex.mutation(api.businesses.create, {
        vendorUserId: createForm.vendorUserId,
        businessName: createForm.businessName,
        businessLocation: createForm.businessLocation,
        category: createForm.category,
        description: createForm.description,
        imageUrls: [],
        contactEmail: createForm.contactEmail || undefined,
        contactPhone: createForm.contactPhone || undefined,
        website: createForm.website || undefined,
      })
      toast.success('Business created!')
      setCreateForm({ ...blankBiz, vendorUserId: '' })
      setShowCreate(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create business')
    } finally { setSaving(false) }
  }

  const startEdit = (b: typeof businesses[0]) => {
    setEditForm({
      businessName: b.businessName,
      businessLocation: b.businessLocation,
      category: b.category,
      description: b.description,
      contactEmail: b.contactEmail ?? '',
      contactPhone: b.contactPhone ?? '',
      website: b.website ?? '',
    })
    setEditingId(b._id)
  }

  const handleEditSave = async (id: Id<'businesses'>) => {
    if (!admin) return
    setSaving(true)
    try {
      await convex.mutation(api.admin.updateBusiness, {
        id,
        adminUserId: String(admin.id),
        businessName: editForm.businessName || undefined,
        businessLocation: editForm.businessLocation || undefined,
        category: editForm.category || undefined,
        description: editForm.description || undefined,
        contactEmail: editForm.contactEmail || undefined,
        contactPhone: editForm.contactPhone || undefined,
        website: editForm.website || undefined,
      })
      toast.success('Business updated')
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update business')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: Id<'businesses'>, name: string) => {
    if (!confirm(`Delete business "${name}"? This cannot be undone.`)) return
    if (!admin) return
    try {
      await convex.mutation(api.admin.deleteBusiness, { id, adminUserId: String(admin.id) })
      toast.success('Business deleted')
    } catch { toast.error('Failed to delete business') }
  }

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
  }) => (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
    </div>
  )

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Businesses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{businesses.length} registered businesses</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ backgroundColor: '#399edc' }}>
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Cancel' : 'Add Business'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: '#399edc' }} /> New Business
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Vendor *</label>
                <select required value={createForm.vendorUserId} onChange={e => setCreateForm(p => ({ ...p, vendorUserId: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors">
                  <option value="">Select vendor…</option>
                  {vendors.map(v => <option key={v._id} value={v.userId}>{v.name} ({v.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Business Name *</label>
                <input required value={createForm.businessName} onChange={e => setCreateForm(p => ({ ...p, businessName: e.target.value }))}
                  placeholder="Aminata Fashion House"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Location *</label>
                <input required value={createForm.businessLocation} onChange={e => setCreateForm(p => ({ ...p, businessLocation: e.target.value }))}
                  placeholder="Freetown, Sierra Leone"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Category *</label>
                <select value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value as typeof blankBiz.category }))}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors">
                  {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Description *</label>
                <textarea required rows={2} value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the business"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Contact Email</label>
                <input type="email" value={createForm.contactEmail} onChange={e => setCreateForm(p => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="business@example.com"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Contact Phone</label>
                <input value={createForm.contactPhone} onChange={e => setCreateForm(p => ({ ...p, contactPhone: e.target.value }))}
                  placeholder="+232 79 000 000"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Website</label>
                <input value={createForm.website} onChange={e => setCreateForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: '#399edc' }}>
                {saving ? 'Creating…' : 'Create Business'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search businesses…"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-800 dark:text-white transition-colors" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'SME', 'MACRO', 'MICRO', 'SOHO'].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                catFilter === c ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={catFilter === c ? { backgroundColor: '#399edc' } : {}}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 py-16 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-card">
            <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No businesses found</p>
          </div>
        ) : filtered.map(b => (
          <div key={b._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            {editingId === b._id ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editing: {b.businessName}</h3>
                  <button onClick={() => setEditingId(null)}><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="space-y-2.5">
                  <InputField label="Business Name" value={editForm.businessName} onChange={v => setEditForm(p => ({ ...p, businessName: v }))} />
                  <InputField label="Location" value={editForm.businessLocation} onChange={v => setEditForm(p => ({ ...p, businessLocation: v }))} />
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Category</label>
                    <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors">
                      {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Description</label>
                    <textarea rows={2} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors resize-none" />
                  </div>
                  <InputField label="Email" value={editForm.contactEmail} onChange={v => setEditForm(p => ({ ...p, contactEmail: v }))} type="email" />
                  <InputField label="Phone" value={editForm.contactPhone} onChange={v => setEditForm(p => ({ ...p, contactPhone: v }))} />
                  <InputField label="Website" value={editForm.website} onChange={v => setEditForm(p => ({ ...p, website: v }))} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button disabled={saving} onClick={() => handleEditSave(b._id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-60 transition-colors"
                    style={{ backgroundColor: '#399edc' }}>
                    <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {b.imageUrls[0] ? (
                  <img src={b.imageUrls[0]} alt={b.businessName} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{b.businessName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[b.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{b.description}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>📍 {b.businessLocation}</p>
                    {b.contactEmail && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{b.contactEmail}</p>}
                    {b.contactPhone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{b.contactPhone}</p>}
                    {b.website && <p className="flex items-center gap-1"><Globe className="w-3 h-3" />{b.website}</p>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={() => startEdit(b)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#399edc] hover:bg-[#eef7fd] px-2 py-1 rounded-lg transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(b._id, b.businessName)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{filtered.length} business{filtered.length !== 1 ? 'es' : ''} shown</p>
    </div>
  )
}
