/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- Models (relative to apps/api)
const Owner = require('../models/owner');
// If your Admins live in a different model, you can still use Owner with userType 'ADMIN'.

(async function seed() {
  try {
    const uri = process.env.CONNECTION_STRING;
    if (!uri) {
      throw new Error('Missing CONNECTION_STRING in apps/api/.env');
    }

    // Quiet the warning you saw
    mongoose.set('strictQuery', true);

    console.log(`👉 Connecting to: ${uri}`);
    await mongoose.connect(uri, {
      // Mongoose v6 ignores useNewUrlParser/useUnifiedTopology (kept harmless)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const vendorEmail = 'admin@gmail.com';
    const adminEmail  = 'alaaeallam@gmail.com';
    const password    = '123123';

    const hashed = await bcrypt.hash(password, 12);

    // Upsert helper
    async function upsertOwner(email, userType) {
      const existing = await Owner.findOne({ email });
      if (existing) {
        // ensure correct role + password
        existing.userType = userType;
        existing.password = hashed;
        await existing.save();
        console.log(`✔ Updated ${userType}: ${email}`);
        return existing;
      }
      const created = await Owner.create({
        email,
        password: hashed,
        userType,          // 'VENDOR' or 'ADMIN'
        isActive: true,
      });
      console.log(`✔ Created ${userType}: ${email}`);
      return created;
    }

    await upsertOwner(vendorEmail, 'VENDOR');
    await upsertOwner(adminEmail,  'ADMIN');

    console.log('✅ Seeding complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
})();