const Order = require('../../models/order')
const Owner = require('../../models/owner')
const Restaurant = require('../../models/restaurant')
const Rider = require('../../models/rider')
const User = require('../../models/user')
const { months } = require('../../helpers/enum')
const { requireRole, ADMIN_ROLES, requireRestaurantAccess } = require('../../helpers/guards')

// Shared by the restaurant-dashboard queries below — mirrors the exact
// dateKeyword semantics already established for allOrdersWithoutPagination.
const computeDateRange = (dateKeyword, starting_date, ending_date) => {
  const keyword = dateKeyword || (starting_date && ending_date ? 'Custom' : 'All')
  const now = new Date()
  if (keyword === 'Custom' && starting_date && ending_date) {
    const start = new Date(starting_date)
    const end = new Date(ending_date)
    end.setDate(end.getDate() + 1)
    return { $gte: start, $lt: end }
  } else if (keyword === 'Today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { $gte: start, $lt: end }
  } else if (keyword === 'Week') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    return { $gte: start, $lte: now }
  } else if (keyword === 'Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { $gte: start, $lte: now }
  } else if (keyword === 'Year') {
    const start = new Date(now.getFullYear(), 0, 1)
    return { $gte: start, $lte: now }
  }
  return null
}

const aggregateOrders = list => {
  const total_orders = list.length
  const total_delivery_fee = list.reduce((s, o) => s + (o.deliveryCharges || 0), 0)
  const total_sales = list.reduce((s, o) => s + (o.orderAmount || 0), 0)
  return {
    total_orders,
    total_sales,
    total_sales_without_delivery: total_sales - total_delivery_fee,
    total_delivery_fee
  }
}

module.exports = {
  Query: {
    getDashboardUsers: async (_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      const [usersCount, vendorsCount, restaurantsCount, ridersCount] = await Promise.all([
        User.countDocuments({}),
        Owner.countDocuments({ userType: 'VENDOR', isActive: true }),
        Restaurant.countDocuments({}),
        Rider.countDocuments({})
      ])
      return { usersCount, vendorsCount, restaurantsCount, ridersCount }
    },
    getDashboardTotal: async(_, args, context) => {
      console.log('getDashboardTotal', args)
      try {
        const starting_date = new Date(args.starting_date)
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const filter_date = {
          createdAt: { $gte: starting_date, $lt: ending_date }
        }
        const orders_count = await Order.countDocuments({
          ...filter_date,
          restaurant: args.restaurant,
          orderStatus: 'DELIVERED'
        })
        const paid_orders = await Order.find({
          ...filter_date,
          orderStatus: 'DELIVERED',
          restaurant: args.restaurant
        }).select('orderAmount')
        const sales_amount = paid_orders.reduce(
          (acc, order) => acc + order.orderAmount,
          0
        )
        return {
          totalOrders: orders_count,
          totalSales: sales_amount.toFixed(2)
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getDashboardSales: async(_, args, context) => {
      console.log('getDashboardSales', args)
      try {
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const sales_value = []
        const current_date = new Date(args.starting_date)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (current_date < ending_date) {
          const filter_start = new Date(current_date)
          const filter_end = new Date(filter_start).setDate(
            filter_start.getDate() + 1
          )
          const filter = { createdAt: { $gte: filter_start, $lt: filter_end } }
          const orders = await Order.find({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant
          }).select('orderAmount')
          const day = `${
            months[current_date.getMonth()]
          } ${current_date.getDate()}`
          const temp_sales_value = { day }
          temp_sales_value.amount = orders
            .reduce((acc, order) => acc + order.orderAmount, 0)
            .toFixed(2)
          sales_value.push(temp_sales_value)
          current_date.setDate(current_date.getDate() + 1)
        }
        return {
          orders: sales_value
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getDashboardOrders: async(_, args, context) => {
      console.log('getDashboardOrders', args)
      try {
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const sales_value = []
        const current_date = new Date(args.starting_date)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (current_date < ending_date) {
          const filter_start = new Date(current_date)
          const filter_end = new Date(filter_start).setDate(
            filter_start.getDate() + 1
          )
          const filter = { createdAt: { $gte: filter_start, $lt: filter_end } }
          const day = `${
            months[current_date.getMonth()]
          } ${current_date.getDate()}`
          const temp_sales_value = { day }
          temp_sales_value.count = await Order.countDocuments({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant
          })
          sales_value.push(temp_sales_value)
          current_date.setDate(current_date.getDate() + 1)
        }
        return {
          orders: sales_value
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getRestaurantDashboardOrdersSalesStats: async(_, args, { req }) => {
      try {
        await requireRestaurantAccess(req, args.restaurant, Restaurant)
        const range = computeDateRange(args.dateKeyword, args.starting_date, args.ending_date)
        const filter = { restaurant: args.restaurant, orderStatus: 'DELIVERED' }
        if (range) filter.createdAt = range
        const orders = await Order.find(filter).select('orderAmount paymentMethod')
        const totalOrders = orders.length
        const totalSales = orders.reduce((s, o) => s + (o.orderAmount || 0), 0)
        const totalCODOrders = orders.filter(o => o.paymentMethod === 'COD').length
        const totalCardOrders = orders.filter(o => o.paymentMethod !== 'COD').length
        return { totalOrders, totalSales, totalCODOrders, totalCardOrders }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getRestaurantDashboardSalesOrderCountDetailsByYear: async(_, args, { req }) => {
      try {
        await requireRestaurantAccess(req, args.restaurant, Restaurant)
        const salesAmount = new Array(12).fill(0)
        const ordersCount = new Array(12).fill(0)
        const start = new Date(args.year, 0, 1)
        const end = new Date(args.year + 1, 0, 1)
        const orders = await Order.find({
          restaurant: args.restaurant,
          orderStatus: 'DELIVERED',
          createdAt: { $gte: start, $lt: end }
        }).select('orderAmount createdAt')
        orders.forEach(o => {
          const month = new Date(o.createdAt).getMonth()
          salesAmount[month] += o.orderAmount || 0
          ordersCount[month] += 1
        })
        return { salesAmount, ordersCount }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getDashboardOrderSalesDetailsByPaymentMethod: async(_, args, { req }) => {
      try {
        await requireRestaurantAccess(req, args.restaurant, Restaurant)
        const range = computeDateRange(args.dateKeyword, args.starting_date, args.ending_date)
        const baseFilter = { restaurant: args.restaurant, orderStatus: 'DELIVERED' }
        if (range) baseFilter.createdAt = range

        const buildBucket = async paymentFilter => {
          const orders = await Order.find({ ...baseFilter, ...paymentFilter })
            .select('orderAmount deliveryCharges isPickedUp')
          return [
            { _type: 'all', data: aggregateOrders(orders) },
            { _type: 'isPickedUp', data: aggregateOrders(orders.filter(o => o.isPickedUp)) },
            { _type: 'isNotPickedUp', data: aggregateOrders(orders.filter(o => !o.isPickedUp)) }
          ]
        }

        const [all, cod, card] = await Promise.all([
          buildBucket({}),
          buildBucket({ paymentMethod: 'COD' }),
          buildBucket({ paymentMethod: { $ne: 'COD' } })
        ])
        return { all, cod, card }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {}
}
