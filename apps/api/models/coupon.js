const mongoose = require('mongoose')

const Schema = mongoose.Schema
const couponSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    // TODO: TBD, adding discountPercent and flatDiscount to the coupons in future
    discount: {
      type: Number,
      required: true
    },
    // TODO: TBD, adding an expiry date to coupons in future, maybe start date too?
    enabled: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // null = platform-wide coupon (created via Management > Coupons),
    // set = exclusive to one restaurant (created via that restaurant's own Coupons page)
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Coupon', couponSchema))
myModule.couponSchema = couponSchema
