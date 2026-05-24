"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
}

const slides = [
  {
    tag: "UN Women Market Square",
    headline: "Empowering Women in Business",
    sub: "Discover products from women-led businesses across Sierra Leone",
    cta: "Shop Now",
    href: "/products/shop",
  },
  {
    tag: "Made in Sierra Leone",
    headline: "Support Local, Grow Together",
    sub: "From Freetown to the provinces — buy direct from entrepreneurs",
    cta: "Browse Store",
    href: "/products/shop",
  },
];

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c + 1) % images.length);
  const slide = slides[current % slides.length];

  return (
    <div className="relative w-full overflow-hidden bg-blue-900" style={{ height: "420px" }}>
      {/* Slides */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Image src={image} alt={`Banner ${index + 1}`} fill className="object-cover" priority={index === 0} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent" />
        </div>
      ))}

      {/* Text Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-lg">
            <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              {slide?.tag}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
              {slide?.headline}
            </h1>
            <p className="text-white/80 text-sm sm:text-base mb-6">
              {slide?.sub}
            </p>
            <Link href={slide?.href ?? "/products/shop"}>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-7 py-3 rounded-full transition-colors shadow-lg text-sm">
                {slide?.cta}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors" aria-label="Previous">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors" aria-label="Next">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`rounded-full transition-all ${index === current ? "w-6 h-2.5 bg-yellow-400" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"}`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
