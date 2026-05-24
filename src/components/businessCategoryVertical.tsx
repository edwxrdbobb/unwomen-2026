"use client";
import Image from 'next/image';
import macro from '@/images/MACRO.png';
import micro from '@/images/MICRO.jpeg';
import sme from '@/images/SME.jpg';
import soho from '@/images/SOHO.jpg';
import Link from 'next/link';

const BUSINESS_CATEGORIES = [
  { category: 'SME', img: sme },
  { category: 'MACRO', img: macro },
  { category: 'MICRO', img: micro },
  { category: 'SOHO', img: soho },
]

export default function BusinessCategoryVertical({ currentCategory }: { currentCategory: string | string[] }) {
  const active = Array.isArray(currentCategory) ? currentCategory[0] : currentCategory

  return (
    <div className="space-y-0.5">
      {BUSINESS_CATEGORIES.map(({ category, img }) => (
        <Link key={category} href={`/products/shop/category/business/${category}`}>
          <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
            active === category
              ? 'bg-blue-500 text-white'
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300'
          }`}>
            <span className={`flex-shrink-0 rounded-full overflow-hidden ${active === category ? 'ring-2 ring-white/40' : ''}`}>
              <Image width={22} height={22} className="w-6 h-6 rounded-full object-cover" src={img} alt={category} />
            </span>
            <span className="text-xs font-medium">{category}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
