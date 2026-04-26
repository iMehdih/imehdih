import { connectDB } from '@/lib/db/mongoose'
import mongoose, { Schema } from 'mongoose'

// Lightweight rate limit store using MongoDB TTL index
const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  firstAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
})
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RateLimit =
  mongoose.models.RateLimit ||
  mongoose.model('RateLimit', RateLimitSchema)

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  await connectDB()

  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000)

  const doc = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 }, $setOnInsert: { firstAt: now, expiresAt } },
    { upsert: true, new: true }
  )

  const count = doc.count as number
  const resetInSeconds = Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000)

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetInSeconds,
  }
}
