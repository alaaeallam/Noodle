const Category = require('../../models/category')
const Restaurant = require('../../models/restaurant')
const { transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    // Returns categories for the authenticated restaurant (from context)
    categories: async (_, __, { req }) => {
      try {
        const restaurantId = req?.restaurantId;
        if (!restaurantId) {
          throw new Error('Missing restaurant context for categories query');
        }
        const restaurant = await Restaurant.findOne({ _id: restaurantId }).lean();
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        // Restaurant document stores categories as an embedded array
        return restaurant.categories || [];
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    createCategory: async(_, args, context) => {
      console.log('createCategory')
      try {
        console.log(args.category)
        const category = new Category({
          title: args.category.title,
          image: args.category.image || null,
          isActive: typeof args.category.isActive === 'boolean' ? args.category.isActive : true
        })
        const restaurant = await Restaurant.findOne({
          _id: args.category.restaurant
        })
        if (!restaurant) {
          throw new Error('Restaurant not found for createCategory');
        }
        restaurant.categories.push(category)
        await restaurant.save()

        return transformRestaurant(restaurant)
      } catch (err) {
        throw err
      }
    },
    editCategory: async(_, args, context) => {
      console.log('editCategory')
      try {
        const restaurant = await Restaurant.findOne({
          _id: args.category.restaurant
        })
        const catDoc = restaurant.categories.id(args.category._id);
        if (!catDoc) {
          throw new Error('Category not found');
        }
        const updatePayload = {};
        if (typeof args.category.title !== 'undefined') updatePayload.title = args.category.title;
        if (typeof args.category.image !== 'undefined') updatePayload.image = args.category.image;
        if (typeof args.category.isActive !== 'undefined') updatePayload.isActive = args.category.isActive;
        catDoc.set(updatePayload);
        await restaurant.save()

        return transformRestaurant(restaurant)
      } catch (err) {
        throw err
      }
    },
    deleteCategory: async(_, { id, restaurant }, context) => {
      console.log('deleteCategory')
      try {
        const restaurants = await Restaurant.findOne({ _id: restaurant })
        if (!restaurants) {
          throw new Error('Restaurant not found for deleteCategory');
        }
        const cat = restaurants.categories.id(id);
        if (!cat) {
          throw new Error('Category not found for deleteCategory');
        }
        cat.remove();
        await restaurants.save()
        return transformRestaurant(restaurants)
      } catch (err) {
        throw err
      }
    }
  }
}
