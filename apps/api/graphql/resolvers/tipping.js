const Tipping = require('../../models/tipping')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    tips: async() => {
      console.log('Tipping')
      try {
        const tipping = await Tipping.findOne({ isActive: true })
        if (!tipping) {
          return {
            _id: '',
            tipVariations: [],
            enabled: true
          }
        }
        return {
          ...tipping._doc,
          _id: tipping.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createTipping: async(_, args, { req }) => {
      console.log('createTipping')
      try {
        requireRole(req, ADMIN_ROLES)
        const count = await Tipping.countDocuments({
          isActive: true
        })
        if (count > 0) throw new Error('Tipping amount already exists')
        const tipping = new Tipping({
          tipVariations: args.tippingInput.tipVariations,
          enabled: args.tippingInput.enabled
        })
        const result = await tipping.save()
        await recordAuditLog({
          req,
          action: 'CREATE_TIPPING',
          targetType: 'Tipping',
          targetId: result.id,
          changes: result._doc
        })
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editTipping: async(_, args, { req }) => {
      console.log('editTipping', args)
      try {
        requireRole(req, ADMIN_ROLES)
        const tipping = await Tipping.findById(args.tippingInput._id)
        if (!tipping) {
          throw new Error('Something went wrong')
        }
        const oldData = { ...tipping._doc }
        tipping.tipVariations = args.tippingInput.tipVariations
        tipping.enabled = args.tippingInput.enabled
        const result = await tipping.save()
        await recordAuditLog({
          req,
          action: 'EDIT_TIPPING',
          targetType: 'Tipping',
          targetId: result.id,
          changes: { oldData, newData: result._doc }
        })
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
