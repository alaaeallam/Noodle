// apps/api/helpers/jwt.js
const jwt = require('jsonwebtoken');

const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET missing');
  return s;
};

const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const TOKEN_EXP_SECONDS = (() => {
  const v = getExpiresIn();
  const m = String(v).match(/^(\d+)([smhd])?$/i);
  if (!m) return 7 * 24 * 3600;
  const n = parseInt(m[1], 10);
  const mult = { s: 1, m: 60, h: 3600, d: 86400 }[ (m[2]||'s').toLowerCase() ] || 1;
  return n * mult;
})();

const sign = (payload) => jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn() });
const verify = (token)   => jwt.verify(token, getSecret());

module.exports = { sign, verify, TOKEN_EXP_SECONDS };