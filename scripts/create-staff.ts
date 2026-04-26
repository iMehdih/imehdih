// scripts/create-staff.ts
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  const User = (await import('../src/models/User')).default

  const existing = await User.findOne({ mobile: '09100000001' })
  if (existing) {
    console.log('ℹ️  Staff already exists')
    await mongoose.disconnect()
    return
  }

  await User.create({
    mobile: '09100000001',
    role: 'staff',
    firstName: 'امیر',
    lastName: 'رضایی',
    isActive: true,
    isProfileComplete: true,
    salary: 15000000,
    walletBalance: 0,
    rating: 5,
    totalTasksCompleted: 0,
    departments: [
      'support_theme_plugin',
      'support_course',
      'support_hosting_domain',
      'support_service',
      'presale',
    ],
  })

  console.log('✅ Staff created — mobile: 09100000001')
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
