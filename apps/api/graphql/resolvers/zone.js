const Zone = require('../../models/zone')
const { transformZone } = require('./merge')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')
module.exports = {
  Query: {
    zones: async(_, args, { req, res }) => {
      const zones = await Zone.find({ isActive: true })
      return zones.map(transformZone)
    },
    zone: async(_, args, { req, res }) => {
      console.log('Zones')
      const zone = await Zone.findById(args.id)
      if (!zone) throw new Error('Zone does not exist')

      return transformZone(zone)
    }
  },
  Mutation: {
    createZone: async(_, args, { req, res }) => {
      requireRole(req, ADMIN_ROLES)
      // polygon schema can be found in models/zone.js
      // coordinates: [[
      //     [72.9744366, 33.6857303],
      //     [72.9845601, 33.6718977],
      //     [73.0020695, 33.6811117],
      //     [72.9919728, 33.6949683],
      //     [72.9744366, 33.6857303]
      // ]]

      const location = {
        type: 'Polygon',
        coordinates: args.zone.coordinates
      }

      const zone = new Zone({
        title: args.zone.title,
        description: args.zone.description,
        location
      })
      const result = await zone.save()
      await recordAuditLog({
        req,
        action: 'CREATE_ZONE',
        targetType: 'Zone',
        targetId: result.id,
        changes: result._doc
      })
      return transformZone(result)
    },
    editZone: async(_, args, { req, res }) => {
      requireRole(req, ADMIN_ROLES)
      const zone = await Zone.findById(args.zone._id)
      if (!zone) throw new Error('Zone does not exist')
      const oldData = { ...zone._doc }
      const location = {
        type: 'Polygon',
        coordinates: args.zone.coordinates
      }

      zone.title = args.zone.title
      zone.description = args.zone.description
      zone.location = location

      const result = await zone.save()
      await recordAuditLog({
        req,
        action: 'EDIT_ZONE',
        targetType: 'Zone',
        targetId: result.id,
        changes: { oldData, newData: result._doc }
      })
      return transformZone(result)
    },
    deleteZone: async(_, args, { req, res }) => {
      requireRole(req, ADMIN_ROLES)
      const deletedZone = await Zone.findByIdAndUpdate(
        args.id,
        { isActive: false },
        { new: true }
      )
      await recordAuditLog({
        req,
        action: 'DELETE_ZONE',
        targetType: 'Zone',
        targetId: args.id,
        changes: deletedZone ? deletedZone._doc : null
      })
      return transformZone(deletedZone)
    }
  }
}
