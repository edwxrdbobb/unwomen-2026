'use client'

import { useState } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Package, Trash2, Search, Image as ImageIcon, Pencil, Check, X } from 'lucide-react'
import { ProductImage } from '@/components/ui/ProductImage'
import type { Id } from '@cvx/_generated/dataModel'

type EditForm = {
  productName: string
  category: string
  currentPrice: string
  previousPrice: string
  productLocation: string
  discription: string
}

export default function AdminProductsPage() {
  const { user: admin } = useAuth()
  const convex = useConvex()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<Id<'products'> | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    productName: '', category: '', currentPrice: '', previousPrice: '', productLocation: '', discription: '',
  })
  const [saving, setSaving] = useState(false)

  const products = useQuery(api.products.list) ?? []
  const categories = useQuery(api.categories.list) ?? []

  const filtered = search
    ? products.filter(p =>
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products

  const startEdit = (p: typeof products[0]) => {
    setEditForm({
      productName: p.productName,
      category: p.category,
      currentPrice: String(p.currentPrice),
      previousPrice: String(p.previousPrice),
      productLocation: p.productLocation,
      discription: p.discription,
    })
    setEditingId(p._id)
  }

  const handleEditSave = async (id: Id<'products'>) => {
    if (!admin) return
    setSaving(true)
    try {
      await convex.mutation(api.admin.updateProduct, {
        id,
        adminUserId: String(admin.id),
        productName: editForm.productName || undefined,
        category: editForm.category || undefined,
        currentPrice: editForm.currentPrice ? Number(editForm.currentPrice) : undefined,
        previousPrice: editForm.previousPrice ? Number(editForm.previousPrice) : undefined,
        productLocation: editForm.productLocation || undefined,
        discription: editForm.discription || undefined,
      })
      toast.success('Product updated')
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: Id<'products'>, name: string) => {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return
    if (!admin) return
    try {
      await convex.mutation(api.admin.deleteProduct, { id, adminUserId: String(admin.id) })
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete product') }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} products on the platform</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-800 dark:text-white transition-colors" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map(p => (
                <>
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.imageUrls[0]} alt={p.productName}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{p.productName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{p.productLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Le {p.currentPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{p.productLocation}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editingId === p._id ? setEditingId(null) : startEdit(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            editingId === p._id
                              ? 'text-white bg-[#399edc]'
                              : 'text-gray-400 hover:text-[#399edc] hover:bg-[#eef7fd]'
                          }`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.productName)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingId === p._id && (
                    <tr key={`${p._id}-edit`} className="bg-[#eef7fd] dark:bg-[#1a3a50]/30">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                            <input value={editForm.productName} onChange={e => setEditForm(p => ({ ...p, productName: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                            <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors">
                              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                              <option value={editForm.category}>{editForm.category}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
                            <input value={editForm.productLocation} onChange={e => setEditForm(p => ({ ...p, productLocation: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Price (Le)</label>
                            <input type="number" value={editForm.currentPrice} onChange={e => setEditForm(p => ({ ...p, currentPrice: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Previous Price (Le)</label>
                            <input type="number" value={editForm.previousPrice} onChange={e => setEditForm(p => ({ ...p, previousPrice: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                            <input value={editForm.discription} onChange={e => setEditForm(p => ({ ...p, discription: e.target.value }))}
                              className="w-full px-3 py-1.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] bg-white dark:bg-gray-700 dark:text-white transition-colors" />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button disabled={saving} onClick={() => handleEditSave(p._id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-60 transition-colors"
                            style={{ backgroundColor: '#399edc' }}>
                            <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => setEditingId(null)}
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
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{filtered.length} product{filtered.length !== 1 ? 's' : ''} shown</p>
    </div>
  )
}
