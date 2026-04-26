// scripts/seed.ts — اجرا با: npx tsx scripts/seed.ts
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI!

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const Product = (await import('../src/models/Product')).default
  const User = (await import('../src/models/User')).default

  // پاک کردن داده‌های قبلی
  await Product.deleteMany({})
  console.log('Cleared products')

  // ساخت محصولات نمونه
  await Product.insertMany([
    {
      type: 'theme',
      title: 'قالب آواتار Pro',
      slug: 'avatar-pro-theme',
      shortDescription: 'قالب فروشگاهی حرفه‌ای با WooCommerce کامل',
      description: 'قالب آواتار Pro یک قالب فروشگاهی حرفه‌ای برای وردپرس است.',
      price: 500000,
      salePrice: 400000,
      category: 'shop',
      tags: ['woocommerce', 'فروشگاهی', 'rtl'],
      isActive: true,
      isFeatured: true,
      supportDuration: 180,
      rating: 4.9,
      reviewCount: 37,
      meta: { version: '2.1.0', wpCompatibility: '6.4+', pageBuilder: 'elementor' },
    },
    {
      type: 'plugin',
      title: 'افزونه فرم‌ساز فارسی',
      slug: 'persian-form-builder',
      shortDescription: 'ساخت فرم‌های پیشرفته فارسی برای وردپرس',
      description: 'افزونه فرم‌ساز فارسی با قابلیت‌های پیشرفته.',
      price: 220000,
      category: 'form',
      tags: ['form', 'فارسی', 'contact'],
      isActive: true,
      supportDuration: 180,
      rating: 4.6,
      reviewCount: 18,
      meta: { version: '1.5.2', wpCompatibility: '6.0+' },
    },
    {
      type: 'course',
      title: 'دوره وووکامرس پیشرفته',
      slug: 'advanced-woocommerce-course',
      shortDescription: 'از صفر تا صد فروشگاه آنلاین حرفه‌ای',
      description: 'جامع‌ترین دوره آموزش WooCommerce به فارسی.',
      price: 380000,
      category: 'woocommerce',
      tags: ['woocommerce', 'آموزش', 'فروشگاه'],
      isActive: true,
      rating: 4.8,
      reviewCount: 111,
      meta: { lessons: 73, duration: '20 ساعت', level: 'advanced' },
    },
    {
      type: 'service_project',
      title: 'بهینه‌سازی سرعت سایت',
      slug: 'speed-optimization',
      shortDescription: 'PageSpeed بالای ۹۰ — تضمینی',
      description: 'بهینه‌سازی کامل Core Web Vitals سایت وردپرسی شما.',
      price: 450000,
      category: 'optimization',
      tags: ['سرعت', 'pagespeed', 'core web vitals'],
      isActive: true,
      meta: { deliveryDays: 3, guarantee: 'pagespeed_90' },
    },
    {
      type: 'subscription_pro',
      title: 'اشتراک Pro دانلود فایل',
      slug: 'pro-subscription',
      shortDescription: 'دسترسی نامحدود به تمام فایل‌ها',
      description: 'با اشتراک Pro به تمام فایل‌های گرافیکی دسترسی داشته باشید.',
      price: 99000,
      salePrice: 79000,
      category: 'subscription',
      isActive: true,
      isFeatured: true,
      meta: { duration: 90, downloadLimit: 50 },
    },
    {
      type: 'file',
      title: 'موکاپ لپ‌تاپ حرفه‌ای',
      slug: 'laptop-mockup-pack',
      shortDescription: 'پک موکاپ لپ‌تاپ 4K با Smart Object',
      description: 'موکاپ لپ‌تاپ حرفه‌ای در ۸ زاویه مختلف.',
      price: 0,
      category: 'mockup',
      tags: ['موکاپ', 'psd', 'لپ‌تاپ'],
      isActive: true,
      meta: { format: ['PSD', 'PNG'], resolution: '3840x2160', fileCount: 8, software: 'photoshop' },
    },
  ])

  console.log('✅ Products seeded')

  // ساخت ادمین
  const adminExists = await User.findOne({ mobile: '09000000000' })
  if (!adminExists) {
    await User.create({
      mobile: '09000000000',
      role: 'admin',
      firstName: 'مهدی',
      lastName: 'حاتم‌پور',
      isActive: true,
      isProfileComplete: true,
      customerScore: 100,
      isVIP: true,
    })
    console.log('✅ Admin user created (mobile: 09000000000)')
  } else {
    console.log('ℹ️  Admin already exists')
  }

  await mongoose.disconnect()
  console.log('Done!')
}

seed().catch(console.error)