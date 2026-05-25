"use client";

import { useQuery } from 'convex/react';
import { api } from '@cvx/_generated/api';
import Link from 'next/link';
import { Sparkles, Shirt, Gem, UtensilsCrossed, Leaf, Palette, Home, Layers, HeartPulse, Baby, Scissors, CakeSlice, Pencil, BookOpen, Wind, PartyPopper, Smartphone, Paperclip, Tag } from 'lucide-react';
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

export default function CategoryVertical({ currentCategory }: { currentCategory: string | string[] }) {
  const categories = useQuery(api.categories.list) ?? [];
  const active = Array.isArray(currentCategory) ? currentCategory[0] : currentCategory;

  if (categories.length === 0) {
    return (
      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {categories.map((cat) => {
        const isActive = active === cat.name;
        const Icon = CATEGORY_ICONS[cat.slug] ?? Tag;
        return (
          <Link key={cat._id} href={`/products/shop/category/${encodeURIComponent(cat.name)}`}>
            <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#399edc] text-white'
                : 'hover:bg-[#eef7fd] dark:hover:bg-[#1a5a8a]/20 text-gray-700 dark:text-gray-300'
            }`}>
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-white/20' : cat.color
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : cat.textColor}`} strokeWidth={1.5} />
              </span>
              <span className="text-xs font-medium truncate">{cat.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
