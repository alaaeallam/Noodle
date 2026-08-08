const Staff = require('../../models/staff')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

const transformStaff = staff => {
  return {
    ...staff._doc,
    _id: staff.id,
    plainPassword: staff.password,
    userType: 'STAFF'
  }
}

// Staff passwords are stored in plaintext — never let them leak into the audit trail's stored diff.
const redactStaff = doc => {
  const { password, ...rest } = doc
  return rest
}

module.exports = {
  Query: {
    staffs: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const staffs = await Staff.find()
        return staffs.map(transformStaff)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    createStaff: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const checkEmail = await Staff.countDocuments({
          email: args.staffInput.email
        })
        if (checkEmail) {
          throw new Error('Email already associated with another staff account')
        }
        const staff = new Staff({
          name: args.staffInput.name,
          email: args.staffInput.email,
          password: args.staffInput.password,
          phone: args.staffInput.phone,
          isActive: args.staffInput.isActive,
          permissions: args.staffInput.permissions
        })
        const result = await staff.save()
        await recordAuditLog({
          req,
          action: 'CREATE_STAFF',
          targetType: 'Staff',
          targetId: result.id,
          changes: redactStaff(result._doc)
        })
        return transformStaff(result)
      } catch (err) {
        throw err
      }
    },
    editStaff: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const checkEmail = await Staff.find({ email: args.staffInput.email })
        if (
          checkEmail.length > 1 ||
          (checkEmail.length === 1 &&
            checkEmail[0].id !== args.staffInput._id)
        ) {
          throw new Error('Email associated with another staff account')
        }

        const staff = await Staff.findOne({ _id: args.staffInput._id })
        if (!staff) throw new Error('Staff does not exist')
        const oldData = redactStaff(staff._doc)

        staff.name = args.staffInput.name
        staff.email = args.staffInput.email
        if (args.staffInput.password) {
          staff.password = args.staffInput.password
        }
        staff.phone = args.staffInput.phone
        staff.isActive = args.staffInput.isActive
        staff.permissions = args.staffInput.permissions

        const result = await staff.save()
        await recordAuditLog({
          req,
          action: 'EDIT_STAFF',
          targetType: 'Staff',
          targetId: result.id,
          changes: { oldData, newData: redactStaff(result._doc) }
        })
        return transformStaff(result)
      } catch (err) {
        throw err
      }
    },
    deleteStaff: async(_, { id }, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const staff = await Staff.findById(id)
        if (!staff) throw new Error('Staff does not exist')
        await staff.deleteOne()
        await recordAuditLog({
          req,
          action: 'DELETE_STAFF',
          targetType: 'Staff',
          targetId: id,
          changes: redactStaff(staff._doc)
        })
        return transformStaff(staff)
      } catch (err) {
        throw err
      }
    }
  }
}
