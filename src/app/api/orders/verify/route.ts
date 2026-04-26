// src/app/api/orders/verify/route.ts — نسخه آپدیت شده با Process Engine
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Coupon from '@/models/Coupon'
import CouponUse from '@/models/CouponUse'
import { verifyPayment } from '@/lib/payment/zarinpal'
import { notify } from '@/lib/utils/notify'
import { createProjectFromTemplate } from '@/lib/utils/processEngine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const authority = searchParams.get('Authority')
  const status = searchParams.get('Status')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!orderId || !authority) {
    return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error&reason=invalid_params`)
  }

  try {
    await connectDB()

    const order = await Order.findById(orderId)
    if (!order) return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error&reason=order_not_found`)

    if (status === 'NOK') {
      return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=cancelled&order=${order.orderNumber}`)
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=already_paid&order=${order.orderNumber}`)
    }

    const verification = await verifyPayment(authority, order.finalAmount)
    if (!verification.success) {
      return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=failed&order=${order.orderNumber}`)
    }

    // آیا همه آیتم‌ها دیجیتال هستن؟
    const isAllDigital = order.items.every((item: any) =>
      ['theme', 'plugin', 'course', 'file', 'subscription_pro'].includes(item.productType)
    )

    // آیا سرویس پروژه‌ای یا مستمر دارن؟
    const hasService = order.items.some((item: any) =>
      ['service_project', 'service_recurring'].includes(item.productType)
    )

    await Order.findByIdAndUpdate(orderId, {
      status: isAllDigital ? 'completed' : 'paid',
      paidAt: new Date(),
      paymentRef: verification.refId,
    })

    // آپدیت download count
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { downloadCount: 1 } })
    }

    // ساخت پروژه برای سرویس‌ها
    if (hasService) {
      for (const item of order.items) {
        if (['service_project', 'service_recurring'].includes(item.productType)) {
          await createProjectFromTemplate({
            orderId: order._id.toString(),
            customerId: order.userId.toString(),
            productId: item.productId.toString(),
            title: item.title,
            commissionRate: 20,
          })
        }
      }
    }

    // کوپن
    if (order.couponCode && order.couponDiscount > 0) {
      const coupon = await Coupon.findOne({ code: order.couponCode })
      if (coupon) {
        await CouponUse.create({ couponId: coupon._id, userId: order.userId, orderId: order._id })
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } })
      }
    }

    // اعلان مشتری
    await notify({
      userId: order.userId.toString(),
      title: 'پرداخت موفق',
      content: `سفارش ${order.orderNumber} با موفقیت پرداخت شد.`,
      type: 'payment',
      relatedId: orderId,
      smsTemplate: 'PAYMENT_SUCCESS',
      smsTokens: { amount: order.finalAmount.toLocaleString('fa'), orderNumber: order.orderNumber },
    })

    return NextResponse.redirect(
      `${appUrl}/dashboard/orders?payment=success&order=${order.orderNumber}&ref=${verification.refId}`
    )
  } catch (err) {
    console.error('verify-order error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error&reason=server_error`)
  }
}
