const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    parentCategoryId: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubCategory', subCategorySchema);