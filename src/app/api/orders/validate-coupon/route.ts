// src/app/api/orders/validate-coupon/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Coupon from '@/models/Coupon'
import CouponUse from '@/models/CouponUse'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    price: z.number(),
  })),
  subtotal: z.number(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const { code, items, subtotal } = schema.parse(body)

    await connectDB()

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'کد تخفیف معتبر نیست' }, { status: 400 })
    }

    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ success: false, error: 'این کد تخفیف هنوز فعال نشده' }, { status: 400 })
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ success: false, error: 'این کد تخفیف منقضی شده' }, { status: 400 })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: 'ظرفیت این کد تخفیف پر شده' }, { status: 400 })
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ success: false, error: `حداقل مبلغ سفارش ${coupon.minOrderAmount.toLocaleString('fa')} تومان است` }, { status: 400 })
    }

    // چک per user
    const userUseCount = await CouponUse.countDocuments({
      couponId: coupon._id,
      userId: auth.userId,
    })
    if (userUseCount >= coupon.maxUsesPerUser) {
      return NextResponse.json({ success: false, error: 'شما قبلاً از این کد استفاده کرده‌اید' }, { status: 400 })
    }

    // چک first_order
    if (coupon.applicableTo === 'first_order') {
      const prevOrders = await Order.countDocuments({
        userId: auth.userId,
        status: { $in: ['paid', 'in_progress', 'completed'] },
      })
      if (prevOrders > 0) {
        return NextResponse.json({ success: false, error: 'این کد فقط برای اولین خرید است' }, { status: 400 })
      }
    }

    // محاسبه تخفیف
    let discountAmount = 0
    if (coupon.type === 'percent') {
      discountAmount = Math.round(subtotal * coupon.value / 100)
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount)
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal)
    }

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountAmount,
        type: coupon.type,
        value: coupon.value,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}