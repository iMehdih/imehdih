// src/app/layout.tsx — نسخه آپدیت شده با ThemeProvider
import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ui/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: 'مهدی حاتم‌پور | مدیر آنلاین کسب‌وکار شما',
    template: '%s | مهدی حاتم‌پور',
  },
  description: 'قالب وردپرس، افزونه، دوره آموزشی، هاست و خدمات تخصصی وردپرس',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* جلوگیری از flash هنگام load */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('hp_theme') || 'dark';
                var isDark = t === 'system'
                  ? window.matchMedia('(prefers-color-scheme: dark)').matches
                  : t === 'dark';
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            })()
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}