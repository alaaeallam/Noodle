const { Expo } = require('expo-server-sdk')
const User = require('../../models/user')
const Notification = require('../../models/notification')
const { sendNotificationMobile } = require('../../helpers/utilities')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    notifications: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const notifications = await Notification.find().sort({ createdAt: -1 })
        return notifications.map(notification => ({
          ...notification._doc,
          _id: notification.id,
          createdAt: notification.createdAt.toDateString()
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    sendNotificationUser: async(_, args, { req, res }) => {
      console.log('sendNotificationUser')
      try {
        requireRole(req, ADMIN_ROLES)
        const users = await User.find({ isActive: true })
        const messages = []
        users.forEach(async(user, i) => {
          if (user.notificationToken && user.isOfferNotification) {
            if (Expo.isExpoPushToken(user.notificationToken)) {
              messages.push({
                to: user.notificationToken,
                sound: 'default',
                body: args.notificationBody,
                title: args.notificationTitle,
                channelId: 'default',
                data: {}
              })
            }
          }
        })
        await sendNotificationMobile(messages)
        const notification = await new Notification({
          title: args.notificationTitle,
          body: args.notificationBody
        }).save()
        await recordAuditLog({
          req,
          action: 'SEND_NOTIFICATION',
          targetType: 'Notification',
          targetId: notification.id,
          changes: notification._doc
        })
        console.log('Before Success')
        return 'Success'
      } catch (e) {
        console.log(e)
        throw e
      }
    },
    saveNotificationTokenWeb: async(_, args, { req, res }) => {
      console.log('saveNotificationTokenWeb', args)
      try {
        if (!req.userId) throw new Error('Unauthenticated')
        const result = await User.updateOne(
          { _id: req.userId },
          { $set: { notificationTokenWeb: args.token } },
          { new: true, useFindAndModify: true }
        )
        return {
          success: result.modifiedCount > 0,
          message:
            result.modifiedCount > 0
              ? ''
              : 'an error occured while saving token'
        }
      } catch (error) {
        console.log(error)
        return {
          success: false,
          message: error.message
        }
      }
    }
  }
}
