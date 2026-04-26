// scripts/seed-append.ts
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  const ServiceTemplate = (await import('../src/models/ServiceTemplate')).default

  await ServiceTemplate.deleteMany({})
  console.log('Cleared templates')

  await ServiceTemplate.create({
    productType: 'service_project',
    title: 'بهینه‌سازی سرعت سایت',
    isActive: true,
    tasks: [
      {
        title: 'آنالیز اولیه',
        description: 'قبل از شروع کار، اسکرین و داده‌های PageSpeed را ثبت کنید',
        order: 0,
        isRequired: true,
        isBlocking: true,
        fields: [
          { name: 'screenshot_before', label: 'اسکرین‌شات قبل', type: 'image', required: true, usedInReport: true, reportLabel: 'وضعیت قبل از بهینه‌سازی' },
          { name: 'pagespeed_before', label: 'نمره PageSpeed موبایل', type: 'number', required: true, usedInReport: true, reportLabel: 'نمره PageSpeed قبل' },
          { name: 'lcp_before', label: 'زمان LCP (ms)', type: 'number', required: true, usedInReport: true, reportLabel: 'LCP قبل' },
          { name: 'cls_before', label: 'نمره CLS', type: 'number', required: false, usedInReport: true, reportLabel: 'CLS قبل' },
        ],
      },
      {
        title: 'بهینه‌سازی تصاویر',
        description: 'فشرده‌سازی و تبدیل تصاویر به فرمت WebP',
        order: 1,
        isRequired: true,
        isBlocking: false,
        fields: [
          { name: 'tool_used', label: 'ابزار استفاده‌شده', type: 'select', required: true, options: ['ShortPixel', 'Imagify', 'EWWW', 'Smush', 'دستی'], usedInReport: true, reportLabel: 'ابزار بهینه‌سازی تصویر' },
          { name: 'size_before', label: 'حجم کل تصاویر قبل (KB)', type: 'number', required: true, usedInReport: true, reportLabel: 'حجم تصاویر قبل' },
          { name: 'size_after', label: 'حجم کل تصاویر بعد (KB)', type: 'number', required: true, usedInReport: true, reportLabel: 'حجم تصاویر بعد' },
        ],
      },
      {
        title: 'تنظیم کش و CDN',
        description: 'راه‌اندازی کش مرورگر، سرور و CDN آروان‌کلاد',
        order: 2,
        isRequired: true,
        isBlocking: false,
        fields: [
          { name: 'cache_plugin', label: 'افزونه کش', type: 'select', required: true, options: ['W3 Total Cache', 'WP Rocket', 'LiteSpeed Cache', 'WP Super Cache'], usedInReport: true, reportLabel: 'افزونه کش نصب شده' },
          { name: 'cdn_enabled', label: 'CDN فعال شد؟', type: 'select', required: true, options: ['بله — آروان‌کلاد', 'بله — Cloudflare', 'خیر'], usedInReport: true, reportLabel: 'CDN' },
        ],
      },
      {
        title: 'تست نهایی و گزارش',
        description: 'بعد از همه بهینه‌سازی‌ها، نتایج نهایی را ثبت کنید',
        order: 3,
        isRequired: true,
        isBlocking: false,
        fields: [
          { name: 'screenshot_after', label: 'اسکرین‌شات بعد', type: 'image', required: true, usedInReport: true, reportLabel: 'وضعیت بعد از بهینه‌سازی' },
          { name: 'pagespeed_after', label: 'نمره PageSpeed موبایل (نهایی)', type: 'number', required: true, usedInReport: true, reportLabel: 'نمره PageSpeed بعد' },
          { name: 'lcp_after', label: 'زمان LCP نهایی (ms)', type: 'number', required: true, usedInReport: true, reportLabel: 'LCP بعد' },
          { name: 'notes', label: 'توضیحات و نکات', type: 'textarea', required: false, usedInReport: true, reportLabel: 'توضیحات فنی' },
        ],
      },
    ],
  })

  console.log('✅ Service template seeded')
  await mongoose.disconnect()
  console.log('Done!')
}

main().catch(err => { console.error(err); process.exit(1) })