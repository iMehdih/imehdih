// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/middleware'
import { uploadImage, uploadFile, UploadBucket } from '@/lib/storage/liara'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5 MB
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_FILE_TYPES = [
  'application/zip', 'application/x-zip-compressed',
  'application/pdf', 'application/octet-stream',
  'video/mp4', 'video/webm',
]

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if (!auth || !['admin', 'staff'].includes(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as UploadBucket) || 'products'
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) return NextResponse.json({ error: 'فایل ارسال نشده' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'application/octet-stream'
  const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
  const isFile = ALLOWED_FILE_TYPES.includes(contentType)

  if (!isImage && !isFile) {
    return NextResponse.json({ error: `نوع فایل مجاز نیست: ${contentType}` }, { status: 400 })
  }

  if (isImage && buffer.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'حداکثر حجم تصویر ۵ مگابایت است' }, { status: 400 })
  }

  if (!isImage && buffer.length > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'حداکثر حجم فایل ۲۰۰ مگابایت است' }, { status: 400 })
  }

  try {
    const url = isImage
      ? await uploadImage(bucket, folder, file.name, buffer)
      : await uploadFile(bucket, folder, file.name, buffer, contentType)

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'خطا در آپلود فایل' }, { status: 500 })
  }
}
