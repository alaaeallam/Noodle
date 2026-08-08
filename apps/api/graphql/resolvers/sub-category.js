const SubCategory = require('../../models/sub-category');
const Restaurant = require('../../models/restaurant');
const { requireRestaurantAccess } = require('../../helpers/guards');

// SubCategory has no direct restaurant reference — only parentCategoryId,
// which is a Category subdocument's _id nested inside some Restaurant.
const requireAccessViaCategory = async (req, parentCategoryId) => {
  const restaurant = await Restaurant.findOne({ 'categories._id': parentCategoryId });
  if (!restaurant) throw new Error('Category not found');
  await requireRestaurantAccess(req, restaurant._id, Restaurant);
};

module.exports = {
  Query: {
    subCategories: async () => {
      return await SubCategory.find({}).lean();
    },
    subCategory: async (_, { _id }) => {
      if (!_id) return null;
      return await SubCategory.findById(_id).lean();
    },
    subCategoriesByParentId: async (_, { parentCategoryId }) => {
      return await SubCategory.find({ parentCategoryId }).lean();
    },
  },

  Mutation: {
    // Frontend calls it with no selection set → expect Boolean
    createSubCategories: async (_, { subCategories }, { req }) => {
      if (!Array.isArray(subCategories) || subCategories.length === 0) return false;
      // Basic shape guard; keep lax to avoid breaking callers
      const docs = subCategories.map(sc => ({
        title: sc.title?.trim(),
        parentCategoryId: String(sc.parentCategoryId),
        isActive: typeof sc.isActive === 'boolean' ? sc.isActive : true,
      }));
      // Verify access for every distinct parent category referenced in this batch
      const uniqueParentIds = [...new Set(docs.map(d => d.parentCategoryId))];
      for (const parentCategoryId of uniqueParentIds) {
        await requireAccessViaCategory(req, parentCategoryId);
      }
      await SubCategory.insertMany(docs);
      return true;
    },

    deleteSubCategory: async (_, { _id }, { req }) => {
      if (!_id) return false;
      const subCategory = await SubCategory.findById(_id);
      if (!subCategory) return false;
      await requireAccessViaCategory(req, subCategory.parentCategoryId);
      const res = await SubCategory.deleteOne({ _id });
      return res.deletedCount > 0;
    },
  },
};