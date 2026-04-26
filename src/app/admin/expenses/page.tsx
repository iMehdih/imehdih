// src/app/admin/expenses/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const categoryLabels: Record<string, string> = {
  salary: 'حقوق', bonus: 'پاداش', infrastructure: 'زیرساخت',
  marketing: 'بازاریابی', tools: 'ابزارها', tax: 'مالیات', other: 'سایر',
}

const categoryColors: Record<string, string> = {
  salary: 'blue', bonus: 'gold', infrastructure: 'gray',
  marketing: 'green', tools: 'gray', tax: 'red', other: 'gray',
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/expenses?${category ? `category=${category}` : ''}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setExpenses(d.data.items); setTotal(d.data.total) } })
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 5, flex: 1, flexWrap: 'wrap' }}>
          <button onClick={() => setCategory('')} className={`admin-filter-btn ${!category ? 'active' : ''}`}>همه</button>
          {Object.entries(categoryLabels).map(([val, label]) => (
            <button key={val} onClick={() => setCategory(val)} className={`admin-filter-btn ${category === val ? 'active' : ''}`}>{label}</button>
          ))}
        </div>
        <Link href="/admin/expenses/new" className="admin-btn admin-btn-gold">+ هزینه جدید</Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div className="admin-card-title">هزینه‌ها ({total})</div>
          <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 800 }}>
            جمع: {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('fa')} ت
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#505062', fontSize: 13 }}>در حال بارگذاری...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#505062', fontSize: 13 }}>هزینه‌ای ثبت نشده</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>عنوان</th><th>دسته</th><th>نوع</th><th>مبلغ</th><th>تاریخ</th><th>ثبت‌کننده</th></tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 700 }}>
                      {e.title}
                      {e.description && <div style={{ fontSize: 11, color: '#505062', fontWeight: 400 }}>{e.description}</div>}
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${categoryColors[e.category] || 'gray'}`}>
                        {categoryLabels[e.category] || e.category}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: '#505062' }}>
                      {e.type === 'auto' ? '🤖 خودکار' : e.type === 'offline' ? '📄 آفلاین' : '✏ دستی'}
                    </td>
                    <td style={{ color: '#EF4444', fontWeight: 800 }}>{e.amount.toLocaleString('fa')} ت</td>
                    <td style={{ fontSize: 11.5 }}>{new Date(e.date).toLocaleDateString('fa-IR')}</td>
                    <td style={{ fontSize: 12 }}>
                      {e.createdBy?.firstName ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
