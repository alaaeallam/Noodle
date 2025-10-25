// apps/api/helpers/guards.js
const requireAuth = (req) => {
  if (!req || !req.isAuth) {
    throw new Error('Unauthenticated');
  }
  return req;
};

const requireRole = (req, allowed) => {
  requireAuth(req);


  // Normalize: if array, convert to set
  const set = Array.isArray(allowed) ? new Set(allowed) : allowed;
  if (!set.has(req.userType || '')) throw new Error('Forbidden');
  return req;
};

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
const VENDOR_ROLES = new Set(['VENDOR']);
const ADMIN_OR_VENDOR_ROLES = new Set(['ADMIN', 'VENDOR']);
const ANY_AUTHENTICATED = new Set(['ADMIN','SUPER_ADMIN','VENDOR', 'USER', 'RIDER']);

module.exports = {
  requireAuth,
  requireRole,
  ADMIN_ROLES,
  VENDOR_ROLES,
  ADMIN_OR_VENDOR_ROLES,
  ANY_AUTHENTICATED,
};