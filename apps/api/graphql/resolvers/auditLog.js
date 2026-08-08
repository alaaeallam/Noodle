const AuditLog = require('../../models/auditLog')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')

module.exports = {
  Query: {
    auditLogs: async(_, args, { req }) => {
      try {
        requireRole(req, ADMIN_ROLES)
        const page = args.page || 1
        const limit = args.limit || 10
        const totalCount = await AuditLog.countDocuments()
        const logs = await AuditLog.find()
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
        return {
          auditLogs: logs.map(log => ({
            ...log._doc,
            _id: log.id,
            timestamp: log.timestamp.toISOString()
          })),
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
