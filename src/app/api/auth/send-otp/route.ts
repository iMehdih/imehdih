import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { generateOTP, getOTPExpiry } from '@/lib/auth/otp'
import { sendOTP } from '@/lib/sms/kavenegar'
import { z } from 'zod'

const schema = z.object({
  mobile: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile } = schema.parse(body)

    await connectDB()

    const otp = generateOTP()
    const otpExpires = getOTPExpiry()

    await User.findOneAndUpdate(
      { mobile },
      { 
        $set: { otp, otpExpires },
        $setOnInsert: { role: 'customer', isActive: true, isProfileComplete: false, customerScore: 0, isVIP: false }
      },
      { upsert: true, new: true }
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP for ${mobile}: ${otp}`)
      return NextResponse.json({ success: true, dev_otp: otp })
    }

    const sent = await sendOTP(mobile, otp)
    if (!sent) {
      return NextResponse.json({ success: false, error: 'خطا در ارسال پیامک' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}