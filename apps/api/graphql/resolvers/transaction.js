const Transaction = require('../../models/transaction')
const { requireWalletAccess } = require('../../helpers/guards')

module.exports = {
  Query: {
    transactionHistory: async(_, args, { req }) => {
      console.log('transactionHistory', args)
      try {
        const { userType, userId } = requireWalletAccess(req, args.userType, args.userId)
        const filter = {}
        if (userType === 'STORE' && userId) filter.store = userId
        if (userType === 'RIDER' && userId) filter.rider = userId
        if (args.search) filter.transactionId = { $regex: args.search, $options: 'i' }
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
        const total = await Transaction.countDocuments(filter)
        const transactions = await Transaction.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNo - 1) * pageSize)
          .limit(pageSize)
          .populate('rider')
          .populate('store')

        return {
          success: true,
          data: transactions.map(t => ({
            ...t._doc,
            _id: t.id,
            createdAt: t.createdAt.toISOString()
          })),
          pagination: { total }
        }
      } catch (err) {
        console.log('transactionHistory error', err)
        return {
          success: false,
          message: err.message,
          data: []
        }
      }
    }
  }
}
