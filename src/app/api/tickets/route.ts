// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Ticket from '@/models/Ticket'
import User from '@/models/User'
import Order from '@/models/Order'
import Domain from '@/models/Domain'
import { requireAuth } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

// دپارتمان‌هایی که نیاز به چک پشتیبانی دارن
const SUPPORT_CHECK_DEPARTMENTS = [
  'support_theme_plugin',
  'support_course',
  'support_hosting_domain',
  'support_service',
  'support_subscription',
]

// دپارتمان‌هایی که نیاز به انتخاب محصول دارن
const PRODUCT_DEPARTMENTS: Record<string, string[]> = {
  support_theme_plugin: ['theme', 'plugin'],
  support_course: ['course'],
  support_hosting_domain: ['hosting', 'domain'],
  support_service: ['service_project', 'service_recurring'],
  support_subscription: ['subscription_pro'],
}

function generateTicketNumber(): string {
  const now = new Date()
  const y = now.getFullYear().toString().slice(2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TK-${y}${m}${d}-${rand}`
}

const createSchema = z.object({
  department: z.enum([
    'support_theme_plugin',
    'support_course',
    'support_hosting_domain',
    'support_service',
    'support_subscription',
    'finance',
    'service_support',
    'presale',
    'management',
  ]),
  relatedOrderId: z.string().optional(),   // آیدی سفارش مرتبط
  relatedProductId: z.string().optional(), // آیدی محصول
  relatedProductType: z.string().optional(),
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد').max(200),
  content: z.string().min(10, 'متن تیکت باید حداقل ۱۰ کاراکتر باشد'),
  attachments: z.array(z.string()).default([]),
})

// ── GET: لیست تیکت‌های مشتری ──
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const filter: Record<string, unknown> = { userId: auth.userId }
    if (status) filter.status = status

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-messages') // پیام‌ها رو در لیست نشون نده
        .lean(),
      Ticket.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: { items: tickets, total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

// ── POST: ایجاد تیکت جدید ──
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    const body = await req.json()
    const data = createSchema.parse(body)

    await connectDB()

    // چک اگه دپارتمان نیاز به محصول داره
    if (PRODUCT_DEPARTMENTS[data.department] && !data.relatedOrderId) {
      return NextResponse.json({
        success: false,
        error: 'لطفاً محصول مرتبط را انتخاب کنید',
      }, { status: 400 })
    }

    // چک پشتیبانی فعال (فقط برای دپارتمان‌های فنی)
    if (SUPPORT_CHECK_DEPARTMENTS.includes(data.department) && data.relatedOrderId) {
      const order = await Order.findOne({
        _id: data.relatedOrderId,
        userId: auth.userId,
        status: 'completed',
      })

      if (!order) {
        return NextResponse.json({
          success: false,
          error: 'سفارش معتبر یافت نشد',
        }, { status: 400 })
      }

      // چک انقضای پشتیبانی برای قالب/افزونه
      if (data.department === 'support_theme_plugin' && order.paidAt) {
        const product = order.items.find((i: any) => i.productId?.toString() === data.relatedProductId)
        if (product) {
          // supportDuration از product میاد — اینجا ساده چک می‌کنیم
          // در فاز بعد از Product.findById اطلاعات کامل می‌گیریم
        }
      }
    }

    // دامنه رو از Domain model بگیر (فقط نمایش، قابل ویرایش نیست)
    let relatedDomain: string | undefined
    if (data.department === 'support_theme_plugin' && data.relatedProductId) {
      const domainDoc = await Domain.findOne({
        userId: auth.userId,
        productId: data.relatedProductId,
      })
      relatedDomain = domainDoc?.domain
    }

    // ساخت تیکت
    const ticket = await Ticket.create({
      ticketNumber: generateTicketNumber(),
      userId: auth.userId,
      department: data.department,
      relatedProductId: data.relatedProductId || undefined,
      relatedProductType: data.relatedProductType || undefined,
      relatedDomain,
      title: data.title,
      status: 'open',
      messages: [{
        senderId: auth.userId,
        senderRole: auth.role,
        content: data.content,
        attachments: data.attachments,
        createdAt: new Date(),
      }],
      autoCloseAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 ساعت بعد از آخرین پاسخ
    })

    // اعلان به کارمندان دپارتمان مربوطه
    const staffInDept = await User.find({
      role: 'staff',
      isActive: true,
      departments: data.department,
    }).select('_id')

    for (const staff of staffInDept) {
      await notify({
        userId: staff._id.toString(),
        title: 'تیکت جدید',
        content: `تیکت جدید: ${data.title}`,
        type: 'ticket',
        relatedId: ticket._id.toString(),
      })
    }

    // تأیید برای مشتری
    await notify({
      userId: auth.userId,
      title: 'تیکت ثبت شد',
      content: `تیکت #${ticket.ticketNumber} با موفقیت ثبت شد. در اسرع وقت رسیدگی می‌شود.`,
      type: 'ticket',
      relatedId: ticket._id.toString(),
    })

    return NextResponse.json({
      success: true,
      data: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    console.error('create ticket error:', err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
