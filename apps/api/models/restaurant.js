const mongoose = require('mongoose')
const { optionSchema } = require('../models/option')
const { addonSchema } = require('../models/addon')
const { categorySchema } = require('../models/category')
const { pointSchema } = require('./point')
const { timingsSchema } = require('./timings')
const {
  defaultOpeningTimes,
  defaultCategoryFood,
  defaultAddons,
  defaultOptions
} = require('../helpers/defaultValues')
const { polygonSchema } = require('./zone')
const { SHOP_TYPE } = require('../helpers/enum')

const Schema = mongoose.Schema

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    address: {
      type: String,
      default: 'Default Address'
    },
    categories: {
      type: [categorySchema],
      default: defaultCategoryFood
    },
    addons: {
      type: [addonSchema],
      default: defaultAddons
    },
    options: {
      type: [optionSchema],
      default: defaultOptions
    },
    orderPrefix: {
      type: String
    },
    orderId: {
      type: Number,
      default: 1
    },
    deliveryTime: {
      type: Number,
      default: 20
    },
    minimumOrder: {
      type: Number,
      default: 0
    },
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // TODO: TBD, should this be inside address property?
    location: {
      type: pointSchema,
      default: { type: 'Point', coordinates: [0, 0] }
    },
    username: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },
    sections: {
      type: [String],
      default: []
    },
    notificationToken: {
      type: String,
      default: null
    },
    enableNotification: {
      type: Boolean,
      default: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    openingTimes: {
      type: [timingsSchema],
      default: defaultOpeningTimes
    },
    slug: { type: String, default: null },
    stripeAccountId: { type: String, default: null },
    stripeDetailsSubmitted: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 25 },
    cuisines: { type: [String] },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner'
    },
    deliveryBounds: polygonSchema,
    tax: { type: Number, default: 10 },
    shopType: { type: String, default: SHOP_TYPE.RESTAURANT }
  },

  { timestamps: true }
)
restaurantSchema.index({ deliveryBounds: '2dsphere' })
module.exports = mongoose.model('Restaurant', restaurantSchema)
