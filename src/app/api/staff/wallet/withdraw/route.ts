// src/app/api/staff/wallet/withdraw/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import WalletTransaction from '@/models/WalletTransaction'
import { requireRole } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(5000000, 'حداقل مبلغ برداشت ۵ میلیون تومان است'),
  bankAccount: z.string().min(10, 'شماره حساب معتبر نیست'),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['staff'])
    const body = await req.json()
    const { amount, bankAccount } = schema.parse(body)

    await connectDB()

    const staff = await User.findById(auth.userId)
    if (!staff) return NextResponse.json({ success: false, error: 'کاربر یافت نشد' }, { status: 404 })

    if ((staff.walletBalance || 0) < amount) {
      return NextResponse.json({ success: false, error: 'موجودی کافی نیست' }, { status: 400 })
    }

    // چک pending قبلی
    const pending = await WalletTransaction.findOne({ staffId: auth.userId, type: 'withdrawal', status: 'pending' })
    if (pending) {
      return NextResponse.json({ success: false, error: 'یک درخواست برداشت در انتظار تأیید دارید' }, { status: 400 })
    }

    await WalletTransaction.create({
      staffId: auth.userId,
      type: 'withdrawal',
      amount,
      description: `برداشت به حساب ${bankAccount}`,
      status: 'pending',
    })

    return NextResponse.json({ success: true, message: 'درخواست برداشت ثبت شد. ظرف ۷۲ ساعت پردازش می‌شود.' })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
