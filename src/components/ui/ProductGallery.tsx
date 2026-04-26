'use client'
// src/components/ui/ProductGallery.tsx
import { useState } from 'react'

interface ProductGalleryProps {
  thumbnail?: string
  images?: string[]
  title: string
}

export default function ProductGallery({ thumbnail, images = [], title }: ProductGalleryProps) {
  const all = [thumbnail, ...images].filter(Boolean) as string[]
  const [selected, setSelected] = useState(0)

  if (all.length === 0) {
    return (
      <div className="product-gallery-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 72, color: 'var(--t3)', opacity: .2 }}>▣</div>
      </div>
    )
  }

  return (
    <div>
      <div className="product-gallery-main">
        <img src={all[selected]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {all.length > 1 && (
        <div className="product-gallery-thumbs">
          {all.map((src, i) => (
            <div
              key={i}
              className={`product-gallery-thumb${selected === i ? ' active' : ''}`}
              onClick={() => setSelected(i)}
            >
              <img src={src} alt={`${title} - تصویر ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
