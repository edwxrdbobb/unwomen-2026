'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import CategoryVertical from './categoryVertical'
import BusinessCategoryVertical from './businessCategoryVertical'

const MIN_PRICE = 0
const MAX_PRICE = 5000

export default function Sidebar({ currentCategory }: { currentCategory: string | string[] }) {
  const [priceOpen, setPriceOpen] = useState(true)
  const [minVal, setMinVal] = useState(MIN_PRICE)
  const [maxVal, setMaxVal] = useState(MAX_PRICE)

  const pct = (v: number) => ((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), maxVal - 1)
    setMinVal(v)
  }
  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), minVal + 1)
    setMaxVal(v)
  }

  const isFiltered = minVal > MIN_PRICE || maxVal < MAX_PRICE

  return (
    <div className="space-y-3">
      {/* Business type */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Business Type</p>
          <BusinessCategoryVertical currentCategory={currentCategory} />
        </div>
      </div>

      {/* Product category */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Category</p>
          <CategoryVertical currentCategory={currentCategory} />
        </div>
      </div>

      {/* Price range slider */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-yellow-400" />
        <div className="p-4">
          <button
            className="flex items-center justify-between w-full mb-4"
            onClick={() => setPriceOpen(!priceOpen)}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Price Range</p>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${priceOpen ? 'rotate-180' : ''}`} />
          </button>

          {priceOpen && (
            <div className="space-y-4">
              {/* Price labels */}
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Min</p>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                    Le {minVal.toLocaleString()}
                  </span>
                </div>
                <div className="h-px w-6 bg-gray-200 dark:bg-gray-600" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Max</p>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                    {maxVal >= MAX_PRICE ? `Le ${MAX_PRICE.toLocaleString()}+` : `Le ${maxVal.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Dual-range track */}
              <div className="relative h-5 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
                {/* Filled segment */}
                <div
                  className="absolute h-1.5 rounded-full bg-blue-500"
                  style={{ left: `${pct(minVal)}%`, right: `${100 - pct(maxVal)}%` }}
                />
                {/* Min thumb */}
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={50}
                  value={minVal}
                  onChange={handleMin}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
                  style={{ zIndex: minVal > MAX_PRICE - 200 ? 5 : 3 }}
                />
                {/* Max thumb */}
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={50}
                  value={maxVal}
                  onChange={handleMax}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
                  style={{ zIndex: 4 }}
                />
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                <span>Le 0</span>
                <span>Le 1,250</span>
                <span>Le 2,500</span>
                <span>Le 5,000+</span>
              </div>

              {isFiltered && (
                <button
                  onClick={() => { setMinVal(MIN_PRICE); setMaxVal(MAX_PRICE) }}
                  className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
                >
                  Reset price
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
