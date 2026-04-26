import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { requireRole } from '@/lib/auth/middleware'
import { writeAuditLog } from '@/lib/utils/audit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true'
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { mobile: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-otp -otpExpires')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])

    return NextResponse.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

const createSchema = z.object({
  mobile: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  role: z.enum(['customer', 'staff', 'admin']),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  salary: z.number().min(0).optional(),
  departments: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    const body = await req.json()
    const data = createSchema.parse(body)

    await connectDB()

    const existing = await User.findOne({ mobile: data.mobile })
    if (existing) {
      return NextResponse.json({ success: false, error: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 409 })
    }

    const user = await User.create({
      mobile: data.mobile,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      salary: data.salary,
      departments: data.departments,
      isActive: true,
      isProfileComplete: !!(data.firstName),
      customerScore: 0,
      isVIP: false,
      walletBalance: 0,
    })

    await writeAuditLog({
      userId: auth.userId, userRole: auth.role,
      action: 'create_user', entity: 'user',
      entityId: user._id.toString(),
      after: { mobile: data.mobile, role: data.role }, req,
    })

    return NextResponse.json({ success: true, data: { id: user._id, mobile: user.mobile, role: user.role } }, { status: 201 })
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
