const { WITHDRAW_REQUEST_STATUS, USER_TYPE } = require('../../helpers/enum')
const Rider = require('../../models/rider')
const Restaurant = require('../../models/restaurant')
const WithdrawRequest = require('../../models/withdrawRequest')
const Transaction = require('../../models/transaction')
const { transformWithDrawRequest, transformRider, transformRestaurant } = require('./merge')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    withdrawRequests: async(_, args, { req }) => {
      console.log('withdrawRequests')
      try {
        requireRole(req, ADMIN_ROLES)
        const filter = {}
        if (args.userType) filter.userType = args.userType
        if (args.userId) {
          filter[args.userType === USER_TYPE.STORE ? 'store' : 'rider'] = args.userId
        }
        if (args.search) {
          filter.requestId = { $regex: args.search, $options: 'i' }
        }
        const pageSize = args.pagination?.pageSize || 10
        const pageNo = args.pagination?.pageNo || 1
        const total = await WithdrawRequest.countDocuments(filter)
        const requests = await WithdrawRequest.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNo - 1) * pageSize)
          .limit(pageSize)
        return {
          success: true,
          data: await Promise.all(requests.map(transformWithDrawRequest)),
          pagination: { total }
        }
      } catch (err) {
        console.log('withdrawRequests error', err)
        return {
          success: false,
          message: err.message,
          data: []
        }
      }
    },
    riderWithdrawRequests: async(_, args, { req }) => {
      console.log('riderWithdrawRequests', args)
      const riderId = args.id || req.userId
      if (!riderId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderRequests = await WithdrawRequest.find({
          rider: riderId
        })
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(10)
        return riderRequests.map(transformWithDrawRequest)
      } catch (err) {
        throw err
      }
    },
    getAllWithdrawRequests: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const riderRequests = await WithdrawRequest.find({})
          .sort({ createdAt: -1 })
          .skip(args.offset || 0)
          .limit(20)
        const withdrawRequestCount = await WithdrawRequest.countDocuments()
        return {
          success: true,
          data: await Promise.all(riderRequests.map(transformWithDrawRequest)),
          pagination: {
            total: withdrawRequestCount
          }
        }
      } catch (error) {
        console.log('getAllWithdrawRequests', error)
        return {
          success: false,
          message: error.message
        }
      }
    }
  },
  Mutation: {
    createWithdrawRequest: async(_, args, { req }) => {
      console.log('createWithdrawRequest', args)
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const isStoreRequest = !!args.userId
        let userType = USER_TYPE.RIDER
        let rider = null
        let store = null
        let requestPrefix = ''
        let filterQuery = {}

        if (isStoreRequest) {
          const isAdmin = ADMIN_ROLES.has(req.userType || '')
          const isOwnStore =
            req.userType === 'RESTAURANT' && String(req.restaurantId) === String(args.userId)
          if (!isAdmin && !isOwnStore) {
            throw new Error('Forbidden')
          }
          store = await Restaurant.findById(args.userId)
          if (!store) throw new Error('Store not found')
          userType = USER_TYPE.STORE
          requestPrefix = store.username || store.name
          filterQuery = { store: store._id, status: WITHDRAW_REQUEST_STATUS.REQUESTED }
          if (args.requestAmount > store.currentWalletAmount) {
            throw new Error('Not enough amount in wallet')
          }
        } else {
          rider = await Rider.findById(req.userId)
          if (!rider) throw new Error('Rider not found')
          requestPrefix = rider.username
          filterQuery = { rider: rider._id, status: WITHDRAW_REQUEST_STATUS.REQUESTED }
          if (args.requestAmount > rider.currentWalletAmount) {
            throw new Error('Not enough amount in wallet')
          }
        }

        const existingRequest = await WithdrawRequest.countDocuments(filterQuery)
        if (existingRequest > 0) {
          throw new Error("You've an existing withdraw request")
        }

        const requestId = `REQ-${requestPrefix}-${await WithdrawRequest.countDocuments()}`
        const request = new WithdrawRequest({
          requestId,
          requestAmount: args.requestAmount,
          rider: rider ? rider._id : undefined,
          store: store ? store._id : undefined,
          userType,
          status: WITHDRAW_REQUEST_STATUS.REQUESTED
        })
        const result = await request.save()
        return transformWithDrawRequest(result)
      } catch (err) {
        throw err
      }
    },
    updateWithdrawReqStatus: async(_, args, { req }) => {
      console.log('updateWithdrawReqStatus: ', args)
      try {
        requireRole(req, ADMIN_ROLES)
        const withdrawRequest = await WithdrawRequest.findById(args.id)
        if (!withdrawRequest) throw new Error('Withdraw Request not found!')

        const isStoreRequest = withdrawRequest.userType === USER_TYPE.STORE
        const rider = isStoreRequest ? null : await Rider.findById(withdrawRequest.rider)
        const store = isStoreRequest ? await Restaurant.findById(withdrawRequest.store) : null
        const account = isStoreRequest ? store : rider
        if (!account) throw new Error('Account not found')

        const oldStatus = withdrawRequest.status
        const isNewlyTransferred =
          args.status === WITHDRAW_REQUEST_STATUS.TRANSFERRED &&
          oldStatus !== WITHDRAW_REQUEST_STATUS.TRANSFERRED
        withdrawRequest.status = args.status

        if (isNewlyTransferred) {
          if (account.currentWalletAmount >= withdrawRequest.requestAmount) {
            account.currentWalletAmount -= withdrawRequest.requestAmount
            account.withdrawnWalletAmount += withdrawRequest.requestAmount
          } else {
            return {
              success: false,
              message: 'Not enough amount in wallet'
            }
          }
        }

        const resultAccount = await account.save()
        const resultWithdrawRequest = await withdrawRequest.save()

        if (isNewlyTransferred) {
          const bussinessDetails = resultAccount.bussinessDetails || {}
          await new Transaction({
            transactionId: `TXN-${withdrawRequest.requestId}`,
            userType: isStoreRequest ? USER_TYPE.STORE : USER_TYPE.RIDER,
            rider: isStoreRequest ? undefined : resultAccount._id,
            store: isStoreRequest ? resultAccount._id : undefined,
            withdrawRequest: withdrawRequest._id,
            amountTransferred: withdrawRequest.requestAmount,
            status: WITHDRAW_REQUEST_STATUS.TRANSFERRED,
            toBank: {
              accountName: bussinessDetails.accountName,
              bankName: bussinessDetails.bankName,
              accountNumber: bussinessDetails.accountNumber,
              accountCode: bussinessDetails.accountCode
            }
          }).save()
        }

        await recordAuditLog({
          req,
          action: 'UPDATE_WITHDRAW_REQUEST_STATUS',
          targetType: 'WithdrawRequest',
          targetId: resultWithdrawRequest.id,
          changes: { oldData: { status: oldStatus }, newData: { status: resultWithdrawRequest.status } }
        })

        return {
          success: true,
          data: {
            rider: isStoreRequest ? null : transformRider(resultAccount),
            store: isStoreRequest ? await transformRestaurant(resultAccount) : null,
            withdrawRequest: await transformWithDrawRequest(resultWithdrawRequest)
          }
        }
      } catch (err) {
        console.log('updateWithdrawReqStatus error', err)
        return {
          success: false,
          message: err.message
        }
      }
    }
  }
}
