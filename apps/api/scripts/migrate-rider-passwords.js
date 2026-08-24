/* eslint-disable no-console */
// One-time migration: bcrypt-hash any Rider password that's still stored in
// plaintext. Safe to re-run - already-hashed passwords (bcrypt format,
// $2a$/$2b$/$2y$ prefix) are skipped, so this can be run more than once
// without double-hashing anything.
//
// Usage:
//   node scripts/migrate-rider-passwords.js --dry-run   (preview only, no writes)
//   node scripts/migrate-rider-passwords.js             (actually migrate)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Rider = require('../models/rider');

const BCRYPT_FORMAT = /^\$2[aby]\$/;
const isDryRun = process.argv.includes('--dry-run');

(async function migrate() {
  try {
    const uri = process.env.CONNECTION_STRING;
    if (!uri) {
      throw new Error('Missing CONNECTION_STRING in apps/api/.env');
    }

    mongoose.set('strictQuery', true);

    // Don't log the URI itself - it carries embedded DB credentials.
    console.log(`👉 Connecting to database at host: ${new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://')).hostname}`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const riders = await Rider.find({});
    console.log(`Found ${riders.length} rider(s) total.`);

    let migrated = 0;
    let alreadyHashed = 0;
    let skippedNoPassword = 0;
    let failed = 0;

    for (const rider of riders) {
      if (!rider.password) {
        skippedNoPassword++;
        continue;
      }
      if (BCRYPT_FORMAT.test(rider.password)) {
        alreadyHashed++;
        continue;
      }
      try {
        const hashed = await bcrypt.hash(rider.password, 12);
        if (isDryRun) {
          console.log(`[dry-run] would migrate rider ${rider.id} (${rider.username})`);
        } else {
          await Rider.updateOne({ _id: rider._id }, { $set: { password: hashed } });
          console.log(`✔ Migrated rider ${rider.id} (${rider.username})`);
        }
        migrated++;
      } catch (err) {
        failed++;
        console.error(`❌ Failed to migrate rider ${rider.id} (${rider.username}):`, err.message);
      }
    }

    console.log('');
    console.log(isDryRun ? '--- DRY RUN SUMMARY (no writes made) ---' : '--- MIGRATION SUMMARY ---');
    console.log(`Total riders:        ${riders.length}`);
    console.log(`Already hashed:      ${alreadyHashed}`);
    console.log(`${isDryRun ? 'Would migrate' : 'Migrated'}:       ${migrated}`);
    console.log(`Skipped (no pw):     ${skippedNoPassword}`);
    console.log(`Failed:              ${failed}`);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
})();
