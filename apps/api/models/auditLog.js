const mongoose = require('mongoose')

const Schema = mongoose.Schema
const auditLogSchema = new Schema(
  {
    admin: {
      _id: { type: String },
      email: { type: String }
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      required: true
    },
    targetId: {
      type: String
    },
    changes: {
      type: String
    }
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
)

module.exports = mongoose.model('AuditLog', auditLogSchema)
