'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BUSINESS_CATEGORIES, Category } from '@/types/businesses'

import macro from '@/images/MACRO.png'
import micro from '@/images/MICRO.jpeg'
import sme from '@/images/SME.jpg'
import soho from '@/images/SOHO.jpg'

const BusinessCategory = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    setCategories(BUSINESS_CATEGORIES)
  }, [])

  const categoryIconSelector = (category: string) => {
    const iconMap: Record<string, string> = {
      SOHO: soho,
      MACRO: macro,
      MICRO: micro,
      SME: sme,
    }
    return iconMap[category.toUpperCase()] || null
  }

  return (
    <section className="py-8 px-4">
      <h2 className="text-xl text-black mb-6">Search by Business</h2>
      <div className="flex items-center justify-center">
        <div className="flex overflow-x-auto whitespace-nowrap">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/products/shop/category/business/${category.id}`}
              className="flex flex-col items-center px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="bg-gray-200 p-4 rounded-full m-2">
                <Image 
                  width={100} 
                  height={100} 
                  className='rounded-full w-auto h-auto' 
                  src={categoryIconSelector(category.id)} 
                  alt={`${category.name} icon`}
                />
              </span>
              <span className="text-black text-lg font-bold text-capitalize t">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BusinessCategory

