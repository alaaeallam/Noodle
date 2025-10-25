// apps/admin/scripts/nest-locale-keys.mjs
import fs from 'node:fs';
import path from 'node:path';

const LOCALES_DIR = path.resolve(process.cwd(), 'apps/admin/locales');

function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split('.');
  let cur = obj;
  while (parts.length > 1) {
    const k = parts.shift();
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[parts[0]] = value;
}

function nestKeys(flatObj) {
  const out = {};
  for (const [key, val] of Object.entries(flatObj)) {
    if (key.includes('.')) {
      setDeep(out, key, val);
    } else {
      // keep non-dotted keys at top level
      out[key] = val;
    }
  }
  return out;
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
  const backupDir = path.join(LOCALES_DIR, '.backup_nested_' + Date.now());
  fs.mkdirSync(backupDir);

  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const flat = JSON.parse(raw);

    // Backup
    const b = path.join(backupDir, path.basename(f));
    fs.writeFileSync(b, raw, 'utf8');

    const nested = nestKeys(flat);
    fs.writeFileSync(f, JSON.stringify(nested, null, 2) + '\n', 'utf8');
    console.log('✔ nested', path.basename(f));
  }
}

run();