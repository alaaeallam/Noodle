// const cons = require('consolidate')
const Food = require('../../models/food')
const Restaurant = require('../../models/restaurant')
const Variation = require('../../models/variation')
const { transformRestaurant } = require('./merge')

module.exports = {
  Query: {
    // Returns all foods for the authenticated restaurant by flattening embedded categories[].foods
    foods: async (_, __, { req }) => {
      try {
        const restaurantId =
          req?.restaurantId ||
          req?.headers?.['x-restaurant-id'] ||
          req?.headers?.['X-Restaurant-Id'];
        if (!restaurantId) {
          throw new Error('Missing restaurant context for foods query');
        }
        const restaurant = await Restaurant.findOne({ _id: restaurantId }).lean();
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
        const categories = restaurant.categories || [];
        const foods = categories.flatMap(c => c.foods || []);
        return foods;
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    createFood: async (_, args, context) => {
      console.log('createFood');
      try {
        const {
          restaurant: restId,
          category: categoryId,
          title,
          description,
          image,
          subCategory,
          isActive,
          isOutOfStock,
          variations: variationsInput = []
        } = args.foodInput || {};

        // Map incoming variations to the Variation subdocument
        const variations = variationsInput.map(v => new Variation({
          title: v.title,
          price: v.price,
          discounted: typeof v.discounted === 'number' ? v.discounted : 0,
          addons: Array.isArray(v.addons) ? v.addons : [],
          isOutOfStock: !!v.isOutOfStock
        }));

        // Construct the Food subdocument (embedded)
        const food = new Food({
          title,
          description,
          image,
          variations,
          subCategory: subCategory || null,
          isActive: typeof isActive === 'boolean' ? isActive : true,
          isOutOfStock: !!isOutOfStock
        });

        // Push into the selected category for the restaurant
        await Restaurant.updateOne(
          { _id: restId, 'categories._id': categoryId },
          { $push: { 'categories.$.foods': food } }
        );

        const latestRest = await Restaurant.findOne({ _id: restId });
        return transformRestaurant(latestRest);
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    editFood: async (_, args, context) => {
      const {
        _id: foodId,
        restaurant: restId,
        category: categoryId,
        title,
        description,
        image,
        subCategory,
        isActive,
        isOutOfStock,
        variations: variationsInput = []
      } = args.foodInput || {};

      try {
        const restaurant = await Restaurant.findOne({ _id: restId });

        // Build variations array from input
        const variations = variationsInput.map(v => new Variation({
          title: v.title,
          price: v.price,
          discounted: typeof v.discounted === 'number' ? v.discounted : 0,
          addons: Array.isArray(v.addons) ? v.addons : [],
          isOutOfStock: !!v.isOutOfStock
        }));

        // Find the category that currently contains the food
        const currentCategory = restaurant.categories.find(cat =>
          cat.foods.id(foodId)
        );

        if (!currentCategory) {
          throw new Error('Food not found for edit');
        }

        // If category changed, remove from old and push to new
        if (!currentCategory._id.equals(categoryId)) {
          // remove from previous category
          currentCategory.foods.id(foodId).remove();
          await restaurant.save();

          // add to new category with updated payload
          const food = new Food({
            title,
            description,
            image,
            variations,
            subCategory: subCategory || null,
            isActive: typeof isActive === 'boolean' ? isActive : true,
            isOutOfStock: !!isOutOfStock
          });

          await Restaurant.updateOne(
            { _id: restId, 'categories._id': categoryId },
            { $push: { 'categories.$.foods': food } }
          );

          const latestRest = await Restaurant.findOne({ _id: restId });
          return transformRestaurant(latestRest);
        }

        // Category unchanged: update in place with only provided fields
        const foodDoc = restaurant.categories.id(categoryId).foods.id(foodId);
        if (!foodDoc) {
          throw new Error('Category Food error');
        }

        const updatePayload = {};
        if (typeof title !== 'undefined') updatePayload.title = title;
        if (typeof description !== 'undefined') updatePayload.description = description;
        if (typeof image !== 'undefined') updatePayload.image = image;
        if (typeof subCategory !== 'undefined') updatePayload.subCategory = subCategory || null;
        if (typeof isActive !== 'undefined') updatePayload.isActive = !!isActive;
        if (typeof isOutOfStock !== 'undefined') updatePayload.isOutOfStock = !!isOutOfStock;
        if (variationsInput && Array.isArray(variationsInput)) updatePayload.variations = variations;

        foodDoc.set(updatePayload);
        const result = await restaurant.save();
        return transformRestaurant(result);
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateFoodOutOfStock: async (_, { id, restaurant, categoryId }) => {
      try {
        const rest = await Restaurant.findOne({ _id: restaurant });
        if (!rest) throw new Error('Restaurant not found');

        const cat = rest.categories.id(categoryId);
        if (!cat) throw new Error('Category not found');

        const foodDoc = cat.foods.id(id);
        if (!foodDoc) throw new Error('Food not found');

        foodDoc.isOutOfStock = !foodDoc.isOutOfStock;
        await rest.save();
        return true;
      } catch (err) {
        console.error('updateFoodOutOfStock error:', err);
        throw err;
      }
    },
    deleteFood: async(_, { id, restaurant, categoryId }, context) => {
      console.log('deleteFood')
      try {
        const restaurants = await Restaurant.findOne({ _id: restaurant })
        restaurants.categories.id(categoryId).foods.id(id).remove()
        const result = await restaurants.save()
        return transformRestaurant(result)
      } catch (err) {
        throw err
      }
    }
  }
}
