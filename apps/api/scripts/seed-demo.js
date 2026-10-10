/* eslint-disable no-console */
// Demo data for sales screenshots / demos: one demo store (a copy of a real
// BTB branch's menu), one demo rider, demo customers, ~5 weeks of order
// history with reviews, earnings and wallet balances.
//
// Every document this script creates carries `demoSeed: 'btb-demo-v1'`, so
// `remove` deletes exactly what it added (plus anything later created *for*
// the demo store/rider through the real apps). Real stores, riders, users and
// orders are never modified, apart from adding/removing the demo store id in
// the source store owner's `restaurants` list.
//
// Raw collection inserts are used on purpose: the Order pre-save hook would
// stamp every earning with *today's* date and bump wallets as a side effect.
// Here earnings/wallets are written explicitly with backdated timestamps,
// using the same formulas as that hook (models/order.js).
//
// Usage (from apps/api, on the server):
//   node scripts/seed-demo.js plan                      # dry run, writes nothing
//   DEMO_PASSWORD='...' node scripts/seed-demo.js apply # create the demo data
//   node scripts/seed-demo.js open | close              # show/hide demo store to customers
//   node scripts/seed-demo.js remove                    # delete all demo data
//
// Optional: DEMO_SOURCE_STORE='<store name>' picks which real store's menu to
// copy (default: the BTB store with the most menu items).
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Restaurant = require('../models/restaurant')
const Rider = require('../models/rider')
const User = require('../models/user')
const Order = require('../models/order')
const Review = require('../models/review')
const Earnings = require('../models/earnings')
const Transaction = require('../models/transaction')
const Owner = require('../models/owner')

const TAG = 'btb-demo-v1'
const DAYS = 35
const STORE_USERNAME = 'btb-demo-store'
const RIDER_USERNAME = 'btb-demo-rider'
const CUSTOMER_EMAIL = 'demo.customer@demo.btb.invalid'

// Deterministic PRNG so `plan` and `apply` describe the same data set.
let seed = 20261010
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = arr => arr[Math.floor(rand() * arr.length)]
const between = (min, max) => min + Math.floor(rand() * (max - min + 1))
const round2 = n => +(+n).toFixed(2)
const minutes = (date, m) => new Date(date.getTime() + m * 60000)

const FIRST = ['Ahmed', 'Mariam', 'Omar', 'Nour', 'Youssef', 'Salma', 'Karim', 'Farida', 'Mostafa', 'Laila', 'Hassan', 'Hana', 'Ali', 'Malak', 'Tarek', 'Jana', 'Amr', 'Rana', 'Khaled', 'Dina', 'Ziad', 'Yasmin', 'Seif', 'Habiba']
const LAST = ['Hassan', 'Mostafa', 'Ibrahim', 'Adel', 'Fathy', 'Samir', 'Nabil', 'Ashraf', 'Kamal', 'Saeed', 'Farouk', 'Mansour']
const STREETS = ['Street 9', 'Street 15', 'El Nasr Road', 'Street 90', 'El Hadaba El Wosta', 'Street 77', 'El Mokattam Plateau']
const REVIEWS = {
  5: ['Best burger in Cairo, hands down.', 'Arrived hot and fast. The Frickin Double is unreal.', 'Perfect as always!', 'Juicy, messy, amazing.', ''],
  4: ['Great taste, delivery took a bit longer than expected.', 'Really good, fries could be crispier.', 'Solid burger, will order again.', ''],
  3: ['Good burger but arrived lukewarm.', 'Okay this time, missing extra sauce.'],
  2: ['Order was late and the bun was soggy.']
}
const KITCHEN_NOTES = ['', '', '', 'No onions please', 'Extra sauce on the side', 'Well done patty', 'Cut in half please']

async function connect() {
  const uri = process.env.CONNECTION_STRING
  if (!uri) throw new Error('Missing CONNECTION_STRING in apps/api/.env')
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  const host = uri.replace(/^mongodb(\+srv)?:\/\/([^@]*@)?/, '').split(/[/?]/)[0]
  console.log(`Database: ${host}/${mongoose.connection.name}`)
}

async function findSourceStore() {
  const query = { demoSeed: { $exists: false } }
  if (process.env.DEMO_SOURCE_STORE) query.name = process.env.DEMO_SOURCE_STORE
  else query.name = /btb/i
  const stores = await Restaurant.collection.find(query).toArray()
  if (!stores.length) throw new Error('No source store found (set DEMO_SOURCE_STORE to an exact store name)')
  const foodCount = s => (s.categories || []).reduce((n, c) => n + (c.foods || []).filter(f => f.isActive !== false).length, 0)
  stores.sort((a, b) => foodCount(b) - foodCount(a))
  const src = stores[0]
  if (!foodCount(src)) throw new Error(`Source store "${src.name}" has no menu items`)
  if (!src.zone) throw new Error(`Source store "${src.name}" has no delivery zone`)
  return { src, foodCount: foodCount(src) }
}

// Build one order line from the store menu, choosing options the same way the
// customer app would (respecting each addon group's minimum), priced like
// placeOrder in graphql/resolvers/order.js.
function buildItem(store, foods, exclude = []) {
  const choices = foods.filter(f => !exclude.includes(String(f._id)))
  const food = pick(choices.length ? choices : foods)
  const variation = pick(food.variations.filter(v => !v.isOutOfStock).length ? food.variations.filter(v => !v.isOutOfStock) : food.variations)
  let price = variation.price
  const addons = []
  for (const addonId of variation.addons || []) {
    const addon = (store.addons || []).find(a => String(a._id) === String(addonId))
    if (!addon || addon.isActive === false) continue
    const opts = (addon.options || []).map(id => (store.options || []).find(o => String(o._id) === String(id))).filter(Boolean)
    if (!opts.length) continue
    const min = Math.max(addon.quantityMinimum || 0, 0)
    const max = Math.max(Math.min(addon.quantityMaximum || 1, opts.length), min)
    // Mostly the minimum; one paid extra now and then, like real orders.
    const count = Math.min(rand() < 0.75 ? min : Math.min(max, min + 1), opts.length)
    if (!count) continue
    const chosen = [...opts].sort(() => rand() - 0.5).slice(0, count)
    for (const o of chosen) {
      if (!(addon.defaultOptions || []).includes(String(o._id))) price += o.price || 0
    }
    addons.push({
      title: addon.title,
      description: addon.description,
      options: chosen.map(o => ({ title: o.title, description: o.description, price: o.price || 0 })),
      defaultOptions: addon.defaultOptions || [],
      quantityMinimum: addon.quantityMinimum,
      quantityMaximum: addon.quantityMaximum
    })
  }
  const quantity = rand() < 0.9 ? 1 : 2
  return {
    line: {
      food: String(food._id),
      title: food.title,
      description: food.description,
      image: food.image,
      quantity,
      variation: { title: variation.title, price: variation.price, discounted: variation.discounted || 0 },
      addons,
      specialInstructions: pick(KITCHEN_NOTES)
    },
    total: price * quantity
  }
}

function buildDataset(src) {
  const now = new Date()
  const storeId = new mongoose.Types.ObjectId()
  const riderId = new mongoose.Types.ObjectId()
  const [lng, lat] = src.location?.coordinates || [31.3, 30.01]
  const foods = src.categories.filter(c => c.isActive !== false).flatMap(c => c.foods || []).filter(f => f.isActive !== false && !f.isOutOfStock && (f.variations || []).length)
  const taxRate = src.tax ?? 10
  const commissionRate = src.commissionRate ?? 0

  const store = {
    _id: storeId,
    name: 'BTB Demo Kitchen',
    image: src.image,
    logo: src.logo,
    address: src.address,
    phone: src.phone,
    categories: src.categories,
    addons: src.addons,
    options: src.options,
    orderPrefix: 'DEMO',
    deliveryTime: src.deliveryTime,
    minimumOrder: src.minimumOrder,
    zone: src.zone,
    isActive: true,
    // Hidden from customers by default; `open` shows it for screenshot sessions.
    isAvailable: false,
    location: src.location,
    deliveryBounds: src.deliveryBounds,
    boundType: src.boundType,
    circleBounds: src.circleBounds,
    username: STORE_USERNAME,
    openingTimes: src.openingTimes,
    slug: 'btb-demo-kitchen',
    commissionRate,
    tax: taxRate,
    cuisines: src.cuisines,
    shopType: src.shopType,
    owner: src.owner,
    enableNotification: false,
    bussinessDetails: { bankName: 'Demo Bank', accountName: 'BTB Demo Kitchen', accountNumber: '0000000000', accountCode: 'DEMO' }
  }

  const rider = {
    _id: riderId,
    name: 'Karim Adel',
    email: 'demo.rider@demo.btb.invalid',
    username: RIDER_USERNAME,
    phone: '+201000000000',
    location: { type: 'Point', coordinates: [lng, lat] },
    available: true,
    vehicleType: 'motorbike',
    zone: src.zone,
    isActive: true,
    licenseDetails: { number: 'DEMO-LIC-1001', expiryDate: '2028-12-31' },
    vehicleDetails: { number: 'DEMO 1001' },
    bussinessDetails: { bankName: 'Demo Bank', accountName: 'Karim Adel', accountNumber: '0000000001', accountCode: 'DEMO' },
    workSchedule: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => ({
      day,
      enabled: day !== 'FRI',
      slots: [{ startTime: '12:00', endTime: '18:00' }, { startTime: '19:00', endTime: '23:30' }]
    }))
  }

  const users = []
  for (let i = 0; i < 24; i++) {
    const name = i === 0 ? 'Nour Hassan' : `${FIRST[i]} ${pick(LAST)}`
    const created = new Date(now.getTime() - between(i === 0 ? 300 : 3, 360) * 86400000)
    users.push({
      _id: new mongoose.Types.ObjectId(),
      name,
      email: i === 0 ? CUSTOMER_EMAIL : `demo.customer${String(i).padStart(2, '0')}@demo.btb.invalid`,
      emailIsVerified: true,
      phone: `+2010000${String(i).padStart(5, '0')}`,
      phoneIsVerified: true,
      userType: 'default',
      isOrderNotification: true,
      addresses: [{
        _id: new mongoose.Types.ObjectId(),
        location: { type: 'Point', coordinates: [round2(lng + (rand() - 0.5) * 0.03), round2(lat + (rand() - 0.5) * 0.03)] },
        deliveryAddress: `${between(1, 60)} ${pick(STREETS)}, Mokattam, Cairo`,
        details: `Floor ${between(1, 9)}, Apt ${between(1, 30)}`,
        label: rand() < 0.7 ? 'Home' : 'Work',
        selected: true
      }],
      favourite: i < 8 ? [String(storeId)] : [],
      createdAt: created,
      updatedAt: created
    })
  }

  const orders = []
  const reviews = []
  const earnings = []
  const transactions = []
  let seq = 0
  const nextId = () => `DEMO-${++seq}`

  const makeOrder = (createdAt, status, opts = {}) => {
    const user = opts.user || pick(users.slice(1))
    const posOrder = !!opts.pos
    const isPickedUp = posOrder || !!opts.pickup
    const lines = []
    let subtotal = 0
    const r = rand()
    for (let n = r < 0.55 ? 1 : r < 0.9 ? 2 : 3; n > 0; n--) {
      const { line, total } = buildItem(src, foods, lines.map(l => l.food))
      lines.push(line)
      subtotal += total
    }
    const deliveryCharges = isPickedUp ? 0 : pick([15, 20, 20, 25, 30])
    const tax = round2(subtotal * (taxRate / 100))
    const tip = isPickedUp ? 0 : pick([0, 0, 0, 10, 15, 20])
    const orderAmount = round2(subtotal + deliveryCharges + tax + tip)
    const withRider = !isPickedUp && ['ACCEPTED', 'PICKED', 'DELIVERED'].includes(status)
    const address = user.addresses[0]
    const order = {
      _id: new mongoose.Types.ObjectId(),
      zone: src.zone,
      restaurant: storeId,
      orderId: nextId(),
      deliveryAddress: posOrder
        ? { location: src.location, deliveryAddress: 'Walk-in (counter)', label: 'Counter', id: String(new mongoose.Types.ObjectId()) }
        : { location: address.location, deliveryAddress: address.deliveryAddress, details: address.details, label: address.label, id: String(address._id) },
      items: lines,
      user: posOrder ? undefined : user._id,
      orderSource: posOrder ? 'POS' : 'CUSTOMER',
      customerName: posOrder ? `${pick(FIRST)} (walk-in)` : null,
      paymentStatus: status === 'DELIVERED' ? 'PAID' : 'PENDING',
      orderStatus: status,
      paidAmount: status === 'DELIVERED' ? orderAmount : 0,
      orderAmount,
      deliveryCharges,
      paymentMethod: 'COD',
      instructions: rand() < 0.2 ? 'Please ring the bell twice' : '',
      tipping: tip,
      isPickedUp,
      isReadyToPickUp: ['PICKED', 'DELIVERED'].includes(status),
      taxationAmount: tax,
      rider: withRider ? riderId : undefined,
      orderDate: createdAt,
      expectedTime: minutes(createdAt, 35),
      completionTime: minutes(createdAt, 35),
      preparationTime: minutes(createdAt, 20),
      acceptedAt: status !== 'PENDING' && status !== 'CANCELLED' ? minutes(createdAt, 2) : null,
      assignedAt: withRider ? minutes(createdAt, 4) : null,
      pickedAt: ['PICKED', 'DELIVERED'].includes(status) && withRider ? minutes(createdAt, between(15, 22)) : null,
      deliveredAt: status === 'DELIVERED' ? minutes(createdAt, between(28, 45)) : null,
      cancelledAt: status === 'CANCELLED' ? minutes(createdAt, 6) : null,
      reason: status === 'CANCELLED' ? pick(['Customer requested cancellation', 'Store too busy']) : undefined,
      chat: [],
      isActive: true,
      // Never ring store/rider devices for seeded orders.
      isRinged: false,
      isRiderRinged: false,
      createdAt,
      updatedAt: status === 'DELIVERED' ? minutes(createdAt, 45) : createdAt
    }
    orders.push(order)

    if (status === 'DELIVERED') {
      // Same formulas as the Order pre-save hook (models/order.js).
      const deliveryFee = order.rider ? deliveryCharges : 0
      const riderTip = order.rider ? tip : 0
      const marketplaceCommission = round2(orderAmount * (commissionRate / 100))
      const platformFee = round2(marketplaceCommission + tax)
      const storeTotal = round2(orderAmount - marketplaceCommission)
      earnings.push({
        orderId: order.orderId,
        orderType: isPickedUp ? 'PICKUP' : 'DELIVERY',
        paymentMethod: 'COD',
        platformEarnings: { marketplaceCommission, deliveryCommission: 0, tax, platformFee, totalEarnings: platformFee },
        riderEarnings: { riderId: order.rider, deliveryFee, tip: riderTip, totalEarnings: round2(deliveryFee) },
        storeEarnings: { storeId, orderAmount, totalEarnings: storeTotal },
        createdAt: order.deliveredAt,
        updatedAt: order.deliveredAt
      })
      if (order.rider && riderTip > 0) {
        transactions.push({
          transactionId: `TXN-${order.orderId}`,
          userType: 'RIDER',
          rider: riderId,
          amountCurrency: 'EGP',
          amountTransferred: riderTip,
          status: 'PAID',
          createdAt: order.deliveredAt,
          updatedAt: order.deliveredAt
        })
      }
      if (!posOrder && rand() < 0.6) {
        const r = rand()
        const rating = r < 0.62 ? 5 : r < 0.88 ? 4 : r < 0.97 ? 3 : 2
        const reviewId = new mongoose.Types.ObjectId()
        order.review = reviewId
        reviews.push({
          _id: reviewId,
          order: order._id,
          restaurant: storeId,
          rating,
          description: pick(REVIEWS[rating]),
          isActive: true,
          createdAt: minutes(order.deliveredAt, between(30, 300)),
          updatedAt: minutes(order.deliveredAt, between(30, 300))
        })
      }
    }
    return order
  }

  // History: DAYS days back to yesterday, busier on Thu-Sat evenings.
  for (let d = DAYS; d >= 1; d--) {
    const day = new Date(now)
    day.setDate(now.getDate() - d)
    const weekday = day.getDay()
    const perDay = (weekday >= 4 && weekday <= 6 ? between(5, 8) : between(2, 5))
    for (let k = 0; k < perDay; k++) {
      const t = new Date(day)
      t.setHours(rand() < 0.35 ? between(12, 15) : between(18, 23), between(0, 59), between(0, 59), 0)
      const roll = rand()
      makeOrder(t, roll < 0.05 ? 'CANCELLED' : 'DELIVERED', {
        // The main demo customer gets a believable repeat-order history.
        user: rand() < 0.12 ? users[0] : undefined,
        pickup: roll > 0.88 && roll < 0.95,
        pos: roll >= 0.95
      })
    }
  }
  // Today: a live queue for the store app, rider app and customer tracking.
  const ago = m => new Date(now.getTime() - m * 60000)
  makeOrder(ago(4), 'PENDING')
  makeOrder(ago(2), 'PENDING')
  makeOrder(ago(16), 'ACCEPTED')
  makeOrder(ago(24), 'PICKED', { user: users[0] })
  makeOrder(ago(180), 'DELIVERED', { user: users[0] })

  // Wallets reflect the seeded earnings (what the pre-save hook would have accumulated).
  const storeWallet = round2(earnings.reduce((s, e) => s + e.storeEarnings.totalEarnings, 0))
  const riderWallet = round2(transactions.reduce((s, t) => s + t.amountTransferred, 0))
  Object.assign(store, { orderId: seq, currentWalletAmount: storeWallet, totalWalletAmount: storeWallet, withdrawnWalletAmount: 0 })
  Object.assign(rider, {
    assigned: orders.filter(o => o.rider && ['ACCEPTED', 'PICKED'].includes(o.orderStatus)).map(o => String(o._id)),
    delivered: orders.filter(o => o.rider && o.orderStatus === 'DELIVERED').map(o => String(o._id)),
    currentWalletAmount: riderWallet,
    totalWalletAmount: riderWallet
  })
  const created = new Date(now.getTime() - (DAYS + 5) * 86400000)
  Object.assign(store, { createdAt: created, updatedAt: now })
  Object.assign(rider, { createdAt: created, updatedAt: now })

  return { store, rider, users, orders, reviews, earnings, transactions }
}

// Cast through the mongoose model (applies schema defaults/types), then add the
// tag and explicit timestamps before inserting.
function prepare(Model, doc) {
  const { createdAt, updatedAt, ...rest } = doc
  const obj = new Model(rest).toObject({ depopulate: true })
  return { ...obj, demoSeed: TAG, createdAt: createdAt || new Date(), updatedAt: updatedAt || createdAt || new Date() }
}

function summarize(src, foodCount, data) {
  const by = s => data.orders.filter(o => o.orderStatus === s).length
  const delivered = data.orders.filter(o => o.orderStatus === 'DELIVERED')
  const sales = round2(delivered.reduce((s, o) => s + o.orderAmount, 0))
  const avg = data.reviews.length ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(2) : '-'
  console.log(`Menu copied from: "${src.name}" (${foodCount} items), zone ${src.zone}`)
  console.log(`Will create: store "${data.store.name}" (login ${STORE_USERNAME}, hidden from customers), rider "${data.rider.name}" (login ${RIDER_USERNAME}),`)
  console.log(`  ${data.users.length} customers (main login ${CUSTOMER_EMAIL}), ${data.orders.length} orders over ${DAYS} days`)
  console.log(`  orders: ${by('DELIVERED')} delivered, ${by('CANCELLED')} cancelled, live: ${by('PENDING')} pending, ${by('ACCEPTED')} accepted, ${by('PICKED')} on the way`)
  console.log(`  ${data.orders.filter(o => o.orderSource === 'POS').length} walk-in (POS), ${data.orders.filter(o => o.isPickedUp && o.orderSource !== 'POS').length} pickup`)
  console.log(`  ${data.reviews.length} reviews (avg ${avg}), ${data.earnings.length} earnings records, ${data.transactions.length} rider tip transactions`)
  console.log(`  delivered sales EGP ${sales.toFixed(2)}, store wallet EGP ${data.store.currentWalletAmount.toFixed(2)}, rider tips EGP ${data.rider.currentWalletAmount.toFixed(2)}`)
}

async function existingDemo() {
  return Restaurant.collection.findOne({ $or: [{ demoSeed: TAG }, { username: STORE_USERNAME }] })
}

async function plan() {
  const { src, foodCount } = await findSourceStore()
  const data = buildDataset(src)
  summarize(src, foodCount, data)
  if (await existingDemo()) console.log('\nNOTE: demo data already exists - run `remove` before `apply`.')
  console.log('\nDry run only - nothing was written.')
}

async function apply() {
  const password = process.env.DEMO_PASSWORD
  if (!password || password.length < 8) throw new Error('Set DEMO_PASSWORD (8+ characters) - it becomes the password for the demo store, rider and customer logins')
  if (await existingDemo()) throw new Error('Demo data already exists - run `remove` first')
  for (const [Model, q, label] of [[Rider, { username: RIDER_USERNAME }, 'rider username'], [User, { email: CUSTOMER_EMAIL }, 'customer email']]) {
    if (await Model.collection.findOne(q)) throw new Error(`A ${label} "${Object.values(q)[0]}" already exists - remove it first`)
  }
  const { src, foodCount } = await findSourceStore()
  const data = buildDataset(src)
  summarize(src, foodCount, data)

  const hash = await bcrypt.hash(password, 12)
  data.store.password = hash
  data.rider.password = hash
  data.users[0].password = hash
  // Other demo customers get an unusable random password.
  for (const u of data.users.slice(1)) u.password = await bcrypt.hash(new mongoose.Types.ObjectId().toString() + Math.random(), 4)

  await Restaurant.collection.insertOne(prepare(Restaurant, data.store))
  await Rider.collection.insertOne(prepare(Rider, data.rider))
  await User.collection.insertMany(data.users.map(u => prepare(User, u)))
  await Order.collection.insertMany(data.orders.map(o => prepare(Order, o)))
  if (data.reviews.length) await Review.collection.insertMany(data.reviews.map(r => prepare(Review, r)))
  if (data.earnings.length) await Earnings.collection.insertMany(data.earnings.map(e => prepare(Earnings, e)))
  if (data.transactions.length) await Transaction.collection.insertMany(data.transactions.map(t => prepare(Transaction, t)))
  if (src.owner) await Owner.collection.updateOne({ _id: src.owner }, { $addToSet: { restaurants: data.store._id } })
  console.log('\nDone. Demo store is hidden from customers; run `open` while taking customer-app screenshots, then `close`.')
}

async function setOpen(isAvailable) {
  const res = await Restaurant.collection.updateOne({ demoSeed: TAG }, { $set: { isAvailable } })
  if (!res.matchedCount) throw new Error('No demo store found')
  console.log(`Demo store is now ${isAvailable ? 'OPEN (visible to customers)' : 'CLOSED (hidden from customers)'}.`)
}

async function remove() {
  const store = await Restaurant.collection.findOne({ demoSeed: TAG })
  const rider = await Rider.collection.findOne({ demoSeed: TAG })
  const out = {}
  // Also catch records the real apps created for the demo store/rider after seeding.
  const storeOrRider = [{ demoSeed: TAG }]
  if (store) {
    out.orders = (await Order.collection.deleteMany({ $or: [{ demoSeed: TAG }, { restaurant: store._id }] })).deletedCount
    out.reviews = (await Review.collection.deleteMany({ $or: [{ demoSeed: TAG }, { restaurant: store._id }] })).deletedCount
    storeOrRider.push({ 'storeEarnings.storeId': store._id })
  } else {
    out.orders = (await Order.collection.deleteMany({ demoSeed: TAG })).deletedCount
    out.reviews = (await Review.collection.deleteMany({ demoSeed: TAG })).deletedCount
  }
  if (rider) storeOrRider.push({ 'riderEarnings.riderId': rider._id })
  out.earnings = (await Earnings.collection.deleteMany({ $or: storeOrRider })).deletedCount
  const txnOr = [{ demoSeed: TAG }]
  if (rider) txnOr.push({ rider: rider._id })
  if (store) txnOr.push({ store: store._id })
  out.transactions = (await Transaction.collection.deleteMany({ $or: txnOr })).deletedCount
  out.users = (await User.collection.deleteMany({ demoSeed: TAG })).deletedCount
  out.riders = (await Rider.collection.deleteMany({ demoSeed: TAG })).deletedCount
  if (store) await Owner.collection.updateMany({ restaurants: store._id }, { $pull: { restaurants: store._id } })
  out.stores = (await Restaurant.collection.deleteMany({ demoSeed: TAG })).deletedCount
  console.log('Removed:', JSON.stringify(out))
}

;(async () => {
  const cmd = process.argv[2] || 'plan'
  try {
    await connect()
    if (cmd === 'plan') await plan()
    else if (cmd === 'apply') await apply()
    else if (cmd === 'open') await setOpen(true)
    else if (cmd === 'close') await setOpen(false)
    else if (cmd === 'remove') await remove()
    else throw new Error('Usage: node scripts/seed-demo.js plan|apply|open|close|remove')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌', err.message)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  }
})()
