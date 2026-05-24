'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, MapPin, ArrowRight, Tag } from "lucide-react"
import Loader from "./Loader"
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"

interface Product {
  id: string
  uuid: string
  productName: string
  ProductImages: Array<{ id: number; uuid: string; productImageOne: string; productImageTwo: string }>
  currentPrice: number
  originalPrice: number
  category: string
  rating: number
  soldCount: number
  productLocation?: string
}

interface ProductCardProps { size?: number }

interface WishlistItem {
  id: string; uuid: string; productName: string; price: number; image: string
}

function mapConvexToProduct(doc: {
  _id: Id<"products">; productName: string; productLocation: string; category: string;
  currentPrice: number; previousPrice: number; imageUrls: string[]
}): Product {
  const primary = doc.imageUrls[0] ?? "/placeholder.svg"
  return {
    id: doc._id, uuid: doc._id, productName: doc.productName,
    ProductImages: [{ id: 0, uuid: doc._id, productImageOne: primary, productImageTwo: doc.imageUrls[1] ?? primary }],
    currentPrice: doc.currentPrice, originalPrice: doc.previousPrice,
    category: doc.category, rating: 0, soldCount: 0, productLocation: doc.productLocation,
  }
}

function ProductCardGrid({ products, currentPage, setCurrentPage, productsPerPage }: {
  products: Product[]; currentPage: number; setCurrentPage: (n: number) => void; productsPerPage: number
}) {
  const router = useRouter()
  const indexOfLast = currentPage * productsPerPage
  const currentProducts = products.slice(indexOfLast - productsPerPage, indexOfLast)
  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage))

  const addToWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (wishlist.find((i: WishlistItem) => i.id === product.id)) { toast('Already in wishlist'); return }
    wishlist.push({ id: product.id, uuid: product.uuid, productName: product.productName,
      price: product.currentPrice, image: product.ProductImages[0]?.productImageOne || '/placeholder.svg' })
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    toast.success('Added to wishlist!')
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <section className="py-10 px-4 sm:px-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} products available</p>
        </div>
        <Link href="/products/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {currentProducts.map((product) => {
          const pct = product.originalPrice > product.currentPrice
            ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
            : 0
          const img = product.ProductImages[0]?.productImageOne || '/placeholder.svg'

          return (
            <Link key={product.id} href={`/products/${product.uuid}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700" style={{ height: '180px' }}>
                  <img src={img} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {pct > 0 && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{pct}%</span>
                  )}
                  <button onClick={(e) => addToWishlist(product, e)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500" aria-label="Wishlist">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-1">
                    {product.productName}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-auto pt-2">
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      Le {product.currentPrice.toLocaleString()}
                    </span>
                    {product.originalPrice > product.currentPrice && (
                      <span className="text-xs text-gray-400 line-through">Le {product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {product.productLocation && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[50%]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {product.productLocation}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); router.push(`/products/shop/category/${product.category}`) }}
                      className="flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full hover:bg-blue-500 hover:text-white transition-colors ml-auto"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {product.category}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600'}`}>
                {page}
              </button>
            ))}
            {totalPages > 5 && <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>}
          </div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  )
}

export default function ProductCard(props: ProductCardProps) {
  const raw = useQuery(api.products.list, {})
  const products = useMemo(() => (raw ?? []).map(mapConvexToProduct), [raw])
  const [currentPage, setCurrentPage] = useState(1)
  if (raw === undefined) return <Loader />
  if (products.length === 0) return (
    <div className="py-16 text-center text-gray-500 dark:text-gray-400 max-w-screen-xl mx-auto px-6">
      <p className="text-lg font-semibold mb-1">No products yet</p>
      <p className="text-sm">Add products from the vendor dashboard.</p>
    </div>
  )
  return <ProductCardGrid products={products} currentPage={currentPage} setCurrentPage={setCurrentPage} productsPerPage={24} />
}
