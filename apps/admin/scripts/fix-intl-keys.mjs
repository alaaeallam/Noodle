// apps/admin/scripts/fix-intl-keys.mjs
import fs from 'node:fs';
import path from 'node:path';

const LOCALES_DIR = path.resolve(process.cwd(), 'apps/admin/locales');

// 1) Map old (bad) keys -> new (safe) keys
const KEY_MAP = {
  '8.5% up from yesterday': 'analytics.up8_5',
  '2.4% up from yesterday': 'analytics.up2_4',
  '6.1% down from yesterday': 'analytics.down6_1',
  '1.9% up from yesterday': 'analytics.up1_9',

  'Store Creation Failed - Please select a vendor.':
    'store.create.failed_select_vendor',

  'Something went wrong. Please try again':
    'common.error.generic',

  'An error occurred while fetching restaurants. Please try again later.':
    'restaurants.fetch.error',

  'We have sent OTP code to john@email.com':
    'auth.otp.sent_to_email', // will parameterize to {email}
};

// 2) Any other keys containing a dot can be auto-namespaced here if desired
function autoKeyFor(key) {
  // we only want to auto-fix the specific set right now; return null to skip
  return null;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  const temp = file + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  fs.renameSync(temp, file);
}

function migrateLocaleFile(localePath) {
  const data = readJson(localePath);
  let changed = false;

  // Work on top-level keys only (matches your files’ structure).
  // If you ever nest, upgrade this to a deep-walk.
  for (const [oldKey, newKey] of Object.entries(KEY_MAP)) {
    if (oldKey in data) {
      const val = data[oldKey];

      // Special case: parameterize OTP email
      const finalValue =
        newKey === 'auth.otp.sent_to_email'
          ? String(val).replace(/john@email\.com/gi, '{email}')
          : val;

      // Preserve existing newKey if it already exists; otherwise move
      if (!(newKey in data)) {
        data[newKey] = finalValue;
      }

      delete data[oldKey];
      changed = true;
    }
  }

  // Optional: auto-fix any top-level key that contains a dot
  for (const key of Object.keys(data)) {
    if (key.includes('.')) {
      const guess = autoKeyFor(key);
      if (guess && !(guess in data)) {
        data[guess] = data[key];
        delete data[key];
        changed = true;
      }
    }
  }

  if (changed) {
    writeJson(localePath, data);
    console.log('✔ migrated', path.basename(localePath));
  } else {
    console.log('• no changes', path.basename(localePath));
  }
}

function run() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error('Locales dir not found:', LOCALES_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(LOCALES_DIR, f));

  if (!files.length) {
    console.log('No locale JSON files found in', LOCALES_DIR);
    return;
  }

  // Backup once
  const backupDir = path.join(LOCALES_DIR, '.backup_before_fix');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  for (const f of files) {
    const b = path.join(backupDir, path.basename(f));
    if (!fs.existsSync(b)) fs.copyFileSync(f, b);
  }

  files.forEach(migrateLocaleFile);
}

run();