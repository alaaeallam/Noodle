const mongoose = require('mongoose')
const Earnings = require('../../models/earnings')
const { requireWalletAccess } = require('../../helpers/guards')

module.exports = {
  Query: {
    earnings: async(_, args, { req }) => {
      console.log('earnings', args)
      try {
        const { userType, userId } = requireWalletAccess(req, args.userType, args.userId)
        const filter = {}
        if (userType === 'STORE' && userId) filter['storeEarnings.storeId'] = userId
        if (userType === 'RIDER' && userId) filter['riderEarnings.riderId'] = userId
        if (args.orderType) filter.orderType = args.orderType
        if (args.paymentMethod) filter.paymentMethod = args.paymentMethod
        if (args.search) filter.orderId = { $regex: args.search, $options: 'i' }
        if (args.dateFilter?.starting_date || args.dateFilter?.ending_date) {
          filter.createdAt = {}
          if (args.dateFilter.starting_date) filter.createdAt.$gte = new Date(args.dateFilter.starting_date)
          if (args.dateFilter.ending_date) {
            const end = new Date(args.dateFilter.ending_date)
            end.setHours(23, 59, 59, 999)
            filter.createdAt.$lte = end
          }
        }

        const pageSize = args.pagination?.pageSize || 10
        const pageNo = args.pagination?.pageNo || 1
        const total = await Earnings.countDocuments(filter)
        const earnings = await Earnings.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNo - 1) * pageSize)
          .limit(pageSize)
          .populate('riderEarnings.riderId')
          .populate('storeEarnings.storeId')

        const totalsAgg = await Earnings.aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              platformTotal: { $sum: '$platformEarnings.totalEarnings' },
              riderTotal: { $sum: '$riderEarnings.totalEarnings' },
              storeTotal: { $sum: '$storeEarnings.totalEarnings' }
            }
          }
        ])
        const grandTotalEarnings = totalsAgg[0] || { platformTotal: 0, riderTotal: 0, storeTotal: 0 }

        return {
          success: true,
          data: {
            earnings: earnings.map(e => ({
              ...e._doc,
              _id: e.id,
              createdAt: e.createdAt.toISOString(),
              updatedAt: e.updatedAt.toISOString()
            })),
            grandTotalEarnings
          },
          pagination: { total }
        }
      } catch (err) {
        console.log('earnings error', err)
        return {
          success: false,
          message: err.message
        }
      }
    },
    // Groups a rider's earnings by day, mirroring storeEarningsGraph below —
    // same Earnings collection, riderEarnings sub-document instead of
    // storeEarnings. The rider app's Earnings screen needs this grouping too.
    riderEarningsGraph: async(_, args, { req }) => {
      console.log('riderEarningsGraph', args)
      try {
        const { userId: riderId } = requireWalletAccess(req, 'RIDER', args.riderId)

        const match = { 'riderEarnings.riderId': new mongoose.Types.ObjectId(riderId) }
        if (args.startDate || args.endDate) {
          match.createdAt = {}
          if (args.startDate) match.createdAt.$gte = new Date(args.startDate)
          if (args.endDate) match.createdAt.$lte = new Date(args.endDate)
        }

        const grouped = await Earnings.aggregate([
          { $match: match },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              totalEarningsSum: { $sum: '$riderEarnings.totalEarnings' },
              totalTipsSum: { $sum: '$riderEarnings.tip' },
              totalDeliveries: { $sum: 1 },
              earningsArray: {
                $push: {
                  orderDetails: {
                    orderType: '$orderType',
                    orderId: '$orderId',
                    paymentMethod: '$paymentMethod'
                  },
                  totalEarnings: '$riderEarnings.totalEarnings',
                  deliveryFee: '$riderEarnings.deliveryFee',
                  tip: '$riderEarnings.tip',
                  date: '$createdAt'
                }
              }
            }
          },
          { $sort: { _id: -1 } }
        ])

        const totalCount = grouped.length
        const pageSize = args.limit || 10
        const pageNo = args.page || 1
        const paged = grouped.slice((pageNo - 1) * pageSize, (pageNo - 1) * pageSize + pageSize)

        return {
          totalCount,
          earnings: paged.map(g => ({
            _id: g._id,
            date: g._id,
            totalEarningsSum: g.totalEarningsSum,
            totalTipsSum: g.totalTipsSum,
            totalDeliveries: g.totalDeliveries,
            earningsArray: g.earningsArray.map(e => ({
              ...e,
              date: e.date instanceof Date ? e.date.toISOString() : e.date
            }))
          }))
        }
      } catch (err) {
        console.log('riderEarningsGraph error', err)
        throw err
      }
    },
    // Groups a store's earnings by day, for the wallet's bar chart / daily
    // breakdown.
    storeEarningsGraph: async(_, args, { req }) => {
      console.log('storeEarningsGraph', args)
      try {
        const { userId: storeId } = requireWalletAccess(req, 'STORE', args.storeId)

        const match = { 'storeEarnings.storeId': new mongoose.Types.ObjectId(storeId) }
        if (args.startDate || args.endDate) {
          match.createdAt = {}
          if (args.startDate) match.createdAt.$gte = new Date(args.startDate)
          if (args.endDate) match.createdAt.$lte = new Date(args.endDate)
        }

        const grouped = await Earnings.aggregate([
          { $match: match },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              totalEarningsSum: { $sum: '$storeEarnings.totalEarnings' },
              totalOrderAmount: { $sum: '$storeEarnings.orderAmount' },
              totalDeliveries: { $sum: 1 },
              earningsArray: {
                $push: {
                  orderDetails: {
                    orderType: '$orderType',
                    orderId: '$orderId',
                    paymentMethod: '$paymentMethod'
                  },
                  totalOrderAmount: '$storeEarnings.orderAmount',
                  totalEarnings: '$storeEarnings.totalEarnings',
                  date: '$createdAt'
                }
              }
            }
          },
          { $sort: { _id: -1 } }
        ])

        const totalCount = grouped.length
        const pageSize = args.limit || 10
        const pageNo = args.page || 1
        const paged = grouped.slice((pageNo - 1) * pageSize, (pageNo - 1) * pageSize + pageSize)

        return {
          totalCount,
          earnings: paged.map(g => ({
            _id: g._id,
            date: g._id,
            totalEarningsSum: g.totalEarningsSum,
            totalOrderAmount: g.totalOrderAmount,
            totalDeliveries: g.totalDeliveries,
            earningsArray: g.earningsArray.map(e => ({
              ...e,
              date: e.date instanceof Date ? e.date.toISOString() : e.date
            }))
          }))
        }
      } catch (err) {
        console.log('storeEarningsGraph error', err)
        throw err
      }
    }
  }
}
