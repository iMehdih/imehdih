import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(authUser.userId).select('-otp -otpExpires')
  if (!user) {
    return NextResponse.json({ success: false, error: 'کاربر یافت نشد' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: user })
}
