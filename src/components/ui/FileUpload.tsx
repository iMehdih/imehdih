'use client'
// src/components/ui/FileUpload.tsx
import { useState, useRef } from 'react'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  bucket?: string
  folder?: string
  label?: string
  hint?: string
  previewType?: 'image' | 'none'
}

export default function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  bucket = 'products',
  folder = 'uploads',
  label = 'آپلود فایل',
  hint,
  previewType = 'image',
}: FileUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', bucket)
      fd.append('folder', folder)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا در آپلود'); return }
      onChange(data.url)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>{label}</label>}

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          border: '2px dashed var(--bd)',
          borderRadius: 10,
          padding: '18px 16px',
          textAlign: 'center',
          cursor: loading ? 'wait' : 'pointer',
          background: 'var(--b2)',
          transition: 'border-color .15s',
          position: 'relative',
        }}
      >
        {previewType === 'image' && value ? (
          <div style={{ position: 'relative' }}>
            <img src={value} alt="preview" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>کلیک کنید تا عوض شود</div>
          </div>
        ) : (
          <div style={{ color: 'var(--t3)', fontSize: 13 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                در حال آپلود...
              </div>
            ) : (
              <>
                <div style={{ fontSize: 24, marginBottom: 6 }}>↑</div>
                <div style={{ fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11.5, marginTop: 4 }}>{hint || 'کلیک یا Drag & Drop'}</div>
                {value && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--green)' }}>✓ فایل آپلود شده</div>}
              </>
            )}
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
      </div>

      {error && <div style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 6 }}>{error}</div>}

      {value && (
        <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', flex: 1 }}>{value}</span>
          <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
        </div>
      )}
    </div>
  )
}
