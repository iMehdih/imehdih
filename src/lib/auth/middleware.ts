import { NextRequest } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('hp_token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload> {
  const user = await getAuthUser(req)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireRole(req: NextRequest, roles: string[]): Promise<JWTPayload> {
  const user = await requireAuth(req)
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
  return user
}