const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      enum: ['RIDER', 'STORE'],
      required: true
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    withdrawRequest: {
      type: Schema.Types.ObjectId,
      ref: 'WithdrawRequest'
    },
    amountCurrency: {
      type: String,
      default: 'USD'
    },
    amountTransferred: {
      type: Number,
      required: true
    },
    status: {
      type: String
    },
    toBank: {
      accountName: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountCode: { type: String }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Transaction', transactionSchema)
