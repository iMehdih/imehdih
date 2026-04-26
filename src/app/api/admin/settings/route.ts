import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Settings, { DEFAULT_SETTINGS } from '@/models/Settings'
import { requireRole } from '@/lib/auth/middleware'
import { writeAuditLog } from '@/lib/utils/audit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    let settings = await Settings.find().sort('group').lean()

    // Seed defaults if empty
    if (settings.length === 0) {
      await Settings.insertMany(DEFAULT_SETTINGS)
      settings = await Settings.find().sort('group').lean()
    }

    // Mask secret values in response
    const safeSettings = settings.map(s => ({
      ...s,
      value: s.isSecret ? (s.value ? '••••••••' : '') : s.value,
    }))

    return NextResponse.json({ success: true, data: safeSettings })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

const updateSchema = z.object({
  updates: z.array(z.object({
    key: z.string(),
    value: z.unknown(),
  })).min(1),
})

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    const body = await req.json()
    const { updates } = updateSchema.parse(body)

    await connectDB()

    const results = []
    for (const { key, value } of updates) {
      // Don't allow updating secret fields with masked placeholder
      if (typeof value === 'string' && value === '••••••••') continue

      const updated = await Settings.findOneAndUpdate(
        { key },
        { value, updatedBy: auth.userId },
        { new: true, upsert: false }
      )
      if (updated) results.push(key)
    }

    await writeAuditLog({
      userId: auth.userId, userRole: auth.role,
      action: 'update_settings', entity: 'settings',
      after: { updatedKeys: results }, req,
    })

    return NextResponse.json({ success: true, updated: results })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
