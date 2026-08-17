const mongoose = require('mongoose')
const { pointSchema } = require('./point')

const Schema = mongoose.Schema

const riderSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      default: '123'
    },
    phone: {
      type: String,
      default: true,
      required: false
    },
    location: {
      type: pointSchema
    },
    available: {
      type: Boolean,
      default: true
    },
    vehicleType: {
      type: String
    },
    assigned: [String],
    delivered: [String],
    zone: {
      type: Schema.Types.ObjectId,
      ref: 'Zone',
      default: null
    },
    notificationToken: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    accountNumber: {
      type: String
    },
    currentWalletAmount: { type: Number, default: 0 },
    totalWalletAmount: { type: Number, default: 0 },
    withdrawnWalletAmount: { type: Number, default: 0 },
    bussinessDetails: {
      bankName: { type: String },
      accountName: { type: String },
      accountCode: { type: String },
      accountNumber: { type: String },
      bussinessRegNo: { type: String },
      companyRegNo: { type: String },
      taxRate: { type: Number }
    },
    licenseDetails: {
      number: { type: String },
      image: { type: String },
      expiryDate: { type: String }
    },
    vehicleDetails: {
      number: { type: String },
      image: { type: String }
    },
    timeZone: { type: String },
    workSchedule: [
      {
        _id: false,
        day: { type: String, required: true },
        enabled: { type: Boolean, default: false },
        slots: [
          {
            _id: false,
            startTime: { type: String, required: true },
            endTime: { type: String, required: true }
          }
        ]
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Rider', riderSchema)
