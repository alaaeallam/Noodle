const mongoose = require('mongoose')
const Schema = mongoose.Schema

const earningsSchema = new Schema(
  {
    orderId: {
      type: String
    },
    orderType: {
      type: String,
      enum: ['DELIVERY', 'PICKUP']
    },
    paymentMethod: {
      type: String
    },
    platformEarnings: {
      marketplaceCommission: { type: Number, default: 0 },
      deliveryCommission: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 }
    },
    riderEarnings: {
      riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
      deliveryFee: { type: Number, default: 0 },
      tip: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 }
    },
    storeEarnings: {
      storeId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
      orderAmount: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Earnings', earningsSchema)
