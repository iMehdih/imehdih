'use client'
import { useEffect, useState, useCallback } from 'react'

interface Setting {
  _id: string
  key: string
  value: unknown
  group: string
  label: string
  type: string
  isSecret: boolean
}

const GROUP_LABELS: Record<string, string> = {
  general: 'عمومی',
  brand: 'برند',
  payment: 'مالی / فاکتور',
  support: 'پشتیبانی',
  sms: 'پیامک',
  email: 'ایمیل',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        const init: Record<string, unknown> = {}
        for (const s of data.data) init[s.key] = s.value
        setValues(init)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updates = settings.map(s => ({ key: s.key, value: values[s.key] }))
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error || 'خطا در ذخیره')
      }
    } catch {
      setError('خطای اتصال')
    } finally {
      setSaving(false)
    }
  }

  const groups = [...new Set(settings.map(s => s.group))]

  if (loading) return (
    <div className="db-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <div style={{ color: 'var(--t2)', fontSize: 14 }}>در حال بارگذاری...</div>
    </div>
  )

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--t)', marginBottom: 4 }}>تنظیمات سیستم</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>تنظیمات عمومی، برند، مالی و پشتیبانی پلتفرم</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn" style={{ minWidth: 120 }}>
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تنظیمات'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: 20 }}>
        {groups.map(group => {
          const groupSettings = settings.filter(s => s.group === group)
          return (
            <div key={group} className="admin-card">
              <div className="admin-card-head">
                <div className="admin-card-title">{GROUP_LABELS[group] || group}</div>
              </div>
              <div style={{ padding: '16px 20px', display: 'grid', gap: 16 }}>
                {groupSettings.map(setting => (
                  <div key={setting.key}>
                    <label className="admin-label">
                      {setting.label}
                      {setting.isSecret && (
                        <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>محرمانه</span>
                      )}
                    </label>
                    {setting.type === 'boolean' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          onClick={() => setValues(v => ({ ...v, [setting.key]: !v[setting.key] }))}
                          style={{
                            width: 44, height: 24, borderRadius: 100, cursor: 'pointer',
                            transition: 'background 0.2s', position: 'relative',
                            background: values[setting.key] ? 'var(--gold)' : 'var(--b3)',
                          }}
                        >
                          <div style={{
                            position: 'absolute', top: 3, width: 18, height: 18,
                            borderRadius: '50%', background: '#fff', transition: 'right 0.2s',
                            right: values[setting.key] ? 3 : 23,
                          }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                          {values[setting.key] ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    ) : setting.type === 'number' ? (
                      <input
                        type="number"
                        className="admin-input"
                        value={String(values[setting.key] ?? '')}
                        onChange={e => setValues(v => ({ ...v, [setting.key]: Number(e.target.value) }))}
                        dir="ltr"
                      />
                    ) : (
                      <input
                        type={setting.isSecret ? 'password' : 'text'}
                        className="admin-input"
                        value={String(values[setting.key] ?? '')}
                        onChange={e => setValues(v => ({ ...v, [setting.key]: e.target.value }))}
                        placeholder={setting.isSecret ? '••••••••' : ''}
                        dir={setting.key.includes('url') || setting.isSecret ? 'ltr' : 'rtl'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving} className="admin-btn" style={{ minWidth: 150 }}>
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره همه تنظیمات'}
        </button>
      </div>
    </div>
  )
}
