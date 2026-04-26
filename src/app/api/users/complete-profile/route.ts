import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ حرف باشد'),
  lastName: z.string().min(2, 'نام‌خانوادگی باید حداقل ۲ حرف باشد'),
  email: z.string().email().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const data = schema.parse(body)

    await connectDB()

    const result = await User.findByIdAndUpdate(
      auth.userId,
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.email ? { email: data.email } : {}),
          isProfileComplete: true,
        }
      },
      { new: true }
    )

    console.log('complete-profile update result:', result?._id, 'isProfileComplete:', result?.isProfileComplete)

    if (!result) {
      return NextResponse.json({ success: false, error: 'کاربر یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error('complete-profile error:', err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}