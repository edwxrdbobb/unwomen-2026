'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import Loader from '@/components/Loader'
import { Package, MapPin, Tag, DollarSign, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { MultiImageUpload } from '@/components/ui/ImageUpload'
import { cleanError } from '@/utils/formatError'

const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide"
const inputClass = "w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw
  const updateProduct = useMutation(api.products.update)
  const convexRow = useQuery(api.products.getById, id ? { id: String(id) } : 'skip')
  const categories = useQuery(api.categories.list) ?? []

  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    productName: '', productLocation: '', category: '', discription: '',
    previousPrice: '', currentPrice: '',
  })
  const [initialized, setInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (convexRow && !initialized) {
      setFormData({
        productName: convexRow.productName, productLocation: convexRow.productLocation,
        category: convexRow.category, discription: convexRow.discription,
        previousPrice: String(convexRow.previousPrice), currentPrice: String(convexRow.currentPrice),
      })
      setImageUrls(convexRow.imageUrls ?? [])
      setInitialized(true)
    }
  }, [convexRow, initialized])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !convexRow) return
    setIsLoading(true)
    try {
      if (imageUrls.length === 0) { toast.error('Add at least one product image.'); return }
      await updateProduct({
        id: convexRow._id, vendorUserId: String(user.id),
        productName: formData.productName, productLocation: formData.productLocation,
        category: formData.category, discription: formData.discription,
        currentPrice: parseFloat(formData.currentPrice) || 0,
        previousPrice: parseFloat(formData.previousPrice) || 0,
        imageUrls,
      })
      toast.success('Product updated!')
      router.push('/user/dashboard/vendor/products')
    } catch (err) {
      toast.error(cleanError(err, 'Could not update product.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!id) return <div className="p-6 text-gray-500">Invalid product link.</div>
  if (convexRow === undefined) return <Loader />
  if (!convexRow) return <div className="p-6 text-gray-500">Product not found.</div>

  return (
    <div className="max-w-2xl">
      <Toaster position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your product details</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Product Name</label>
            <div className="relative">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required
                className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select name="category" value={formData.category} onChange={handleChange} required
                  className={`${inputClass} pl-10 appearance-none`}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="productLocation" value={formData.productLocation} onChange={handleChange} required
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Current Price (NLE)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required
                  min="0" step="0.01" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Previous Price (NLE)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" name="previousPrice" value={formData.previousPrice} onChange={handleChange} required
                  min="0" step="0.01" className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea name="discription" value={formData.discription} onChange={handleChange} required rows={3}
                className={`${inputClass} pl-10 resize-none`} />
            </div>
          </div>

          <div>
            <MultiImageUpload
              values={imageUrls}
              onChange={setImageUrls}
              folder="unwomen/products"
              max={4}
              label="Product Images (up to 4)"
              watermark
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Saving...</>
                : <>Save Changes <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-3 rounded-full border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
