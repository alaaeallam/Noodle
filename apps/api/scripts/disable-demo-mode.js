/* eslint-disable no-console */
// One-off: turn off Configuration.enableRiderDemo / enableRestaurantDemo.
// These gate the unauthenticated lastOrderCreds query (see SECURITY.md #14)
// which auto-fills login forms with a real account's username+password for
// demo convenience - safe only when genuinely running a demo deployment.
// No admin panel UI actually calls saveDemoConfiguration to toggle these,
// so there's no way to flip them off except directly.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Configuration = require('../models/configuration');

(async function disableDemoMode() {
  try {
    const uri = process.env.CONNECTION_STRING;
    if (!uri) {
      throw new Error('Missing CONNECTION_STRING in apps/api/.env');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const configuration = await Configuration.findOne();
    if (!configuration) {
      console.log('No Configuration document found - nothing to change.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Before: enableRiderDemo=${configuration.enableRiderDemo}, enableRestaurantDemo=${configuration.enableRestaurantDemo}`);

    await Configuration.updateOne(
      { _id: configuration._id },
      { $set: { enableRiderDemo: false, enableRestaurantDemo: false } }
    );

    console.log('✔ Set enableRiderDemo=false, enableRestaurantDemo=false');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
