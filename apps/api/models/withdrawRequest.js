const mongoose = require('mongoose')
const Schema = mongoose.Schema

const withdrawRequestSchema = new Schema(
  {
    requestId: {
      type: String
    },
    requestAmount: {
      type: Number,
      required: true
    },
    requestTime: {
      type: Date,
      default: new Date()
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    userType: {
      type: String,
      enum: ['RIDER', 'STORE'],
      default: 'RIDER'
    },
    status: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema)
