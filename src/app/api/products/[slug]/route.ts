// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/models/Product'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params
    const product = await Product.findOne({ slug, isActive: true }).select('-downloadFile')
    if (!product) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}