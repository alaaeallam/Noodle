const { withFilter } = require('graphql-subscriptions')
const bcrypt = require('bcryptjs')
const Rider = require('../../models/rider')
const Order = require('../../models/order')
const Point = require('../../models/point')
const User = require('../../models/user')
const { transformOrder, transformRider } = require('../resolvers/merge')
const {
  pubsub,
  publishRiderLocation,
  RIDER_LOCATION,
  ZONE_ORDER,
  publishOrder,
  publishToUser
} = require('../../helpers/pubsub')
const { sendNotificationToUser } = require('../../helpers/notifications')
const {
  sendNotificationToCustomerWeb
} = require('../../helpers/firebase-web-notifications')
const { order_status } = require('../../helpers/enum')
const {
  notificationsQueue,
  JOB_TYPE,
  JOB_DELAY_DEFAULT
} = require('../../queue')
const { requireAuth, requireRole, ADMIN_ROLES, requireWalletAccess } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

// Same unsigned Cloudinary preset the admin panel already uploads
// restaurant/cuisine images through (apps/admin/.env.production) --
// reused here so rider document uploads (license/vehicle plate) land
// in the same real, working media pipeline instead of a fictional S3 bucket.
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/' + 'alaaeallam' + '/image/upload'
const CLOUDINARY_UPLOAD_PRESET = 'noodle_admin_unsigned'
module.exports = {
  Subscription: {
    subscriptionRiderLocation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(RIDER_LOCATION),
        (payload, args) => {
          const riderId = payload.subscriptionRiderLocation._id
          return riderId === args.riderId
        }
      )
    },
    subscriptionZoneOrders: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ZONE_ORDER),
        (payload, args) => {
          const zoneId = payload.subscriptionZoneOrders.zoneId
          return zoneId === args.zoneId
        }
      )
    }
  },
  Query: {
    riders: async(_, args, { req }) => {
      console.log('riders')
      try {
        requireRole(req, ADMIN_ROLES)
        const riders = await Rider.find({ isActive: true })
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    rider: async(_, args, { req }) => {
      try {
        requireAuth(req)
        const userId = args.id || req.userId
        if (!ADMIN_ROLES.has(req.userType || '') && String(userId) !== String(req.userId)) {
          throw new Error('Forbidden')
        }
        const rider = await Rider.findById(userId)
        if (!rider) throw new Error('Rider does not exist')
        return transformRider(rider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    availableRiders: async _ => {
      console.log('riders')
      try {
        const riders = await Rider.find({ isActive: true, available: true })
        return riders.map(transformRider)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    assignedOrders: async(_, args, { req }) => {
      console.log('assignedOrders', args.id || req.userId)
      const userId = args.id || req.userId
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const riderOrders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'ACCEPTED' }, { orderStatus: 'PICKED' }]
        }).sort({ createdAt: -1 })
        return riderOrders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    riderCompletedOrders: async(_, args, { req }) => {
      console.log('rider completed orders')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const orders = await Order.find({
          rider: req.userId,
          $or: [{ orderStatus: 'COMPLETED' }, { orderStatus: 'DELIVERED' }]
        }).sort({ createdAt: -1 })
        return orders.map(order => {
          return transformOrder(order)
        })
      } catch (err) {
        throw err
      }
    },
    unassignedOrdersByZone: async(_, args, { req }) => {
      console.log('unassignedOrders')

      try {
        if (!req.isAuth) {
          throw new Error('Unauthenticated!')
        }

        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')

        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null
        }).sort({ createdAt: -1 })
        return orders.map(transformOrder)
      } catch (err) {
        throw err
      }
    },
    riderOrders: async(_, args, { req }) => {
      console.log('riderOrders', req.userId)
      try {
        const rider = await Rider.findById(req.userId)
        if (!rider) throw new Error('Rider does not exist')
        const date = new Date()
        date.setDate(date.getDate() - 1)
        const activeWindow = {
          $gte: `${date.getFullYear()}-${
            date.getMonth() + 1
          }-${date.getDate()}`
        }
        // Delivered/cancelled orders are the rider's history, not their
        // active queue — they shouldn't be dropped just because they were
        // created outside the ~24h "active order" window above (e.g. an
        // order accepted yesterday and only just marked delivered). Give
        // history a much longer, but still bounded, window instead.
        const historyDate = new Date()
        historyDate.setDate(historyDate.getDate() - 30)
        const historyWindow = {
          $gte: `${historyDate.getFullYear()}-${
            historyDate.getMonth() + 1
          }-${historyDate.getDate()}`
        }
        const activeOrders = await Order.find({
          rider: req.userId,
          createdAt: activeWindow,
          $or: [
            { orderStatus: 'ACCEPTED' },
            { orderStatus: 'PICKED' },
            { orderStatus: 'ASSIGNED' }
          ]
        }).sort({ createdAt: -1 })
        const historyOrders = await Order.find({
          rider: req.userId,
          createdAt: historyWindow,
          $or: [{ orderStatus: 'DELIVERED' }, { orderStatus: 'CANCELLED' }]
        }).sort({ createdAt: -1 })
        const orders = await Order.find({
          zone: rider.zone,
          orderStatus: 'ACCEPTED',
          rider: null,
          createdAt: activeWindow
        }).sort({ createdAt: -1 })
        return orders
          .concat(activeOrders, historyOrders)
          .map(order => {
            return transformOrder(order)
          })
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createRider: async(_, args, { req }) => {
      console.log('createRider')
      try {
        requireRole(req, ADMIN_ROLES)
        // check username, if already exists throw error
        const checkUsername = await Rider.countDocuments({
          username: args.riderInput.username
        })
        if (checkUsername) {
          throw new Error(
            'Username already associated with another rider account'
          )
        }
        const checkPhone = await Rider.countDocuments({
          phone: args.riderInput.phone
        })
        if (checkPhone) {
          throw new Error('Phone already associated with another rider account')
        }

        const hashedPassword = await bcrypt.hash(args.riderInput.password, 12)
        const rider = new Rider({
          name: args.riderInput.name,
          username: args.riderInput.username,
          password: hashedPassword,
          phone: args.riderInput.phone,
          available: args.riderInput.available,
          zone: args.riderInput.zone,
          vehicleType: args.riderInput.vehicleType
        })
        const result = await rider.save()
        await recordAuditLog({
          req,
          action: 'CREATE_RIDER',
          targetType: 'Rider',
          targetId: result.id,
          changes: result._doc
        })
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editRider: async(_, args, { req }) => {
      console.log('editRider')
      try {
        // Admins can edit any rider; a rider can edit their own record via
        // the rider app's own profile screen — anyone else is forbidden.
        const isSelf =
          req?.isAuth &&
          req.userType === 'RIDER' &&
          String(req.userId) === String(args.riderInput._id)
        if (!isSelf) {
          requireRole(req, ADMIN_ROLES)
        }
        const checkUsername = await Rider.find({
          username: args.riderInput.username
        })
        if (
          checkUsername.length > 1 ||
          (checkUsername.length === 1 &&
            checkUsername[0].id !== args.riderInput._id)
        ) {
          throw new Error('Username associated with another rider account')
        }
        const checkPhone = await Rider.find({ phone: args.riderInput.phone })
        if (
          checkPhone.length > 1 ||
          (checkPhone.length === 1 && checkPhone[0].id !== args.riderInput._id)
        ) {
          throw new Error('Phone associated with another rider account')
        }

        const rider = await Rider.findOne({ _id: args.riderInput._id })
        const oldData = { ...rider._doc }

        rider.name = args.riderInput.name
        rider.username = args.riderInput.username
        rider.phone = args.riderInput.phone
        rider.available = args.riderInput.available
        rider.zone = args.riderInput.zone
        if (args.riderInput.vehicleType !== undefined) {
          rider.vehicleType = args.riderInput.vehicleType
        }
        if (args.riderInput.password) {
          rider.password = await bcrypt.hash(args.riderInput.password, 12)
        }

        const result = await rider.save()
        if (!isSelf) {
          await recordAuditLog({
            req,
            action: 'EDIT_RIDER',
            targetType: 'Rider',
            targetId: result.id,
            changes: { oldData, newData: result._doc }
          })
        }
        return transformRider(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteRider: async(_, { id }, { req }) => {
      console.log('deleteRider')
      try {
        requireRole(req, ADMIN_ROLES)
        const rider = await Rider.findById(id)
        const oldData = { ...rider._doc }
        rider.isActive = false
        const result = await rider.save()
        await recordAuditLog({
          req,
          action: 'DELETE_RIDER',
          targetType: 'Rider',
          targetId: result.id,
          changes: { oldData, newData: result._doc }
        })
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    toggleAvailablity: async(_, args, { req }) => {
      console.log('toggleAvailablity')
      const userId = args.id || req.userId // if rider: get id from req, args otherwise
      if (!userId) {
        throw new Error('Unauthenticated!')
      }
      try {
        const rider = await Rider.findById(userId)
        rider.available = !rider.available
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        throw err
      }
    },
    updateOrderStatusRider: async(_, args, { req }) => {
      console.log('updateOrderStatusRider', args, req.userId)
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const order = await Order.findById(args.id)
        order.orderStatus = args.status
        if (args.status === 'PICKED') {
          order.completionTime = new Date(Date.now() + 15 * 60 * 1000)
          order.pickedAt = new Date()
        }
        if (args.status === 'DELIVERED') {
          notificationsQueue.add(
            JOB_TYPE.REVIEW_ORDER_NOTIFICATION,
            {
              type: 'REVIEW_ORDER',
              orderId: args.id,
              order,
              user: order.user,
              message: 'How was your order?'
            },
            { delay: JOB_DELAY_DEFAULT }
          )

          await Rider.updateMany(
            { assigned: { $in: [order.id] } },
            { $pull: { assigned: { $in: [order.id] } } }
          )
          await Rider.updateOne(
            { _id: req.userId },
            { $push: { delivered: order.id } }
          )
          order.deliveredAt = new Date()
        }
        const result = await order.save()
        const user = await User.findById(order.user)
        const transformedOrder = await transformOrder(result)
        publishOrder(transformedOrder)
        publishToUser(result.user.toString(), transformedOrder, 'update')
        sendNotificationToUser(result.user, result)
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
    assignOrder: async(_, args, { req }) => {
      console.log('assignOrder', args.id, req.userId)
      try {
        const order = await Order.findById(args.id)
        if (!order) throw new Error('Order does not exist')
        if (order.rider) {
          throw new Error('Order was assigned to someone else.')
        }
        order.rider = req.userId
        order.orderStatus = order_status[6]
        order.assignedAt = new Date()
        order.isRiderRinged = false
        const result = await order.save()
        const transformedOrder = await transformOrder(result)
        sendNotificationToUser(order.user.toString(), transformedOrder)
        publishOrder(transformedOrder)
        publishToUser(order.user.toString(), transformedOrder, 'update')
        return transformedOrder
      } catch (error) {
        throw error
      }
    },
    updateRiderLocation: async(_, args, { req }) => {
      console.log('updateRiderLocation', req.userId)
      if (!req.userId) {
        throw new Error('Unauthenticated!')
      }

      const rider = await Rider.findById(req.userId)
      if (!rider) {
        throw new Error('Unauthenticated!')
      }

      const location = new Point({
        coordinates: [args.longitude, args.latitude]
      })
      rider.location = location
      const result = await rider.save()

      publishRiderLocation({
        ...result._doc,
        _id: result.id,
        location: location
      })
      return transformRider(result)
    },
    updateRiderBussinessDetails: async(_, args, { req }) => {
      console.log('updateRiderBussinessDetails', args.id)
      try {
        const { userId } = requireWalletAccess(req, 'RIDER', args.id)
        const rider = await Rider.findById(userId)
        if (!rider) throw new Error('Rider does not exist')
        rider.bussinessDetails = args.bussinessDetails
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log('updateRiderBussinessDetails error', err)
        throw err
      }
    },
    updateRiderLicenseDetails: async(_, args, { req }) => {
      console.log('updateRiderLicenseDetails', args.id)
      try {
        const { userId } = requireWalletAccess(req, 'RIDER', args.id)
        const rider = await Rider.findById(userId)
        if (!rider) throw new Error('Rider does not exist')
        rider.licenseDetails = args.licenseDetails
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log('updateRiderLicenseDetails error', err)
        throw err
      }
    },
    updateRiderVehicleDetails: async(_, args, { req }) => {
      console.log('updateRiderVehicleDetails', args.id)
      try {
        const { userId } = requireWalletAccess(req, 'RIDER', args.id)
        const rider = await Rider.findById(userId)
        if (!rider) throw new Error('Rider does not exist')
        rider.vehicleDetails = args.vehicleDetails
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log('updateRiderVehicleDetails error', err)
        throw err
      }
    },
    updateWorkSchedule: async(_, args, { req }) => {
      console.log('updateWorkSchedule', args.riderId)
      try {
        const { userId } = requireWalletAccess(req, 'RIDER', args.riderId)
        const rider = await Rider.findById(userId)
        if (!rider) throw new Error('Rider does not exist')
        rider.workSchedule = args.workSchedule
        rider.timeZone = args.timeZone
        const result = await rider.save()
        return transformRider(result)
      } catch (err) {
        console.log('updateWorkSchedule error', err)
        throw err
      }
    },
    uploadImageToS3: async(_, args, { req }) => {
      console.log('uploadImageToS3')
      try {
        if (!req.isAuth) throw new Error('Unauthenticated')
        const match = /^data:(.+);base64,(.+)$/.exec(args.image || '')
        if (!match) throw new Error('Invalid image data')
        const [, mime, base64Data] = match
        const buffer = Buffer.from(base64Data, 'base64')

        const formData = new FormData()
        formData.append('file', new Blob([buffer], { type: mime }), 'upload.jpg')
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData
        })
        const data = await response.json()
        if (!data.secure_url) {
          console.log('uploadImageToS3 cloudinary error', data)
          throw new Error((data.error && data.error.message) || 'Image upload failed')
        }
        return { imageUrl: data.secure_url }
      } catch (err) {
        console.log('uploadImageToS3 error', err)
        throw err
      }
    }
  }
}
