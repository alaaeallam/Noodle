/* eslint-disable no-tabs */
const path = require('path')
const User = require('../../models/user')
// const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Item = require('../../models/item')
const Coupon = require('../../models/coupon')
const Point = require('../../models/point')
const Zone = require('../../models/zone')
const Restaurant = require('../../models/restaurant')
const Configuration = require('../../models/configuration')
const Paypal = require('../../models/paypal')
const Stripe = require('../../models/stripe')
const { transformOrder } = require('./merge')
const { requireRole, requireRestaurantAccess, ADMIN_ROLES } = require('../../helpers/guards')
const {
  payment_status,
  order_status,
  ORDER_STATUS
} = require('../../helpers/enum')
const { sendEmail } = require('../../helpers/email')
const {
  sendNotification,
  calculateDistance
} = require('../../helpers/utilities')
const { placeOrderTemplate } = require('../../helpers/templates')
const { sendNotificationToRestaurant } = require('../../helpers/notifications')
const { withFilter } = require('graphql-subscriptions')
const {
  pubsub,
  publishToUser,
  publishToDashboard,
  publishOrder,
  publishToDispatcher,
  PLACE_ORDER,
  ORDER_STATUS_CHANGED,
  ASSIGN_RIDER,
  SUBSCRIPTION_ORDER
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')

var DELIVERY_CHARGES = 0.0
module.exports = {
  Subscription: {
    subscribePlaceOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PLACE_ORDER),
        (payload, args, context) => {
          const restaurantId = payload.subscribePlaceOrder.restaurantId
          console.log('restaurantId', restaurantId)
          return restaurantId === args.restaurant
        }
      )
    },
    orderStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_STATUS_CHANGED),
        (payload, args, context) => {
          const userId = payload.orderStatusChanged.userId.toString()
          return userId === args.userId
        }
      )
    },
    subscriptionAssignRider: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ASSIGN_RIDER),
        (payload, args) => {
          const riderId = payload.subscriptionAssignRider.userId.toString()
          return riderId === args.riderId
        }
      )
    },
    subscriptionOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SUBSCRIPTION_ORDER),
        (payload, args) => {
          const orderId = payload.subscriptionOrder._id.toString()
          return orderId === args.id
        }
      )
    }
  },
  Query: {
    order: async(_, args, { req, res }) => {
      console.log('order')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        console.log(order)
        return transformOrder(order)
      } catch (err) {
        throw err
      }
    },
    orderPaypal: async(_, args, { req, res }) => {
      console.log('orderPaypal')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const paypal = await Paypal.findById(args.id)
        console.log('PAYPAL: ', paypal)
        if (!paypal) throw new Error('Order does not exist')
        return transformOrder(paypal)
      } catch (err) {
        throw err
      }
    },
    orderStripe: async(_, args, { req, res }) => {
      console.log('orderStripe')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const stripe = await Stripe.findById(args.id)
        console.log('STRIPE: ', stripe)
        if (!stripe) throw new Error('Order does not exist')
        return transformOrder(stripe)
      } catch (err) {
        throw err
      }
    },
    orders: async(_, args, { req, res }) => {
      console.log('orders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(50)
        const filterOrders = orders.filter(order => order.restaurant)
        return filterOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },

    getOrdersByDateRange: async(_, args, context) => {
      try {
        const orders = await Order.find({
          restaurant: args.restaurant,
          createdAt: {
            $gte: new Date(args.startingDate),
            $lt: new Date(args.endingDate)
          }
        }).sort({ createdAt: -1 })

        const cashOnDeliveryOrders = orders.filter(
          order =>
            order.paymentMethod === 'COD' && order.orderStatus === 'DELIVERED'
        )

        const totalAmountCashOnDelivery = cashOnDeliveryOrders
          .reduce((total, order) => total + parseFloat(order.orderAmount), 0)
          .toFixed(2)

        const countCashOnDeliveryOrders = cashOnDeliveryOrders.length

        return {
          orders: orders.map(order => transformOrder(order)),
          totalAmountCashOnDelivery,
          countCashOnDeliveryOrders
        }
      } catch (err) {
        throw err
      }
    },
    ordersByRestId: async(_, args, context) => {
      console.log('restaurant orders')
      try {
        await requireRestaurantAccess(context.req, args.restaurant, Restaurant)
        let orders = []
        if (args.search) {
          const search = new RegExp(
            // eslint-disable-next-line no-useless-escape
            args.search.replace(/[\\\[\]()+?.*]/g, c => '\\' + c),
            'i'
          )
          orders = await Order.find({
            restaurant: args.restaurant,
            orderId: search
          }).sort({ createdAt: -1 })
          return orders.map(order => {
            return transformOrder(order)
          })
        } else {
          orders = await Order.find({ restaurant: args.restaurant })
            .sort({ createdAt: -1 })
            .skip((args.page || 0) * args.rows)
            .limit(args.rows)
          return orders.map(order => {
            return transformOrder(order)
          })
        }
      } catch (err) {
        throw err
      }
    },

    ordersByRestIdWithoutPagination: async (_, args, context) => {
      await requireRestaurantAccess(context.req, args.restaurant, Restaurant)
      try {
        const filter = { restaurant: args.restaurant };
        if (args.search) {
          const searchRegex = new RegExp(args.search, 'i');
          filter.orderId = searchRegex;
        }
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        return orders.map(order => transformOrder(order));
      } catch (err) {
        console.error('ordersByRestIdWithoutPagination error:', err);
        return [];
      }
    },

    ordersByUser: async (_, { userId, page = 1, limit = 10 }, context) => {
      requireRole(context.req, ADMIN_ROLES)
      try {
        const skip = (page - 1) * limit;
        const [orders, totalCount] = await Promise.all([
          Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Order.countDocuments({ user: userId })
        ]);
        const totalPages = Math.max(1, Math.ceil(totalCount / limit));
        return {
          orders: orders.map(order => transformOrder(order)),
          totalCount,
          totalPages,
          currentPage: page,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        };
      } catch (err) {
        console.error('ordersByUser error:', err);
        return { orders: [], totalCount: 0, totalPages: 1, currentPage: page, nextPage: null, prevPage: null }
      }
    },
    undeliveredOrders: async(_, args, { req, res }) => {
      console.log('undeliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [
            { orderStatus: 'PENDING' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'ACCEPTED' }
          ]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    deliveredOrders: async(_, args, { req, res }) => {
      console.log('deliveredOrders')
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const orders = await Order.find({
          user: req.userId,
          $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'COMPLETED' }]
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    allOrders: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      try {
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .skip((args.page || 0) * 10)
          .limit(10)
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    allOrdersWithoutPagination: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      try {
        const dateFilter = {}
        const keyword = args.dateKeyword || 'All'
        const now = new Date()

        if (keyword === 'Custom' && args.starting_date && args.ending_date) {
          const start = new Date(args.starting_date)
          const end = new Date(args.ending_date)
          end.setDate(end.getDate() + 1)
          dateFilter.createdAt = { $gte: start, $lt: end }
        } else if (keyword === 'Today') {
          const start = new Date(now)
          start.setHours(0, 0, 0, 0)
          const end = new Date(start)
          end.setDate(end.getDate() + 1)
          dateFilter.createdAt = { $gte: start, $lt: end }
        } else if (keyword === 'Week') {
          const start = new Date(now)
          start.setDate(start.getDate() - 7)
          dateFilter.createdAt = { $gte: start, $lte: now }
        } else if (keyword === 'Month') {
          const start = new Date(now.getFullYear(), now.getMonth(), 1)
          dateFilter.createdAt = { $gte: start, $lte: now }
        } else if (keyword === 'Year') {
          const start = new Date(now.getFullYear(), 0, 1)
          dateFilter.createdAt = { $gte: start, $lte: now }
        }
        // 'All' (or unrecognized keyword): no date filter

        const orders = await Order.find(dateFilter).sort({ createdAt: -1 })
        return orders.map(order => transformOrder(order))
      } catch (err) {
        throw err
      }
    },
    pageCount: async(_, args, context) => {
      try {
        const orderCount = await Order.countDocuments({
          restaurant: args.restaurant
        })
        const pageCount = orderCount / 10
        return Math.ceil(pageCount)
      } catch (err) {
        throw err
      }
    },
    orderCount: async(_, args, context) => {
      try {
        const orderCount = await Order.find({
          isActive: true,
          restaurant: args.restautant
        }).countDocuments()
        return orderCount
      } catch (err) {
        throw err
      }
    },
    getOrderStatuses: async(_, args, context) => {
      return order_status
    },
    getPaymentStatuses: async(_, args, context) => {
      return payment_status
    }
  },
  Mutation: {
    placeOrder: async(_, args, { req, res }) => {
      console.log('placeOrder', args.address.longitude, args.address.latitude)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const restaurant = await Restaurant.findById(args.restaurant)
        const location = new Point({
          type: 'Point',
          coordinates: [+args.address.longitude, +args.address.latitude]
        })
        const checkZone = await Restaurant.findOne({
          _id: args.restaurant,
          deliveryBounds: { $geoIntersects: { $geometry: location } }
        })
        if (!checkZone && args.isPickedUp !== true) {
          throw new Error("Sorry! we can't deliver to your address.")
        }
        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: { $geometry: restaurant.location }
          }
        })
        if (!zone) {
          throw new Error('Delivery zone not found')
        }

        const foods = restaurant.categories.map(c => c.foods).flat()
        const availableAddons = restaurant.addons
        const availableOptions = restaurant.options
        const ItemsData = args.orderInput.map(item => {
          const food = foods.find(
            element => element._id.toString() === item.food
          )
          const variation = food.variations.find(
            v => v._id.toString() === item.variation
          )
          const addonList = []
          item.addons.forEach((data, index) => {
            const selectedOptions = []
            data.options.forEach((option, inx) => {
              selectedOptions.push(
                availableOptions.find(op => op._id.toString() === option)
              )
            })
            const adds = availableAddons.find(
              addon => addon._id.toString() === data._id.toString()
            )

            addonList.push({
              ...adds._doc,
              options: selectedOptions
            })
          })

          return new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })
        })

        const user = await User.findById(req.userId)
        if (!user) {
          throw new Error('invalid request')
        }
        // get previous orderid from db
        let configuration = await Configuration.findOne()
        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }

        const orderid =
          restaurant.orderPrefix + '-' + (Number(restaurant.orderId) + 1)
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()
        const latOrigin = +restaurant.location.coordinates[1]
        const lonOrigin = +restaurant.location.coordinates[0]
        const latDest = +args.address.latitude
        const longDest = +args.address.longitude
        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )
        DELIVERY_CHARGES = Math.ceil(distance) * configuration.deliveryRate
        let price = 0.0

        ItemsData.forEach(async item => {
          let itemPrice = item.variation.price
          if (item.addons && item.addons.length > 0) {
            const addonDetails = []
            item.addons.forEach(({ options, defaultOptions }) => {
              options.forEach(option => {
                const isDefault = defaultOptions?.includes(option._id.toString())
                if (!isDefault) {
                  itemPrice = itemPrice + option.price
                }
                addonDetails.push(
                  `${option.title}	${configuration.currencySymbol}${isDefault ? 0 : option.price}`
                )
              })
            })
          }
          price += itemPrice * item.quantity
          return `${item.quantity} x ${item.title}${
            item.variation.title ? `(${item.variation.title})` : ''
          }	${configuration.currencySymbol}${item.variation.price}`
        })
        let coupon = null
        if (args.couponCode) {
          coupon = await Coupon.findOne({
            title: args.couponCode,
            isActive: true,
            restaurant: args.restaurant
          })
          if (!coupon) {
            coupon = await Coupon.findOne({
              title: args.couponCode,
              isActive: true,
              restaurant: null
            })
          }
          if (coupon) {
            price = price - (coupon.discount / 100) * price
          }
        }
        const orderObj = {
          zone: zone._id,
          restaurant: args.restaurant,
          user: req.userId,
          items: ItemsData,
          deliveryAddress: {
            ...args.address,
            location: location
          },
          orderId: orderid,
          paidAmount: 0,
          orderStatus: 'PENDING',
          instructions: args.instructions,
          deliveryCharges: args.isPickedUp ? 0 : DELIVERY_CHARGES,
          tipping: args.tipping,
          taxationAmount: args.taxationAmount,
          orderDate: args.orderDate,
          isPickedUp: args.isPickedUp,
          orderAmount: (
            price +
            (args.isPickedUp ? 0 : DELIVERY_CHARGES) +
            args.taxationAmount +
            args.tipping
          ).toFixed(2),
          paymentStatus: payment_status[0],
          coupon: coupon,
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
        }

        let result = null
        if (args.paymentMethod === 'COD') {
          const order = new Order(orderObj)
          result = await order.save()

          const placeOrder_template = await placeOrderTemplate([
            result.orderId,
            ItemsData,
            args.isPickedUp
              ? restaurant.address
              : result.deliveryAddress.deliveryAddress,
            `${configuration.currencySymbol} ${Number(price).toFixed(2)}`,
            `${configuration.currencySymbol} ${order.tipping.toFixed(2)}`,
            `${configuration.currencySymbol} ${order.taxationAmount.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.deliveryCharges.toFixed(
              2
            )}`,
            `${configuration.currencySymbol} ${order.orderAmount.toFixed(2)}`,
            configuration.currencySymbol
          ])
          const transformedOrder = await transformOrder(result)

          publishToDashboard(
            order.restaurant.toString(),
            transformedOrder,
            'new'
          )
          publishToDispatcher(transformedOrder)
          const attachment = path.join(
            __dirname,
            '../../public/assets/tempImages/enatega.png'
          )
          sendEmail(
            user.email,
            'Order Placed',
            '',
            placeOrder_template,
            attachment
          )
          sendNotification(result.orderId)
          sendNotificationToCustomerWeb(
            user.notificationTokenWeb,
            'Order placed',
            `Order ID ${result.orderId}`
          )
          sendNotificationToRestaurant(result.restaurant, result)
        } else if (args.paymentMethod === 'PAYPAL') {
          orderObj.paymentMethod = args.paymentMethod
          const paypal = new Paypal(orderObj)
          result = await paypal.save()
        } else if (args.paymentMethod === 'STRIPE') {
          console.log('stripe')
          orderObj.paymentMethod = args.paymentMethod
          const stripe = new Stripe(orderObj)
          result = await stripe.save()
          console.log(result)
        } else {
          throw new Error('Invalid Payment Method')
        }
        const orderResult = await transformOrder(result)
        return orderResult
      } catch (err) {
        throw err
      }
    },
    placeOrderPOS: async(_, { orderInput }, { req }) => {
      const {
        restaurant: restaurantId,
        orderInput: items,
        instructions,
        customerName,
        customerPhone
      } = orderInput
      await requireRestaurantAccess(req, restaurantId, Restaurant)
      try {
        const restaurant = await Restaurant.findById(restaurantId)
        if (!restaurant) {
          throw new Error('Restaurant not found')
        }
        if (!items || items.length === 0) {
          throw new Error('Cart is empty')
        }

        const zone = await Zone.findOne({
          isActive: true,
          location: {
            $geoIntersects: { $geometry: restaurant.location }
          }
        })
        if (!zone) {
          throw new Error('Delivery zone not found')
        }

        const foods = restaurant.categories.map(c => c.foods).flat()
        const availableAddons = restaurant.addons
        const availableOptions = restaurant.options

        const ItemsData = items.map(item => {
          const food = foods.find(
            element => element._id.toString() === item.food
          )
          if (!food) {
            throw new Error(`Food item not found: ${item.food}`)
          }
          const variation = food.variations.find(
            v => v._id.toString() === item.variation
          )
          if (!variation) {
            throw new Error(`Variation not found for item: ${food.title}`)
          }
          const addonList = []
          ;(item.addons || []).forEach(data => {
            const adds = availableAddons.find(
              addon => addon._id.toString() === data._id.toString()
            )
            if (!adds) {
              throw new Error(`Addon not found: ${data._id}`)
            }
            const selectedOptions = data.options.map(option => {
              const opt = availableOptions.find(
                op => op._id.toString() === option
              )
              if (!opt) {
                throw new Error(`Option not found: ${option}`)
              }
              return opt
            })
            addonList.push({
              ...adds._doc,
              options: selectedOptions
            })
          })

          return new Item({
            food: item.food,
            title: food.title,
            description: food.description,
            image: food.image,
            variation,
            addons: addonList,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })
        })

        let configuration = await Configuration.findOne()
        if (!configuration) {
          configuration = new Configuration()
          await configuration.save()
        }

        const orderid =
          restaurant.orderPrefix + '-' + (Number(restaurant.orderId) + 1)
        restaurant.orderId = Number(restaurant.orderId) + 1
        await restaurant.save()

        let price = 0.0
        ItemsData.forEach(item => {
          let itemPrice = item.variation.price
          if (item.addons && item.addons.length > 0) {
            item.addons.forEach(({ options, defaultOptions }) => {
              options.forEach(option => {
                const isDefault = defaultOptions?.includes(
                  option._id.toString()
                )
                if (!isDefault) {
                  itemPrice = itemPrice + option.price
                }
              })
            })
          }
          price += itemPrice * item.quantity
        })

        const taxRate = restaurant.tax || 0
        const taxationAmount = +((price * taxRate) / 100).toFixed(2)
        const orderAmount = +(price + taxationAmount).toFixed(2)

        const orderObj = {
          zone: zone._id,
          restaurant: restaurantId,
          user: null,
          orderSource: 'POS',
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          items: ItemsData,
          deliveryAddress: {
            deliveryAddress: restaurant.address || 'Counter Pickup',
            label: 'Pickup at Restaurant'
          },
          orderId: orderid,
          paidAmount: 0,
          orderStatus: 'PENDING',
          instructions,
          deliveryCharges: 0,
          tipping: 0,
          taxationAmount,
          orderDate: new Date(),
          isPickedUp: true,
          paymentMethod: 'COD',
          orderAmount,
          paymentStatus: payment_status[0],
          completionTime: new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
        }

        const order = new Order(orderObj)
        const result = await order.save()
        const transformedOrder = await transformOrder(result)

        publishToDashboard(
          result.restaurant.toString(),
          transformedOrder,
          'new'
        )
        publishToDispatcher(transformedOrder)
        sendNotification(result.orderId)
        sendNotificationToRestaurant(result.restaurant, result)

        return transformedOrder
      } catch (err) {
        throw err
      }
    },
    editOrder: async(_, args, { req, res }) => {
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      try {
        const items = args.orderInput.map(async function(item) {
          const newItem = new Item({
            ...item
          })
          const result = await newItem.save()
          return result._id
        })
        const completed = await Promise.all(items)
        const order = await Order.findOne({ _id: args._id, user: req.userId })
        if (!order) {
          throw new Error('order does not exist')
        }
        order.items = completed
        const result = await order.save()
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatus: async(_, args, context) => {
      console.log('updateOrderStatus')
      try {
        const order = await Order.findById(args.id)
        const restaurant = await Restaurant.findById(order.restaurant)
        if (args.status === 'ACCEPTED') {
          order.completionTime = new Date(
            Date.now() + restaurant.deliveryTime * 60 * 1000
          )
        }
        order.orderStatus = args.status
        order.reason = args.reason
        const result = await order.save()

        const transformedOrder = await transformOrder(result)
        const user = await User.findById(order.user)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        publishOrder(transformedOrder)
        sendNotificationToUser(result.user, result)
        sendNotificationToCustomerWeb(
          user.notificationTokenWeb,
          `Order status: ${result.orderStatus}`,
          `Order ID ${result.orderId}`
        )
        return transformOrder(result)
      } catch (err) {
        throw err
      }
    },
    updatePaymentStatus: async(_, args, context) => {
      console.log('updatePaymentStatus', args.id, args.status)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        order.paymentStatus = args.status
        order.paidAmount = args.status === 'PAID' ? order.orderAmount : 0.0
        const result = await order.save()
        return transformOrder(result)
      } catch (error) {
        throw error
      }
    },
    muteRing: async(_, args, { req }) => {
      try {
        const order = await Order.findOne({ orderId: args.orderId })
        if (!order) throw new Error('Order does not exist')
        order.isRinged = false
        await order.save()
        return true
      } catch (error) {
        throw error
      }
    },
    abortOrder: async(_, args, { req }) => {
      console.log('abortOrder', args)
      if (!req.isAuth) {
        throw new Error('Unauthenticated!')
      }
      const order = await Order.findOne({ _id: args.id, user: req.userId })
      if (!order) {
        throw new Error('Order not found')
      }
      if (order.orderStatus !== ORDER_STATUS.PENDING) {
        throw new Error('Order can no longer be cancelled')
      }
      order.orderStatus = ORDER_STATUS.CANCELLED
      const result = await order.save()

      const transformedOrder = await transformOrder(result)
      publishOrder(transformedOrder)

      return transformedOrder
    }
  }
}
