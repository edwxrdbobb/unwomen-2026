'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import Loader from '@/components/Loader'
import Link from 'next/link'
import { MapPin, Mail, Phone, Globe, CheckCircle, ArrowRight, Building2, Tag, ShoppingBag, User } from 'lucide-react'
import FollowButton from '@/components/FollowButton'

function OwnerProfileSection({ userId }: { userId: string }) {
  const profile = useQuery(api.profiles.get, { userId })

  if (profile === undefined) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden animate-pulse">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-6 flex gap-5">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
  if (!profile) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Business Owner</p>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900/30" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900/30">
                <User className="w-8 h-8 text-gray-400 dark:text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{profile.name}</h3>
              {profile.isVerified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{profile.role}</p>

            {profile.location && (
              <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {profile.location}
              </p>
            )}
            {profile.phoneNo && (
              <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <a href={`tel:${profile.phoneNo}`} className="hover:text-blue-500 transition-colors">{profile.phoneNo}</a>
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            {profile.bio}
          </p>
        )}

        {profile.expertise && (
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">Expertise</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link href={`/user/${profile._id}`}
          className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-colors w-full">
          <User className="w-3.5 h-3.5" /> View Full Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

function VendorProductsSection({ vendorUserId, vendorName }: { vendorUserId: string; vendorName?: string }) {
  const products = useQuery(api.products.listByVendor, { vendorUserId })

  if (products === undefined) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Products</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse aspect-square" />
          ))}
        </div>
      </div>
    </div>
  )

  if (!products || products.length === 0) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-5 text-center py-10">
        <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No products listed yet</p>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Products by {vendorName ?? 'this vendor'}
          </p>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{products.length} listing{products.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((product) => {
            const img = product.imageUrls[0] ?? '/placeholder.svg'
            const pct = product.previousPrice > product.currentPrice
              ? Math.round(((product.previousPrice - product.currentPrice) / product.previousPrice) * 100)
              : 0
            return (
              <Link key={product._id} href={`/products/${product._id}`} className="group">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={img} alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {pct > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{pct}%</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">
                      {product.productName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        Le {product.currentPrice.toLocaleString()}
                      </span>
                      {product.previousPrice > product.currentPrice && (
                        <span className="text-[10px] text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full mt-1.5">
                      <Tag className="w-2.5 h-2.5" />{product.category}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function BusinessDetailsPage() {
  const params = useParams()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw

  const business = useQuery(api.businesses.getById, id ? { id: String(id) } : 'skip')

  if (!id) return <div className="p-6 text-gray-500">Invalid link.</div>
  if (business === undefined) return <Loader />
  if (!business) return <div className="p-6 text-gray-500">Business not found.</div>

  const primaryImage = business.imageUrls[0] ?? '/placeholder.svg'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img src={primaryImage} alt={business.businessName}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 max-w-screen-xl mx-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-yellow-400 text-gray-900 px-2.5 py-1 rounded-full mb-2">
            <Building2 className="w-3 h-3" /> {business.category}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">{business.businessName}</h1>
          {business.businessLocation && (
            <p className="flex items-center gap-1 text-white/70 text-sm mt-1">
              <MapPin className="w-4 h-4" /> {business.businessLocation}
            </p>
          )}
          <div className="mt-3">
            <FollowButton targetId={business.vendorUserId} targetType="vendor" />
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Images + Owner Profile ── */}
          <div className="space-y-4">
            {/* Additional images */}
            {business.imageUrls.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                {business.imageUrls.slice(1).map((url, i) => (
                  <img key={i} src={url} alt={`${business.businessName} ${i + 2}`}
                    className="w-full aspect-square object-cover rounded-2xl bg-gray-100 dark:bg-gray-700" />
                ))}
              </div>
            )}

            {/* Expanded owner profile */}
            <OwnerProfileSection userId={business.vendorUserId} />
          </div>

          {/* ── Right: Details + Products ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
              <div className="p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">About this business</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{business.description}</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
              <div className="p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Contact & Location</h3>
                <div className="space-y-3">
                  {business.businessLocation && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{business.businessLocation}</span>
                    </div>
                  )}
                  {business.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <a href={`mailto:${business.contactEmail}`}
                        className="text-sm text-blue-500 hover:underline">{business.contactEmail}</a>
                    </div>
                  )}
                  {business.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-blue-500" />
                      </div>
                      <a href={`tel:${business.contactPhone}`}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">{business.contactPhone}</a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-blue-500" />
                      </div>
                      <a href={business.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline truncate">{business.website}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor products */}
            <VendorProductsSection vendorUserId={business.vendorUserId} />
          </div>
        </div>
      </div>
    </div>
  )
}
