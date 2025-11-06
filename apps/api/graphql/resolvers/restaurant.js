const { sign } = require('../../helpers/jwt')
var randomstring = require('randomstring')
const mongoose = require('mongoose')
const Restaurant = require('../../models/restaurant')
const Owner = require('../../models/owner')
const Offer = require('../../models/offer')
const Order = require('../../models/order')
const Point = require('../../models/point')
const Sections = require('../../models/section')
const Zone = require('../../models/zone')
const User = require('../../models/user')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const {
  transformRestaurant,
  transformOwner,
  transformRestaurants,
  transformOrder
} = require('./merge')
const {
  order_status,
  SHOP_TYPE,
  getThirtyDaysAgo
} = require('../../helpers/enum')
const {
  publishToZoneRiders,
  publishOrder,
  publishToUser
} = require('../../helpers/pubsub')
const { sendNotificationToZoneRiders } = require('../../helpers/notifications')
const {
  sendNotificationToUser,
  sendNotificationToRider
} = require('../../helpers/notifications')
const bcrypt = require('bcryptjs')

module.exports = {
  Query: {
    nearByRestaurants: async(_, args) => {
      console.log('nearByRestaurants', args)
      try {
        const { shopType } = args
        const query = {
          isActive: true,
          isAvailable: true,
          deliveryBounds: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [Number(args.longitude), Number(args.latitude)]
              }
            }
          }
        }
        if (shopType) {
          query.shopType = shopType
        }
        const restaurants = await Restaurant.find(query)

        if (!restaurants.length) {
          return {
            restaurants: [],
            sections: [],
            offers: []
          }
        }
        // TODO: do something about offers too w.r.t zones
        const offers = await Offer.find({ isActive: true, enabled: true })

        // Find restaurants containing sections / offers
        const sectionArray = [
          ...new Set([...restaurants.map(res => res.sections)].flat())
        ]
        const sections = await Sections.find({
          _id: { $in: sectionArray },
          enabled: true
        })

        const result = {
          restaurants: await restaurants.map(transformRestaurant),
          sections: sections.map(sec => ({
            _id: sec.id,
            name: sec.name,
            restaurants: sec.restaurants
          })),
          offers: offers.map(o => ({
            ...o._doc,
            _id: o.id
          }))
        }
        return result
      } catch (err) {
        throw err
      }
    },
    restaurantList: async _ => {
      console.log('restaurantList')
      try {
        const allRestaurants = await Restaurant.find({ address: { $ne: null } })
        return transformRestaurants(allRestaurants)
      } catch (error) {
        throw error
      }
    },
    restaurantByOwner: async(_, args, { req }) => {
      console.log('restaurantByOwner')
      try {
        const id = args.id || req.userId
        const owner = await Owner.findById(id)
        return transformOwner(owner)
      } catch (e) {
        throw e
      }
    },
    restaurants: async _ => {
      console.log('restaurants')
      try {
        const restaurants = await Restaurant.find()
        return transformRestaurants(restaurants)
      } catch (e) {
        throw e
      }
    },
    restaurant: async(_, args, { req }) => {
      console.log('restaurant', args)
      try {
        const filters = {}
        if (args.slug) {
          filters.slug = args.slug
        } else if (args.id) {
          filters._id = args.id
        } else if (req.restaurantId) {
          filters._id = req.restaurantId
        } else {
          throw new Error('Invalid request, restaurant id not provided')
        }
        const restaurant = await Restaurant.findOne(filters)
        if (!restaurant) throw Error('Restaurant not found')
        return transformRestaurant(restaurant)
      } catch (e) {
        throw e
      }
    },
    /**
     * Returns delivery zone info for a single restaurant (used by Admin > Store > Location)
     * Shape aligns with frontend query: address, deliveryBounds{coordinates}, circleBounds{radius}, location{coordinates}, boundType
     */
    getRestaurantDeliveryZoneInfo: async (_, { id }) => {
      console.log('getRestaurantDeliveryZoneInfo', id);
      try {
        // Explicitly select the geo fields (in case schema uses select:false) and use lean() for a plain object
        const restaurant = await Restaurant
          .findById(id)
          .select('address deliveryBounds location circleBounds boundType')
          .lean();

        if (!restaurant) throw new Error('Restaurant not found');

        // Extra debug to verify what we actually read from DB
        console.log('[ZoneInfo:raw] deliveryBounds=', restaurant?.deliveryBounds, ' location=', restaurant?.location);

        // Normalize polygon coordinates if present (GeoJSON { type: 'Polygon', coordinates: [ [ [lng,lat], ... ] ] })
        const rawPoly = restaurant?.deliveryBounds?.coordinates;
        const poly = Array.isArray(rawPoly)
          ? rawPoly.map((ring) =>
              Array.isArray(ring)
                ? ring
                    .map((pt) => (Array.isArray(pt) && pt.length >= 2
                      ? [Number(pt[0]), Number(pt[1])] : null))
                    .filter(Boolean)
                : []
            )
          : null;

        // Normalize point coordinates if present (GeoJSON Point { type: 'Point', coordinates: [lng,lat] })
        const rawPoint = restaurant?.location?.coordinates;
        const point = Array.isArray(rawPoint)
          ? rawPoint.map((n) => Number(n))
          : null;

        // Optional circle radius if your DB stores it
        const radius = (restaurant?.circleBounds && restaurant.circleBounds.radius != null)
          ? Number(restaurant.circleBounds.radius)
          : null;

        const boundTypeGuess = restaurant?.boundType
          ? restaurant.boundType
          : (poly ? 'polygon' : (radius ? 'radius' : 'point'));

        // Helpful concise debug
        console.log('[ZoneInfo] poly?', !!poly, 'point?', point, 'radius?', radius);

        return {
          address: restaurant.address || '',
          deliveryBounds: poly ? { coordinates: poly } : null,
          circleBounds: radius != null ? { radius } : null,
          location: point ? { coordinates: point } : null,
          boundType: boundTypeGuess,
        };
      } catch (error) {
        console.log('getRestaurantDeliveryZoneInfo error', error);
        throw error;
      }
    },
    restaurantOrders: async(_, args, { req }) => {
      console.log('restaurantOrders', req.restaurantId)
      const date = new Date()
      date.setDate(date.getDate() - 1)
      const orders = await Order.find({
        restaurant: req.restaurantId,
        createdAt: {
          $gte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        }
      }) // today and yesterday instead of limit 50
      return orders.map(transformOrder)
    },
    recentOrderRestaurants: async(_, args, { req }) => {
      console.log('recentOrderRestaurants', args, req.userId)
      const { longitude, latitude } = args
      if (!req.isAuth) throw new Error('Unauthenticated')
      // selects recent orders
      const recentRestaurantIds = await Order.find({ user: req.userId })
        .select('restaurant')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
      // if no orders, no restaurant, returns empty
      if (!recentRestaurantIds.length) return []
      const restaurantIds = recentRestaurantIds.map(r =>
        r.restaurant.toString()
      )
      // finds restaurants by id, also make sures restaurants delivers in the area.
      const restaurants = await Restaurant.find({
        $and: [
          {
            id: {
              $in: restaurantIds
            }
          },
          {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        ]
      })
      return restaurants.map(transformRestaurant)
    },
    mostOrderedRestaurants: async(_, args, { req }) => {
      console.log('mostOrderedRestaurants', args, req.userId)
      const { longitude, latitude } = args
      const restaurants = await Restaurant.aggregate([
        {
          $match: {
            isActive: true,
            isAvailable: true,
            deliveryBounds: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [Number(longitude), Number(latitude)]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'restaurant',
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: getThirtyDaysAgo() }
                }
              }
            ],
            as: 'orders'
          }
        },
        {
          $addFields: {
            orderCount: { $size: '$orders' }
          }
        },
        {
          $sort: { orderCount: -1 }
        },
        {
          $limit: 20
        }
      ]).exec()

      return restaurants.map(r => transformRestaurant(new Restaurant(r)))
    },
    relatedItems: async(_, args, { req }) => {
      console.log('relatedItems', args, req.userId)
      try {
        const { itemId, restaurantId } = args
        const items = await Order.aggregate([
          {
            $match: {
              $and: [
                { 'items.food': itemId },
                { restaurant: mongoose.Types.ObjectId(restaurantId) },
                { createdAt: { $gte: getThirtyDaysAgo() } }
              ]
            }
          },
          {
            $unwind: '$items'
          },
          {
            $match: {
              'items.food': { $ne: itemId }
            }
          },
          {
            $group: {
              _id: '$items.food',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10
          }
        ]).exec()

        return items.map(item => item._id)
      } catch (error) {
        console.log('relatedItems', error)
        throw error
      }
    },
    popularItems: async(_, args) => {
      console.log('popularItems', args)
      try {
        const { restaurantId } = args
        const result = await Order.aggregate([
          {
            $match: {
              $and: [
                { restaurant: mongoose.Types.ObjectId(restaurantId) },
                { createdAt: { $gte: getThirtyDaysAgo() } }
              ]
            }
          },
          { $unwind: '$items' },
          { $group: { _id: { id: '$items.food' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]).exec()
        return result.map(({ _id: { id }, count }) => ({ id, count }))
      } catch (error) {
        console.log('popularItems errored', error)
      }
    },
    topRatedVendors: async(_, args, { req }) => {
      console.log('topRatedVendors', args)
      try {
        const { longitude, latitude } = args
        const restaurants = await Restaurant.aggregate([
          {
            $match: {
              isActive: true,
              isAvailable: true,
              deliveryBounds: {
                $geoIntersects: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [Number(longitude), Number(latitude)]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'restaurant',
              pipeline: [
                {
                  $match: {
                    createdAt: { $gte: getThirtyDaysAgo() }
                  }
                }
              ],
              as: 'reviews'
            }
          },
          {
            $addFields: {
              averageRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] } // Calculate the average of the 'rating' property
            }
          },
          {
            $sort: { averageRating: -1 }
          },
          {
            $limit: 20
          }
        ]).exec()
        return restaurants.map(restaurant =>
          transformRestaurant(new Restaurant(restaurant))
        )
      } catch (error) {
        console.log('topRatedVendors error', error)
      }
    }
  },
  Mutation: {
    createRestaurant: async(_, args, { req }) => {
      console.log('createRestanrant', args)
      try {
        if (!req.userId) throw new Error('Unauthenticated')
        const restaurantExists = await Restaurant.exists({
          name: { $regex: new RegExp('^' + args.restaurant.name + '$', 'i') }
        })
        if (restaurantExists) {
          throw Error('Restaurant by this name already exists')
        }
        const owner = await Owner.findById(args.owner)
        if (!owner) throw new Error('Owner does not exist')
        const orderPrefix = randomstring.generate({
          length: 5,
          capitalization: 'uppercase'
        })

        const restaurant = new Restaurant({
          name: args.restaurant.name,
          address: args.restaurant.address,
          image: args.restaurant.image,
          orderPrefix: orderPrefix,
          slug: args.restaurant.name.toLowerCase().split(' ').join('-'),
          username: args.restaurant.username,
          password: args.restaurant.password,
          owner: args.owner,
          tax: args.salesTax,
          cuisines: args.restaurant.cuisines ?? [],
          shopType: args.restaurant.shopType || SHOP_TYPE.RESTAURANT //  default value 'restaurant' for backward compatibility
        })
        console.log('New Restaurant: ', restaurant)

        const result = await restaurant.save()
        owner.restaurants.push(result.id)
        await owner.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    editRestaurant: async(_, args) => {
      console.log('editRestaurant')
      try {
        const restaurantByNameExists = await Restaurant.findOne({
          name: { $regex: new RegExp('^' + args.restaurant.name + '$', 'i') },
          // name: { $text: { $search: args.restaurant.name } },
          _id: { $ne: args.restaurant._id }
        })
          .select({ _id: 1 })
          .lean()

        if (restaurantByNameExists) {
          throw new Error('Restaurant by this name already exists')
        }
        if (args.restaurant.username) {
          const restaurantExists = await Restaurant.findOne({
            username: args.restaurant.username
          })

          if (restaurantExists && restaurantExists.id !== args.restaurant._id) {
            throw new Error('Username already taken')
          }
        }
        if (args.restaurant.orderPrefix) {
          const restaurantExists = await Restaurant.find({
            orderPrefix: args.restaurant.orderPrefix
          })
          if (restaurantExists.length > 0) {
            if (restaurantExists.length > 1) {
              throw new Error('Order Prefix already taken')
            } else if (restaurantExists[0].id !== args.restaurant._id) {
              throw new Error('Order Prefix already taken')
            }
          }
        }

        const restaurant = await Restaurant.findOne({
          _id: args.restaurant._id
        })
        restaurant.name = args.restaurant.name
        restaurant.address = args.restaurant.address
        restaurant.image = args.restaurant.image
        restaurant.orderPrefix = args.restaurant.orderPrefix
        restaurant.isActive = true
        restaurant.username = args.restaurant.username
        restaurant.deliveryTime = args.restaurant.deliveryTime
        restaurant.minimumOrder = args.restaurant.minimumOrder
        restaurant.password = args.restaurant.password
        restaurant.slug = args.restaurant.name
          .toLowerCase()
          .split(' ')
          .join('-')
        restaurant.tax = args.restaurant.salesTax
        restaurant.shopType = args.restaurant.shopType
        restaurant.cuisines = args.restaurant.cuisines
        const result = await restaurant.save()

        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    deleteRestaurant: async(_, { id }, { req }) => {
      console.log('deleteRestaurant', req.userId)
      try {
        const owner = await Owner.findOne({
          restaurants: mongoose.Types.ObjectId(id)
        })
        if (!owner) throw new Error('Owner does not exist')
        if (!owner.isActive) throw new Error('Owner was deleted')
        const restaurant = await Restaurant.findById(id)
        restaurant.isActive = !restaurant.isActive
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    restaurantLogin: async (_, args) => {
      console.log('restaurantLogin')
      try {
        const rawUser = (args?.username || '').trim()
        const rawPass = args?.password || ''
        if (!rawUser || !rawPass) throw new Error('Invalid credentials')

        // Look up by username or email (case-insensitive), but DO NOT include password in the query
        const userQuery = {
          $or: [
            { username: { $regex: new RegExp('^' + rawUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } },
            { email:    { $regex: new RegExp('^' + rawUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } }
          ]
        }

        const restaurant = await Restaurant.findOne(userQuery)
        if (!restaurant) throw new Error('Invalid credentials')

        // Compare bcrypt hash
        const ok = await bcrypt.compare(rawPass, restaurant.password || '')
        if (!ok) throw new Error('Invalid credentials')

        // Optional gate: inactive restaurants cannot login
        if (restaurant.isActive === false) throw new Error('Invalid credentials')

        const token = sign({ restaurantId: restaurant.id, userType: 'RESTAURANT' })
        return { token, restaurantId: restaurant.id }
      } catch (err) {
        // Keep error message generic to avoid leaking which check failed
        throw new Error('Invalid credentials')
      }
    },
    acceptOrder: async(_, args, { req }) => {
      var newDateObj = await new Date(
        Date.now() + (parseInt(args.time) || 0) * 60000
      )
      console.log('preparation', newDateObj)
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order_status[1] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(req.restaurantId)
        order.preparationTime = newDateObj
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )
        order.acceptedAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)
        if (!transformedOrder.isPickedUp) {
          publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
          sendNotificationToZoneRiders(order.zone.toString(), transformedOrder)
        }
        publishToUser(result.user.toString(), transformedOrder, 'update')
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user.toString(), transformedOrder)
        return transformedOrder
      } catch (err) {
        console.log('acceptOrder', err)
        throw err
      }
    },
    cancelOrder: async(_, args, { req }) => {
      console.log('cancelOrder')
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order_status[4] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        order.reason = args.reason
        order.cancelledAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)

        if (result.rider) {
          sendNotificationToRider(result.rider.toString(), transformedOrder)
        }

        sendNotificationToUser(result.user, transformedOrder)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    saveRestaurantToken: async(_, args, { req }) => {
      console.log('saveRestaurantToken', req.restaurantId, args)
      try {
        const restaurant = await Restaurant.findById(req.restaurantId)
        if (!restaurant) throw new Error('Restaurant does not exist')
        restaurant.notificationToken = args.token
        restaurant.enableNotification = args.isEnabled
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (error) {
        console.log('error', error)
      }
    },
    updateTimings: async(_, args) => {
      console.log('updateTimings', args)
      try {
        const restaurant = await Restaurant.findById(args.id)
        restaurant.openingTimes = args.openingTimes
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    toggleAvailability: async(_, args, { req }) => {
      console.log('toggleAvailablity')
      try {
        if (!req.restaurantId) {
          throw new Error('Unauthenticated!')
        }
        const restaurant = await Restaurant.findById(req.restaurantId)
        restaurant.isAvailable = !restaurant.isAvailable
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    },
    updateCommission: async(_, args) => {
      console.log('updateCommission')
      try {
        const { id, commissionRate } = args
        const result = await Restaurant.updateOne(
          { _id: id },
          { commissionRate }
        )
        if (result.modifiedCount > 0) {
          const restaurant = await Restaurant.findOne({ _id: id })
          return transformRestaurant(restaurant)
        } else {
          throw Error("Couldn't update the restaurant")
        }
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    orderPickedUp: async(_, args, { req }) => {
      console.log('orderPickedUp')
      if (!req.restaurantId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args._id)
        const status = order_status[3] // TODO: we should make variables named status instead. e.g const ACCEPTED="ACCEPTED"
        order.orderStatus = status
        const restaurant = await Restaurant.findById(req.restaurantId)
        order.completionTime = new Date(
          Date.now() + restaurant.deliveryTime * 60 * 1000
        )
        order.deliveredAt = new Date()
        const result = await order.save()
        const user = await User.findById(result.user)
        const transformedOrder = await transformOrder(result)
        if (!transformedOrder.isPickedUp) {
          publishToZoneRiders(order.zone.toString(), transformedOrder, 'new')
          sendNotificationToZoneRiders(order.zone.toString(), transformedOrder)
        }
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user.toString(), transformedOrder)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    updateDeliveryBoundsAndLocation: async (_, args) => {
      console.log('updateDeliveryBoundsAndLocation');
      const { id, bounds: newBounds, location: newLocation, circleRadius, boundType } = args;
      try {
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) throw new Error('Restaurant does not exists');

        // --- Build GeoJSON Point for the restaurant location
        const locLng = Number(newLocation.longitude);
        const locLat = Number(newLocation.latitude);
        const location = new Point({
          type: 'Point',
          coordinates: [locLng, locLat]
        });
        console.log('[Update] Location:', location);

        // --- Try to resolve an active zone that contains this point (optional for circle mode)
        const zone = await Zone.findOne({
          location: { $geoIntersects: { $geometry: location } },
          isActive: true
        });
        console.log('[Update] Zone:', zone ? zone._id : 'NONE');

        // --- Helper: ensure a valid polygon ring (Lng/Lat pairs)
        const normalizePolygonRing = (ring) => {
          if (!Array.isArray(ring)) return [];
          const cleaned = ring
            .map(p => Array.isArray(p) && p.length >= 2 ? [Number(p[0]), Number(p[1])] : null)
            .filter(Boolean);
          if (cleaned.length < 3) return [];
          const first = cleaned[0];
          const last = cleaned[cleaned.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            cleaned.push([first[0], first[1]]);
          }
          return cleaned;
        };

        // Accept either a full [[[lng,lat]]] polygon or a single outer ring [[lng,lat],...]
        let polygonCoordinates = null;
        if (newBounds && Array.isArray(newBounds)) {
          if (Array.isArray(newBounds[0]) && typeof newBounds[0][0] === 'number') {
            const ring = normalizePolygonRing(newBounds);
            if (ring.length) polygonCoordinates = [ring];
          } else if (Array.isArray(newBounds[0])) {
            const ring = normalizePolygonRing(newBounds[0]);
            if (ring.length) polygonCoordinates = [ring];
          }
        }

        const isCircle = (boundType === 'circle' || boundType === 'radius') && circleRadius != null;

        // --- Guard: require at least one method of defining bounds (zone, polygon, or circle)
        if (!zone && !polygonCoordinates && !isCircle) {
          return {
            success: false,
            message: "restaurant's location doesn't lie in any delivery zone"
          };
        }

        // --- Build update operations using $set/$unset to correctly switch between modes
        const updateOps = { $set: { location }, $unset: {} };

        if (polygonCoordinates) {
          updateOps.$set.deliveryBounds = { type: 'Polygon', coordinates: polygonCoordinates };
          updateOps.$set.boundType = 'polygon';
          updateOps.$unset.circleBounds = '';
        }

        if (isCircle) {
          updateOps.$set.boundType = 'circle';
          updateOps.$set.circleBounds = { radius: Number(circleRadius) };
          updateOps.$unset.deliveryBounds = '';
        }

        if (zone) {
          updateOps.$set.zone = zone._id;
        }

        const updated = await Restaurant.findByIdAndUpdate(
          id,
          updateOps,
          { new: true }
        );

        return {
          success: true,
          data: transformRestaurant(updated)
        };
      } catch (error) {
        console.log('updateDeliveryBoundsAndLocation', error);
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
}
  