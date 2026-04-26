import AuditLog from '@/models/AuditLog'
import { NextRequest } from 'next/server'

interface AuditOptions {
  userId: string
  userRole: string
  action: string
  entity: string
  entityId?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  req?: NextRequest
}

export async function writeAuditLog(opts: AuditOptions): Promise<void> {
  try {
    const ip = opts.req
      ? (opts.req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || opts.req.headers.get('x-real-ip') || undefined)
      : undefined
    const userAgent = opts.req?.headers.get('user-agent') || undefined

    await AuditLog.create({
      userId: opts.userId,
      userRole: opts.userRole,
      action: opts.action,
      entity: opts.entity,
      entityId: opts.entityId,
      before: opts.before,
      after: opts.after,
      ip,
      userAgent,
    })
  } catch (err) {
    // Audit log failures must never break the main flow
    console.error('Audit log write failed:', err)
  }
}
