// src/lib/storage/liara.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

const endpoint = process.env.LIARA_ENDPOINT || 'https://storage.iran.liara.space'
const accessKeyId = process.env.LIARA_ACCESS_KEY || ''
const secretAccessKey = process.env.LIARA_SECRET_KEY || ''

export const BUCKETS = {
  products: process.env.LIARA_BUCKET_PRODUCTS || 'hp-products',
  videos: process.env.LIARA_BUCKET_VIDEOS || 'hp-videos',
  tickets: process.env.LIARA_BUCKET_TICKETS || 'hp-tickets',
  temp: process.env.LIARA_BUCKET_TEMP || 'hp-temp',
}

const s3 = new S3Client({
  endpoint,
  region: 'ir-thr-at1',
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
})

export type UploadBucket = keyof typeof BUCKETS

// Upload a Buffer directly to S3
export async function uploadToS3(
  bucket: UploadBucket,
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKETS[bucket],
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  }))
  return `${endpoint}/${BUCKETS[bucket]}/${key}`
}

// Delete an object from S3
export async function deleteFromS3(bucket: UploadBucket, key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKETS[bucket], Key: key }))
}

// Generate presigned GET URL (for private files)
export async function getPresignedUrl(bucket: UploadBucket, key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKETS[bucket], Key: key }), { expiresIn })
}

// Process and upload an image — resize + WebP conversion
export async function uploadImage(
  bucket: UploadBucket,
  folder: string,
  filename: string,
  buffer: Buffer,
  options: { width?: number; height?: number; quality?: number } = {},
): Promise<string> {
  const { width = 1200, height, quality = 85 } = options

  const processed = await sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()

  const key = `${folder}/${Date.now()}-${filename.replace(/\.[^.]+$/, '')}.webp`
  return uploadToS3(bucket, key, processed, 'image/webp')
}

// Upload raw file (PDF, ZIP, etc.)
export async function uploadFile(
  bucket: UploadBucket,
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${folder}/${Date.now()}-${safe}`
  return uploadToS3(bucket, key, buffer, contentType)
}

// Extract S3 key from a full URL
export function urlToKey(url: string): string {
  const u = new URL(url)
  return u.pathname.split('/').slice(2).join('/')
}
