import React from 'react';

interface SimilarProduct {
  name: string;
  price: string;
  image: string;
}

interface SimilarProductsProps {
  products: SimilarProduct[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ products }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Similar Products</h3>
      <div className="flex space-x-6 overflow-x-auto py-4">
        {products.map((product, index) => (
          <div key={index} className="border rounded-lg p-4 w-64 flex-shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded" />
            <h4 className="font-semibold mt-2">{product.name}</h4>
            <p className="text-xl font-bold text-yellow-500">NLE {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
