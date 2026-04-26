// تولید OTP 6 رقمی
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// تاریخ انقضا (۲ دقیقه)
export function getOTPExpiry(): Date {
  const expiry = new Date()
  expiry.setSeconds(expiry.getSeconds() + Number(process.env.OTP_EXPIRES_IN || 120))
  return expiry
}

export function isOTPValid(otp: string, storedOTP: string, expiry: Date): boolean {
  if (otp !== storedOTP) return false
  if (new Date() > expiry) return false
  return true
}
