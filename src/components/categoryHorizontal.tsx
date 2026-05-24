"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Shirt, Gem, UtensilsCrossed, Leaf, Palette, Home, Layers, HeartPulse, Baby, Scissors, CakeSlice, Pencil, BookOpen, Wind, PartyPopper, Smartphone, Paperclip, Tag } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@cvx/_generated/api';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

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
};

const CategoryHorizontal = () => {
  const categories = useQuery(api.categories.list) ?? [];
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = categories.length === 0;

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });

  return (
    <section className="py-10 px-4 sm:px-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Find exactly what you&apos;re looking for</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/categories" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#399edc] hover:text-[#2d8bc8] transition-colors">
            All <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => scroll('left')} disabled={!canLeft}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-[#399edc] hover:border-[#399edc] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-[#399edc] hover:border-[#399edc] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} onScroll={updateScroll} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mx-auto" />
              </div>
            ))
          : categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Tag;
              return (
                <Link key={cat._id} href={`/products/shop/category/${encodeURIComponent(cat.name)}`} className="flex-shrink-0 group">
                  <div className="flex flex-col items-center w-28">
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all group-hover:shadow-lg group-hover:scale-105 ${cat.color} dark:bg-gray-700`}>
                      <Icon className={`w-8 h-8 ${cat.textColor} dark:text-gray-300`} strokeWidth={1.5} />
                    </div>
                    <span className="mt-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 text-center group-hover:text-[#399edc] transition-colors leading-tight">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
};

export default CategoryHorizontal;
