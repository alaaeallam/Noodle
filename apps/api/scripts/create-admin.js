/* eslint-disable no-console */
// One-off admin utility: create an ADMIN Owner account (or report that the
// email is already taken). Standalone script so it can only be run by
// someone with direct server/.env access, not exposed over the network.
//
// Usage:
//   node scripts/create-admin.js <email> <password>
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Owner = require('../models/owner')

const [, , email, password] = process.argv

;(async function createAdmin() {
  try {
    if (!email || !password) {
      console.error('Usage: node scripts/create-admin.js <email> <password>')
      process.exit(1)
    }

    const uri = process.env.CONNECTION_STRING
    if (!uri) {
      throw new Error('Missing CONNECTION_STRING in apps/api/.env')
    }

    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    const existing = await Owner.findOne({ email })
    if (existing) {
      console.error(
        `An account with "${email}" already exists (userType: ${existing.userType}). ` +
          'Use reset-owner-password.js to change its password.'
      )
      await mongoose.disconnect()
      process.exit(1)
    }

    const owner = await Owner.create({
      email,
      password: await bcrypt.hash(password, 12),
      userType: 'ADMIN',
      isActive: true
    })

    console.log(`✔ Created ADMIN "${email}" (${owner._id})`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ Create admin error:', err)
    process.exit(1)
  }
})()
