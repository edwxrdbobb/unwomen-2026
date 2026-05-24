"use client";

import React, { useEffect, useState } from 'react';

interface ProductImagesProps {
  images: Array<{
    productImageOne: string;
    productImageTwo: string;
    productImageThree: string;
    productImageFour: string;
    productImageFive: string;
    productImageSix: string;
  }>;
}

const ProductImages: React.FC<ProductImagesProps> = ({ images }) => {
  const [productImages, setProductImages] = useState<string[]>([]); // Define the type as string[]
  const [currentImage, setCurrentImage] = useState<string>();

  useEffect(() => {
    setProductImages([
      `${images[0].productImageOne}`,
      `${images[0].productImageTwo}`,
      `${images[0].productImageThree}`,
      `${images[0].productImageFour}`,
      `${images[0].productImageFive}`,
      `${images[0].productImageSix}`,
    ].filter(Boolean) as string[]); // Filter out any null or undefined values

    setCurrentImage(productImages[0]);
  }, [images]);

  console.log(`images: ${productImages}`);

  return (
    <div>
      {/* Main Product Image */}
      <div className="mb-4 h-[450px]">
        <img src={currentImage} alt="Main Product" className="w-full h-full object-cover rounded-lg" />
      </div>

      {/* Thumbnail Selection Below */}
      <div className="flex space-x-4">
        {productImages.map((img, idx) => (
          img === 'null' ? 
            null : 
            <img key={idx} src={img} alt={`Thumbnail ${idx} url ${img}`} onClick={() => setCurrentImage(img)} className={`cursor-pointer w-20 h-20 rounded-lg ${
              img === currentImage? 'border border-4 border-blue-400' : ''}
              `} />
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
