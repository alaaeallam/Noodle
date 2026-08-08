const Cuisine = require('../../models/cuisine')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

module.exports = {
  Query: {
    // GET ALL
    cuisines: async () => {
      console.log('cuisines')
      try {
        const cuisines = await Cuisine.find({ isActive: true }).sort({
          createdAt: -1,
        })
        return cuisines.map((cuisine) => ({
          ...cuisine._doc,
          _id: cuisine.id,
          image: cuisine.image || '',
          shopType: cuisine.shopType || '',
        }))
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    // GET ONE BY NAME
    cuisine: async (_, args) => {
      console.log('cuisine', args)
      try {
        const cuisine = await Cuisine.findOne({
          isActive: true,
          name: args.cuisine,
        })
        if (!cuisine) {
          throw new Error('Cuisine not found')
        }
        return {
          ...cuisine._doc,
          _id: cuisine.id,
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },

  Mutation: {
    // CREATE
    createCuisine: async (_, args, { req }) => {
      console.log('createCuisine')
      try {
        requireRole(req, ADMIN_ROLES)
        const count = await Cuisine.countDocuments({
          name: args.cuisineInput.name,
          isActive: true,
        })
        if (count > 0) throw new Error('Cuisine already exists')

        const cuisine = new Cuisine({
          name: args.cuisineInput.name,
          description: args.cuisineInput.description,
          image: args.cuisineInput.image || '',       // 👈 cloudinary url
          shopType: args.cuisineInput.shopType || '', // 👈 optional
          isActive: true,
        })

        const result = await cuisine.save()
        await recordAuditLog({
          req,
          action: 'CREATE_CUISINE',
          targetType: 'Cuisine',
          targetId: result.id,
          changes: result._doc
        })
        return {
          ...result._doc,
          _id: result.id,
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    // EDIT
    editCuisine: async (_, args, { req }) => {
      console.log('editCuisine')
      try {
        requireRole(req, ADMIN_ROLES)
        const input = args.cuisineInput
        const cuisine = await Cuisine.findById(input._id)
        if (!cuisine) {
          throw new Error('cuisine does not exist')
        }
        const oldData = { ...cuisine._doc }

        cuisine.name = input.name
        cuisine.description = input.description
        // only overwrite if provided
        cuisine.image = typeof input.image !== 'undefined'
          ? input.image
          : cuisine.image
        cuisine.shopType = typeof input.shopType !== 'undefined'
          ? input.shopType
          : cuisine.shopType

        const result = await cuisine.save()
        await recordAuditLog({
          req,
          action: 'EDIT_CUISINE',
          targetType: 'Cuisine',
          targetId: result.id,
          changes: { oldData, newData: result._doc }
        })
        return {
          ...result._doc,
          _id: result.id,
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    // SOFT DELETE
    deleteCuisine: async (_, args, { req }) => {
      console.log('deleteCuisine')
      try {
        requireRole(req, ADMIN_ROLES)
        const cuisine = await Cuisine.findById(args.id)
        cuisine.isActive = false
        const result = await cuisine.save()
        await recordAuditLog({
          req,
          action: 'DELETE_CUISINE',
          targetType: 'Cuisine',
          targetId: result.id,
          changes: result._doc
        })
        return result.id
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
}