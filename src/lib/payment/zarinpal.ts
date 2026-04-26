// src/lib/payment/zarinpal.ts
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!
const SANDBOX = process.env.ZARINPAL_SANDBOX === 'true'

const BASE_URL = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment'

const PAYMENT_URL = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/StartPay'
  : 'https://www.zarinpal.com/pg/StartPay'

interface RequestResult {
  success: boolean
  authority?: string
  paymentUrl?: string
  error?: string
}

interface VerifyResult {
  success: boolean
  refId?: string
  cardHash?: string
  error?: string
}

export async function createPayment(
  amount: number,         // تومان
  description: string,
  callbackUrl: string,
  mobile?: string,
  email?: string
): Promise<RequestResult> {
  try {
    const res = await fetch(`${BASE_URL}/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amount * 10, // تبدیل تومان به ریال
        description,
        callback_url: callbackUrl,
        ...(mobile && { metadata: { mobile } }),
        ...(email && { metadata: { email } }),
      }),
    })

    const data = await res.json()

    if (data.data?.code === 100) {
      return {
        success: true,
        authority: data.data.authority,
        paymentUrl: `${PAYMENT_URL}/${data.data.authority}`,
      }
    }

    return { success: false, error: data.errors?.message || 'خطا در ایجاد پرداخت' }
  } catch (err) {
    console.error('ZarinPal request error:', err)
    return { success: false, error: 'خطای اتصال به درگاه پرداخت' }
  }
}

export async function verifyPayment(
  authority: string,
  amount: number         // تومان
): Promise<VerifyResult> {
  try {
    const res = await fetch(`${BASE_URL}/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amount * 10,
        authority,
      }),
    })

    const data = await res.json()

    if (data.data?.code === 100 || data.data?.code === 101) {
      return {
        success: true,
        refId: String(data.data.ref_id),
        cardHash: data.data.card_hash,
      }
    }

    return { success: false, error: data.errors?.message || 'پرداخت تأیید نشد' }
  } catch (err) {
    console.error('ZarinPal verify error:', err)
    return { success: false, error: 'خطای تأیید پرداخت' }
  }
}