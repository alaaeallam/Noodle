// GraphQL Resolvers for Vendor related operations
const Owner = require('../../models/owner')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards');
const Restaurant = require('../../models/restaurant')
const Order = require('../../models/order');
const { transformOwner } = require('./merge')
const bcrypt = require('bcryptjs')


// helper
const normalizeEmail = (e = '') => String(e).trim().toLowerCase();

// helpers for vendor dashboard
const buildDateFilter = (dateKeyword, starting_date, ending_date) => {
  // if explicit dates were provided, use them
  if (starting_date || ending_date) {
    const filter = {};
    if (starting_date) filter.$gte = new Date(starting_date);
    if (ending_date) {
      const d = new Date(ending_date);
      d.setHours(23, 59, 59, 999);
      filter.$lte = d;
    }
    return Object.keys(filter).length ? filter : null;
  }

  // simple keyword support – extend as needed
  if (dateKeyword === 'Today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { $gte: d, $lte: end };
  }
  if (dateKeyword === 'ThisMonth') {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { $gte: start, $lte: end };
  }
  // All / default – no filter
  return null;
};

const calcStoreMetrics = async (restaurantId, createdAtFilter) => {
  // if we don't have Order model in this deployment, just return zeros gracefully
  if (!Order) {
    return {
      totalOrders: 0,
      totalSales: 0,
      totalSalesWithoutDelivery: 0,
      totalDeliveryFee: 0,
      pickUpCount: 0,
      deliveryCount: 0,
    };
  }

  const orderQuery = { restaurant: restaurantId };
  if (createdAtFilter) {
    orderQuery.createdAt = createdAtFilter;
  }

  const orders = await Order.find(orderQuery).lean();
  let totalOrders = 0;
  let totalSales = 0;
  let totalSalesWithoutDelivery = 0;
  let totalDeliveryFee = 0;
  let pickUpCount = 0;
  let deliveryCount = 0;

  for (const o of orders) {
    totalOrders += 1;
    const amount = Number(o.amount || o.total || 0);
    const deliveryFee = Number(o.deliveryFee || 0);
    totalSales += amount;
    totalSalesWithoutDelivery += amount - deliveryFee;
    totalDeliveryFee += deliveryFee;
    if (o.orderType === 'PICKUP') {
      pickUpCount += 1;
    } else {
      deliveryCount += 1;
    }
  }

  return {
    totalOrders,
    totalSales,
    totalSalesWithoutDelivery,
    totalDeliveryFee,
    pickUpCount,
    deliveryCount,
  };
};

module.exports = {
  Query: {
    vendorProfile: async (_, _args, { req }) => {
      requireRole(req, ['ADMIN', 'VENDOR', 'SUPER_ADMIN']);
      const owner = await Owner.findById(req.userId);
      if (!owner) throw new Error('Vendor not found');
      return transformOwner(owner);
    },

    vendors: async (_, _args, { req }) => {
      requireRole(req, ADMIN_ROLES);
      const vendors = await Owner.find({ userType: 'VENDOR', isActive: true });
      return vendors?.length ? vendors.map(transformOwner) : [];
    },

    getVendor: async (_, { id }, { req }) => {
      let isAdmin = false;
      try {
        requireRole(req, ADMIN_ROLES);
        isAdmin = true;
      } catch (_) { /* not admin */ }

      if (!req?.isAuth) throw new Error('Unauthenticated');
      if (!isAdmin && String(req.userId) !== String(id)) throw new Error('Forbidden');

      const vendor = await Owner.findById(id);
      if (!vendor) throw new Error('Vendor not found');
      return transformOwner(vendor);
    },

    // returns per-store details for a given vendor – used by admin/vendor dashboard
    getStoreDetailsByVendorId: async (
      _,
      { id, dateKeyword, starting_date, ending_date },
      { req }
    ) => {
      // 1) determine who is calling
      let isAdmin = false;
      try {
        requireRole(req, ADMIN_ROLES);
        isAdmin = true;
      } catch (_) {
        isAdmin = false;
      }

      // 2) if the request is unauthenticated at all -> block (this is what you were seeing in Apollo)
      if (!req?.isAuth) {
        throw new Error('Unauthenticated');
      }

      // 3) figure out which vendor we should actually read
      //    - admin: can read any id passed in args
      //    - vendor: can only read himself, so ignore the passed id and use req.userId
      const effectiveVendorId = isAdmin ? id : req.userId;
      if (!effectiveVendorId) {
        throw new Error('Vendor id is required');
      }

      // 4) if the caller is vendor but is trying to read someone else -> block
      if (!isAdmin && String(req.userId) !== String(effectiveVendorId)) {
        throw new Error('Forbidden');
      }

      const owner = await Owner.findById(effectiveVendorId).lean();
      if (!owner) {
        throw new Error('Vendor not found');
      }

      // restaurants can come either from owner.restaurants or by querying Restaurant
      let restaurantIds = Array.isArray(owner.restaurants) ? owner.restaurants : [];
      if (!restaurantIds.length) {
        const owned = await Restaurant.find({ owner: effectiveVendorId, isActive: true }).lean();
        restaurantIds = owned.map((r) => r._id);
      }

      const createdAtFilter = buildDateFilter(dateKeyword, starting_date, ending_date);

      const restaurants = await Restaurant.find({ _id: { $in: restaurantIds }, isActive: true }).lean();
      const result = [];
      for (const r of restaurants) {
        const metrics = await calcStoreMetrics(r._id, createdAtFilter);
        result.push({
          _id: String(r._id),
          restaurantName: r.name,
          totalOrders: metrics.totalOrders,
          totalSales: metrics.totalSales,
          pickUpCount: metrics.pickUpCount,
          deliveryCount: metrics.deliveryCount,
        });
      }
      return result;
    },

    // aggregate version – used by vendor dashboard cards
    getVendorDashboardStatsCardDetails: async (
      _,
      { vendorId, dateKeyword, starting_date, ending_date },
      { req }
    ) => {
      let isAdmin = false;
      try {
        requireRole(req, ADMIN_ROLES);
        isAdmin = true;
      } catch (_) {
        isAdmin = false;
      }
      if (!req?.isAuth) {
        throw new Error('Unauthenticated');
      }

      // pick effective vendor id using the same rule as above
      const effectiveVendorId = isAdmin ? vendorId : req.userId;
      if (!effectiveVendorId) {
        throw new Error('Vendor id is required');
      }
      if (!isAdmin && String(req.userId) !== String(effectiveVendorId)) {
        throw new Error('Forbidden');
      }

      // call the per-store resolver directly so the logic stays in one place
      const stores = await module.exports.Query.getStoreDetailsByVendorId(
        _,
        {
          id: effectiveVendorId,
          dateKeyword,
          starting_date,
          ending_date,
        },
        { req }
      );

      const totalRestaurants = stores.length;
      const totalOrders = stores.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
      const totalSales = stores.reduce((sum, s) => sum + (s.totalSales || 0), 0);
      const totalDeliveries = stores.reduce((sum, s) => sum + (s.deliveryCount || 0), 0);

      return {
        totalRestaurants,
        totalOrders,
        totalSales,
        totalDeliveries,
      };
    },

    // simple growth placeholder so FE stops erroring – expand later
    getVendorDashboardGrowthDetailsByYear: async (_, { vendorId, year }, { req }) => {
      let isAdmin = false;
      try {
        requireRole(req, ADMIN_ROLES);
        isAdmin = true;
      } catch (_) {
        isAdmin = false;
      }
      if (!req?.isAuth) {
        throw new Error('Unauthenticated');
      }

      const effectiveVendorId = isAdmin ? vendorId : req.userId;
      if (!effectiveVendorId) {
        throw new Error('Vendor id is required');
      }
      if (!isAdmin && String(req.userId) !== String(effectiveVendorId)) {
        throw new Error('Forbidden');
      }

      // return 12 months arrays filled with 0 – FE will render empty chart
      const months = Array.from({ length: 12 }, () => 0);
      return {
        totalRestaurants: months,
        totalOrders: months,
        totalSales: months,
      };
    },

    // minimal live monitor – FE is calling this too
    getLiveMonitorData: async (_, { id, dateKeyword, starting_date, ending_date }, { req }) => {
      let isAdmin = false;
      try {
        requireRole(req, ADMIN_ROLES);
        isAdmin = true;
      } catch (_) {
        isAdmin = false;
      }
      if (!req?.isAuth) {
        throw new Error('Unauthenticated');
      }

      const effectiveVendorId = isAdmin ? id : req.userId;
      if (!effectiveVendorId) {
        throw new Error('Vendor id is required');
      }
      if (!isAdmin && String(req.userId) !== String(effectiveVendorId)) {
        throw new Error('Forbidden');
      }

      const owner = await Owner.findById(effectiveVendorId).lean();
      if (!owner) throw new Error('Vendor not found');

      let restaurantIds = Array.isArray(owner.restaurants) ? owner.restaurants : [];
      if (!restaurantIds.length) {
        const owned = await Restaurant.find({ owner: effectiveVendorId, isActive: true }).lean();
        restaurantIds = owned.map((r) => r._id);
      }

      const online_stores = await Restaurant.countDocuments({
        _id: { $in: restaurantIds },
        isActive: true,
      });

      return {
        online_stores,
        cancelled_orders: 0,
        delayed_orders: 0,
        ratings: 0,
      };
    },
  },
  Mutation: {
    // TODO: need to rethink about how restaurants are being added
    createVendor: async (_, args, { req }) => {
      requireRole(req, ADMIN_ROLES);
      console.log('createVendor')
      try {
        const email = normalizeEmail(args.vendorInput.email);
        if (!email) {
          throw new Error('Email is required');
        }
        if (!args.vendorInput.password) {
          throw new Error('Password is required');
        }

        const existingEmail = await Owner.findOne({ email, isActive: true });
        if (existingEmail) {
          throw new Error('Email is already associated with another account.');
        }

        const hashedPassword = await bcrypt.hash(args.vendorInput.password, 12);
        const owner = Owner({
          email,
          password: hashedPassword,
          userType: 'VENDOR'
        });
        const result = await owner.save()
        return transformOwner(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editVendor: async (_, args, { req }) => {
      console.log('editVendor');
      try {
        // Accept edits from ADMIN roles or the vendor themself
        let isAdmin = false;
        try {
          requireRole(req, ADMIN_ROLES);
          isAdmin = true;
        } catch (e) {
          isAdmin = false;
        }

        const { vendorInput } = args;
        if (!req?.isAuth) {
          throw new Error('Unauthenticated');
        }

        // If not admin, only allow self-updates
        if (!isAdmin && String(req.userId) !== String(vendorInput._id)) {
          throw new Error('Forbidden');
        }

        const owner = await Owner.findOne({
          _id: vendorInput._id,
          isActive: true
        });
        if (!owner) {
          throw new Error('Vendor not found');
        }

        // Email (optional) — normalize, ensure uniqueness if changed
        if (typeof vendorInput.email === 'string') {
          const email = normalizeEmail(vendorInput.email);
          if (!email) {
            throw new Error('Email is required');
          }
          if (email !== owner.email) {
            const existing = await Owner.findOne({
              email,
              isActive: true,
              _id: { $ne: owner._id }
            });
            if (existing) {
              throw new Error('Email is associated with another account');
            }
            owner.email = email;
          }
        }

        // Optional fields
        if (typeof vendorInput.name === 'string') owner.name = vendorInput.name;
        if (typeof vendorInput.firstName === 'string') owner.firstName = vendorInput.firstName;
        if (typeof vendorInput.lastName === 'string') owner.lastName = vendorInput.lastName;
        if (typeof vendorInput.phoneNumber === 'string') owner.phoneNumber = vendorInput.phoneNumber;
        if (typeof vendorInput.image === 'string') owner.image = vendorInput.image;

        // Optional password update
        if (vendorInput.password && typeof vendorInput.password === 'string') {
          const hashed = await bcrypt.hash(vendorInput.password, 12);
          owner.password = hashed;
        }

        const result = await owner.save();
        return transformOwner(result);
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // TODO: if vendor is deleted, shouldn't the restaurants also(isActive:false)
    deleteVendor: async(_, args, context) => {
      console.log('Delete Vendor')
      try {
        const owner = await Owner.findById(args.id);
        if (!owner) {
          throw new Error('Vendor not found');
        }

        await Promise.all(
          (owner.restaurants || []).map(async (rid) => {
            const restaurant = await Restaurant.findById(rid);
            if (restaurant) {
              restaurant.isActive = false;
              await restaurant.save();
            }
          })
        );

        owner.isActive = false;
        await owner.save();
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
}
