'use client'
import { useEffect, useCallback } from 'react'

export default function MobileMenu() {
  const toggle = useCallback(() => {
    const sidebar = document.querySelector('.db-sidebar, .admin-sidebar') as HTMLElement | null
    const overlay = document.querySelector('.sb-overlay') as HTMLElement | null
    if (!sidebar) return
    const isOpen = sidebar.classList.contains('open')
    sidebar.classList.toggle('open', !isOpen)
    if (overlay) overlay.classList.toggle('visible', !isOpen)
  }, [])

  const close = useCallback(() => {
    const sidebar = document.querySelector('.db-sidebar, .admin-sidebar') as HTMLElement | null
    const overlay = document.querySelector('.sb-overlay') as HTMLElement | null
    sidebar?.classList.remove('open')
    overlay?.classList.remove('visible')
  }, [])

  useEffect(() => {
    const overlay = document.querySelector('.sb-overlay')
    overlay?.addEventListener('click', close)
    return () => overlay?.removeEventListener('click', close)
  }, [close])

  return (
    <>
      <div className="sb-overlay" />
      <button className="sb-toggle" onClick={toggle} aria-label="منو">
        ☰
      </button>
    </>
  )
}
