const Configuration = require('../../models/configuration')
const { requireRole, ADMIN_ROLES } = require('../../helpers/guards')
const { recordAuditLog } = require('../../helpers/auditLog')

// Configuration holds live platform secrets (API keys, tokens) — the audit
// trail must record WHICH fields an admin changed, never the actual values.
const auditFieldsUpdated = fields => ({ fieldsUpdated: fields })

module.exports = {
  Query: {
    configuration: async() => {
      console.log('configuration')
      const configuration = await Configuration.findOne()
      if (!configuration) {
        return {
          _id: '',
          email: '',
          password: '',
          emailName: '',
          enableEmail: true,
          clientId: '',
          clientSecret: '',
          sandbox: false,
          publishableKey: '',
          secretKey: '',
          currency: '',
          currencySymbol: '',
          deliveryRate: 5,
          costType: 'perKM',
          singleVendorId: '',
          twilioAccountSid: '',
          twilioAuthToken: '',
          twilioPhoneNumber: '',
          twilioEnabled: false,
          formEmail: '',
          sendGridApiKey: '',
          sendGridEnabled: false,
          sendGridEmail: '',
          sendGridEmailName: '',
          sendGridPassword: '',
          dashboardSentryUrl: '',
          webSentryUrl: '',
          apiSentryUrl: '',
          customerAppSentryUrl: '',
          restaurantAppSentryUrl: '',
          riderAppSentryUrl: '',
          googleApiKey: '',
          cloudinaryUploadUrl: '',
          cloudinaryApiKey: '',
          webClientID: '',
          androidClientID: '',
          iOSClientID: '',
          expoClientID: '',
          googleMapLibraries: '',
          googleColor: '',
          termsAndConditions: '',
          privacyPolicy: '',
          testOtp: '',
          firebaseKey: '',
          authDomain: '',
          projectId: '',
          storageBucket: '',
          msgSenderId: '',
          appId: '',
          measurementId: '',
          isPaidVersion: false,
          skipMobileVerification: false,
          skipEmailVerification: false
        }
      }
      return {
        ...configuration._doc,
        _id: configuration.id
      }
    },
    getVersions: async() => {
      const configuration = await Configuration.findOne()
      if (!configuration) {
        return {
          customerAppVersion: { android: '', ios: '' },
          riderAppVersion: { android: '', ios: '' },
          restaurantAppVersion: { android: '', ios: '' }
        }
      }
      return {
        customerAppVersion: configuration.customerAppVersion || { android: '', ios: '' },
        riderAppVersion: configuration.riderAppVersion || { android: '', ios: '' },
        restaurantAppVersion: configuration.restaurantAppVersion || { android: '', ios: '' }
      }
    }
  },
  Mutation: {
    saveEmailConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveEmailConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.email = args.configurationInput.email
      configuration.emailName = args.configurationInput.emailName
      configuration.password = args.configurationInput.password
      configuration.enableEmail = args.configurationInput.enableEmail
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_EMAIL_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['email', 'emailName', 'password', 'enableEmail'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveFirebaseConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveFirebaseConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.firebaseKey = args.configurationInput.firebaseKey
      configuration.authDomain = args.configurationInput.authDomain
      configuration.projectId = args.configurationInput.projectId
      configuration.storageBucket = args.configurationInput.storageBucket
      configuration.appId = args.configurationInput.appId
      configuration.measurementId = args.configurationInput.measurementId
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_FIREBASE_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['firebaseKey', 'authDomain', 'projectId', 'storageBucket', 'appId', 'measurementId'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveDeliveryRateConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveDeliveryRateConfiguration', args.deliveryRate, args.costType)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      const oldDeliveryRate = configuration.deliveryRate
      const oldCostType = configuration.costType
      configuration.deliveryRate = args.deliveryRate
      if (args.costType !== undefined) configuration.costType = args.costType
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_DELIVERY_RATE_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: {
          oldData: { deliveryRate: oldDeliveryRate, costType: oldCostType },
          newData: { deliveryRate: result.deliveryRate, costType: result.costType }
        }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveSingleVendorConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveSingleVendorConfiguration', args.singleVendorId)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      const oldSingleVendorId = configuration.singleVendorId
      configuration.singleVendorId = args.singleVendorId || null
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_SINGLE_VENDOR_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: {
          oldData: { singleVendorId: oldSingleVendorId },
          newData: { singleVendorId: result.singleVendorId }
        }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    savePaypalConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('savePaypalConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.clientId = args.configurationInput.clientId
      configuration.clientSecret = args.configurationInput.clientSecret
      configuration.sandbox = args.configurationInput.sandbox
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_PAYPAL_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['clientId', 'clientSecret', 'sandbox'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveStripeConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveStripeConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.publishableKey = args.configurationInput.publishableKey
      configuration.secretKey = args.configurationInput.secretKey
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_STRIPE_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['publishableKey', 'secretKey'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveCurrencyConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveCurrencyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      const oldData = { currency: configuration.currency, currencySymbol: configuration.currencySymbol }
      configuration.currency = args.configurationInput.currency
      configuration.currencySymbol = args.configurationInput.currencySymbol
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_CURRENCY_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: { oldData, newData: { currency: result.currency, currencySymbol: result.currencySymbol } }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },

    // New mutation resolver for TWILIO configuration
    saveTwilioConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveTwilioConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.twilioAccountSid = args.configurationInput.twilioAccountSid
      configuration.twilioAuthToken = args.configurationInput.twilioAuthToken
      configuration.twilioPhoneNumber =
        args.configurationInput.twilioPhoneNumber
      configuration.twilioEnabled = args.configurationInput.twilioEnabled
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_TWILIO_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber', 'twilioEnabled'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveFormEmailConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveFormEmailConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      const oldFormEmail = configuration.formEmail
      configuration.formEmail = args.configurationInput.formEmail
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_FORM_EMAIL_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: { oldData: { formEmail: oldFormEmail }, newData: { formEmail: result.formEmail } }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveSendGridConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveSendGridConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      // Update fields based on the provided input
      configuration.sendGridApiKey = args.configurationInput.sendGridApiKey
      configuration.sendGridEnabled = args.configurationInput.sendGridEnabled
      configuration.sendGridEmail = args.configurationInput.sendGridEmail
      configuration.sendGridEmailName =
        args.configurationInput.sendGridEmailName
      configuration.sendGridPassword = args.configurationInput.sendGridPassword
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_SENDGRID_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['sendGridApiKey', 'sendGridEnabled', 'sendGridEmail', 'sendGridEmailName', 'sendGridPassword'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveSentryConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveSentryConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.dashboardSentryUrl =
        args.configurationInput.dashboardSentryUrl
      configuration.webSentryUrl = args.configurationInput.webSentryUrl
      configuration.apiSentryUrl = args.configurationInput.apiSentryUrl
      configuration.customerAppSentryUrl =
        args.configurationInput.customerAppSentryUrl
      configuration.restaurantAppSentryUrl =
        args.configurationInput.restaurantAppSentryUrl
      configuration.riderAppSentryUrl =
        args.configurationInput.riderAppSentryUrl

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_SENTRY_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['dashboardSentryUrl', 'webSentryUrl', 'apiSentryUrl', 'customerAppSentryUrl', 'restaurantAppSentryUrl', 'riderAppSentryUrl'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveGoogleApiKeyConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveGoogleApiKeyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.googleApiKey = args.configurationInput.googleApiKey

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_GOOGLE_API_KEY_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['googleApiKey'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveCloudinaryConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveCloudinaryConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.cloudinaryUploadUrl =
        args.configurationInput.cloudinaryUploadUrl
      configuration.cloudinaryApiKey = args.configurationInput.cloudinaryApiKey

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_CLOUDINARY_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['cloudinaryUploadUrl', 'cloudinaryApiKey'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveAmplitudeApiKeyConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveAmplitudeApiKeyConfiguration', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.webAmplitudeApiKey =
        args.configurationInput.webAmplitudeApiKey
      configuration.appAmplitudeApiKey =
        args.configurationInput.appAmplitudeApiKey

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_AMPLITUDE_API_KEY_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['webAmplitudeApiKey', 'appAmplitudeApiKey'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },

    saveGoogleClientIDConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveGoogleClientIDConfiguration', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      configuration.webClientID = args.configurationInput.webClientID
      configuration.androidClientID = args.configurationInput.androidClientID
      configuration.iOSClientID = args.configurationInput.iOSClientID
      configuration.expoClientID = args.configurationInput.expoClientID

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_GOOGLE_CLIENT_ID_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['webClientID', 'androidClientID', 'iOSClientID', 'expoClientID'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveWebConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveWebConfiguration', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.googleMapLibraries =
        args.configurationInput.googleMapLibraries
      configuration.googleColor = args.configurationInput.googleColor

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_WEB_CONFIGURATION',
        targetType: 'Configuration',
        targetId: result.id,
        changes: { newData: { googleMapLibraries: result.googleMapLibraries, googleColor: result.googleColor } }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveAppConfigurations: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveAppConfigurations', args.configurationInput)

      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()

      configuration.termsAndConditions =
        args.configurationInput.termsAndConditions
      configuration.privacyPolicy = args.configurationInput.privacyPolicy
      configuration.testOtp = args.configurationInput.testOtp

      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_APP_CONFIGURATIONS',
        targetType: 'Configuration',
        targetId: result.id,
        changes: auditFieldsUpdated(['termsAndConditions', 'privacyPolicy', 'testOtp'])
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveVerificationsToggle: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveVerificationsToggle', args.configurationInput)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      const oldData = {
        skipEmailVerification: configuration.skipEmailVerification,
        skipMobileVerification: configuration.skipMobileVerification
      }
      configuration.skipEmailVerification =
        args.configurationInput.skipEmailVerification
      configuration.skipMobileVerification =
        args.configurationInput.skipMobileVerification
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SAVE_VERIFICATIONS_TOGGLE',
        targetType: 'Configuration',
        targetId: result.id,
        changes: {
          oldData,
          newData: {
            skipEmailVerification: result.skipEmailVerification,
            skipMobileVerification: result.skipMobileVerification
          }
        }
      })
      return {
        ...result._doc,
        _id: result.id
      }
    },
    saveDemoConfiguration: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      console.log('saveDemoConfiguration', args)
      try {
        let configuration = await Configuration.findOne()
        if (!configuration) configuration = new Configuration()
        configuration.enableRiderDemo = args.configurationInput.enableRiderDemo
        configuration.enableRestaurantDemo =
          args.configurationInput.enableRestaurantDemo
        configuration.enableAdminDemo = args.configurationInput.enableAdminDemo
        const result = await configuration.save()
        await recordAuditLog({
          req: context.req,
          action: 'SAVE_DEMO_CONFIGURATION',
          targetType: 'Configuration',
          targetId: result.id,
          changes: {
            newData: {
              enableRiderDemo: result.enableRiderDemo,
              enableRestaurantDemo: result.enableRestaurantDemo,
              enableAdminDemo: result.enableAdminDemo
            }
          }
        })
        return {
          ...result._doc,
          _id: result.id
        }
      } catch (error) {
        console.log('saveDemoConfiguration error', error.message)
      }
    },
    setVersions: async(_, args, context) => {
      requireRole(context.req, ADMIN_ROLES)
      let configuration = await Configuration.findOne()
      if (!configuration) configuration = new Configuration()
      if (args.customerAppVersion) {
        configuration.customerAppVersion = args.customerAppVersion
      }
      if (args.riderAppVersion) {
        configuration.riderAppVersion = args.riderAppVersion
      }
      if (args.restaurantAppVersion) {
        configuration.restaurantAppVersion = args.restaurantAppVersion
      }
      const result = await configuration.save()
      await recordAuditLog({
        req: context.req,
        action: 'SET_VERSIONS',
        targetType: 'Configuration',
        targetId: result.id,
        changes: {
          newData: {
            customerAppVersion: result.customerAppVersion,
            riderAppVersion: result.riderAppVersion,
            restaurantAppVersion: result.restaurantAppVersion
          }
        }
      })
      return true
    }
  }
}
