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

// Shared ownership-or-admin gate for wallet queries (earnings, transactionHistory)
// that are read by three different callers: the admin panel (sees everything),
// a restaurant's own session (RESTAURANT userType, scoped to its own restaurantId),
// and a rider's own session (RIDER userType, scoped to its own userId).
const requireWalletAccess = (req, userType, userId) => {
  requireAuth(req);
  if (ADMIN_ROLES.has(req.userType || '')) {
    return { userType, userId };
  }
  if (req.userType === 'RESTAURANT') {
    if (userType && userType !== 'STORE') throw new Error('Forbidden');
    const effectiveUserId = userId || req.restaurantId;
    if (String(effectiveUserId) !== String(req.restaurantId)) throw new Error('Forbidden');
    return { userType: 'STORE', userId: effectiveUserId };
  }
  if (req.userType === 'RIDER') {
    if (userType && userType !== 'RIDER') throw new Error('Forbidden');
    const effectiveUserId = userId || req.userId;
    if (String(effectiveUserId) !== String(req.userId)) throw new Error('Forbidden');
    return { userType: 'RIDER', userId: effectiveUserId };
  }
  throw new Error('Forbidden');
};

// Shared ownership-or-admin gate for a single restaurant's own dashboard/data:
// admins see everything, a restaurant's own session (RESTAURANT userType) can
// only see its own restaurantId, and a vendor (Owner) can see restaurants they own.
const requireRestaurantAccess = async(req, restaurantId, Restaurant) => {
  requireAuth(req);
  if (ADMIN_ROLES.has(req.userType || '')) return;
  if (req.userType === 'RESTAURANT' && String(req.restaurantId) === String(restaurantId)) return;
  if (req.userType === 'VENDOR') {
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant && String(restaurant.owner) === String(req.userId)) return;
  }
  throw new Error('Forbidden');
};

// Shared ownership-or-admin gate for a single order: admins see any order,
// the customer who placed it (USER userType) can see their own, and the
// rider assigned to it (RIDER userType) can see it while delivering.
const requireOrderAccess = (req, order) => {
  requireAuth(req);
  if (ADMIN_ROLES.has(req.userType || '')) return;
  if (req.userType === 'USER' && order.user && String(order.user) === String(req.userId)) return;
  if (req.userType === 'RIDER' && order.rider && String(order.rider) === String(req.userId)) return;
  throw new Error('Forbidden');
};

module.exports = {
  requireAuth,
  requireRole,
  requireWalletAccess,
  requireRestaurantAccess,
  requireOrderAccess,
  ADMIN_ROLES,
  VENDOR_ROLES,
  ADMIN_OR_VENDOR_ROLES,
  ANY_AUTHENTICATED,
};