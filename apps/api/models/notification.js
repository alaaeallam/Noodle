const mongoose = require('mongoose')

const Schema = mongoose.Schema
const notificationSchema = new Schema(
  {
    title: {
      type: String
    },
    body: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
