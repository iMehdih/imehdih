// src/app/api/cron/check-expirations/route.ts
// این endpoint رو توسط لیارا Cron Job هر روز ساعت ۸ صبح فراخوانی کن
import { NextRequest, NextResponse } from 'next/server'
import { checkExpirations } from '@/lib/infrastructure'

const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-change-this'

export async function GET(req: NextRequest) {
  // چک secret برای امنیت
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await checkExpirations()
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Cron checkExpirations error:', err)
    return NextResponse.json({ success: false, error: 'خطا' }, { status: 500 })
  }
}
