// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Review from '@/models/Review'
import Product from '@/models/Product'
import Order from '@/models/Order'
import { getAuthUser } from '@/lib/auth/middleware'

// GET /api/reviews?productId=...&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = 10

  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  await connectDB()

  const [reviews, total] = await Promise.all([
    Review.find({ productId, isApproved: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ productId, isApproved: true }),
  ])

  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/reviews — submit a review
export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })

  const { productId, rating, title, body } = await req.json()

  if (!productId || !rating || !body?.trim()) {
    return NextResponse.json({ error: 'productId، امتیاز و متن الزامی است' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۵ باشد' }, { status: 400 })
  }

  await connectDB()

  // check if product exists
  const product = await Product.findById(productId).lean()
  if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })

  // check verified purchase
  const order = await Order.findOne({
    userId: auth.userId,
    'items.productId': productId,
    status: { $in: ['paid', 'completed', 'delivered'] },
  }).lean()

  const existing = await Review.findOne({ productId, userId: auth.userId })
  if (existing) return NextResponse.json({ error: 'شما قبلاً نظر ثبت کرده‌اید' }, { status: 409 })

  const review = await Review.create({
    productId,
    userId: auth.userId,
    rating,
    title: title?.trim() || undefined,
    body: body.trim(),
    isVerifiedPurchase: !!order,
    isApproved: true,
  })

  // recalculate product rating average
  const agg = await Review.aggregate([
    { $match: { productId: review.productId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (agg.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    })
  }

  return NextResponse.json({ success: true, review })
}
