import ImageSlider from '@/components/ImageSlider'
import CategoryHorizontal from '@/components/categoryHorizontal'
import ProductCard from '@/components/productCards'
import bannerOne from '@/images/banner2-unwomen.jpg'
import bannerTwo from '@/images/unwomen-banner1.jpg'
import { ShieldCheck, Truck, Users } from 'lucide-react'
import Link from 'next/link'

const trustFeatures = [
  { Icon: ShieldCheck, title: 'Verified Sellers', desc: 'All vendors are screened and approved' },
  { Icon: Truck, title: 'Nationwide Delivery', desc: 'We ship across Sierra Leone' },
  { Icon: Users, title: 'Women-Led Businesses', desc: 'Supporting female entrepreneurs' },
]

export default function HomeScreen() {
  const images = [bannerOne, bannerTwo] as unknown as string[]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Slider */}
      <ImageSlider images={images} />

      {/* Trust Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trustFeatures.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <CategoryHorizontal />

      {/* Divider */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Products */}
      <ProductCard />

      {/* CTA Banner */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mb-10">
        <div className="relative rounded-3xl overflow-hidden bg-[#399edc] py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #facc15 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 50%)' }}
          />
          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white">Are you a woman entrepreneur?</h3>
            <p className="text-white/75 text-sm mt-1">List your business and reach thousands of customers across Sierra Leone.</p>
          </div>
          <Link href="/auth/signup" className="relative z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-full transition-colors shadow-lg text-sm flex-shrink-0">
            Start Selling Today
          </Link>
        </div>
      </div>
    </div>
  )
}
