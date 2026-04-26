'use client'
import { useEffect, useState, useCallback } from 'react'

interface User {
  _id: string
  mobile: string
  firstName?: string
  lastName?: string
  email?: string
  role: string
  isActive: boolean
  isVIP: boolean
  salary?: number
  walletBalance?: number
  rating?: number
  totalTasksCompleted?: number
  departments?: string[]
  createdAt: string
}

const ROLE_LABEL: Record<string, string> = { customer: 'مشتری', staff: 'کارمند', admin: 'ادمین' }
const ROLE_COLOR: Record<string, string> = { customer: 'db-badge-gray', staff: 'db-badge-blue', admin: 'db-badge-gold' }
const DEPARTMENTS = ['theme_plugin', 'course', 'hosting_domain', 'service', 'subscription', 'finance', 'presale', 'management']
const DEPT_LABEL: Record<string, string> = {
  theme_plugin: 'قالب و افزونه', course: 'دوره', hosting_domain: 'هاست/دامنه',
  service: 'خدمات', subscription: 'اشتراک', finance: 'مالی', presale: 'پیش‌فروش', management: 'مدیریت',
}

export default function AdminStaffPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    mobile: '', role: 'staff' as string, firstName: '', lastName: '',
    email: '', salary: 0, departments: [] as string[], isActive: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotal(data.data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({
      mobile: u.mobile, role: u.role, firstName: u.firstName || '',
      lastName: u.lastName || '', email: u.email || '',
      salary: u.salary || 0, departments: u.departments || [], isActive: u.isActive,
    })
    setShowAdd(true)
  }

  const openAdd = () => {
    setEditUser(null)
    setForm({ mobile: '', role: 'staff', firstName: '', lastName: '', email: '', salary: 0, departments: [], isActive: true })
    setShowAdd(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setMsg('')
    try {
      let res
      if (editUser) {
        res = await fetch(`/api/admin/users/${editUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form }),
        })
      } else {
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form }),
        })
      }
      const data = await res.json()
      if (data.success) {
        setMsg(editUser ? 'کاربر بروزرسانی شد' : 'کاربر جدید ثبت شد')
        setShowAdd(false)
        load()
      } else {
        setMsg(data.error || 'خطا')
      }
    } catch {
      setMsg('خطای اتصال')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (u: User) => {
    await fetch(`/api/admin/users/${u._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    })
    load()
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div className="db-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--t)', marginBottom: 4 }}>مدیریت کاربران</h1>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>{total.toLocaleString('fa')} کاربر ثبت‌شده</p>
        </div>
        <button onClick={openAdd} className="admin-btn">+ افزودن کاربر</button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: msg.includes('خطا') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${msg.includes('خطا') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, fontSize: 13, color: msg.includes('خطا') ? 'var(--red)' : 'var(--green)', marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="admin-input" placeholder="جستجو (نام، موبایل، ایمیل)..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="admin-input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} style={{ width: 140 }}>
          <option value="">همه نقش‌ها</option>
          <option value="customer">مشتری</option>
          <option value="staff">کارمند</option>
          <option value="admin">ادمین</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>کاربر</th>
                <th>موبایل</th>
                <th>نقش</th>
                <th>وضعیت</th>
                <th>تسک‌ها</th>
                <th>حقوق</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--t2)' }}>در حال بارگذاری...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--t3)' }}>کاربری یافت نشد</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--t)' }}>
                      {u.firstName ? `${u.firstName} ${u.lastName || ''}` : '—'}
                    </div>
                    {u.email && <div style={{ fontSize: 11, color: 'var(--t3)', direction: 'ltr' }}>{u.email}</div>}
                  </td>
                  <td style={{ direction: 'ltr', fontFamily: 'monospace' }}>{u.mobile}</td>
                  <td><span className={`db-badge ${ROLE_COLOR[u.role] || 'db-badge-gray'}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td>
                    <span className={`db-badge ${u.isActive ? 'db-badge-green' : 'db-badge-red'}`}>
                      {u.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--t2)' }}>{u.totalTasksCompleted?.toLocaleString('fa') || '—'}</td>
                  <td style={{ color: 'var(--t2)' }}>
                    {u.salary ? `${(u.salary / 1000000).toFixed(1)} م` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} className="admin-btn-sm">ویرایش</button>
                      <button onClick={() => toggleActive(u)} className="admin-btn-sm" style={{ color: u.isActive ? 'var(--red)' : 'var(--green)', borderColor: u.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)' }}>
                        {u.isActive ? 'غیرفعال' : 'فعال'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--bd)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className="admin-btn-sm" style={{ background: p === page ? 'var(--gold)' : 'transparent', color: p === page ? '#000' : 'var(--t2)' }}>
                {p.toLocaleString('fa')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--b1)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--bd)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--t)' }}>{editUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gap: 14 }}>
              <div>
                <label className="admin-label">شماره موبایل <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="admin-input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} disabled={!!editUser} dir="ltr" placeholder="09xxxxxxxxx" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="admin-label">نام</label>
                  <input className="admin-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="admin-label">نام خانوادگی</label>
                  <input className="admin-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="admin-label">ایمیل</label>
                <input className="admin-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" />
              </div>
              <div>
                <label className="admin-label">نقش <span style={{ color: 'var(--red)' }}>*</span></label>
                <select className="admin-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="customer">مشتری</option>
                  <option value="staff">کارمند</option>
                  <option value="admin">ادمین</option>
                </select>
              </div>
              {form.role === 'staff' && (
                <>
                  <div>
                    <label className="admin-label">حقوق ماهانه (تومان)</label>
                    <input className="admin-input" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))} dir="ltr" />
                  </div>
                  <div>
                    <label className="admin-label">دپارتمان‌ها</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {DEPARTMENTS.map(d => (
                        <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 12, color: 'var(--t2)' }}>
                          <input
                            type="checkbox"
                            checked={form.departments.includes(d)}
                            onChange={e => setForm(f => ({
                              ...f,
                              departments: e.target.checked ? [...f.departments, d] : f.departments.filter(x => x !== d)
                            }))}
                          />
                          {DEPT_LABEL[d] || d}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{ width: 44, height: 24, borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s', position: 'relative', background: form.isActive ? 'var(--gold)' : 'var(--b3)' }}
                >
                  <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'right 0.2s', right: form.isActive ? 3 : 23 }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>حساب فعال</span>
              </div>

              {msg && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>{msg}</div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setShowAdd(false)} className="admin-btn" style={{ background: 'transparent', border: '1px solid var(--bd)', color: 'var(--t2)' }}>انصراف</button>
                <button onClick={handleSubmit} disabled={saving} className="admin-btn">
                  {saving ? 'در حال ذخیره...' : editUser ? 'بروزرسانی' : 'ثبت کاربر'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
