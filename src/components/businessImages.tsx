"use client";

import React from 'react';

interface BusinessImagesProps {
  logo: string; // Assuming you want to display the business logo
  images?: string[]; // Optional array of additional images
}

const BusinessImages: React.FC<BusinessImagesProps> = ({ logo, images = [] }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Business Logo */}
      <div className="mb-4 h-[350px] w-full">
        <img
          src={logo}
          alt="Business Logo"
          className="w-full h-full rounded-lg shadow-lg object-cover"
        />
      </div>

      {/* Additional Images */}
      {images.length > 0 && (
        <div className="flex space-x-4">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Business Image ${idx + 1}`}
              className="w-24 h-24 rounded-lg shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessImages;
