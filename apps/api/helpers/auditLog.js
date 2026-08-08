const AuditLog = require('../models/auditLog')
const Owner = require('../models/owner')

// Records an admin audit-log entry. Never throws — a logging failure must
// never break the mutation it's recording.
const recordAuditLog = async({ req, action, targetType, targetId, changes }) => {
  try {
    let email = null
    if (req?.userId) {
      const owner = await Owner.findById(req.userId).select('email')
      if (owner) email = owner.email
    }
    await new AuditLog({
      admin: { _id: req?.userId, email },
      action,
      targetType,
      targetId: targetId !== undefined && targetId !== null ? String(targetId) : undefined,
      changes: changes !== undefined ? JSON.stringify(changes) : undefined
    }).save()
  } catch (err) {
    console.log('Failed to record audit log:', err)
  }
}

module.exports = { recordAuditLog }
