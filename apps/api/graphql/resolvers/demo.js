const Order = require('../../models/order')
const Restaurant = require('../../models/restaurant')
const Rider = require('../../models/rider')
const Configuration = require('../../models/configuration')

module.exports = {
  Mutation: {},
  Query: {
    // Demo-mode convenience for auto-filling the store/rider login forms with
    // the most recently active account. This is unauthenticated, so it must
    // stay off (Configuration.enableRestaurantDemo / enableRiderDemo) outside
    // a demo deployment, and must never throw on missing data in a real
    // deployment where there's no seeded demo order.
    lastOrderCreds: async() => {
      try {
        const configuration = await Configuration.findOne()
        if (!configuration?.enableRestaurantDemo && !configuration?.enableRiderDemo) {
          return null
        }

        const order = await Order.findOne().sort({ createdAt: -1 })
        if (!order) return null

        const restaurant = configuration?.enableRestaurantDemo
          ? await Restaurant.findById(order.restaurant)
          : null
        const rider = configuration?.enableRiderDemo
          ? await Rider.findOne({ zone: order.zone, isActive: true, available: true })
          : null

        // Security: never return a real account's actual password/hash here,
        // even if demo mode is ever re-enabled - this only ever leaks the
        // username of whichever account happens to be most recently active,
        // never its credential.
        return {
          restaurantUsername: restaurant?.username ?? null,
          restaurantPassword: null,
          riderUsername: rider?.username ?? null,
          riderPassword: null
        }
      } catch (err) {
        console.log('lastOrderCreds error', err)
        return null
      }
    }
  }
}
