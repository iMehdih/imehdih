// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  isLegal: z.boolean().default(false),
  companyName: z.string().optional(),
  nationalId: z.string().optional(),
  economicCode: z.string().optional(),
  emailNotifications: z.record(z.boolean()).optional(),
})

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const data = schema.parse(body)

    await connectDB()

    await User.findByIdAndUpdate(auth.userId, {
      $set: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.email ? { email: data.email } : {}),
        isLegal: data.isLegal,
        ...(data.companyName ? { companyName: data.companyName } : {}),
        ...(data.nationalId ? { nationalId: data.nationalId } : {}),
        ...(data.economicCode ? { economicCode: data.economicCode } : {}),
        ...(data.emailNotifications ? { emailNotifications: data.emailNotifications } : {}),
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
