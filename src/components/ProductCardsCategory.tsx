'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, MapPin, Tag, Package } from "lucide-react"
import Loader from "./Loader"
import { toast } from 'react-hot-toast'
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"

interface WishlistItem { id: string; productName: string; price: number; image: string }

const ProductCardCategory = ({ category }: { category: string; size?: number }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24
  const raw = useQuery(api.products.listByCategory, { category })

  const products = useMemo(() => (raw ?? []).map((doc) => ({
    id: doc._id as string, productName: doc.productName,
    currentPrice: doc.currentPrice, previousPrice: doc.previousPrice,
    category: doc.category, productLocation: doc.productLocation,
    image: doc.imageUrls[0] ?? '/placeholder.svg',
  })), [raw])

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage))
  const currentProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  const addToWishlist = (product: typeof products[0], e: React.MouseEvent) => {
    e.preventDefault()
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (wishlist.find((i: WishlistItem) => i.id === product.id)) { toast('Already in wishlist'); return }
    wishlist.push({ id: product.id, productName: product.productName, price: product.currentPrice, image: product.image })
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    toast.success('Added to wishlist!')
    window.dispatchEvent(new Event('storage'))
  }

  if (raw === undefined) return <Loader />

  if (products.length === 0) return (
    <div className="py-20 text-center">
      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">No products in this category yet.</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{category}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentProducts.map((product) => {
          const pct = product.previousPrice > product.currentPrice
            ? Math.round(((product.previousPrice - product.currentPrice) / product.previousPrice) * 100)
            : 0
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 h-[160px]">
                  <img src={product.image} alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {pct > 0 && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{pct}%</span>
                  )}
                  <button onClick={(e) => addToWishlist(product, e)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-1">{product.productName}</h3>
                  <div className="flex items-baseline gap-1.5 mt-auto pt-2">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Le {product.currentPrice.toLocaleString()}</span>
                    {product.previousPrice > product.currentPrice && (
                      <span className="text-xs text-gray-400 line-through">Le {product.previousPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {product.productLocation && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[55%]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />{product.productLocation}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full ml-auto">
                      <Tag className="w-2.5 h-2.5" />{product.category}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 transition-colors dark:text-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${currentPage === page
                ? 'bg-blue-500 text-white'
                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
              {page}
            </button>
          ))}
          {totalPages > 5 && <span className="text-gray-400 text-sm">…</span>}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 transition-colors dark:text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductCardCategory
