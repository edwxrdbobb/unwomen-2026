'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import Link from 'next/link'
import Loader from '@/components/Loader'
import { CheckCircle, MapPin, Briefcase, Phone, Mail, Tag, Heart, Package } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

interface WishlistItem { id: string; uuid: string; productName: string; price: number; image: string; category?: string }

export default function UserPublicProfile() {
  const params = useParams()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw

  const profile = useQuery(api.profiles.getById, id ? { id: String(id) } : 'skip')
  const products = useQuery(
    api.products.listByVendor,
    profile?.role === 'vendor' && profile?.userId ? { vendorUserId: profile.userId } : 'skip'
  )

  if (!id) return <div className="p-6 text-gray-500">Invalid profile link.</div>
  if (profile === undefined) return <Loader />
  if (!profile) return <div className="p-6 text-gray-500">User not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/30" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/30">
                  <span className="text-3xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {profile.isVerified && (
                <CheckCircle className="absolute -bottom-1 -right-1 w-7 h-7 text-green-500 bg-white dark:bg-gray-800 rounded-full p-0.5" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2.5 py-1 rounded-full capitalize">
                  {profile.role}
                </span>
                {profile.isVerified && (
                  <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              {profile.expertise && (
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> {profile.expertise}
                </p>
              )}
              {profile.location && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </p>
              )}
              {profile.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-xl leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {profile.email}
                  </a>
                )}
                {profile.phoneNo && (
                  <a href={`tel:${profile.phoneNo}`}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {profile.phoneNo}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products section (vendors only) */}
      {profile.role === 'vendor' && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> Products
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {products ? `${products.length} listed` : 'Loading...'}
              </p>
            </div>
          </div>

          {products === undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card animate-pulse overflow-hidden">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {products !== undefined && products.length === 0 && (
            <div className="py-16 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-card">
              <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No products listed yet.</p>
            </div>
          )}

          {products !== undefined && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: {
  product: { _id: string; productName: string; currentPrice: number; previousPrice: number; category: string; productLocation: string; imageUrls: string[] }
}) {
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false
    const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
    return w.some((i: WishlistItem) => i.id === product._id)
  })

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (wishlisted) {
      localStorage.setItem('wishlist', JSON.stringify(w.filter((i: WishlistItem) => i.id !== product._id)))
      setWishlisted(false)
      toast.success('Removed from wishlist')
    } else {
      w.push({ id: product._id, uuid: product._id, productName: product.productName,
        price: product.currentPrice, image: product.imageUrls[0] ?? '/placeholder.svg', category: product.category })
      localStorage.setItem('wishlist', JSON.stringify(w))
      setWishlisted(true)
      toast.success('Added to wishlist!')
    }
    window.dispatchEvent(new Event('storage'))
  }

  const img = product.imageUrls[0] ?? '/placeholder.svg'
  const pct = product.previousPrice > product.currentPrice
    ? Math.round(((product.previousPrice - product.currentPrice) / product.previousPrice) * 100) : 0

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
        <div className="relative overflow-hidden h-44 bg-gray-50 dark:bg-gray-700">
          <img src={img} alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {pct > 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{pct}%</span>
          )}
          <button onClick={toggle}
            className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-1">{product.productName}</h3>
          <div className="flex items-baseline gap-1.5 mt-auto pt-2">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Le {product.currentPrice.toLocaleString()}</span>
            {pct > 0 && <span className="text-xs text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</span>}
          </div>
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Tag className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="text-[10px] text-blue-500 font-medium truncate">{product.category}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
