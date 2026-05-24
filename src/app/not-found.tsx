import Link from 'next/link'
import { Search, Home, ShoppingBag, Users } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8 select-none">
          <p className="text-[120px] sm:text-[160px] font-black text-gray-100 dark:text-gray-800 leading-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg rotate-6">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try one of the links below.
        </p>

        {/* Primary CTA */}
        <Link href="/"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3.5 rounded-full text-sm transition-colors shadow-sm mb-8">
          <Home className="w-4 h-4" /> Back to Home
        </Link>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <Link href="/products/shop"
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover p-4 text-left transition-all group">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
              <ShoppingBag className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Shop</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Browse products</p>
            </div>
          </Link>

          <Link href="/categories"
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover p-4 text-left transition-all group">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
              <Search className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Categories</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Find by type</p>
            </div>
          </Link>

          <Link href="/mentors"
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover p-4 text-left transition-all group">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
              <Users className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Mentors</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Find a mentor</p>
            </div>
          </Link>

          <Link href="/blog"
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover p-4 text-left transition-all group">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
              <Home className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Blog</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Read stories</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
