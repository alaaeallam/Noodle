const Coupon = require('../../models/coupon')
const Restaurant = require('../../models/restaurant')
const { requireRole, requireRestaurantAccess, ADMIN_ROLES } = require('../../helpers/guards')

module.exports = {
  Query: {
    // Management (super-admin) view: every coupon platform-wide, both
    // global (restaurant: null) and restaurant-owned.
    coupons: async(_, args, { req }) => {
      console.log('coupons')
      try {
        requireRole(req, ADMIN_ROLES)
        const coupons = await Coupon.find({ isActive: true }).sort({
          createdAt: -1
        })
        return coupons.map(coupon => ({
          ...coupon._doc,
          _id: coupon.id
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // A single restaurant's own Coupons page: only coupons that belong to
    // that restaurant, never platform-wide or other restaurants' coupons.
    restaurantCoupons: async (_, { restaurantId }, { req }) => {
      console.log('restaurantCoupons', { restaurantId });
      try {
        await requireRestaurantAccess(req, restaurantId, Restaurant)
        const coupons = await Coupon.find({ isActive: true, restaurant: restaurantId }).sort({ createdAt: -1 });
        return coupons.map(coupon => ({
          ...coupon._doc,
          _id: coupon.id
        }));
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  },
  Mutation: {
    // Platform-wide coupon (Management > Coupons, admin-only)
    createCoupon: async(_, args, { req }) => {
      console.log('createCoupon')
      try {
        requireRole(req, ADMIN_ROLES)
        const count = await Coupon.countDocuments({
          title: args.couponInput.title,
          isActive: true,
          restaurant: null
        })
        if (count > 0) throw new Error('Coupon Code already exists')
        const coupon = new Coupon({
          title: args.couponInput.title,
          discount: args.couponInput.discount,
          enabled: args.couponInput.enabled,
          restaurant: null
        })
        const result = await coupon.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editCoupon: async(_, args, { req }) => {
      console.log('editCoupon')
      try {
        requireRole(req, ADMIN_ROLES)
        const count = await Coupon.countDocuments({ _id: args.couponInput._id })
        if (count > 1) throw new Error('Coupon code already used')
        const coupon = await Coupon.findById(args.couponInput._id)
        if (!coupon) {
          throw new Error('Coupon does not exist')
        }
        coupon.title = args.couponInput.title
        coupon.discount = args.couponInput.discount
        coupon.enabled = args.couponInput.enabled
        const result = await coupon.save()
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteCoupon: async(_, args, { req }) => {
      console.log('deleteCoupon')
      try {
        requireRole(req, ADMIN_ROLES)
        const coupon = await Coupon.findById(args.id)
        coupon.isActive = false
        const result = await coupon.save()
        return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // Restaurant-owned coupon (a single restaurant's own Coupons page)
    createRestaurantCoupon: async (_, { restaurantId, couponInput }, { req }) => {
      console.log('createRestaurantCoupon', { restaurantId });
      try {
        await requireRestaurantAccess(req, restaurantId, Restaurant)
        const count = await Coupon.countDocuments({
          title: couponInput.title,
          isActive: true,
          restaurant: restaurantId
        });
        if (count > 0) throw new Error('Coupon Code already exists');
        const coupon = new Coupon({
          title: couponInput.title,
          discount: couponInput.discount,
          enabled: couponInput.enabled,
          restaurant: restaurantId
        });
        const result = await coupon.save();
        return {
          ...result._doc,
          _id: result.id
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    editRestaurantCoupon: async (_, { restaurantId, couponInput }, { req }) => {
      console.log('editRestaurantCoupon', { restaurantId });
      try {
        await requireRestaurantAccess(req, restaurantId, Restaurant)
        const coupon = await Coupon.findById(couponInput._id);
        if (!coupon) {
          throw new Error('Coupon does not exist');
        }
        if (String(coupon.restaurant) !== String(restaurantId)) {
          throw new Error('Coupon does not belong to this restaurant')
        }
        const count = await Coupon.countDocuments({
          _id: { $ne: couponInput._id },
          title: couponInput.title,
          isActive: true,
          restaurant: restaurantId
        })
        if (count > 0) throw new Error('Coupon code already used')
        coupon.title = couponInput.title;
        coupon.discount = couponInput.discount;
        coupon.enabled = couponInput.enabled;
        const result = await coupon.save();
        return {
          ...result._doc,
          _id: result.id
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    deleteRestaurantCoupon: async (_, { restaurantId, couponId }, { req }) => {
      console.log('deleteRestaurantCoupon', { restaurantId, couponId });
      try {
        await requireRestaurantAccess(req, restaurantId, Restaurant)
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
          throw new Error('Coupon does not exist');
        }
        if (String(coupon.restaurant) !== String(restaurantId)) {
          throw new Error('Coupon does not belong to this restaurant')
        }
        coupon.isActive = false;
        const result = await coupon.save();
        return result.id;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // Customer checkout redemption (public, pre-login) — prefers a coupon
    // scoped to the order's restaurant, falls back to a platform-wide one.
    coupon: async(_, args, context) => {
      console.log('coupon', args)
      try {
        let coupon = null
        if (args.restaurantId) {
          coupon = await Coupon.findOne({
            isActive: true,
            title: args.coupon,
            restaurant: args.restaurantId
          })
        }
        if (!coupon) {
          coupon = await Coupon.findOne({
            isActive: true,
            title: args.coupon,
            restaurant: null
          })
        }
        if (coupon) {
          return {
            ...coupon._doc,
            _id: coupon.id
          }
        } else {
          throw new Error('Coupon code not found')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
