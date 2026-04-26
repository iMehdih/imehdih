// src/app/api/admin/finance/route.ts
// گزارش مالی کامل
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import Order from '@/models/Order'
import Expense from '@/models/Expense'
import { requireRole } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month' // month | quarter | year | custom
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')

    const now = new Date()
    let from: Date, to: Date

    if (period === 'custom' && fromStr && toStr) {
      from = new Date(fromStr)
      to = new Date(toStr)
    } else if (period === 'quarter') {
      from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      to = now
    } else if (period === 'year') {
      from = new Date(now.getFullYear(), 0, 1)
      to = now
    } else {
      // ماه جاری
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      to = now
    }

    // ماه قبل برای مقایسه
    const prevFrom = new Date(from)
    const prevTo = new Date(from)
    prevFrom.setMonth(prevFrom.getMonth() - 1)
    prevTo.setDate(0)

    const [
      currentOrders, prevOrders,
      currentExpenses, prevExpenses,
      revenueByProduct, dailyRevenue,
      pendingWithdrawals,
    ] = await Promise.all([
      // درآمد دوره جاری
      Order.find({ createdAt: { $gte: from, $lte: to }, status: { $in: ['paid','in_progress','completed'] } })
        .select('finalAmount items createdAt').lean(),

      // درآمد دوره قبل
      Order.find({ createdAt: { $gte: prevFrom, $lte: prevTo }, status: { $in: ['paid','in_progress','completed'] } })
        .select('finalAmount').lean(),

      // هزینه‌های دوره جاری
      Expense.find({ date: { $gte: from, $lte: to } }).lean(),

      // هزینه‌های دوره قبل
      Expense.find({ date: { $gte: prevFrom, $lte: prevTo } }).lean(),

      // درآمد به تفکیک نوع محصول
      Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, status: { $in: ['paid','in_progress','completed'] } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productType', revenue: { $sum: '$items.discountedPrice' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
      ]),

      // درآمد روزانه (۳۰ روز)
      Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, status: { $in: ['paid','in_progress','completed'] } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$finalAmount' },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),

      // درخواست‌های برداشت pending
      (await import('@/models/WalletTransaction')).default.find({ type: 'withdrawal', status: 'pending' })
        .populate('staffId', 'firstName lastName').lean(),
    ])

    const totalRevenue = (currentOrders as any[]).reduce((s, o) => s + o.finalAmount, 0)
    const prevRevenue = (prevOrders as any[]).reduce((s, o) => s + o.finalAmount, 0)
    const totalExpense = (currentExpenses as any[]).reduce((s, e) => s + e.amount, 0)
    const prevExpense = (prevExpenses as any[]).reduce((s, e) => s + e.amount, 0)
    const profit = totalRevenue - totalExpense
    const prevProfit = prevRevenue - prevExpense

    // هزینه به تفکیک دسته
    const expenseByCategory: Record<string, number> = {}
    for (const e of currentExpenses as any[]) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
    }

    const growth = (base: number, current: number) =>
      base > 0 ? Math.round(((current - base) / base) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        summary: {
          revenue: totalRevenue,
          expense: totalExpense,
          profit,
          orderCount: (currentOrders as any[]).length,
          revenueGrowth: growth(prevRevenue, totalRevenue),
          expenseGrowth: growth(prevExpense, totalExpense),
          profitGrowth: growth(prevProfit, profit),
        },
        revenueByProduct,
        expenseByCategory,
        dailyRevenue,
        pendingWithdrawals,
        recentExpenses: (currentExpenses as any[]).sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 10),
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
