const mongoose = require('mongoose')
const { itemSchema } = require('./item')
const {
  payment_status,
  order_status,
  payment_method
} = require('../helpers/enum')
const { pointSchema } = require('./point')
const { couponSchema } = require('./coupon')
const { messageSchema } = require('./message')
const Earning = require('./earnings')
const Rider = require('./rider')
const Restaurant = require('./restaurant')
const { v4 } = require('uuid')
const Schema = mongoose.Schema

const orderSchema = new Schema(
  {
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone'
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    orderId: {
      type: String,
      required: true
    },
    deliveryAddress: {
      location: {
        type: pointSchema
      },
      deliveryAddress: { type: String, required: true },
      details: { type: String },
      label: { type: String, required: true },
      id: { type: String, default: v4() }
    },
    items: [itemSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentStatus: {
      type: String,
      enum: payment_status,
      default: payment_status[0]
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    // TODO: TBD, which status is this and what is it used for
    // i think we need only order_status(rename it to orderStatus)
    // and payment_status(paymentStatus)
    orderStatus: {
      type: String,
      enum: order_status
    },
    // TODO: TBD, we should show rider to collect cash and how much before marking order delivered?
    paidAmount: { type: Number },
    orderAmount: { type: Number, required: true },
    deliveryCharges: { type: Number },
    paymentMethod: {
      enum: payment_method,
      type: String,
      required: true,
      default: payment_method[0]
    },
    reason: { type: String },
    instructions: { type: String },
    // should we save original amount before discount also?
    // also show these details on order modal
    coupon: { type: couponSchema },
    tipping: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    isPickedUp: {
      type: Boolean,
      default: false
    },
    taxationAmount: {
      type: Number,
      default: 0,
      set: v => +parseFloat(v).toFixed(2)
    },
    // TODO: TBD, should we show rider information when order is completed?
    // do we store times at which status get updated
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider'
    },
    completionTime: { type: Date },
    orderDate: {
      type: Date,
      default: Date.now()
    },
    expectedTime: {
      type: Date,
      default: null
    },
    preparationTime: {
      type: Date,
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    pickedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    chat: { type: [messageSchema], default: [] },
    isActive: {
      type: Boolean,
      default: true
    },
    isRinged: {
      type: Boolean,
      default: true
    },
    isRiderRinged: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
orderSchema.pre('save', async function(next) {
  const isOrderStatusUpdated = this.modifiedPaths().includes('orderStatus')
  if (
    isOrderStatusUpdated &&
    this.rider &&
    this.orderStatus === 'DELIVERED' &&
    this.paymentMethod !== payment_method[0]
  ) {
    const restaurant = await Restaurant.findById(this.restaurant)
    const commissionRate = restaurant?.commissionRate || 0
    const orderAmount = this.orderAmount || 0
    const deliveryFee = this.deliveryCharges || 0
    const tip = this.tipping || 0
    const tax = this.taxationAmount || 0

    const marketplaceCommission = +(orderAmount * (commissionRate / 100)).toFixed(2)
    const deliveryCommission = 0
    const platformFee = +(marketplaceCommission + deliveryCommission + tax).toFixed(2)
    const storeTotalEarnings = +(orderAmount - marketplaceCommission).toFixed(2)
    const riderTotalEarnings = +(deliveryFee + tip).toFixed(2)

    const earning = new Earning({
      orderId: this.orderId,
      orderType: this.isPickedUp ? 'PICKUP' : 'DELIVERY',
      paymentMethod: this.paymentMethod,
      platformEarnings: {
        marketplaceCommission,
        deliveryCommission,
        tax,
        platformFee,
        totalEarnings: platformFee
      },
      riderEarnings: {
        riderId: this.rider,
        deliveryFee,
        tip,
        totalEarnings: riderTotalEarnings
      },
      storeEarnings: {
        storeId: this.restaurant,
        orderAmount,
        totalEarnings: storeTotalEarnings
      }
    })
    earning.save()
    Rider.findOneAndUpdate(
      { _id: this.rider },
      {
        $inc: {
          currentWalletAmount: riderTotalEarnings,
          totalWalletAmount: riderTotalEarnings
        }
      }
    ).catch(err => {
      console.log('catch while updating rider wallet', err)
    })
    if (this.restaurant) {
      Restaurant.findOneAndUpdate(
        { _id: this.restaurant },
        {
          $inc: {
            currentWalletAmount: storeTotalEarnings,
            totalWalletAmount: storeTotalEarnings
          }
        }
      ).catch(err => {
        console.log('catch while updating store wallet', err)
      })
    }
  }
})
module.exports = mongoose.model('Order', orderSchema)
