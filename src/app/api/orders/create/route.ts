// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'
import Order from '@/models/Order'
import Coupon from '@/models/Coupon'
import CouponUse from '@/models/CouponUse'
import { requireAuth } from '@/lib/auth/middleware'
import { createPayment } from '@/lib/payment/zarinpal'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

const schema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1),
  })).min(1),
  couponCode: z.string().optional(),
})

function generateOrderNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `HP-${y}${m}${d}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const { items, couponCode } = schema.parse(body)

    await connectDB()

    // واکشی محصولات
    const productIds = items.map(i => i.productId)
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, error: 'یک یا چند محصول یافت نشد یا موجود نیست' },
        { status: 400 }
      )
    }

    // ساخت آیتم‌های سفارش
    const orderItems = products.map(product => {
      const finalPrice = product.salePrice ?? product.price
      return {
        productId: product._id,
        productType: product.type,
        title: product.title,
        price: product.price,
        discountedPrice: finalPrice,
      }
    })

    const subtotal = orderItems.reduce((sum, i) => sum + i.discountedPrice, 0)

    // اعمال کوپن
    let couponDiscount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      })

      if (coupon) {
        const userUseCount = await CouponUse.countDocuments({
          couponId: coupon._id,
          userId: auth.userId,
        })

        if (userUseCount < coupon.maxUsesPerUser) {
          if (coupon.type === 'percent') {
            couponDiscount = Math.round(subtotal * coupon.value / 100)
            if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount)
          } else {
            couponDiscount = Math.min(coupon.value, subtotal)
          }
          couponId = coupon._id
        }
      }
    }

    const finalAmount = Math.max(0, subtotal - couponDiscount)
    const orderNumber = generateOrderNumber()

    // ساخت سفارش
    const order = await Order.create({
      orderNumber,
      userId: auth.userId,
      items: orderItems,
      subtotal,
      discountAmount: orderItems.reduce((s, i) => s + (i.price - i.discountedPrice), 0),
      couponCode: couponCode?.toUpperCase(),
      couponDiscount,
      finalAmount,
      status: 'pending_payment',
    })

    // اگه مبلغ صفر بود (رایگان) — مستقیم تأیید
    if (finalAmount === 0) {
      await activateOrder(order._id.toString(), auth.userId, products)
      return NextResponse.json({
        success: true,
        data: { orderId: order._id, orderNumber, free: true },
      })
    }

    // ایجاد لینک پرداخت
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const callbackUrl = `${appUrl}/api/orders/verify?orderId=${order._id}`

    const payment = await createPayment(
      finalAmount,
      `سفارش ${orderNumber} — مهدی حاتم‌پور`,
      callbackUrl,
    )

    if (!payment.success || !payment.authority) {
      await Order.findByIdAndDelete(order._id)
      return NextResponse.json(
        { success: false, error: payment.error || 'خطا در ایجاد پرداخت' },
        { status: 500 }
      )
    }

    // ذخیره authority
    await Order.findByIdAndUpdate(order._id, { paymentRef: payment.authority })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber,
        paymentUrl: payment.paymentUrl,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error('create-order error:', err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

// فعال‌سازی محصولات بعد از پرداخت موفق
async function activateOrder(orderId: string, userId: string, products: any[]) {
  await Order.findByIdAndUpdate(orderId, {
    status: 'completed',
    paidAt: new Date(),
  })

  // notify
  await notify({
    userId,
    title: 'سفارش تأیید شد',
    content: 'سفارش شما با موفقیت ثبت و فعال شد.',
    type: 'order',
    relatedId: orderId,
  })
}