'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { ArrowRight, Building2, LayoutGrid, Sparkles, Shirt, Gem, UtensilsCrossed, Leaf, Palette, Home, Layers, HeartPulse, Baby, Scissors, CakeSlice, Pencil, BookOpen, Wind, PartyPopper, Smartphone, Paperclip, Tag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'beauty-skincare':        Sparkles,
  'fashion-clothing':       Shirt,
  'accessories-jewellery':  Gem,
  'food-beverages':         UtensilsCrossed,
  'farm-produce':           Leaf,
  'crafts-artwork':         Palette,
  'home-household':         Home,
  'textiles-fabrics':       Layers,
  'health-wellness':        HeartPulse,
  'baby-kids':              Baby,
  'hair-beauty-services':   Scissors,
  'catering-baking':        CakeSlice,
  'tailoring-design':       Pencil,
  'education-training':     BookOpen,
  'cleaning-home-services': Wind,
  'event-planning':         PartyPopper,
  'electronics-tech':       Smartphone,
  'stationery-office':      Paperclip,
}
import macro from '@/images/MACRO.png'
import micro from '@/images/MICRO.jpeg'
import sme from '@/images/SME.jpg'
import soho from '@/images/SOHO.jpg'
import type { StaticImageData } from 'next/image'

const BUSINESS_TYPES: { id: string; name: string; tagline: string; img: StaticImageData; accent: string }[] = [
  {
    id: 'SME',
    name: 'SME',
    tagline: 'Small & Medium Enterprises',
    img: sme,
    accent: 'from-blue-600 to-blue-400',
  },
  {
    id: 'MACRO',
    name: 'Macro',
    tagline: 'Macro Enterprises',
    img: macro,
    accent: 'from-yellow-500 to-yellow-400',
  },
  {
    id: 'MICRO',
    name: 'Micro',
    tagline: 'Micro Enterprises',
    img: micro,
    accent: 'from-green-600 to-green-400',
  },
  {
    id: 'SOHO',
    name: 'SOHO',
    tagline: 'Small Office / Home Office',
    img: soho,
    accent: 'from-purple-600 to-purple-400',
  },
]

export default function CategoriesPage() {
  const categories = useQuery(api.categories.list)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Browse</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">All Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-xl">
            Explore products and businesses from women entrepreneurs across Sierra Leone — from beauty and fashion to tech and food.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-10 space-y-14">

        {/* ── Business Types ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" /> Business Types
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Browse by enterprise size and type</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BUSINESS_TYPES.map((biz) => (
              <Link key={biz.id} href={`/products/shop/category/business/${biz.id}`} className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 aspect-[4/3]">
                  <Image
                    src={biz.img}
                    alt={biz.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${biz.accent} opacity-60 group-hover:opacity-70 transition-opacity`} />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <p className="text-white/80 text-[11px] font-medium uppercase tracking-wide leading-none mb-1">{biz.tagline}</p>
                    <h3 className="text-white text-xl font-bold leading-none">{biz.name}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/90 font-semibold">
                      Browse <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Product Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-500" /> Product & Service Categories
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {categories ? `${categories.length} categories` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Loading skeleton */}
          {categories === undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {categories !== undefined && categories.length === 0 && (
            <div className="py-20 text-center">
              <LayoutGrid className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No categories yet.</p>
            </div>
          )}

          {categories !== undefined && categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <Link key={cat._id} href={`/products/shop/category/${encodeURIComponent(cat.name)}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full">
                    <div className="h-0.5 bg-gradient-to-r from-[#399edc] to-yellow-400" />
                    <div className="p-5 flex flex-col flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.color} dark:bg-gray-700 group-hover:scale-110 transition-transform duration-300`}>
                        {(() => { const Icon = CATEGORY_ICONS[cat.slug] ?? Tag; return <Icon className={`w-6 h-6 ${cat.textColor} dark:text-gray-300`} strokeWidth={1.5} /> })()}
                      </div>
                      <h3 className={`text-sm font-bold mb-1 group-hover:text-[#399edc] transition-colors ${cat.textColor} dark:text-white`}>
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 flex-1">
                        {cat.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          cat.type === 'services' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : cat.type === 'both' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {cat.type === 'both' ? 'Products & Services' : cat.type}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
