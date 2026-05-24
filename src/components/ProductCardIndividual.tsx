"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";

const ProductCardIndividual = ({ userId }: { userId?: string }) => {
  const raw = useQuery(
    api.products.listByVendor,
    userId ? { vendorUserId: userId } : 'skip'
  );

  if (!userId) return <p className="text-gray-500">No user specified.</p>;
  if (raw === undefined) return <p className="text-gray-400">Loading...</p>;
  if (raw.length === 0) return <p className="text-gray-500">No products available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {raw.map((product) => (
        <Link key={product._id} href={`/products/${product._id}`} passHref>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <img
              src={product.imageUrls[0] ?? '/placeholder.svg'}
              alt={product.productName}
              className="w-full h-[220px] object-cover rounded bg-gray-200"
            />
            <h4 className="mt-4 text-lg font-semibold text-black">{product.productName}</h4>
            <p className="text-blue-500">Le {product.currentPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Category: {product.category}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductCardIndividual;
