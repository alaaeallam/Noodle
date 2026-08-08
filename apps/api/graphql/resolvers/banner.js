const Banner = require('../../models/banner')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    banners: async() => {
      try {
        const banners = await Banner.find().sort({ createdAt: -1 })
        return banners.map(banner => ({ ...banner._doc, _id: banner.id }))
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createBanner: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const banner = new Banner({
          title: args.bannerInput.title,
          description: args.bannerInput.description,
          action: args.bannerInput.action,
          screen: args.bannerInput.screen,
          file: args.bannerInput.file,
          parameters: args.bannerInput.parameters
        })
        const result = await banner.save()
        await recordAuditLog({
          req,
          action: 'CREATE_BANNER',
          targetType: 'Banner',
          targetId: result.id,
          changes: result._doc
        })
        return { ...result._doc, _id: result.id }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editBanner: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const input = args.bannerInput
        const banner = await Banner.findById(input._id)
        if (!banner) throw new Error('Banner does not exist')
        const oldData = { ...banner._doc }

        banner.title = input.title
        banner.description = input.description
        banner.action = input.action
        banner.screen = input.screen
        if (typeof input.file !== 'undefined') banner.file = input.file
        if (typeof input.parameters !== 'undefined') { banner.parameters = input.parameters }

        const result = await banner.save()
        await recordAuditLog({
          req,
          action: 'EDIT_BANNER',
          targetType: 'Banner',
          targetId: result.id,
          changes: { oldData, newData: result._doc }
        })
        return { ...result._doc, _id: result.id }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteBanner: async(_, { id }, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const banner = await Banner.findById(id)
        if (!banner) throw new Error('Banner does not exist')
        await banner.deleteOne()
        await recordAuditLog({
          req,
          action: 'DELETE_BANNER',
          targetType: 'Banner',
          targetId: id,
          changes: banner._doc
        })
        return id
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
