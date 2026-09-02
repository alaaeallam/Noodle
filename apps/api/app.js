require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@as-integrations/express4')
const mongoose = require('mongoose')
const engines = require('consolidate')
const typeDefs = require('./graphql/schema/index')
const resolvers = require('./graphql/resolvers/index')
const paypal = require('./routes/paypal')
const stripe = require('./routes/stripe')
const isAuthenticated = require('./middleware/is-auth')
const Sentry = require('@sentry/node')
const graphql = require('graphql')
const subscriptionTransportWs = require('subscriptions-transport-ws')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')
const config = require('./config.js')
const graphqlTools = require('@graphql-tools/schema')

console.log('[boot] JWT_SECRET present?', !!process.env.JWT_SECRET)
const http = require('http')
const populateCountries = require('./helpers/populate-countries-data.js')
async function startApolloServer() {
  const app = express()
  const httpServer = http.createServer(app)

  // initializing bug reporting platform i.e Sentry
  Sentry.init({
    dsn: config.SENTRY_DSN,
    tracesSampleRate: 0.1
  })

  const schema = graphqlTools.makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const server = new ApolloServer({
    schema,

    // Security: disable APQ (persisted queries) unless you explicitly rely on it.
    // Apollo's default APQ cache can be unbounded and lead to memory-exhaustion DoS.
    persistedQueries: false,

    // Security: use Apollo's built-in bounded cache to avoid unbounded memory growth.
    // (No extra dependency needed on apollo-server-caching)
    cache: 'bounded',

    introspection: config.NODE_ENV !== 'production',
    formatError: formattedError => {
      console.error('[GraphQL Error]', JSON.stringify(formattedError, null, 2))
      // Security: never let a stack trace reach the client response in
      // production, regardless of what Apollo's own default masking does.
      if (config.NODE_ENV === 'production' && formattedError.extensions) {
        delete formattedError.extensions.exception
      }
      return formattedError
    }
  })
  const GRAPHQL_PATH = '/graphql'

  // Dual-protocol subscription transition: subscriptions-transport-ws (old,
  // deprecated) and graphql-ws (new) use different, incompatible WebSocket
  // subprotocols ('graphql-ws' vs 'graphql-transport-ws' respectively), so
  // both servers run side by side and the httpServer's single 'upgrade'
  // event is routed to whichever one the connecting client actually
  // requested. This lets already-installed app builds (still on the old
  // client) keep working unbroken while newer builds switch over - once
  // every client has migrated, the old server + subscriptions-transport-ws
  // dependency can be removed.
  const wsServerOld = new WebSocketServer({ noServer: true })
  const wsServerNew = new WebSocketServer({ noServer: true })

  subscriptionTransportWs.SubscriptionServer.create(
    {
      schema,
      execute: graphql.execute,
      subscribe: graphql.subscribe,
      onConnect() {
        console.log('[subscriptions-transport-ws] client connected')
      }
    },
    wsServerOld
  )

  useServer({ schema }, wsServerNew)

  const attachSubscriptionUpgradeRouting = httpServer => {
    httpServer.on('upgrade', (request, socket, head) => {
      const { pathname } = new URL(
        request.url,
        `http://${request.headers.host}`
      )
      if (pathname !== GRAPHQL_PATH) {
        socket.destroy()
        return
      }
      const requestedProtocols = (
        request.headers['sec-websocket-protocol'] || ''
      )
        .split(',')
        .map(p => p.trim())
      if (requestedProtocols.includes('graphql-transport-ws')) {
        wsServerNew.handleUpgrade(request, socket, head, ws => {
          wsServerNew.emit('connection', ws, request)
        })
      } else {
        wsServerOld.handleUpgrade(request, socket, head, ws => {
          wsServerOld.emit('connection', ws, request)
        })
      }
    })
  }

  await server.start()
  app.engine('ejs', engines.ejs)
  app.set('views', './views')
  app.set('view engine', 'ejs')

  // Use JSON parser for all non-webhook routes. The default 100kb limit
  // rejects base64-encoded image uploads (uploadImageToS3) before they ever
  // reach a resolver — a raw phone photo is several MB before base64
  // inflates it further, so give the body room for that.
  app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      next()
    } else {
      bodyParser.json({ limit: '20mb' })(req, res, next)
    }
  })
  // Security: scope CORS to known browser-based clients (admin panel, web
  // app) instead of '*'. Non-browser clients (mobile apps, curl, server-to-
  // server) don't send an Origin header at all, so they're unaffected
  // either way - CORS only ever gates browser fetch/XHR requests.
  const allowedOrigins = [config.DASHBOARD_URL, config.WEB_URL].filter(Boolean)
  const isAllowedOrigin = origin => {
    if (!origin) return true
    if (allowedOrigins.includes(origin)) return true
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true
    return false
  }
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*')
      res.setHeader('Vary', 'Origin')
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })
  app.use(
    GRAPHQL_PATH,
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const { isAuth, userId, userType, restaurantId } = isAuthenticated(req)
        req.isAuth = isAuth
        req.userId = userId
        req.userType = userType
        req.restaurantId = restaurantId
        return { req, res }
      }
    })
  )
  app.use(express.static('public'))
  app.use('/paypal', paypal)
  app.use('/stripe', stripe)

  // Make sure to call listen on httpServer, NOT on app.

  await mongoose.connect(config.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  // Use the PORT provided by the environment (Render/Heroku/etc.),
  // and fall back to the config or a sensible default for local dev.
  const PORT = process.env.PORT || config.PORT || 8001

  // Start the HTTP server first so Render can detect the open port quickly.
  await new Promise(resolve => httpServer.listen(PORT, resolve))
  // start subscription servers (both protocols, routed by upgrade request)
  attachSubscriptionUpgradeRouting(httpServer)

  console.log(`🚀 Server ready at http://localhost:${PORT}${GRAPHQL_PATH}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${GRAPHQL_PATH}`)

  // Populate countries data in the background; don't block server startup.
  populateCountries().catch(err => {
    console.error('[populateCountries] failed:', err)
  })
}
startApolloServer()
