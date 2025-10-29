const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ownerSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    image: { type: String, trim: true },
  restaurants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  ],
  userType: {
    type: String,
    required: true
  },
  pushToken: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

module.exports = mongoose.model('Owner', ownerSchema)
