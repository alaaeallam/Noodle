const ShopType = require('../../models/shopType')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    fetchShopTypes: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const filter = {}
        if (args.filter?.title) {
          filter.title = { $regex: args.filter.title, $options: 'i' }
        }
        if (typeof args.filter?.isActive === 'boolean') {
          filter.isActive = args.filter.isActive
        }

        const page = args.pagination?.page || 1
        const pageSize = args.pagination?.pageSize || 50

        const [data, total] = await Promise.all([
          ShopType.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize),
          ShopType.countDocuments(filter)
        ])

        const totalPages = Math.max(1, Math.ceil(total / pageSize))

        return {
          data: data.map(shopType => ({ ...shopType._doc, _id: shopType.id })),
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    fetchShopTypeByUnique: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const query = {}
        if (args.dto?._id) query._id = args.dto._id
        if (args.dto?.title) query.title = args.dto.title
        const shopType = await ShopType.findOne(query)
        if (!shopType) return null
        return { ...shopType._doc, _id: shopType.id }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createShopType: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const count = await ShopType.countDocuments({ title: args.dto.title })
        if (count > 0) throw new Error('ShopType already exists')

        const shopType = new ShopType({
          title: args.dto.title,
          image: args.dto.image || '',
          isActive: true
        })

        const result = await shopType.save()
        await recordAuditLog({
          req,
          action: 'CREATE_SHOP_TYPE',
          targetType: 'ShopType',
          targetId: result.id,
          changes: result._doc
        })
        return { ...result._doc, _id: result.id }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    updateShopType: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const input = args.dto
        const shopType = await ShopType.findById(input._id)
        if (!shopType) throw new Error('ShopType does not exist')
        const oldData = { ...shopType._doc }

        if (typeof input.title !== 'undefined') shopType.title = input.title
        if (typeof input.image !== 'undefined') shopType.image = input.image
        if (typeof input.isActive !== 'undefined') { shopType.isActive = input.isActive }

        const result = await shopType.save()
        await recordAuditLog({
          req,
          action: 'UPDATE_SHOP_TYPE',
          targetType: 'ShopType',
          targetId: result.id,
          changes: { oldData, newData: result._doc }
        })
        return { ...result._doc, _id: result.id }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteShopType: async(_, args, { req }) => {
      requireRole(req, ADMIN_ROLES)
      try {
        const shopType = await ShopType.findById(args.id)
        if (!shopType) throw new Error('ShopType does not exist')

        if (args.type === 'SOFT') {
          const oldData = { ...shopType._doc }
          shopType.isActive = false
          const result = await shopType.save()
          await recordAuditLog({
            req,
            action: 'DELETE_SHOP_TYPE_SOFT',
            targetType: 'ShopType',
            targetId: result.id,
            changes: { oldData, newData: result._doc }
          })
          return { ...result._doc, _id: result.id }
        }

        const plain = { ...shopType._doc, _id: shopType.id }
        await shopType.deleteOne()
        await recordAuditLog({
          req,
          action: 'DELETE_SHOP_TYPE',
          targetType: 'ShopType',
          targetId: plain._id,
          changes: plain
        })
        return plain
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
