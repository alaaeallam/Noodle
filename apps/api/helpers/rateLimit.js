// apps/api/helpers/rateLimit.js
// Lightweight in-memory rate limiter for sensitive GraphQL mutations
// (login, password reset/change, OTP send). Deliberately not Express
// middleware - the existing middleware chain in app.js has a specific
// bodyParser/CORS/Apollo ordering that's risky to disturb, and every
// resolver already receives `req` via context, so this is applied as a
// plain check at the top of each sensitive resolver instead.
//
// In-memory means this resets on restart and isn't shared across pm2
// cluster workers - fine for the current single-instance deployment, but
// would need a Redis-backed store (the app already depends on Redis via
// `bull`) if this ever moves to cluster mode.

const buckets = new Map(); // key -> { count, resetAt }

const rateLimit = (key, { max, windowMs }) => {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
  if (entry.count > max) {
    throw new Error('Too many attempts. Please try again later.');
  }
};

// Periodic sweep so one-off IPs don't accumulate in memory forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();

const getClientIp = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req?.ip || req?.connection?.remoteAddress || 'unknown';
};

// Convenience wrapper: rate-limit a named endpoint by client IP.
const rateLimitByIp = (endpoint, req, opts) => {
  rateLimit(`${endpoint}:${getClientIp(req)}`, opts);
};

module.exports = { rateLimit, rateLimitByIp, getClientIp };
