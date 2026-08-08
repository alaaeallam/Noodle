const mongoose = require('mongoose')

const Schema = mongoose.Schema

const configurationSchema = new Schema(
  {
    email: {
      type: String
    },
    password: {
      type: String
    },
    emailName: {
      type: String
    },
    enableEmail: {
      type: Boolean
    },
    clientId: {
      type: String
    },
    clientSecret: {
      type: String
    },
    sandbox: {
      type: Boolean
    },
    publishableKey: {
      type: String
    },
    secretKey: {
      type: String
    },
    currency: {
      type: String
    },
    currencySymbol: {
      type: String
    },
    deliveryRate: {
      type: Number,
      default: 5
    },
    costType: {
      type: String,
      enum: ['perKM', 'fixed'],
      default: 'perKM'
    },
    // when set, every customer-facing restaurant-discovery query is filtered
    // to only this vendor's restaurants — lets the platform run as a
    // single-vendor deployment without deleting other vendors' data.
    singleVendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Owner',
      default: null
    },
    twilioAccountSid: {
      type: String
    },
    twilioAuthToken: {
      type: String
    },
    twilioPhoneNumber: {
      type: String
    },
    twilioEnabled: {
      type: Boolean
    },
    isActive: {
      type: Boolean,
      default: true
    },
    formEmail: {
      type: String
    },
    sendGridApiKey: {
      type: String
    },
    sendGridEnabled: {
      type: Boolean
    },
    sendGridEmail: {
      type: String
    },
    sendGridEmailName: {
      type: String
    },
    sendGridPassword: {
      type: String
    },
    dashboardSentryUrl: {
      type: String
    },
    webSentryUrl: {
      type: String
    },
    apiSentryUrl: {
      type: String
    },
    customerAppSentryUrl: {
      type: String
    },
    restaurantAppSentryUrl: {
      type: String
    },
    riderAppSentryUrl: {
      type: String
    },
    googleApiKey: {
      type: String
    },
    cloudinaryUploadUrl: {
      type: String
    },
    cloudinaryApiKey: {
      type: String
    },
    webAmplitudeApiKey: {
      type: String
    },
    appAmplitudeApiKey: {
      type: String
    },
    webClientID: {
      type: String
    },
    androidClientID: {
      type: String
    },
    iOSClientID: {
      type: String
    },
    expoClientID: {
      type: String
    },

    googleMapLibraries: {
      type: String
    },
    googleColor: {
      type: String
    },

    termsAndConditions: {
      type: String
    },
    privacyPolicy: {
      type: String
    },
    testOtp: {
      type: String
    },
    firebaseKey: {
      type: String
    },
    authDomain: {
      type: String
    },
    projectId: {
      type: String
    },
    storageBucket: {
      type: String
    },
    msgSenderId: {
      type: String
    },
    appId: {
      type: String
    },
    measurementId: {
      type: String
    },
    isPaidVersion: {
      type: Boolean,
      default: false
    },
    skipMobileVerification: {
      type: Boolean,
      default: true
    },
    skipEmailVerification: {
      type: Boolean,
      default: true
    },
    enableRiderDemo: {
      type: Boolean,
      default: true
    },
    enableRestaurantDemo: {
      type: Boolean,
      default: true
    },
    enableAdminDemo: {
      type: Boolean,
      default: true
    },
    customerAppVersion: {
      android: { type: String },
      ios: { type: String }
    },
    riderAppVersion: {
      android: { type: String },
      ios: { type: String }
    },
    restaurantAppVersion: {
      android: { type: String },
      ios: { type: String }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Configuration', configurationSchema)
