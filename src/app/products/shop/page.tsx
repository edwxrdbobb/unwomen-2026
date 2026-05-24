'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import Sidebar from "@/components/filterSideBar"
import ProductCard from "@/components/productCards"
import ProductCardBusinessCategory from "@/components/productCardsBusinessCategory"
import ProductCardCategory from "@/components/ProductCardsCategory"

type Action = "category" | "business" | "default"
interface ShopProps { action?: Action; category?: string | string[]; size?: number }
type ValidatedShopProps = { [x: string]: never }

export default function Shop(props: ValidatedShopProps & ShopProps) {
  const { action = 'default', category = '', size = 3 } = props
  const [sidebarOpen, setSidebarOpen] = useState(false)
 
  const pageTitle =
    action === 'category' ? String(category)
    : action === 'business' ? `${String(category)} Businesses`
    : 'All Products'

  const renderProducts = () => {
    switch (action) {
      case 'category':
        return <ProductCardCategory category={Array.isArray(category) ? category[0] : category} size={size} />
      case 'business':
        return <ProductCardBusinessCategory category={Array.isArray(category) ? category[0] : category} size={2} />
      default:
        return <ProductCard size={size} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-8 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            <nav className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span>Home</span><span className="mx-1">/</span><span>Shop</span>
              {action !== 'default' && <><span className="mx-1">/</span><span className="text-blue-500">{pageTitle}</span></>}
            </nav>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-3 py-2 rounded-xl text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto flex gap-6 px-4 sm:px-8 py-6">
        {/* Desktop sidebar */}
        <aside className="hidden sm:block flex-shrink-0 w-56">
          <div className="sticky top-4">
            <Sidebar currentCategory={category} />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <Sidebar currentCategory={category} />
            </div>
          </div>
        )}

        {/* Products */}
        <main className="flex-1 min-w-0">
          {renderProducts()}
        </main>
      </div>
    </div>
  )
}
