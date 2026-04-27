// src/app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Coupon from '@/models/Coupon'
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const coupons = await Coupon.find().sort('-createdAt').lean()
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { code, type, value, maxUses, minOrderAmount, expiresAt, applicableTo, maxUsesPerUser, isActive } = body

  if (!code?.trim() || !type || !value) {
    return NextResponse.json({ error: 'کد، نوع و مقدار الزامی است' }, { status: 400 })
  }

  await connectDB()
  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() })
  if (existing) return NextResponse.json({ error: 'این کد قبلاً ثبت شده' }, { status: 409 })

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    maxUses: maxUses ? Number(maxUses) : undefined,
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
    expiresAt: expiresAt || undefined,
    applicableTo: applicableTo || 'all',
    maxUsesPerUser: maxUsesPerUser || 1,
    isActive: isActive !== false,
  })

  return NextResponse.json({ coupon }, { status: 201 })
}
