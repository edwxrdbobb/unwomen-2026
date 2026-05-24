'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import Link from 'next/link'
import Loader from '@/components/Loader'
import { Heart, MapPin, Tag, CheckCircle, ArrowRight, Share2, MessageCircle, Copy, X, Send } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface WishlistItem { id: string; uuid: string; productName: string; price: number; image: string; category?: string }

function VendorCard({ profile }: { profile: ReturnType<typeof useQuery<typeof api.profiles.get>> }) {
  if (profile === undefined) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  )
  if (!profile) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900/30" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900/30">
              <span className="text-lg font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile.name}</p>
            {profile.isVerified && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{profile.role}</p>
          {profile.location && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{profile.location}
            </p>
          )}
        </div>
        <Link href={`/user/${profile._id}`}
          className="flex items-center gap-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
          View Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

function ShareModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Share this product</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
            <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate">{url}</p>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>

          {/* Social sharing */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Share on</p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
            >
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">WhatsApp</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Send className="w-6 h-6 text-blue-500" />
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Telegram</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="w-6 h-6 flex items-center justify-center text-gray-900 dark:text-white font-black text-base">𝕏</span>
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Twitter / X</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatModal({ profile, onClose }: {
  profile: { name: string; whatsappNumber?: string; telegramUsername?: string; email: string }
  onClose: () => void
}) {
  const hasWhatsapp = !!profile.whatsappNumber
  const hasTelegram = !!profile.telegramUsername

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Contact {profile.name}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="space-y-2">
            {hasWhatsapp && (
              <a
                href={`https://wa.me/${profile.whatsappNumber!.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{profile.whatsappNumber}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-green-500 ml-auto" />
              </a>
            )}
            {hasTelegram && (
              <a
                href={`https://t.me/${profile.telegramUsername!.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Telegram</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{profile.telegramUsername!.replace(/^@/, '')}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 ml-auto" />
              </a>
            )}
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base">✉️</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailsPage() {
  const params = useParams()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw

  const product = useQuery(api.products.getById, id ? { id: String(id) } : 'skip')
  const vendorProfile = useQuery(api.profiles.get, product?.vendorUserId ? { userId: product.vendorUserId } : 'skip')

  const [currentImage, setCurrentImage] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setIsInWishlist(wishlist.some((i: WishlistItem) => i.id === product._id))
    }
  }, [product])

  const toggleWishlist = () => {
    if (!product) return
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (isInWishlist) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist.filter((i: WishlistItem) => i.id !== product._id)))
      setIsInWishlist(false)
      toast.success('Removed from wishlist')
    } else {
      wishlist.push({ id: product._id, uuid: product._id, productName: product.productName,
        price: product.currentPrice, image: product.imageUrls[0] ?? '/placeholder.svg', category: product.category })
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
      setIsInWishlist(true)
      toast.success('Added to wishlist!')
    }
    window.dispatchEvent(new Event('storage'))
  }

  if (!id) return <div className="p-6 text-gray-500">Invalid product link.</div>
  if (product === undefined) return <Loader />
  if (!product) return <div className="p-6 text-gray-500">Product not found.</div>

  const images = product.imageUrls.length > 0 ? product.imageUrls : ['/placeholder.svg']
  const discount = product.previousPrice > product.currentPrice
    ? Math.round(((product.previousPrice - product.currentPrice) / product.previousPrice) * 100)
    : 0

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      {showShare && (
        <ShareModal
          url={pageUrl}
          title={product.productName}
          onClose={() => setShowShare(false)}
        />
      )}
      {showChat && vendorProfile && (
        <ChatModal
          profile={{
            name: vendorProfile.name,
            whatsappNumber: vendorProfile.whatsappNumber,
            telegramUsername: vendorProfile.telegramUsername,
            email: vendorProfile.email,
          }}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-blue-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products/shop" className="hover:text-blue-500 transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/products/shop/category/${product.category}`} className="hover:text-blue-500 transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{product.productName}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-card aspect-square">
              <img src={images[currentImage]} alt={product.productName}
                className="w-full h-full object-cover" />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      i === currentImage
                        ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                        : 'opacity-60 hover:opacity-100 ring-1 ring-gray-200 dark:ring-gray-600'
                    }`}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Details ── */}
          <div className="space-y-5">
            {/* Category + Location */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/products/shop/category/${product.category}`}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2.5 py-1 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
                <Tag className="w-3 h-3" /> {product.category}
              </Link>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" /> {product.productLocation}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
              {product.productName}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                Le {product.currentPrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Wishlist */}
            <button onClick={toggleWishlist}
              className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                isInWishlist
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 ring-2 ring-red-200 dark:ring-red-800'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
              }`}>
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500' : ''}`} />
              {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Description</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.discription}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={() => {
                  if (vendorProfile) {
                    setShowChat(true)
                  } else {
                    toast('Loading seller info...')
                  }
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300">
                <MessageCircle className="w-4 h-4" /> Chat with Seller
              </button>
            </div>

            {/* Vendor card */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Sold by</p>
              <VendorCard profile={vendorProfile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
