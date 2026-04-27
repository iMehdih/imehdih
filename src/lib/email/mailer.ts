// src/lib/email/mailer.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.example.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const FROM = process.env.SMTP_FROM || '"مهدی حاتم‌پور" <noreply@imehdih.ir>'
const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://imehdih.ir'

async function send(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) return // skip if not configured
  await transporter.sendMail({ from: FROM, to, subject, html })
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="UTF-8">
<style>
  body{font-family:Tahoma,Arial,sans-serif;background:#111;color:#e5e5e5;margin:0;padding:0}
  .wrap{max-width:580px;margin:40px auto;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a}
  .head{background:#c8a96e;padding:24px 32px;text-align:center}
  .head h1{margin:0;color:#000;font-size:22px;font-weight:900}
  .body{padding:32px}
  .body p{line-height:1.9;color:#ccc;margin:0 0 16px}
  .btn{display:inline-block;background:#c8a96e;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:900;font-size:14px}
  .foot{background:#111;padding:16px 32px;text-align:center;font-size:12px;color:#555}
  .divider{height:1px;background:#2a2a2a;margin:20px 0}
</style></head><body>
<div class="wrap">
  <div class="head"><h1>${title}</h1></div>
  <div class="body">${body}</div>
  <div class="foot">© ${new Date().getFullYear()} مهدی حاتم‌پور &nbsp;|&nbsp; <a href="${BASE}" style="color:#c8a96e">${BASE}</a></div>
</div></body></html>`
}

export async function sendOrderConfirmation(opts: {
  to: string
  name: string
  orderNumber: string
  items: { title: string; price: number }[]
  total: number
}) {
  const rows = opts.items.map(i =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a2a">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a2a;text-align:left">${i.price.toLocaleString('fa')} ت</td></tr>`
  ).join('')

  const body = `
    <p>سلام <strong>${opts.name}</strong>،</p>
    <p>سفارش شما با شماره <strong>${opts.orderNumber}</strong> با موفقیت ثبت و پرداخت شد.</p>
    <div class="divider"></div>
    <table width="100%" style="border-collapse:collapse">
      ${rows}
      <tr><td style="padding-top:12px;font-weight:900">مجموع</td><td style="padding-top:12px;text-align:left;font-weight:900;color:#c8a96e">${opts.total.toLocaleString('fa')} تومان</td></tr>
    </table>
    <div class="divider"></div>
    <p style="text-align:center"><a href="${BASE}/dashboard/orders" class="btn">مشاهده سفارش</a></p>
  `
  await send(opts.to, `تأیید سفارش ${opts.orderNumber}`, baseTemplate('سفارش ثبت شد ✓', body))
}

export async function sendTicketReply(opts: {
  to: string
  name: string
  ticketSubject: string
  ticketId: string
}) {
  const body = `
    <p>سلام <strong>${opts.name}</strong>،</p>
    <p>پاسخ جدیدی برای تیکت <strong>«${opts.ticketSubject}»</strong> ارسال شده است.</p>
    <div class="divider"></div>
    <p style="text-align:center"><a href="${BASE}/dashboard/tickets/${opts.ticketId}" class="btn">مشاهده پاسخ</a></p>
  `
  await send(opts.to, `پاسخ به تیکت: ${opts.ticketSubject}`, baseTemplate('پاسخ جدید تیکت', body))
}

export async function sendWelcome(opts: { to: string; name: string }) {
  const body = `
    <p>سلام <strong>${opts.name}</strong> عزیز،</p>
    <p>خوش آمدید! حساب کاربری شما در پلتفرم مهدی حاتم‌پور با موفقیت ایجاد شد.</p>
    <p>از اینجا می‌توانید قالب‌ها، افزونه‌ها، دوره‌های آموزشی و خدمات تخصصی ما را مشاهده کنید.</p>
    <div class="divider"></div>
    <p style="text-align:center"><a href="${BASE}/dashboard" class="btn">ورود به پنل کاربری</a></p>
  `
  await send(opts.to, 'خوش آمدید به پلتفرم مهدی حاتم‌پور', baseTemplate('خوش آمدید 🎉', body))
}

export async function sendPasswordReset(opts: { to: string; name: string; otp: string }) {
  const body = `
    <p>سلام <strong>${opts.name}</strong>،</p>
    <p>کد تأیید بازیابی رمز عبور شما:</p>
    <div style="text-align:center;margin:24px 0">
      <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#c8a96e;direction:ltr">${opts.otp}</span>
    </div>
    <p style="font-size:12px;color:#666">این کد ۱۰ دقیقه اعتبار دارد. اگر این درخواست از شما نبوده، این ایمیل را نادیده بگیرید.</p>
  `
  await send(opts.to, 'کد بازیابی رمز عبور', baseTemplate('بازیابی رمز عبور', body))
}
