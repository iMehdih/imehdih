// src/lib/infrastructure/farasoo.ts
// API فراسو برای دامنه‌های .ir
const API_KEY = process.env.FARASOO_API_KEY!
const BASE_URL = process.env.FARASOO_API_URL || 'https://api.farasoo.com'

interface DomainCheckResult {
  available: boolean
  price?: number
  error?: string
}

interface DomainRegisterResult {
  success: boolean
  ref?: string
  error?: string
}

async function farasooRequest(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  return res.json()
}

// چک موجودی دامنه
export async function checkDomain(domain: string): Promise<DomainCheckResult> {
  try {
    const data = await farasooRequest('/domain/check', { domain })
    return {
      available: data.available ?? false,
      price: data.price,
    }
  } catch (err) {
    console.error('Farasoo checkDomain error:', err)
    return { available: false, error: 'خطا در بررسی دامنه' }
  }
}

// ثبت دامنه
export async function registerDomain(
  domain: string,
  contactInfo: { name: string; email: string; mobile: string }
): Promise<DomainRegisterResult> {
  try {
    const data = await farasooRequest('/domain/register', {
      domain,
      contact: contactInfo,
      years: 1,
    })
    if (data.success || data.status === 'registered') {
      return { success: true, ref: data.id || data.ref }
    }
    return { success: false, error: data.message || 'خطا در ثبت دامنه' }
  } catch (err) {
    console.error('Farasoo registerDomain error:', err)
    return { success: false, error: 'خطا در ثبت دامنه' }
  }
}

// تمدید دامنه
export async function renewDomain(domain: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await farasooRequest('/domain/renew', { domain, years: 1 })
    return { success: data.success ?? false, error: data.message }
  } catch (err) {
    console.error('Farasoo renewDomain error:', err)
    return { success: false, error: 'خطا در تمدید دامنه' }
  }
}

// وضعیت دامنه
export async function getDomainStatus(domain: string) {
  try {
    const data = await farasooRequest('/domain/info', { domain })
    return {
      status: data.status,
      expiresAt: data.expiry_date,
      nameservers: data.nameservers || [],
    }
  } catch (err) {
    console.error('Farasoo getDomainStatus error:', err)
    return null
  }
}
