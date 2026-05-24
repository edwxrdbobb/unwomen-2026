"use client";

import Sidebar from "@/components/filterSideBar";
import ProductCard from "@/components/productCards";
import ProductCardBusinessCategory from "@/components/productCardsBusinessCategory";
import ProductCardCategory from "@/components/ProductCardsCategory";

type Action = 'category' | 'business' | 'default';

interface ShopProps {
  action: Action;
  category: string | string[];
  size?: number;
}

export default function Shop({ action, category, size = 3 }: ShopProps) {
  const filterOptions = (action: Action) => {
    switch (action) {
      case 'category':
        return <ProductCardCategory category={category} size={size} />;
      case 'business':
        return <ProductCardBusinessCategory category={category} size={2} />;
      default:
        return <ProductCard size={size} />;
    }
  }

  const categoryString = Array.isArray(category) ? category.join(', ') : category;
  console.log(`Category: ${categoryString}`);

  return (
    <div>
      <div className="flex mt-8 px-8">
        <Sidebar currentCategory={category} />
        <div className="ml-4">
          {filterOptions(action)}
        </div>
      </div>
    </div>
  );
}

