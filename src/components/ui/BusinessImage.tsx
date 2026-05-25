'use client'

import { useState } from 'react'

interface BusinessImageProps {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Business cover/logo image with a branded gray placeholder when missing.
 */
export function BusinessImage({ src, alt, className = '', style }: BusinessImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={style}
      >
        <img
          src="/unwomenlogo.png"
          alt="UN Women"
          className="w-2/5 max-w-[80px] opacity-30 object-contain select-none pointer-events-none"
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}
