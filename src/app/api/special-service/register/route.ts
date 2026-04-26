// src/app/api/special-service/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  website: { type: String, trim: true },
  plan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'pro' },
  message: { type: String, trim: true },
  source: { type: String, default: 'special-service' },
  createdAt: { type: Date, default: Date.now },
})

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema)

const MOBILE_RE = /^09[0-9]{9}$/

export async function POST(req: NextRequest) {
  try {
    const { name, mobile, website, plan, message } = await req.json()

    if (!name?.trim() || !mobile?.trim()) {
      return NextResponse.json({ error: 'نام و موبایل الزامی است' }, { status: 400 })
    }
    if (!MOBILE_RE.test(mobile.trim())) {
      return NextResponse.json({ error: 'شماره موبایل نامعتبر است' }, { status: 400 })
    }

    await connectDB()
    await Lead.create({ name: name.trim(), mobile: mobile.trim(), website: website?.trim(), plan, message: message?.trim() })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
