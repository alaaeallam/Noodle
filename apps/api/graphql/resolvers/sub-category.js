const SubCategory = require('../../models/sub-category');

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
    createSubCategories: async (_, { subCategories }) => {
      if (!Array.isArray(subCategories) || subCategories.length === 0) return false;
      // Basic shape guard; keep lax to avoid breaking callers
      const docs = subCategories.map(sc => ({
        title: sc.title?.trim(),
        parentCategoryId: String(sc.parentCategoryId),
        isActive: typeof sc.isActive === 'boolean' ? sc.isActive : true,
      }));
      await SubCategory.insertMany(docs);
      return true;
    },

    deleteSubCategory: async (_, { _id }) => {
      if (!_id) return false;
      const res = await SubCategory.deleteOne({ _id });
      return res.deletedCount > 0;
    },
  },
};