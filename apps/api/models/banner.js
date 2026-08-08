const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    action: {
      type: String
    },
    screen: {
      type: String
    },
    file: {
      type: String
    },
    parameters: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Banner', bannerSchema)
