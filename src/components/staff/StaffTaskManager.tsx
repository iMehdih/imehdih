// src/components/staff/StaffTaskManager.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Field {
  name: string
  label: string
  type: string
  required: boolean
  usedInReport: boolean
  options?: string[]
}

interface Task {
  _id: string
  title: string
  description?: string
  status: 'pending' | 'unlocked' | 'in_progress' | 'completed'
  isBlocking: boolean
  isRequired: boolean
  fields: Field[]
  fieldValues: Record<string, unknown>
  completedAt?: string
  order: number
}

interface Props {
  project: any
  staffId: string
}

export default function StaffTaskManager({ project, staffId }: Props) {
  const router = useRouter()
  const [activeTask, setActiveTask] = useState<number>(
    project.tasks.findIndex((t: Task) => t.status === 'in_progress' || t.status === 'unlocked')
  )
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tasks: Task[] = project.tasks.sort((a: Task, b: Task) => a.order - b.order)

  function getFieldVal(taskId: string, fieldName: string, existing?: unknown) {
    return fieldValues[taskId]?.[fieldName] ?? existing ?? ''
  }

  function setFieldVal(taskId: string, fieldName: string, val: unknown) {
    setFieldValues(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), [fieldName]: val }
    }))
  }

  async function handleSave(task: Task, action: 'save' | 'complete') {
    setLoading(task._id)
    setErrors({})
    try {
      const res = await fetch(`/api/projects/${project._id}/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldValues: fieldValues[task._id] || {},
          action,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
        if (action === 'complete') {
          // برو به تسک بعدی
          const nextIdx = tasks.findIndex((t, i) => i > activeTask && t.status !== 'completed')
          if (nextIdx !== -1) setActiveTask(nextIdx)
        }
      } else {
        setErrors({ [task._id]: data.error || 'خطا' })
      }
    } catch {
      setErrors({ [task._id]: 'خطای اتصال' })
    }
    setLoading(null)
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div>
      {/* Progress */}
      <div className="db-card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>پیشرفت پروژه</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#C8A96E' }}>{completedCount}/{totalCount} تسک</span>
          </div>
          <div className="db-prog-wrap">
            <div className="db-prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14, alignItems: 'start' }}>
        {/* Tasks List */}
        <div className="db-card" style={{ position: 'sticky', top: 20 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--bd)', fontSize: 12, fontWeight: 800, color: '#505062', textTransform: 'uppercase', letterSpacing: '0.8px' }}>تسک‌ها</div>
          {tasks.map((task, i) => {
            const isLocked = task.status === 'pending'
            const isDone = task.status === 'completed'
            const isActive = activeTask === i && !isLocked

            return (
              <div key={task._id}
                onClick={() => !isLocked && setActiveTask(i)}
                style={{
                  padding: '12px 14px', borderBottom: '1px solid var(--bd)', cursor: isLocked ? 'default' : 'pointer',
                  background: isActive ? 'rgba(200,169,110,0.08)' : 'transparent',
                  opacity: isLocked ? 0.45 : 1,
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900,
                    background: isDone ? '#22C55E' : isActive ? '#C8A96E' : isLocked ? '#1C1C2A' : '#1C1C2A',
                    color: (isDone || isActive) ? '#000' : '#505062',
                  }}>
                    {isDone ? '✓' : isLocked ? '🔒' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? '#C8A96E' : isDone ? '#22C55E' : '#EEEEF2' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#505062' }}>
                      {isDone ? '✓ تکمیل' : isLocked ? 'قفل' : task.fields.length > 0 ? `${task.fields.length} فیلد` : 'بدون فیلد'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Task */}
        {activeTask >= 0 && activeTask < tasks.length && (() => {
          const task = tasks[activeTask]
          const isLocked = task.status === 'pending'
          const isDone = task.status === 'completed'

          return (
            <div className="db-card">
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 900, flex: 1 }}>{task.title}</div>
                <span className={`db-badge ${isDone ? 'db-badge-green' : isLocked ? 'db-badge-gray' : 'db-badge-blue'}`}>
                  {isDone ? 'تکمیل شده' : isLocked ? 'قفل' : task.status === 'in_progress' ? 'در حال انجام' : 'آماده'}
                </span>
              </div>

              {task.description && (
                <div style={{ padding: '12px 20px', fontSize: 13, color: '#8888A0', borderBottom: '1px solid var(--bd)' }}>
                  {task.description}
                </div>
              )}

              <div style={{ padding: '20px' }}>
                {isLocked && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#505062', fontSize: 13 }}>
                    🔒 این تسک پس از تکمیل تسک قبلی آنلاک می‌شود
                  </div>
                )}

                {!isLocked && task.fields.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 13, color: '#8888A0', marginBottom: 16 }}>این تسک فیلدی ندارد — فقط تأیید تکمیل</div>
                    {!isDone && (
                      <button onClick={() => handleSave(task, 'complete')} disabled={loading === task._id}
                        className="db-btn db-btn-gold" style={{ opacity: loading === task._id ? 0.6 : 1 }}>
                        {loading === task._id ? 'در حال ذخیره...' : '✓ تسک را تکمیل کن'}
                      </button>
                    )}
                  </div>
                )}

                {!isLocked && task.fields.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {task.fields.map((field) => (
                      <div key={field.name}>
                        <label className="db-label">
                          {field.label}
                          {field.required && <span style={{ color: '#EF4444' }}> *</span>}
                          {field.usedInReport && <span style={{ fontSize: 9.5, color: '#22C55E', marginRight: 6, fontWeight: 700 }}>📊 گزارش</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea className="db-input" rows={4} style={{ resize: 'vertical' }}
                            value={String(getFieldVal(task._id, field.name, task.fieldValues?.[field.name]) || '')}
                            onChange={e => setFieldVal(task._id, field.name, e.target.value)}
                            disabled={isDone} />
                        ) : field.type === 'select' ? (
                          <select className="db-input"
                            value={String(getFieldVal(task._id, field.name, task.fieldValues?.[field.name]) || '')}
                            onChange={e => setFieldVal(task._id, field.name, e.target.value)}
                            disabled={isDone}>
                            <option value="">انتخاب کنید...</option>
                            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : field.type === 'number' ? (
                          <input type="number" className="db-input" dir="ltr"
                            value={String(getFieldVal(task._id, field.name, task.fieldValues?.[field.name]) || '')}
                            onChange={e => setFieldVal(task._id, field.name, e.target.value)}
                            disabled={isDone} />
                        ) : field.type === 'image' || field.type === 'file' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {!!task.fieldValues?.[field.name] && (
                              <div style={{ fontSize: 12, color: '#22C55E' }}>
                                ✓ {field.type === 'image' ? 'تصویر' : 'فایل'} آپلود شده: {String(task.fieldValues?.[field.name] ?? '')}
                              </div>
                            )}
                            <input type="url" className="db-input" dir="ltr" placeholder={field.type === 'image' ? 'لینک تصویر...' : 'لینک فایل...'}
                              value={String(getFieldVal(task._id, field.name, task.fieldValues?.[field.name]) || '')}
                              onChange={e => setFieldVal(task._id, field.name, e.target.value)}
                              disabled={isDone} />
                            <div style={{ fontSize: 11, color: '#505062' }}>در این مرحله لینک URL وارد کنید. آپلود مستقیم در مرحله بعد اضافه می‌شود.</div>
                          </div>
                        ) : (
                          <input type={field.type === 'url' ? 'url' : 'text'} className="db-input"
                            dir={field.type === 'url' ? 'ltr' : 'rtl'}
                            value={String(getFieldVal(task._id, field.name, task.fieldValues?.[field.name]) || '')}
                            onChange={e => setFieldVal(task._id, field.name, e.target.value)}
                            disabled={isDone} />
                        )}
                      </div>
                    ))}

                    {errors[task._id] && (
                      <div className="db-alert db-alert-error">{errors[task._id]}</div>
                    )}

                    {!isDone && (
                      <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid var(--bd)' }}>
                        <button onClick={() => handleSave(task, 'save')} disabled={loading === task._id}
                          className="db-btn db-btn-outline" style={{ opacity: loading === task._id ? 0.6 : 1 }}>
                          ذخیره موقت
                        </button>
                        <button onClick={() => handleSave(task, 'complete')} disabled={loading === task._id}
                          className="db-btn db-btn-gold" style={{ opacity: loading === task._id ? 0.6 : 1 }}>
                          {loading === task._id ? 'در حال ذخیره...' : '✓ تکمیل تسک'}
                        </button>
                      </div>
                    )}

                    {isDone && (
                      <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, fontSize: 12.5, color: '#22C55E' }}>
                        ✓ این تسک در {task.completedAt ? new Date(task.completedAt).toLocaleDateString('fa-IR') : ''} تکمیل شد
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
