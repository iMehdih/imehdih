// src/app/api/admin/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import User from '@/models/User'
import WalletTransaction from '@/models/WalletTransaction'
import Expense from '@/models/Expense'
import { requireRole } from '@/lib/auth/middleware'
import { notify } from '@/lib/utils/notify'
import { z } from 'zod'

// GET — لیست کارمندان + موجودی + درخواست‌های برداشت
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ['admin'])
    await connectDB()

    const [staff, pendingWithdrawals, recentTransactions] = await Promise.all([
      User.find({ role: 'staff', isActive: true })
        .select('firstName lastName walletBalance salary rating totalTasksCompleted')
        .lean(),
      WalletTransaction.find({ type: 'withdrawal', status: 'pending' })
        .populate('staffId', 'firstName lastName mobile walletBalance')
        .sort('-createdAt').lean(),
      WalletTransaction.find()
        .populate('staffId', 'firstName lastName')
        .sort('-createdAt').limit(20).lean(),
    ])

    return NextResponse.json({ success: true, data: { staff, pendingWithdrawals, recentTransactions } })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}

const schema = z.object({
  action: z.enum(['pay_salary', 'approve_withdrawal', 'reject_withdrawal', 'add_bonus']),
  staffId: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.number().optional(),
  description: z.string().optional(),
})

// POST — عملیات کیف پول
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    const body = await req.json()
    const { action, staffId, transactionId, amount, description } = schema.parse(body)

    await connectDB()

    if (action === 'pay_salary') {
      // پرداخت حقوق به همه کارمندان
      const staffList = await User.find({ role: 'staff', isActive: true, salary: { $gt: 0 } })
      for (const staff of staffList) {
        await User.findByIdAndUpdate(staff._id, { $inc: { walletBalance: staff.salary || 0 } })
        await WalletTransaction.create({
          staffId: staff._id,
          type: 'salary',
          amount: staff.salary,
          description: `حقوق ${new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}`,
          status: 'paid',
          paidAt: new Date(),
        })
        // ثبت در هزینه‌ها
        await Expense.create({
          title: `حقوق ${staff.firstName} ${staff.lastName}`,
          amount: staff.salary,
          category: 'salary',
          type: 'auto',
          relatedUserId: staff._id,
          date: new Date(),
          createdBy: auth.userId,
        })
        await notify({
          userId: staff._id.toString(),
          title: 'واریز حقوق',
          content: `حقوق ${(staff.salary / 1000000).toFixed(1)} میلیون تومان به کیف پول شما واریز شد.`,
          type: 'payment',
        })
      }
      return NextResponse.json({ success: true, message: `حقوق ${staffList.length} کارمند پرداخت شد` })
    }

    if (action === 'approve_withdrawal' && transactionId) {
      const tx = await WalletTransaction.findById(transactionId).populate('staffId')
      if (!tx || tx.status !== 'pending') {
        return NextResponse.json({ success: false, error: 'درخواست یافت نشد یا قبلاً پردازش شده' }, { status: 400 })
      }
      const staff = tx.staffId as any
      if (staff.walletBalance < tx.amount) {
        return NextResponse.json({ success: false, error: 'موجودی کافی نیست' }, { status: 400 })
      }
      await User.findByIdAndUpdate(staff._id, { $inc: { walletBalance: -tx.amount } })
      await WalletTransaction.findByIdAndUpdate(transactionId, { status: 'paid', paidAt: new Date() })
      await notify({
        userId: staff._id.toString(),
        title: 'برداشت تأیید شد',
        content: `درخواست برداشت ${(tx.amount / 1000000).toFixed(1)} میلیون تومان تأیید و پرداخت شد.`,
        type: 'payment',
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'reject_withdrawal' && transactionId) {
      const tx = await WalletTransaction.findByIdAndUpdate(
        transactionId, { status: 'rejected' }, { new: true }
      ).populate('staffId')
      if (tx) {
        await notify({
          userId: (tx.staffId as any)._id.toString(),
          title: 'برداشت رد شد',
          content: 'درخواست برداشت شما رد شد. برای اطلاعات بیشتر با ادمین تماس بگیرید.',
          type: 'system',
        })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'add_bonus' && staffId && amount) {
      await User.findByIdAndUpdate(staffId, { $inc: { walletBalance: amount } })
      await WalletTransaction.create({
        staffId,
        type: 'bonus',
        amount,
        description: description || 'پاداش ادمین',
        status: 'paid',
        paidAt: new Date(),
      })
      await notify({
        userId: staffId,
        title: 'پاداش دریافت کردید',
        content: `مبلغ ${(amount / 1000000).toFixed(1)} میلیون تومان به عنوان پاداش به کیف پول شما اضافه شد.`,
        type: 'payment',
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'عملیات نامعتبر' }, { status: 400 })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    console.error(err)
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 })
  }
}
