'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Package, MapPin, Tag, DollarSign, FileText, ArrowLeft, ArrowRight, MessageCircle, Send, X, CheckCircle } from 'lucide-react'
import { MultiImageUpload } from '@/components/ui/ImageUpload'

const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide"
const inputClass = "w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"

function ContactPromptModal({ onSave, onSkip }: { onSave: (w: string, t: string) => Promise<void>; onSkip: () => void }) {
  const [whatsapp, setWhatsapp] = useState('')
  const [telegram, setTelegram] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!whatsapp.trim() && !telegram.trim()) {
      toast.error('Add at least one contact method')
      return
    }
    setSaving(true)
    await onSave(whatsapp.trim(), telegram.trim())
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">One more thing!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                Your product is live! Now let buyers know how to reach you. Add a WhatsApp number or Telegram username so customers can contact you directly.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+232 79 000 000 (include country code)"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Telegram Username</label>
              <div className="relative">
                <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)}
                  placeholder="username (without @)"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
              {saving
                ? <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> Save & Done</>}
            </button>
            <button onClick={onSkip}
              className="px-4 py-3 rounded-full border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Skip
            </button>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
            You can always update this in your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CreateProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const convex = useConvex()
  const createProduct = useMutation(api.products.create)
  const categories = useQuery(api.categories.list) ?? []
  const profile = useQuery(api.profiles.get, user ? { userId: user.id } : 'skip')

  const [isLoading, setIsLoading] = useState(false)
  const [showContactPrompt, setShowContactPrompt] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    productName: '', productLocation: '', discription: '', category: '',
    previousPrice: '', currentPrice: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('You must be logged in as a vendor.'); return }
    setIsLoading(true)
    try {
      if (imageUrls.length === 0) { toast.error('Add at least one product image.'); setIsLoading(false); return }
      await createProduct({
        vendorUserId: String(user.id),
        productName: formData.productName,
        productLocation: formData.productLocation,
        category: formData.category,
        discription: formData.discription,
        currentPrice: parseFloat(formData.currentPrice) || 0,
        previousPrice: parseFloat(formData.previousPrice) || 0,
        imageUrls,
      })
      toast.success('Product created!')

      // prompt for contact method if none set
      const hasContact = profile?.whatsappNumber || profile?.telegramUsername
      if (!hasContact) {
        setShowContactPrompt(true)
      } else {
        router.push('/user/dashboard/vendor/products')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create product.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSave = async (whatsappNumber: string, telegramUsername: string) => {
    if (!user) return
    try {
      await convex.mutation(api.profiles.update, {
        userId: user.id,
        whatsappNumber: whatsappNumber || undefined,
        telegramUsername: telegramUsername || undefined,
      })
      toast.success('Contact method saved!')
    } catch {
      toast.error('Could not save contact method')
    }
    router.push('/user/dashboard/vendor/products')
  }

  return (
    <div className="max-w-2xl">
      <Toaster position="top-right" />

      {showContactPrompt && (
        <ContactPromptModal
          onSave={handleContactSave}
          onSkip={() => router.push('/user/dashboard/vendor/products')}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below to list your product</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <form onSubmit={onSubmit} className="p-6 space-y-5">

          {/* Product Name */}
          <div>
            <label className={labelClass}>Product Name</label>
            <div className="relative">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required
                placeholder="e.g. Shea Butter Body Balm"
                className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
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

            {/* Location */}
            <div>
              <label className={labelClass}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="productLocation" value={formData.productLocation} onChange={handleChange} required
                  placeholder="e.g. Freetown"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Current Price */}
            <div>
              <label className={labelClass}>Current Price (NLE)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required
                  placeholder="0.00" min="0" step="0.01"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>

            {/* Previous Price */}
            <div>
              <label className={labelClass}>Previous Price (NLE)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" name="previousPrice" value={formData.previousPrice} onChange={handleChange} required
                  placeholder="0.00" min="0" step="0.01"
                  className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea name="discription" value={formData.discription} onChange={handleChange} required rows={3}
                placeholder="Describe your product..."
                className={`${inputClass} pl-10 resize-none`} />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <MultiImageUpload
              values={imageUrls}
              onChange={setImageUrls}
              folder="unwomen/products"
              max={4}
              label="Product Images (up to 4)"
            />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2 text-sm">
            {isLoading
              ? <><span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> Creating...</>
              : <>Create Product <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
