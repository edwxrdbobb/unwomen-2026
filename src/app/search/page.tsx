'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Search, Clock, X, Package, Building2, MapPin, Tag, Heart, Trash2 } from 'lucide-react'

const LOCAL_HISTORY_KEY = 'searchHistory'

function getLocalHistory(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]') } catch { return [] }
}

function saveLocalHistory(query: string) {
  const h = getLocalHistory().filter(x => x.toLowerCase() !== query.toLowerCase())
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify([query, ...h].slice(0, 10)))
}

function ProductCard({ product }: {
  product: { _id: string; productName: string; currentPrice: number; previousPrice: number; category: string; productLocation: string; imageUrls: string[] }
}) {
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false
    const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
    return w.some((i: { id: string }) => i.id === product._id)
  })

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (wishlisted) {
      localStorage.setItem('wishlist', JSON.stringify(w.filter((i: { id: string }) => i.id !== product._id)))
    } else {
      w.push({ id: product._id, uuid: product._id, productName: product.productName, price: product.currentPrice, image: product.imageUrls[0] ?? '/placeholder.svg', category: product.category })
      localStorage.setItem('wishlist', JSON.stringify(w))
    }
    setWishlisted(!wishlisted)
    window.dispatchEvent(new Event('storage'))
  }

  const img = product.imageUrls[0] ?? '/placeholder.svg'
  const pct = product.previousPrice > product.currentPrice
    ? Math.round(((product.previousPrice - product.currentPrice) / product.previousPrice) * 100) : 0

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
        <div className="relative overflow-hidden h-44 bg-gray-50 dark:bg-gray-700">
          <img src={img} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {pct > 0 && <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{pct}%</span>}
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
            <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{product.productLocation}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function BusinessCard({ biz }: {
  biz: { _id: string; businessName: string; category: string; businessLocation: string; description: string; imageUrls: string[] }
}) {
  const img = biz.imageUrls[0] ?? '/placeholder.svg'
  return (
    <Link href={`/business/${biz._id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
        <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img src={img} alt={biz.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full">{biz.category}</span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{biz.businessName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">{biz.description}</p>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{biz.businessLocation}</p>
        </div>
      </div>
    </Link>
  )
}

function SearchContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const initialQ = params.get('q') ?? ''
  const [inputValue, setInputValue] = useState(initialQ)
  const [localHistory, setLocalHistory] = useState<string[]>([])

  const saveHistory = useMutation(api.search.saveHistory)
  const clearHistory = useMutation(api.search.clearHistory)
  const removeOne = useMutation(api.search.removeOne)
  const convexHistory = useQuery(api.search.listHistory, user ? { userId: String(user.id) } : 'skip')

  const products = useQuery(api.products.list)
  const businesses = useQuery(api.businesses.list)

  // Keep input in sync with URL
  useEffect(() => { setInputValue(initialQ) }, [initialQ])

  useEffect(() => { setLocalHistory(getLocalHistory()) }, [])

  const displayHistory = user
    ? (convexHistory ?? []).map(h => ({ id: h._id, query: h.query }))
    : localHistory.map(q => ({ id: q, query: q }))

  const q = initialQ.trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    if (!q || !products) return []
    return products.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.productLocation.toLowerCase().includes(q)
    )
  }, [products, q])

  const filteredBusinesses = useMemo(() => {
    if (!q || !businesses) return []
    return businesses.filter(b =>
      b.businessName.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.businessLocation.toLowerCase().includes(q)
    )
  }, [businesses, q])

  const totalResults = filteredProducts.length + filteredBusinesses.length
  const isLoading = q && (products === undefined || businesses === undefined)

  const handleSearch = (term: string = inputValue) => {
    const trimmed = term.trim()
    if (!trimmed) return
    saveLocalHistory(trimmed)
    setLocalHistory(getLocalHistory())
    if (user) {
      saveHistory({ userId: String(user.id), query: trimmed }).catch(() => {})
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const handleRemoveConvex = async (id: string) => {
    await removeOne({ id: id as Parameters<typeof removeOne>[0]['id'] })
  }

  const handleRemoveLocal = (query: string) => {
    const updated = localHistory.filter(h => h !== query)
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated))
    setLocalHistory(updated)
  }

  const handleClearAll = async () => {
    localStorage.setItem(LOCAL_HISTORY_KEY, '[]')
    setLocalHistory([])
    if (user) {
      await clearHistory({ userId: String(user.id) }).catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex gap-3">
            <div className="flex flex-1 rounded-full border-2 border-blue-400 dark:border-blue-500 focus-within:border-yellow-400 transition-colors overflow-hidden shadow-sm">
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search products, businesses, categories..."
                className="flex-1 px-5 py-3 text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-800 outline-none placeholder-gray-400"
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(''); router.push('/search') }}
                  className="px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-5 flex items-center justify-center transition-colors">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">

        {/* No query — show history */}
        {!q && (
          <div className="max-w-lg">
            {displayHistory.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> Recent searches
                  </h2>
                  <button onClick={handleClearAll}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                </div>
                <div className="space-y-1">
                  {displayHistory.map((item) => (
                    <div key={item.id}
                      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
                      onClick={() => handleSearch(item.query)}>
                      <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{item.query}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (user) handleRemoveConvex(item.id as string)
                          else handleRemoveLocal(item.query)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Search the marketplace</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find products, businesses, categories and more</p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card animate-pulse overflow-hidden">
                <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {q && !isLoading && (
          <div className="space-y-10">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-white">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for
              </p>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">&ldquo;{initialQ}&rdquo;</span>
            </div>

            {totalResults === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No results found</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Try a different search term or browse categories</p>
                <Link href="/products/shop"
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-full text-sm transition-colors">
                  Browse all products
                </Link>
              </div>
            )}

            {/* Products section */}
            {filteredProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" /> Products
                    <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2 py-0.5 rounded-full">
                      {filteredProducts.length}
                    </span>
                  </h2>
                  <Link href="/products/shop" className="text-xs text-blue-500 hover:text-blue-600 font-semibold">View all →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </section>
            )}

            {/* Businesses section */}
            {filteredBusinesses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" /> Businesses
                    <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2 py-0.5 rounded-full">
                      {filteredBusinesses.length}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBusinesses.map(b => <BusinessCard key={b._id} biz={b} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
