'use client'
// src/components/ui/ProductTabs.tsx
import { useState } from 'react'

interface Tab {
  key: string
  label: string
  content: React.ReactNode
}

export default function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key)

  return (
    <div>
      <div className="product-tabs-nav">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`product-tab-btn${active === tab.key ? ' active' : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="product-tab-content">
        {tabs.find(t => t.key === active)?.content}
      </div>
    </div>
  )
}
