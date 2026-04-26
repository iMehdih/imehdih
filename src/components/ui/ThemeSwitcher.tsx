// src/components/ui/ThemeSwitcher.tsx
'use client'
import { useTheme } from './ThemeProvider'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const options = [
    { val: 'light' as const, icon: '☀', label: 'روشن' },
    { val: 'dark' as const, icon: '☾', label: 'تاریک' },
    { val: 'system' as const, icon: '⬡', label: 'سیستم' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: 3,
      background: 'var(--b2)',
      border: '1px solid var(--bd)',
      borderRadius: 10,
      padding: 3,
    }}>
      {options.map(opt => (
        <button
          key={opt.val}
          onClick={() => setTheme(opt.val)}
          title={opt.label}
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            background: theme === opt.val ? 'var(--b1)' : 'transparent',
            color: theme === opt.val ? 'var(--gold)' : 'var(--t3)',
            boxShadow: theme === opt.val ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
