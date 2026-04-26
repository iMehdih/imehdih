import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('hp_token')?.value

  if (pathname.startsWith('/api/auth')) return NextResponse.next()
  if (pathname.startsWith('/api/')) return NextResponse.next()
  if (pathname === '/') return NextResponse.next()
  if (pathname.startsWith('/auth/')) return NextResponse.next()
  if (pathname.startsWith('/_next/')) return NextResponse.next()
  if (pathname.startsWith('/favicon')) return NextResponse.next()

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff')

  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (pathname.startsWith('/staff') && payload.role !== 'staff') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}