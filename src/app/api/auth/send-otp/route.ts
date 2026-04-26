import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { generateOTP, getOTPExpiry, hashOTP } from '@/lib/auth/otp'
import { sendOTP } from '@/lib/sms/kavenegar'
import { checkRateLimit } from '@/lib/utils/rateLimit'
import { z } from 'zod'

const schema = z.object({
  mobile: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile } = schema.parse(body)

    // Rate limit: max 3 attempts per 15 minutes per mobile
    const mobileKey = `otp:mobile:${mobile}`
    const mobileLimit = await checkRateLimit(mobileKey, 3, 15 * 60)
    if (!mobileLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `تعداد درخواست بیش از حد مجاز. لطفاً ${Math.ceil(mobileLimit.resetInSeconds / 60)} دقیقه دیگر تلاش کنید.` },
        { status: 429 }
      )
    }

    // Rate limit: max 10 attempts per 15 minutes per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    const ipKey = `otp:ip:${ip}`
    const ipLimit = await checkRateLimit(ipKey, 10, 15 * 60)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'تعداد درخواست از این آدرس بیش از حد مجاز است.' },
        { status: 429 }
      )
    }

    await connectDB()

    const otp = generateOTP()
    const otpHash = hashOTP(otp)
    const otpExpires = getOTPExpiry()

    await User.findOneAndUpdate(
      { mobile },
      {
        $set: { otp: otpHash, otpExpires },
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
