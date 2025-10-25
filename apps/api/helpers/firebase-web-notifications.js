//enatega-multivendor-api-4.0.12/helpers/firebase-web-notifications.js
var admin = require('firebase-admin')

let firebaseWebEnabled = false
let firebaseWebApp = null

try {
  if (process.env.NODE_ENV !== 'development') {
    // Only initialize outside development where credentials are expected to exist
    const serviceAccount = require('../serviceAccountKey.json')
    firebaseWebApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://enatega-multivender-web.firebaseio.com'
      },
      'firebase-web-notifications'
    )
    firebaseWebEnabled = true
    console.log('[FCM][WEB] Firebase admin initialized for web notifications.')
  } else {
    console.warn('[FCM][WEB] Disabled in DEV (NODE_ENV=development).')
  }
} catch (e) {
  console.warn('[FCM][WEB] Init failed, disabling in this environment:', e.message)
  firebaseWebEnabled = false
  firebaseWebApp = null
}

// Safe no-op messaging when disabled so callers don't crash
const safeMessaging = () => ({
  send: async () => ({ skipped: true }),
  sendToDevice: async () => ({ skipped: true })
})

function sendNotificationToCustomerWeb(token, title, body) {
  if (!token) return true
  if (!firebaseWebEnabled) return true // silently skip in dev

  const message = {
    notification: { title, body },
    token
  }

  const messaging = firebaseWebEnabled ? admin.messaging(firebaseWebApp) : safeMessaging()
  return messaging
    .send(message)
    .then(response => {
      console.log('[FCM][WEB] response', response)
      return true
    })
    .catch(error => {
      console.log('[FCM][WEB] error', error)
      return false
    })
}

module.exports.sendNotificationToCustomerWeb = sendNotificationToCustomerWeb
module.exports.firebaseWebEnabled = firebaseWebEnabled
module.exports.firebaseWebApp = firebaseWebApp