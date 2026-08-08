const mongoose = require('mongoose')

const Schema = mongoose.Schema

const staffSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: [String]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Staff', staffSchema)
