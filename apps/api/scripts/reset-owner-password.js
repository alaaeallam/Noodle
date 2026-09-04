/* eslint-disable no-console */
// One-off admin utility: set an Owner/admin account's password to a known
// value (bcrypt-hashed, same as everywhere else). For when the current
// password is lost/locked out and can't be recovered from a bcrypt hash.
// Not part of any GraphQL API - deliberately a standalone script so it can
// only be run by someone with direct server/.env access, not exposed over
// the network.
//
// Usage:
//   node scripts/reset-owner-password.js <email> <newPassword>
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Owner = require('../models/owner')

const [, , email, newPassword] = process.argv

;(async function resetPassword() {
  try {
    if (!email || !newPassword) {
      console.error(
        'Usage: node scripts/reset-owner-password.js <email> <newPassword>'
      )
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

    const owner = await Owner.findOne({ email })
    if (!owner) {
      console.error(`No owner/admin account found with email "${email}"`)
      await mongoose.disconnect()
      process.exit(1)
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await Owner.updateOne({ _id: owner._id }, { $set: { password: hashed } })

    console.log(
      `✔ Password reset for "${email}" (${owner._id}, userType: ${owner.userType})`
    )

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ Reset error:', err)
    process.exit(1)
  }
})()
