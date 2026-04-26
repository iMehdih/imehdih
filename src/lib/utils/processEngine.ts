// src/lib/utils/processEngine.ts
// هسته Process Engine — ساخت پروژه از template

import { connectDB } from '@/lib/db/mongoose'
import Project from '@/models/Project'
import ServiceTemplate from '@/models/ServiceTemplate'
import { notify } from '@/lib/utils/notify'
import mongoose from 'mongoose'

interface CreateProjectOptions {
  orderId: string
  customerId: string
  productId: string
  title: string
  commissionRate?: number
  type?: 'customer' | 'internal'
}

export async function createProjectFromTemplate(opts: CreateProjectOptions) {
  await connectDB()

  // پیدا کردن template مرتبط با محصول
  const template = await ServiceTemplate.findOne({
    productId: opts.productId,
    isActive: true,
  })

  if (!template) {
    // اگه template نداشت، پروژه ساده بدون تسک
    console.warn(`No template found for product ${opts.productId}`)
    return null
  }

  // ساخت تسک‌ها از template — اولین تسک unlock، بقیه pending
  const tasks = template.tasks
    .sort((a: any, b: any) => a.order - b.order)
    .map((t: any, index: number) => ({
      _id: new mongoose.Types.ObjectId(),
      templateTaskId: t._id,
      title: t.title,
      description: t.description,
      status: index === 0 ? 'unlocked' : (t.isBlocking ? 'pending' : 'unlocked'),
      isBlocking: t.isBlocking,
      isRequired: t.isRequired,
      fields: t.fields,
      recurringType: t.recurringType,
      recurringInterval: t.recurringInterval,
      recurringDayOfMonth: t.recurringDayOfMonth,
      recurringDayOfWeek: t.recurringDayOfWeek,
      fieldValues: {},
      assignedTo: undefined,
      startedAt: undefined,
      completedAt: undefined,
      timeSpentMinutes: 0,
      order: t.order,
    }))

  const project = await Project.create({
    type: opts.type || 'customer',
    orderId: opts.orderId,
    customerId: opts.customerId,
    templateId: template._id,
    title: opts.title,
    status: 'available',
    tasks,
    commissionRate: opts.commissionRate || 20,
    isCommissionPaid: false,
    reportGenerated: false,
  })

  // اعلان به همه کارمندان (پروژه موجود برای claim)
  const User = (await import('@/models/User')).default
  const staffList = await User.find({ role: 'staff', isActive: true }).select('_id')

  for (const staff of staffList) {
    await notify({
      userId: staff._id.toString(),
      title: 'پروژه جدید موجود',
      content: `پروژه "${opts.title}" برای انجام موجود شد.`,
      type: 'project',
      relatedId: project._id.toString(),
    })
  }

  return project
}

// آنلاک کردن تسک‌های بعدی بعد از تکمیل یه تسک blocking
export async function unlockNextTasks(projectId: string, completedTaskId: string) {
  await connectDB()

  const project = await Project.findById(projectId)
  if (!project) return

  const completedTask = project.tasks.find(
    (t: any) => t._id.toString() === completedTaskId
  )
  if (!completedTask || !completedTask.isBlocking) return

  // پیدا کردن تسک بعدی که pending هست
  const sortedTasks = project.tasks.sort((a: any, b: any) => a.order - b.order)
  const completedIndex = sortedTasks.findIndex(
    (t: any) => t._id.toString() === completedTaskId
  )

  // آنلاک کردن تسک بعدی
  if (completedIndex < sortedTasks.length - 1) {
    const nextTask = sortedTasks[completedIndex + 1]
    if (nextTask.status === 'pending') {
      await Project.findOneAndUpdate(
        { _id: projectId, 'tasks._id': nextTask._id },
        { $set: { 'tasks.$.status': 'unlocked' } }
      )
    }
  }

  // چک آیا همه تسک‌های required تموم شدن
  const allRequired = project.tasks.filter((t: any) => t.isRequired)
  const allDone = allRequired.every((t: any) => t.status === 'completed')

  if (allDone) {
    await Project.findByIdAndUpdate(projectId, { status: 'completed' })
    // گزارش اتوماتیک بساز
    await generateReport(projectId)
    // اعلان به مشتری
    if (project.customerId) {
      await notify({
        userId: project.customerId.toString(),
        title: 'پروژه تکمیل شد',
        content: `پروژه "${project.title}" با موفقیت تکمیل شد. گزارش در پنل شما موجود است.`,
        type: 'project',
        relatedId: project._id.toString(),
      })
    }
  }
}

// محاسبه سهم کارمند از پروژه
export async function calculateCommission(projectId: string) {
  await connectDB()
  const Order = (await import('@/models/Order')).default
  const project = await Project.findById(projectId)
  if (!project || !project.orderId) return 0

  const order = await Order.findById(project.orderId)
  if (!order) return 0

  return Math.round(order.finalAmount * (project.commissionRate / 100))
}

// ساخت تسک‌های recurring (فراخوانی توسط cron job)
export async function generateRecurringTasks() {
  await connectDB()
  const now = new Date()

  // پروژه‌های فعال از نوع service_recurring
  const activeProjects = await Project.find({
    status: { $in: ['assigned', 'in_progress'] },
    type: 'customer',
  })

  for (const project of activeProjects) {
    for (const task of project.tasks) {
      if (!task.recurringType) continue

      let shouldCreate = false

      if (task.recurringType === 'weekly') {
        const dayOfWeek = task.recurringDayOfWeek ?? 1 // دوشنبه
        if (now.getDay() === dayOfWeek) {
          // چک آیا این هفته قبلاً ساخته شده
          const lastCompleted = task.completedAt
          if (!lastCompleted || daysBetween(lastCompleted, now) >= 7) {
            shouldCreate = true
          }
        }
      } else if (task.recurringType === 'monthly') {
        const dayOfMonth = task.recurringDayOfMonth ?? 1
        if (now.getDate() === dayOfMonth) {
          const lastCompleted = task.completedAt
          if (!lastCompleted || daysBetween(lastCompleted, now) >= 28) {
            shouldCreate = true
          }
        }
      }

      if (shouldCreate && task.status === 'completed') {
        // reset تسک برای دور بعدی
        await Project.findOneAndUpdate(
          { _id: project._id, 'tasks._id': task._id },
          {
            $set: {
              'tasks.$.status': 'unlocked',
              'tasks.$.fieldValues': {},
              'tasks.$.completedAt': undefined,
              'tasks.$.startedAt': undefined,
            }
          }
        )
      }
    }
  }
}

function daysBetween(d1: Date, d2: Date): number {
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
}

// گزارش اتوماتیک از داده‌های تسک‌ها
async function generateReport(projectId: string) {
  const project = await Project.findById(projectId).populate('templateId')
  if (!project) return

  const template = project.templateId as any
  if (!template) return

  const reportData: Record<string, unknown> = {
    projectTitle: project.title,
    generatedAt: new Date().toISOString(),
    sections: [],
  }

  for (const task of project.tasks) {
    if (task.status !== 'completed') continue
    const templateTask = template.tasks?.find(
      (t: any) => t._id.toString() === task.templateTaskId?.toString()
    )
    if (!templateTask) continue

    // فیلدهایی که باید در گزارش باشن
    const reportFields = templateTask.fields?.filter((f: any) => f.usedInReport) || []
    if (reportFields.length === 0) continue

    const section: Record<string, unknown> = {
      taskTitle: task.title,
      completedAt: task.completedAt,
      fields: [],
    }

    for (const field of reportFields) {
      const value = task.fieldValues?.[field.name]
      if (value !== undefined && value !== null && value !== '') {
        (section.fields as any[]).push({
          label: field.reportLabel || field.label,
          value,
          type: field.type,
        })
      }
    }

    if ((section.fields as any[]).length > 0) {
      (reportData.sections as any[]).push(section)
    }
  }

  await Project.findByIdAndUpdate(projectId, {
    reportGenerated: true,
    reportData,
  })
}
