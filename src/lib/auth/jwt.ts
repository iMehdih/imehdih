import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-this'
)
const EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  mobile: string
  role: 'customer' | 'staff' | 'admin'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      userId: payload.userId as string,
      mobile: payload.mobile as string,
      role: payload.role as 'customer' | 'staff' | 'admin',
    }
  } catch {
    return null
  }
}