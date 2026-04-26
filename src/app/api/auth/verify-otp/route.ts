import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { isOTPValid } from '@/lib/auth/otp'
import { signToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const schema = z.object({
  mobile: z.string().regex(/^09[0-9]{9}$/),
  otp: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile, otp } = schema.parse(body)

    await connectDB()

    const user = await User.findOne({ mobile })
    if (!user) {
      return NextResponse.json({ success: false, error: 'کاربر یافت نشد' }, { status: 404 })
    }

    if (!user.otp || !user.otpExpires || !isOTPValid(otp, user.otp, user.otpExpires)) {
      return NextResponse.json({ success: false, error: 'کد تأیید نامعتبر یا منقضی شده' }, { status: 400 })
    }

    user.otp = undefined
    user.otpExpires = undefined
    user.lastSeen = new Date()
    if (!user.role) user.role = 'customer'
    await user.save()

    const token = await signToken({
      userId: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set('hp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        firstName: user.firstName,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error('verify-otp error:', err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}