import React from "react";
import Image from "next/image"; 
import mac from '@/images/macbook.jpg';

const CreateProduct = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Create Product</h1>
      <form className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Product Title</label>
          <input
            type="text"
            className="w-full border-gray-300 rounded-lg p-2"
            placeholder="Iphone X 120GB for sale"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Product Category</label>
          <select className="w-full border-gray-300 rounded-lg p-2">
            <option>Select</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Product Price (NLe)</label>
          <input
            type="number"
            className="w-full border-gray-300 rounded-lg p-2"
            placeholder="1000"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Product Tags</label>
          <div className="flex space-x-2">
            <span className="bg-yellow-300 text-black px-3 py-1 rounded-lg">
              Iphone
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Product Description</label>
          <textarea
            className="w-full border-gray-300 rounded-lg p-2"
            placeholder="Minimum of 250 words"
          ></textarea>
        </div>

        <div>
          <label className="block font-semibold mb-2">Product Images</label>
          <div className="flex space-x-4">
            <div className="w-24 h-24 border border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Click to add</span>
            </div>
            <div className="image-selection-wrapper">
                <div className="img-list">
                <Image src={mac} alt="profile" width={200} height={150}  className="w-24 h-24 object-cover rounded-lg" />

                </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full"
        >
          Upload Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
