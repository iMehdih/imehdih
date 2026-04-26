const API_KEY = process.env.KAVENEGAR_API_KEY!
const SENDER = process.env.KAVENEGAR_SENDER!
const BASE_URL = `https://api.kavenegar.com/v1/${API_KEY}`

export async function sendSMS(receptor: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/sms/send.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        receptor,
        sender: SENDER,
        message,
      }),
    })
    const data = await res.json()
    return data.return?.status === 200
  } catch (err) {
    console.error('SMS Error:', err)
    return false
  }
}

export async function sendOTP(mobile: string, otp: string): Promise<boolean> {
  const message = `کد تأیید شما: ${otp}\nمهدی حاتم‌پور`
  return sendSMS(mobile, message)
}

// template-based SMS
export async function sendTemplateSMS(
  mobile: string,
  template: string,
  tokens: Record<string, string>
): Promise<boolean> {
  try {
    // replace {{variable}} with actual values
    let message = template
    Object.entries(tokens).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return sendSMS(mobile, message)
  } catch {
    return false
  }
}

// SMS Templates
export const SMS_TEMPLATES = {
  OTP: 'کد تأیید ورود به سایت مهدی حاتم‌پور: {{code}}',
  ORDER_CONFIRMED: 'سفارش #{{orderNumber}} تأیید شد. مشاهده: {{link}}',
  TICKET_REPLIED: 'تیکت #{{ticketNumber}} پاسخ داده شد. مشاهده: {{link}}',
  TASK_UPDATED: 'پروژه {{projectTitle}} به‌روز شد. مشاهده: {{link}}',
  HOSTING_EXPIRE_7: 'هاست {{domain}} تا ۷ روز دیگر منقضی می‌شود. تمدید: {{link}}',
  HOSTING_EXPIRE_3: 'هاست {{domain}} تا ۳ روز دیگر منقضی می‌شود. تمدید: {{link}}',
  HOSTING_EXPIRED: 'هاست {{domain}} منقضی شد. تمدید فوری: {{link}}',
  DOMAIN_EXPIRE_7: 'دامنه {{domain}} تا ۷ روز دیگر منقضی می‌شود. تمدید: {{link}}',
  NEW_MESSAGE: 'پیام جدیدی در پنل کاربری دارید. مشاهده: {{link}}',
  SERVICE_APPROVED: 'درخواست سرویس ویژه شما تأیید شد. برای ادامه وارد پنل شوید: {{link}}',
  PAYMENT_SUCCESS: 'پرداخت {{amount}} تومان موفقیت‌آمیز بود. سفارش #{{orderNumber}}',
}
