// GraphQL Resolvers for Vendor related operations
const Owner = require('../../models/owner')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards');
const Restaurant = require('../../models/restaurant')
const { transformOwner } = require('./merge')
const bcrypt = require('bcryptjs')

// helper
const normalizeEmail = (e = '') => String(e).trim().toLowerCase();

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
      requireRole(req, ADMIN_ROLES);
      
      const vendor = await Owner.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      return transformOwner(vendor);
    },
    
  },
  Mutation: {
    // TODO: need to rethink about how restaurants are being added
    createVendor: async (_, args, { req }) => {
      requireRole(req, ADMIN_ROLES);
      console.log('createVendor')
      try {
        const email = normalizeEmail(args.vendorInput.email);
        if (!email) {
          throw new Error('Email is required');
        }
        if (!args.vendorInput.password) {
          throw new Error('Password is required');
        }

        const existingEmail = await Owner.findOne({ email, isActive: true });
        if (existingEmail) {
          throw new Error('Email is already associated with another account.');
        }

        const hashedPassword = await bcrypt.hash(args.vendorInput.password, 12);
        const owner = Owner({
          email,
          password: hashedPassword,
          userType: 'VENDOR'
        });
        const result = await owner.save()
        return transformOwner(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editVendor: async(_, args, context) => {
      console.log('editVendor');
      try {
        const { vendorInput } = args;
        const owner = await Owner.findOne({
          _id: vendorInput._id,
          isActive: true
        });
        if (!owner) {
          throw new Error('Vendor not found');
        }

        const email = normalizeEmail(vendorInput.email);
        if (!email) {
          throw new Error('Email is required');
        }

        const existing = await Owner.findOne({
          email,
          isActive: true,
          _id: { $ne: owner._id }
        });

        if (existing) {
          throw new Error('Email is associated with another account');
        }

        owner.email = email;
        const result = await owner.save();
        return transformOwner(result);
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // TODO: if vendor is deleted, shouldn't the restaurants also(isActive:false)
    deleteVendor: async(_, args, context) => {
      console.log('Delete Vendor')
      try {
        const owner = await Owner.findById(args.id);
        if (!owner) {
          throw new Error('Vendor not found');
        }

        await Promise.all(
          (owner.restaurants || []).map(async (rid) => {
            const restaurant = await Restaurant.findById(rid);
            if (restaurant) {
              restaurant.isActive = false;
              await restaurant.save();
            }
          })
        );

        owner.isActive = false;
        await owner.save();
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
}
