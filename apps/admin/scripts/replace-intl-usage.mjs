// apps/admin/scripts/replace-intl-usage.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'apps/admin');
const GLOBS = ['app', 'lib']; // where your TS/TSX live
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Map literal usages -> new keys
const REPLACE = new Map([
  ["t('Something went wrong. Please try again')", "t('common.error.generic')"],
  ['t("Something went wrong. Please try again")', "t('common.error.generic')"],

  ["t('Store Creation Failed - Please select a vendor.')", "t('store.create.failed_select_vendor')"],
  ['t("Store Creation Failed - Please select a vendor.")', "t('store.create.failed_select_vendor')"],

  ['t("An error occurred while fetching restaurants. Please try again later.")', "t('restaurants.fetch.error')"],
  ["t('An error occurred while fetching restaurants. Please try again later.')", "t('restaurants.fetch.error')"],

  // analytics
  ["t('8.5% up from yesterday')", "t('analytics.up8_5')"],
  ['t("8.5% up from yesterday")', "t('analytics.up8_5')"],
  ["t('2.4% up from yesterday')", "t('analytics.up2_4')"],
  ['t("2.4% up from yesterday")', "t('analytics.up2_4')"],
  ["t('6.1% down from yesterday')", "t('analytics.down6_1')"],
  ['t("6.1% down from yesterday")', "t('analytics.down6_1')"],
  ["t('1.9% up from yesterday')", "t('analytics.up1_9')"],
  ['t("1.9% up from yesterday")', "t('analytics.up1_9')"],

  // OTP (turn literal text into parametric; you will still pass { email } at call sites where needed)
  ["t('We have sent OTP code to john@email.com')", "t('auth.otp.sent_to_email', { email })"],
  ['t("We have sent OTP code to john@email.com")', "t('auth.otp.sent_to_email', { email })"],
]);

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (EXTS.has(path.extname(e.name))) files.push(p);
  }
  return files;
}

function replaceInFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [from, to] of REPLACE.entries()) {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('✔ updated', path.relative(ROOT, file));
  }
}

function run() {
  for (const base of GLOBS) {
    const dir = path.join(ROOT, base);
    if (fs.existsSync(dir)) {
      const files = walk(dir);
      files.forEach(replaceInFile);
    }
  }
}

run();