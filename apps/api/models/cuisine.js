const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cuisineSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)
const myModule = (module.exports = mongoose.model('Cuisine', cuisineSchema))
myModule.cuisineSchema = cuisineSchema
