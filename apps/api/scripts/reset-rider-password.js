/* eslint-disable no-console */
// One-off admin utility: set a rider's password to a known value (bcrypt-
// hashed, same as everywhere else). For test/demo accounts whose original
// plaintext password was never recorded and can't be recovered from a
// bcrypt hash (e.g. after running migrate-rider-passwords.js). Not part of
// any GraphQL API - deliberately a standalone script so it can only be run
// by someone with direct server/.env access, not exposed over the network.
//
// Usage:
//   node scripts/reset-rider-password.js <username> <newPassword>
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Rider = require('../models/rider');

const [, , username, newPassword] = process.argv;

(async function resetPassword() {
  try {
    if (!username || !newPassword) {
      console.error('Usage: node scripts/reset-rider-password.js <username> <newPassword>');
      process.exit(1);
    }

    const uri = process.env.CONNECTION_STRING;
    if (!uri) {
      throw new Error('Missing CONNECTION_STRING in apps/api/.env');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const rider = await Rider.findOne({ username });
    if (!rider) {
      console.error(`No rider found with username "${username}"`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await Rider.updateOne({ _id: rider._id }, { $set: { password: hashed } });

    console.log(`✔ Password reset for rider "${username}" (${rider._id})`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset error:', err);
    process.exit(1);
  }
})();
