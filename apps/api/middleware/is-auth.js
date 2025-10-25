// apps/api/middleware/is-auth.js
const { verify } = require('../helpers/jwt');

module.exports = (req) => {
  const raw = req.headers?.authorization || req.headers?.Authorization || '';
  // Accept: "Bearer <token>" OR just "<token>"
  let token = '';
  const m = typeof raw === 'string' ? raw.match(/^Bearer\s+(.+)$/i) : null;
  token = m ? m[1] : (typeof raw === 'string' ? raw : '');

  // Trim quotes/spaces just in case a client sent `"token"`
  token = String(token).trim().replace(/^"|"$/g, '');

  if (!token) return { isAuth: false };

  try {
    const decoded = verify(token);
    return {
      isAuth: true,
      userId: decoded.userId || null,
      userType: decoded.userType || null,
      restaurantId: decoded.restaurantId || null,
    };
  } catch (e) {
    // Optional debug:
    // console.error('[is-auth] verify failed:', e.message);
    return { isAuth: false };
  }
};