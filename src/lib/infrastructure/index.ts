// src/lib/infrastructure/index.ts
// سرویس مرکزی زیرساخت — فراخوانی از order verify
import { connectDB } from '@/lib/db/mongoose'
import Hosting from '@/models/Hosting'
import DomainRecord from '@/models/DomainRecord'
import User from '@/models/User'
import { notify } from '@/lib/utils/notify'
import { checkDomain, registerDomain } from './farasoo'
import { checkDomainIntl, registerDomainIntl } from './iransrv'

// ایجاد هاست بعد از پرداخت
export async function provisionHosting(opts: {
  orderId: string
  userId: string
  productMeta: Record<string, unknown>
  domain?: string
}) {
  await connectDB()

  const user = await User.findById(opts.userId).select('firstName lastName email mobile')
  if (!user) throw new Error('User not found')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (Number(opts.productMeta?.durationDays) || 365))

  // در محیط واقعی اینجا به WHM/cPanel API وصل میشیم
  // فعلاً record میسازیم و ادمین دستی تنظیم می‌کنه
  const hosting = await Hosting.create({
    userId: opts.userId,
    orderId: opts.orderId,
    plan: String(opts.productMeta?.plan || 'basic'),
    domain: opts.domain || `user-${opts.userId.slice(-6)}.mehdihp.com`,
    username: `u${opts.userId.slice(-8)}`,
    password: generatePassword(),
    expiresAt,
    status: 'pending', // ادمین تأیید و فعال می‌کنه
  })

  // اعلان به ادمین
  const adminUsers = await User.find({ role: 'admin' }).select('_id')
  for (const admin of adminUsers) {
    await notify({
      userId: admin._id.toString(),
      title: 'هاست جدید در انتظار راه‌اندازی',
      content: `هاست سفارش #${opts.orderId} برای ${user.firstName} ${user.lastName} نیاز به راه‌اندازی دارد.`,
      type: 'system',
    })
  }

  // اعلان به مشتری
  await notify({
    userId: opts.userId,
    title: 'هاست شما در حال راه‌اندازی است',
    content: 'هاست شما ثبت شد و ظرف چند ساعت آماده خواهد بود.',
    type: 'order',
    relatedId: hosting._id.toString(),
  })

  return hosting
}

// ثبت دامنه بعد از پرداخت
export async function provisionDomain(opts: {
  orderId: string
  userId: string
  domain: string
}) {
  await connectDB()

  const user = await User.findById(opts.userId).select('firstName lastName email mobile')
  if (!user) throw new Error('User not found')

  const isIrDomain = opts.domain.endsWith('.ir')
  const tld = opts.domain.split('.').slice(-1)[0]
  const registrar = isIrDomain ? 'farasoo' : 'iransrv'

  const contactInfo = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || `${user.mobile}@temp.ir`,
    mobile: user.mobile,
  }

  // ثبت در API
  const result = isIrDomain
    ? await registerDomain(opts.domain, contactInfo)
    : await registerDomainIntl(opts.domain, contactInfo)

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const domainRecord = await DomainRecord.create({
    userId: opts.userId,
    orderId: opts.orderId,
    domain: opts.domain,
    tld,
    registrar,
    registrarRef: result.ref,
    expiresAt,
    status: result.success ? 'active' : 'failed',
    nameservers: ['ns1.mehdihp.com', 'ns2.mehdihp.com'],
  })

  await notify({
    userId: opts.userId,
    title: result.success ? 'دامنه با موفقیت ثبت شد' : 'خطا در ثبت دامنه',
    content: result.success
      ? `دامنه ${opts.domain} ثبت شد و ظرف ۲۴ ساعت فعال می‌شود.`
      : `مشکلی در ثبت دامنه ${opts.domain} پیش آمد. با پشتیبانی تماس بگیرید.`,
    type: 'order',
  })

  return domainRecord
}

// چک انقضای هاست‌ها (فراخوانی از cron job)
export async function checkExpirations() {
  await connectDB()
  const now = new Date()

  // هشدار ۷ روز مانده
  const warning7 = new Date(now)
  warning7.setDate(warning7.getDate() + 7)
  const warning3 = new Date(now)
  warning3.setDate(warning3.getDate() + 3)

  // هاست‌های در حال انقضا
  const expiringHostings = await Hosting.find({
    status: 'active',
    expiresAt: { $lte: warning7, $gt: now },
  }).populate('userId', 'mobile firstName')

  for (const h of expiringHostings) {
    const daysLeft = Math.ceil((h.expiresAt.getTime() - now.getTime()) / 86400000)
    const lastWarnDays = h.lastWarningAt
      ? Math.floor((now.getTime() - h.lastWarningAt.getTime()) / 86400000)
      : 999

    if (lastWarnDays >= 2) { // هر ۲ روز یه بار
      await notify({
        userId: h.userId.toString(),
        title: `هاست ${daysLeft} روز دیگر منقضی می‌شود`,
        content: `هاست ${h.domain} تا ${daysLeft} روز دیگر منقضی می‌شود. برای جلوگیری از قطع سرویس تمدید کنید.`,
        type: 'system',
        smsTemplate: daysLeft <= 3 ? 'HOSTING_EXPIRE_3' : 'HOSTING_EXPIRE_7',
        smsTokens: {
          domain: h.domain,
          link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hosting`,
        },
      })
      await Hosting.findByIdAndUpdate(h._id, { lastWarningAt: now })
    }
  }

  // هاست‌های منقضی شده → تعلیق
  const expired = await Hosting.find({
    status: 'active',
    expiresAt: { $lt: now },
  })

  for (const h of expired) {
    await Hosting.findByIdAndUpdate(h._id, { status: 'suspended', suspendedAt: now })
    await notify({
      userId: h.userId.toString(),
      title: `هاست ${h.domain} معلق شد`,
      content: `هاست ${h.domain} منقضی و معلق شد. برای فعال‌سازی مجدد تمدید کنید. ظرف ۷ روز حذف خواهد شد.`,
      type: 'system',
      smsTemplate: 'HOSTING_EXPIRED',
      smsTokens: {
        domain: h.domain,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/hosting`,
      },
    })
  }

  // هاست‌های معلق بیش از ۷ روز → حذف
  const deleteDate = new Date(now)
  deleteDate.setDate(deleteDate.getDate() - 7)

  await Hosting.updateMany(
    { status: 'suspended', suspendedAt: { $lt: deleteDate } },
    { status: 'deleted' }
  )

  // همین pattern برای دامنه‌ها
  const expiringDomains = await DomainRecord.find({
    status: 'active',
    expiresAt: { $lte: warning7, $gt: now },
  })

  for (const d of expiringDomains) {
    const daysLeft = Math.ceil((d.expiresAt.getTime() - now.getTime()) / 86400000)
    await notify({
      userId: d.userId.toString(),
      title: `دامنه ${d.domain} ${daysLeft} روز دیگر منقضی می‌شود`,
      content: `دامنه ${d.domain} تا ${daysLeft} روز دیگر منقضی می‌شود.`,
      type: 'system',
      smsTemplate: 'DOMAIN_EXPIRE_7',
      smsTokens: { domain: d.domain, link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/domains` },
    })
  }

  console.log(`Checked expirations: ${expiringHostings.length} hosting warnings, ${expired.length} suspended`)
}

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
