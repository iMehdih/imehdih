// src/components/admin/TemplateBuilder.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Field {
  name: string
  label: string
  type: 'text' | 'number' | 'image' | 'file' | 'url' | 'textarea' | 'select'
  required: boolean
  usedInReport: boolean
  reportLabel: string
  options: string
}

interface Task {
  title: string
  description: string
  order: number
  isRequired: boolean
  isBlocking: boolean
  recurringType: '' | 'weekly' | 'monthly' | 'custom'
  recurringDayOfWeek: number
  recurringDayOfMonth: number
  fields: Field[]
}

interface Props {
  products: { _id: string; title: string; type: string }[]
  initialData?: any
}

const FIELD_TYPES = [
  { val: 'text', label: 'متن کوتاه' },
  { val: 'textarea', label: 'متن بلند' },
  { val: 'number', label: 'عدد' },
  { val: 'image', label: 'تصویر' },
  { val: 'file', label: 'فایل' },
  { val: 'url', label: 'لینک' },
  { val: 'select', label: 'انتخاب از لیست' },
]

function emptyField(): Field {
  return { name: '', label: '', type: 'text', required: false, usedInReport: false, reportLabel: '', options: '' }
}

function emptyTask(order: number): Task {
  return { title: '', description: '', order, isRequired: true, isBlocking: false, recurringType: '', recurringDayOfWeek: 1, recurringDayOfMonth: 1, fields: [] }
}

export default function TemplateBuilder({ products, initialData }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [productId, setProductId] = useState(initialData?.productId?._id || initialData?.productId || '')
  const [isActive, setIsActive] = useState(initialData?.isActive !== false)
  const [tasks, setTasks] = useState<Task[]>(
    initialData?.tasks?.map((t: any) => ({
      ...t,
      recurringType: t.recurringType || '',
      recurringDayOfWeek: t.recurringDayOfWeek || 1,
      recurringDayOfMonth: t.recurringDayOfMonth || 1,
      fields: t.fields?.map((f: any) => ({
        ...f,
        options: Array.isArray(f.options) ? f.options.join(',') : f.options || '',
      })) || [],
    })) || [emptyTask(0)]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedTask, setExpandedTask] = useState<number>(0)

  const selectedProduct = products.find(p => p._id === productId)

  function addTask() {
    setTasks(prev => [...prev, emptyTask(prev.length)])
    setExpandedTask(tasks.length)
  }

  function removeTask(i: number) {
    setTasks(prev => prev.filter((_, idx) => idx !== i).map((t, idx) => ({ ...t, order: idx })))
    setExpandedTask(Math.max(0, i - 1))
  }

  function updateTask(i: number, field: keyof Task, value: any) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  function addField(taskIdx: number) {
    setTasks(prev => prev.map((t, idx) => idx === taskIdx ? { ...t, fields: [...t.fields, emptyField()] } : t))
  }

  function removeField(taskIdx: number, fieldIdx: number) {
    setTasks(prev => prev.map((t, idx) => idx === taskIdx ? { ...t, fields: t.fields.filter((_, fi) => fi !== fieldIdx) } : t))
  }

  function updateField(taskIdx: number, fieldIdx: number, key: keyof Field, val: any) {
    setTasks(prev => prev.map((t, idx) => {
      if (idx !== taskIdx) return t
      return { ...t, fields: t.fields.map((f, fi) => fi !== fieldIdx ? f : { ...f, [key]: val }) }
    }))
  }

  async function handleSubmit() {
    if (!title || !productId) { setError('عنوان و محصول الزامی است'); return }
    if (tasks.some(t => !t.title)) { setError('عنوان همه تسک‌ها الزامی است'); return }

    setLoading(true)
    setError('')

    const payload = {
      title,
      productId,
      productType: selectedProduct?.type || 'service_project',
      isActive,
      tasks: tasks.map((t, i) => ({
        ...t,
        order: i,
        recurringType: t.recurringType || undefined,
        fields: t.fields.map(f => ({
          ...f,
          name: f.name || f.label.toLowerCase().replace(/\s+/g, '_'),
          options: f.type === 'select' ? f.options.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        })),
      })),
    }

    try {
      const url = initialData?._id
        ? `/api/admin/templates/${initialData._id}`
        : '/api/admin/templates'
      const method = initialData?._id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/process-engine')
      } else {
        setError(data.error || 'خطا در ذخیره')
      }
    } catch {
      setError('خطای اتصال')
    }
    setLoading(false)
  }

  return (
    <div className="admin-page">
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* Tasks */}
        <div>
          <div className="admin-card" style={{ marginBottom: 14 }}>
            <div className="admin-card-head"><div className="admin-card-title">تنظیمات اصلی</div></div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="admin-label">عنوان Template <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: بهینه‌سازی سرعت سایت" />
              </div>
              <div>
                <label className="admin-label">محصول مرتبط <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="admin-input" value={productId} onChange={e => setProductId(e.target.value)}>
                  <option value="">انتخاب محصول...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.type})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#8888A0' }}>Template فعال باشد</span>
                <div onClick={() => setIsActive(v => !v)} style={{ width: 44, height: 24, borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s', position: 'relative', background: isActive ? '#C8A96E' : '#1C1C2A' }}>
                  <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'right 0.2s', right: isActive ? 3 : 23 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tasks list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {tasks.map((task, ti) => (
              <div key={ti} className="admin-card">
                {/* Task header */}
                <div
                  onClick={() => setExpandedTask(expandedTask === ti ? -1 : ti)}
                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: task.title ? '#C8A96E' : '#1C1C2A', color: task.title ? '#000' : '#505062', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>
                    {ti + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: task.title ? '#EEEEF2' : '#505062' }}>
                    {task.title || 'تسک بدون عنوان'}
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {task.isBlocking && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '2px 7px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.2)' }}>Blocking</span>}
                    {task.recurringType && <span style={{ fontSize: 10, background: 'rgba(96,165,250,0.1)', color: '#60A5FA', padding: '2px 7px', borderRadius: 100, border: '1px solid rgba(96,165,250,0.2)' }}>Recurring</span>}
                    <span style={{ fontSize: 10, color: '#505062' }}>{task.fields.length} فیلد</span>
                  </div>
                  <span style={{ color: '#505062', fontSize: 14 }}>{expandedTask === ti ? '▲' : '▼'}</span>
                </div>

                {expandedTask === ti && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px 18px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label className="admin-label">عنوان تسک <span style={{ color: '#EF4444' }}>*</span></label>
                        <input className="admin-input" value={task.title} onChange={e => updateTask(ti, 'title', e.target.value)} placeholder="مثال: آنالیز اولیه" />
                      </div>
                      <div>
                        <label className="admin-label">توضیح</label>
                        <input className="admin-input" value={task.description} onChange={e => updateTask(ti, 'description', e.target.value)} placeholder="توضیح مختصر..." />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                      {[
                        { key: 'isRequired', label: 'الزامی' },
                        { key: 'isBlocking', label: 'Blocking (تسک بعدی قفل می‌ماند)' },
                      ].map(opt => (
                        <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: '#8888A0' }}>
                          <input type="checkbox" checked={(task as any)[opt.key]} onChange={e => updateTask(ti, opt.key as keyof Task, e.target.checked)} style={{ accentColor: '#C8A96E' }} />
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    {/* Recurring */}
                    <div style={{ marginBottom: 16 }}>
                      <label className="admin-label">تکرار</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[{ val: '', label: 'یک‌باره' }, { val: 'weekly', label: 'هفتگی' }, { val: 'monthly', label: 'ماهیانه' }].map(r => (
                          <button key={r.val} type="button"
                            onClick={() => updateTask(ti, 'recurringType', r.val as any)}
                            style={{
                              padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                              background: task.recurringType === r.val ? '#C8A96E' : '#141420',
                              color: task.recurringType === r.val ? '#000' : '#8888A0',
                              border: `1px solid ${task.recurringType === r.val ? '#C8A96E' : 'rgba(255,255,255,0.06)'}`,
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                      {task.recurringType === 'weekly' && (
                        <div style={{ marginTop: 8 }}>
                          <label className="admin-label">روز هفته</label>
                          <select className="admin-input" value={task.recurringDayOfWeek} onChange={e => updateTask(ti, 'recurringDayOfWeek', Number(e.target.value))}>
                            {['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'].map((d, i) => (
                              <option key={i} value={i}>{d}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {task.recurringType === 'monthly' && (
                        <div style={{ marginTop: 8 }}>
                          <label className="admin-label">روز ماه</label>
                          <input type="number" className="admin-input" min={1} max={31} value={task.recurringDayOfMonth} onChange={e => updateTask(ti, 'recurringDayOfMonth', Number(e.target.value))} style={{ maxWidth: 100 }} />
                        </div>
                      )}
                    </div>

                    {/* Fields */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label className="admin-label" style={{ margin: 0 }}>فیلدهای تسک</label>
                        <button type="button" onClick={() => addField(ti)}
                          style={{ padding: '4px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 800, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', color: '#C8A96E', cursor: 'pointer', fontFamily: 'inherit' }}>
                          + فیلد
                        </button>
                      </div>
                      {task.fields.map((field, fi) => (
                        <div key={fi} style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 8, marginBottom: 8 }}>
                            <div>
                              <label className="admin-label">برچسب</label>
                              <input className="admin-input" value={field.label} onChange={e => updateField(ti, fi, 'label', e.target.value)} placeholder="مثال: نمره PageSpeed" />
                            </div>
                            <div>
                              <label className="admin-label">نام (slug)</label>
                              <input className="admin-input" value={field.name} onChange={e => updateField(ti, fi, 'name', e.target.value)} placeholder="pagespeed_score" dir="ltr" />
                            </div>
                            <div>
                              <label className="admin-label">نوع</label>
                              <select className="admin-input" value={field.type} onChange={e => updateField(ti, fi, 'type', e.target.value)}>
                                {FIELD_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                              </select>
                            </div>
                          </div>
                          {field.type === 'select' && (
                            <div style={{ marginBottom: 8 }}>
                              <label className="admin-label">گزینه‌ها (با کاما جدا کن)</label>
                              <input className="admin-input" value={field.options} onChange={e => updateField(ti, fi, 'options', e.target.value)} placeholder="گزینه ۱, گزینه ۲, گزینه ۳" />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#8888A0' }}>
                              <input type="checkbox" checked={field.required} onChange={e => updateField(ti, fi, 'required', e.target.checked)} style={{ accentColor: '#C8A96E' }} />
                              الزامی
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#22C55E' }}>
                              <input type="checkbox" checked={field.usedInReport} onChange={e => updateField(ti, fi, 'usedInReport', e.target.checked)} style={{ accentColor: '#22C55E' }} />
                              در گزارش مشتری
                            </label>
                            {field.usedInReport && (
                              <input className="admin-input" value={field.reportLabel} onChange={e => updateField(ti, fi, 'reportLabel', e.target.value)} placeholder="برچسب در گزارش..." style={{ flex: 1, minWidth: 150, fontSize: 12, padding: '6px 10px' }} />
                            )}
                            <button type="button" onClick={() => removeField(ti, fi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 11.5, fontFamily: 'inherit', marginRight: 'auto' }}>
                              حذف فیلد
                            </button>
                          </div>
                        </div>
                      ))}
                      {task.fields.length === 0 && (
                        <div style={{ fontSize: 12, color: '#505062', padding: '8px 0' }}>این تسک فیلدی ندارد — فقط تیک تکمیل دارد</div>
                      )}
                    </div>

                    {/* Remove task */}
                    {tasks.length > 1 && (
                      <button type="button" onClick={() => removeTask(ti)} style={{ marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontFamily: 'inherit' }}>
                        حذف این تسک
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addTask}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', border: '1.5px dashed rgba(200,169,110,0.3)', color: '#C8A96E', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            + افزودن تسک جدید
          </button>
        </div>

        {/* Sidebar: Summary + Save */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="admin-card" style={{ marginBottom: 12 }}>
            <div className="admin-card-head"><div className="admin-card-title">خلاصه Template</div></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#505062' }}>تعداد تسک</span>
                <strong style={{ color: '#C8A96E' }}>{tasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#505062' }}>تسک Blocking</span>
                <strong style={{ color: '#EF4444' }}>{tasks.filter(t => t.isBlocking).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#505062' }}>تسک Recurring</span>
                <strong style={{ color: '#60A5FA' }}>{tasks.filter(t => t.recurringType).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: '#505062' }}>فیلدهای گزارش</span>
                <strong style={{ color: '#22C55E' }}>{tasks.reduce((s, t) => s + t.fields.filter(f => f.usedInReport).length, 0)}</strong>
              </div>
            </div>
          </div>

          {/* Flow preview */}
          <div className="admin-card" style={{ marginBottom: 12 }}>
            <div className="admin-card-head"><div className="admin-card-title">ترتیب تسک‌ها</div></div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.title ? '#C8A96E' : '#1C1C2A', color: t.title ? '#000' : '#505062', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: t.title ? '#EEEEF2' : '#505062', flex: 1 }}>{t.title || '...'}</span>
                  {t.isBlocking && <span style={{ fontSize: 9, color: '#EF4444' }}>🔒</span>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="admin-btn admin-btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '13px' }}>
            {loading ? 'در حال ذخیره...' : initialData ? 'ذخیره تغییرات' : '+ ذخیره Template'}
          </button>
          <a href="/admin/process-engine" className="admin-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#8888A0', textDecoration: 'none', display: 'flex', alignItems: 'center', marginTop: 8 }}>
            انصراف
          </a>
        </div>
      </div>
    </div>
  )
}
