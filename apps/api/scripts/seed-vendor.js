// node apps/api/scripts/seed-vendor.js vendor@example.com vendorpass
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Owner = require('../models/owner');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

(async () => {
  const [,, email, pass] = process.argv;
  if (!email || !pass) {
    console.error('Usage: node seed-vendor.js <email> <password>');
    process.exit(1);
  }
  await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
  const hash = await bcrypt.hash(pass, 12);
  const o = new Owner({ email, password: hash, userType: 'VENDOR', isActive: true, restaurants: [] });
  await o.save();
  console.log('Seeded vendor:', email);
  await mongoose.disconnect();
})();