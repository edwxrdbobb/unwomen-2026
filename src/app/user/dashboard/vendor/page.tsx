'use client'

import Link from 'next/link'
import { Package, PlusCircle, ArrowRight, Tag, MapPin, TrendingUp, ShoppingBag } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function VendorDashboardPage() {
  const { user } = useAuth()
  const vendorId = user ? String(user.id) : ''

  const products = useQuery(api.products.listByVendor, vendorId ? { vendorUserId: vendorId } : 'skip')
  const profile = useQuery(api.profiles.get, vendorId ? { userId: vendorId } : 'skip')

  const productCount = products?.length ?? 0
  const recentProducts = products?.slice(0, 5) ?? []
  const categories = [...new Set(products?.map((p) => p.category) ?? [])]

  return (
    <div className="space-y-8 max-w-5xl">
      <Toaster position="top-right" />

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm font-medium">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name ?? 'Vendor'}</h1>
        <p className="text-white/70 text-sm mt-1">
          {profile?.bio ?? 'Complete your profile to attract more customers.'}
        </p>
        {!profile?.bio && (
          <Link href="/user/dashboard/vendor/profile"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
            Complete profile <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Total Products" value={productCount}
          sub="across all categories" color="bg-blue-50 dark:bg-blue-900/30 text-blue-500" />
        <StatCard icon={Tag} label="Categories" value={categories.length}
          sub="product categories" color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500" />
        <StatCard icon={TrendingUp} label="Profile Status"
          value={profile?.isVerified ? 'Verified' : 'Pending'}
          sub={profile?.isVerified ? 'Your profile is verified' : 'Awaiting verification'}
          color={profile?.isVerified ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/user/dashboard/vendor/products/create"
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 bg-yellow-400 group-hover:bg-yellow-500 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
            <PlusCircle className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Add New Product</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">List a product for sale</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link href="/user/dashboard/vendor/products"
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Manage Products</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{productCount} products listed</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Products</h2>
          <Link href="/user/dashboard/vendor/products" className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {products === undefined ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No products yet.</p>
            <Link href="/user/dashboard/vendor/products/create"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue-500 hover:text-blue-600">
              Add your first product <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 px-6 py-4">
                <img
                  src={product.imageUrls[0] ?? '/placeholder.svg'}
                  alt={product.productName}
                  className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.productName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{product.category}</span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />{product.productLocation}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Le {product.currentPrice.toLocaleString()}</p>
                  {product.previousPrice > product.currentPrice && (
                    <p className="text-xs text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</p>
                  )}
                </div>
                <Link href={`/user/dashboard/vendor/products/edit/${product._id}`}
                  className="ml-2 text-xs text-blue-500 hover:text-blue-600 font-medium flex-shrink-0">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
