'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { Heart, Trash2, MapPin, Tag, ShoppingBag } from 'lucide-react';

interface WishlistItem {
  id: number;
  uuid: string;
  productName: string;
  price: number;
  image: string;
  category?: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    setIsLoading(false);
  }, []);

  const remove = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Saved Items</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-8">
        {/* Empty state */}
        {items.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Save products you love while browsing the shop.</p>
            <Link href="/products/shop"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-full text-sm transition-colors">
              Browse Products
            </Link>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <Link key={item.id} href={`/products/${item.uuid}`} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative overflow-hidden h-40 bg-gray-50 dark:bg-gray-700">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => remove(e, item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 text-gray-500"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-1">
                      {item.productName}
                    </h3>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-auto">
                      Le {item.price.toLocaleString()}
                    </p>
                    {item.category && (
                      <div className="flex items-center gap-0.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Tag className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] text-blue-500 font-medium">{item.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
