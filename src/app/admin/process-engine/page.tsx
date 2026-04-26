// src/app/admin/process-engine/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/db/mongoose'
import ServiceTemplate from '@/models/ServiceTemplate'
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  service_project: 'خدمت پروژه‌ای',
  service_recurring: 'سرویس مستمر',
  theme: 'قالب', plugin: 'افزونه', course: 'دوره',
}

export default async function ProcessEnginePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hp_token')?.value
  if (!token) redirect('/auth/login')
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') redirect('/auth/login')

  await connectDB()
  const templates = await ServiceTemplate.find()
    .sort('-createdAt')
    .populate('productId', 'title type')
    .lean()

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>{(templates as any[]).length} template تعریف شده</div>
        <Link href="/admin/process-engine/new" className="admin-btn admin-btn-gold">
          + Template جدید
        </Link>
      </div>

      {(templates as any[]).length === 0 ? (
        <div className="admin-card">
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚙</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t)', marginBottom: 8 }}>هنوز Template‌ای تعریف نشده</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 20 }}>
              Template تعریف کنید تا بعد از هر سفارش، تسک‌ها اتوماتیک ساخته بشن
            </div>
            <Link href="/admin/process-engine/new" className="admin-btn admin-btn-gold">
              ساخت اولین Template
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(templates as any[]).map(t => (
            <div key={t._id.toString()} className="admin-card">
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  ⚙
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>{t.title}</div>
                    <span className={`admin-badge ${t.isActive ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                      {t.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--t3)', flexWrap: 'wrap' }}>
                    {t.productId && (
                      <span>محصول: <strong style={{ color: 'var(--t)' }}>{t.productId.title}</strong></span>
                    )}
                    <span style={{ color: 'var(--gold)' }}>{t.tasks?.length || 0} تسک</span>
                    <span>{t.tasks?.filter((tk: any) => tk.isBlocking).length || 0} تسک blocking</span>
                    <span>{t.tasks?.filter((tk: any) => tk.recurringType).length || 0} تسک recurring</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/admin/process-engine/${t._id}/edit`} className="admin-btn-sm">
                    ویرایش
                  </Link>
                </div>
              </div>

              {/* تسک‌ها */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(t.tasks || []).map((task: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--b2)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, padding: '5px 10px', fontSize: 11.5,
                  }}>
                    <span style={{ color: 'var(--t3)', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ color: 'var(--t)' }}>{task.title}</span>
                    {task.isBlocking && <span title="Blocking" style={{ color: 'var(--red)', fontSize: 10 }}>🔒</span>}
                    {task.recurringType && <span title={`تکرار ${task.recurringType}`} style={{ color: 'var(--blue)', fontSize: 10 }}>↻</span>}
                    {task.fields?.some((f: any) => f.usedInReport) && <span title="در گزارش" style={{ color: 'var(--green)', fontSize: 10 }}>📊</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
