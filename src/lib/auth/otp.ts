import { createHash } from 'crypto'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashOTP(otp: string): string {
  return createHash('sha256').update(otp).digest('hex')
}

export function getOTPExpiry(): Date {
  const expiry = new Date()
  expiry.setSeconds(expiry.getSeconds() + Number(process.env.OTP_EXPIRES_IN || 120))
  return expiry
}

export function isOTPValid(otp: string, storedHash: string, expiry: Date): boolean {
  if (new Date() > expiry) return false
  const hash = hashOTP(otp)
  return hash === storedHash
}
