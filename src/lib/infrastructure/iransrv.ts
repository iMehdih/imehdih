// src/lib/infrastructure/iransrv.ts
// API ایران‌سرور برای دامنه‌های بین‌المللی
const API_KEY = process.env.IRANSRV_API_KEY!
const BASE_URL = process.env.IRANSRV_API_URL || 'https://api.iranserver.com'

async function iransrvRequest(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  return res.json()
}

export async function checkDomainIntl(domain: string) {
  try {
    const data = await iransrvRequest('/domains/check', { domain })
    return { available: data.available ?? false, price: data.price }
  } catch (err) {
    console.error('IranSrv checkDomain error:', err)
    return { available: false, error: 'خطا در بررسی دامنه' }
  }
}

export async function registerDomainIntl(
  domain: string,
  contactInfo: { name: string; email: string; mobile: string }
) {
  try {
    const data = await iransrvRequest('/domains/register', {
      domain, years: 1,
      registrant: contactInfo,
    })
    if (data.success) return { success: true, ref: data.order_id }
    return { success: false, error: data.message || 'خطا در ثبت دامنه' }
  } catch (err) {
    console.error('IranSrv registerDomain error:', err)
    return { success: false, error: 'خطا در ثبت دامنه' }
  }
}

export async function renewDomainIntl(domain: string) {
  try {
    const data = await iransrvRequest('/domains/renew', { domain, years: 1 })
    return { success: data.success ?? false, error: data.message }
  } catch (err) {
    return { success: false, error: 'خطا در تمدید' }
  }
}
