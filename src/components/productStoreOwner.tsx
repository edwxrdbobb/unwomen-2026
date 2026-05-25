import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';

interface ProductStoreOwnerProps {
  storeName: string;
  storeLocation: string;
  profileImage?: string ;
  storeId: number;
}

const ProductStoreOwner: React.FC<ProductStoreOwnerProps> = ({
  storeName,
  storeLocation,
  profileImage,
  storeId,
}) => {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="flex-shrink-0">
        <Avatar src={profileImage} name={storeName} size="md" />
      </div>
      <div className="ml-4">
        <h4 className="font-semibold">{storeName}</h4>
        <p className="text-gray-500">Store Location: {storeLocation}</p>
      </div>
      <div className="ml-auto space-x-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Follow
        </button>
        <Link href={`/store/${storeId}`} passHref>
          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Visit Store
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductStoreOwner;
