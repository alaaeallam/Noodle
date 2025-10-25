// GraphQL Resolvers for Vendor related operations
const Owner = require('../../models/owner')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards');
const Restaurant = require('../../models/restaurant')
const { transformOwner } = require('./merge')
const bcrypt = require('bcryptjs')

module.exports = {
  Query: {
    vendors: async (_,_args,{ req }) => {
      // Only ADMIN can list vendors
      requireRole(req, ADMIN_ROLES);
      const vendors = await Owner.find({ userType: 'VENDOR', isActive: true });
      if (!vendors || !vendors.length) return [];
      return vendors.map(transformOwner);
    },
     getVendor: async (_, { id }, { req }) => {
      requireRole(req, ['ADMIN','SUPER_ADMIN']);

      const vendor = await Owner.findById(id);
      return transformOwner(vendor);
    },
  },
  Mutation: {
    // TODO: need to rethink about how restaurants are being added
    createVendor: async (_, args, { req }) => {
      requireRole(req, ['ADMIN','SUPER_ADMIN']);
      console.log('createVendor')
      try {
        if (args.vendorInput.email) {
          const existingEmail = await Owner.findOne({
            email: args.vendorInput.email
          })
          if (existingEmail) {
            throw new Error('Email is already associated with another account.')
          }
        }
        const hashedPassword = await bcrypt.hash(args.vendorInput.password, 12)
        const owner = Owner({
          email: args.vendorInput.email,
          password: hashedPassword,
          userType: 'VENDOR'
        })
        const result = await owner.save()
        return transformOwner(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editVendor: async(_, args, context) => {
      console.log('editVendor')
      try {
        const owner = await Owner.findOne({
          _id: args.vendorInput._id,
          isActive: true
        })
        const existingOwnerWithEmail = await Owner.find({
          email: args.vendorInput.email,
          isActive: true
        })
        if (existingOwnerWithEmail.length <= 1) {
          if (
            existingOwnerWithEmail.length === 1 &&
            existingOwnerWithEmail[0].id !== args.vendorInput._id
          ) {
            throw Error('Email is associated with another account')
          }
          owner.email = args.vendorInput.email
          const result = await owner.save()
          return transformOwner(result)
        } else {
          throw Error('Email is associated with another account')
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // TODO: if vendor is deleted, shouldn't the restaurants also(isActive:false)
    deleteVendor: async(_, args, context) => {
      console.log('Delete Vendor')
      try {
        const owner = await Owner.findById(args.id)
        owner.restaurants.forEach(async element => {
          const restaurant = await Restaurant.findById(element)
          restaurant.isActive = false
          await restaurant.save()
        })
        owner.isActive = false
        await owner.save()
        return true
      } catch (error) {
        console.log(error)
      }
    }
  }
}
