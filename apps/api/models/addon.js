const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addonSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    // TODO: can this be changed to { type: [String], default:[] }
    // or look into other ways ho we can give it default value.
    options: [String],
    // subset of `options` — which of this addon's own options should be
    // pre-selected. Scoped to the addon, not the shared Option document,
    // since the same option (e.g. "BTB Sauce") can be the default choice
    // in one addon group and a paid extra in another.
    defaultOptions: {
      type: [String],
      default: []
    },
    quantityMinimum: {
      type: Number,
      required: true
    },
    quantityMaximum: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const myModule = (module.exports = mongoose.model('Addon', addonSchema))
myModule.addonSchema = addonSchema
