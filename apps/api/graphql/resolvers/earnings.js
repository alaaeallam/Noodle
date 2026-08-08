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
    }
  }
}
