import React from 'react';
import ProductDetails from '@/components/productDetails';
import ProductImages from '@/components/productImages';
import SimilarProducts from '@/components/similarProducts';


const Home: React.FC = () => {
  const productImages = [
    '/macbook-main.jpg',
    '/macbook-thumbnail1.jpg',
    '/macbook-thumbnail2.jpg',
    '/macbook-thumbnail3.jpg',
  ];

  const similarProducts = [
    {
      name: 'MacBook Pro 2019 13"',
      price: '18,000.00',
      image: '/macbook-pro-2019.jpg',
    },
    // Add more products here if needed
  ];

  return (
    <div>
      <div className="container mx-auto mt-8">
        <div className="flex flex-wrap lg:flex-nowrap space-x-6">
          {/* Product Images */}
          <div className="w-full lg:w-1/2">
            <ProductImages images={productImages} />
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 space-y-6">
            <ProductDetails
              name="MacBook Pro 2022 M2"
              price="23,000.00"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
              quantity={25}
              condition="New"
            />

            {/* Icons: Chat, Add to Wishlist, Share */}
            <div className="flex space-x-4 items-center">
              <button className="flex items-center text-gray-600">
                <i className="fas fa-comment text-xl"></i>
                <span className="ml-2">Chat</span>
              </button>
              <button className="flex items-center text-gray-600">
                <i className="fas fa-heart text-xl"></i>
                <span className="ml-2">Add to Wishlist</span>
              </button>
              <button className="flex items-center text-gray-600">
                <i className="fas fa-share text-xl"></i>
                <span className="ml-2">Share</span>
              </button>
            </div>

            {/* Store and User Information */}
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div> {/* Placeholder for profile image */}
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">Kadric Gadget</h4>
                <p className="text-gray-500">Store Location: Lumley, Regent Road</p>
              </div>
              <div className="ml-auto">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Follow</button>
                <button className="ml-2 border px-4 py-2 rounded-lg">Visit Store</button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </p>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>
    </div>
  );
};

export default Home;
