// src/app/api/domains/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkDomain } from '@/lib/infrastructure/farasoo'
import { checkDomainIntl } from '@/lib/infrastructure/iransrv'
import { z } from 'zod'

const schema = z.object({ domain: z.string().min(3) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { domain } = schema.parse(body)
    const isIr = domain.endsWith('.ir')
    const result = isIr ? await checkDomain(domain) : await checkDomainIntl(domain)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
