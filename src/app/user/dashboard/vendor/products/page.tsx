'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Edit2, Trash2, PlusCircle, Package, MapPin, Tag } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import type { Id } from '@cvx/_generated/dataModel'

export default function ProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const vendorId = user ? String(user.id) : ''
  const rows = useQuery(api.products.listByVendor, vendorId ? { vendorUserId: vendorId } : 'skip')
  const removeProduct = useMutation(api.products.remove)

  const products = useMemo(() => {
    if (!rows) return []
    return rows.map((doc) => ({
      convexId: doc._id, id: String(doc._id),
      productName: doc.productName, productLocation: doc.productLocation,
      category: doc.category, currentPrice: doc.currentPrice,
      previousPrice: doc.previousPrice, thumb: doc.imageUrls[0] ?? '/placeholder.svg',
    }))
  }, [rows])

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: Id<'products'>) => {
    if (!vendorId || !confirm('Delete this product?')) return
    setDeleting(String(id))
    try {
      await removeProduct({ id, vendorUserId: vendorId })
      toast.success('Product deleted.')
    } catch {
      toast.error('Could not delete product.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        <Link href="/user/dashboard/vendor/products/create"
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Loading */}
      {rows === undefined && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {rows !== undefined && filtered.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card py-16 text-center">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {searchTerm ? 'No products match your search.' : 'No products yet.'}
          </p>
          {!searchTerm && (
            <Link href="/user/dashboard/vendor/products/create"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue-500 hover:text-blue-600">
              Add your first product →
            </Link>
          )}
        </div>
      )}

      {/* Product Cards */}
      {filtered.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <img src={product.thumb} alt={product.productName}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.productName}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">
                      <Tag className="w-3 h-3" />{product.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />{product.productLocation}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 mr-4">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Le {product.currentPrice.toLocaleString()}</p>
                  {product.previousPrice > product.currentPrice && (
                    <p className="text-xs text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => router.push(`/user/dashboard/vendor/products/edit/${product.convexId}`)}
                    className="p-2 rounded-xl text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.convexId)}
                    disabled={deleting === product.id}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
