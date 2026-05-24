"use client";

import { Heart, MessageCircleMore, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ProductDetailsProps {
  id: number | string;
  name: string;
  price: string | number;
  description: string;
  productLocation: string;
  productCategory: string;
  productImage: string;
  uuid: string;
}

interface WishlistItem {
  id: number | string;
  uuid: string;
  productName: string;
  price: number;
  image: string;
  category?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  id, name, price, description, productCategory, productLocation, productImage, uuid
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlistItems.some((item: WishlistItem) => String(item.id) === String(id)));
  }, [id]);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isInWishlist) {
      const updated = wishlist.filter((item: WishlistItem) => String(item.id) !== String(id));
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
    } else {
      wishlist.push({ id, uuid, productName: name, price: Number(price), image: productImage, category: productCategory });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      toast.success('Added to wishlist!');
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="w-full lg:w-2/3 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        NLE {typeof price === 'number' ? price.toLocaleString() : price}
      </p>

      {/* Wishlist button */}
      <button
        onClick={toggleWishlist}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all ${
          isInWishlist
            ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-2 border-red-200 dark:border-red-700'
            : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Category: <Link href={`/products/shop/category/${productCategory}`} className="text-blue-500 hover:underline">{productCategory}</Link>
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">Location: {productLocation}</p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
          <MessageCircleMore className="w-4 h-4" /> Chat
        </button>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
          <SquareArrowOutUpRight className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
