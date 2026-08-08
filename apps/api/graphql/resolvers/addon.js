const Addon = require('../../models/addon')
const Restaurant = require('../../models/restaurant')
const { transformAddon, transformRestaurant } = require('./merge')
const { requireRestaurantAccess } = require('../../helpers/guards')

module.exports = {
  Query: {
    addons: async() => {
      console.log('addons')
      try {
        const addons = await Addon.find({ isActive: true })
        return addons.map(addon => {
          return transformAddon(addon)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createAddons: async(_, args, { req }) => {
      console.log('createAddon')
      try {
        await requireRestaurantAccess(req, args.addonInput.restaurant, Restaurant)
        const restaurant = await Restaurant.findById(args.addonInput.restaurant)
        const addons = args.addonInput.addons

        await addons.map(addon => {
          restaurant.addons.push(new Addon(addon))
        })
        const resultRestaurant = await restaurant.save()
        return await transformRestaurant(resultRestaurant)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editAddon: async(_, args, { req }) => {
      console.log('editAddon')
      try {
        await requireRestaurantAccess(req, args.addonInput.restaurant, Restaurant)
        const restaurant = await Restaurant.findById(args.addonInput.restaurant)

        const addons = args.addonInput.addons
        restaurant.addons.id(args.addonInput.addons._id).set({
          title: addons.title,
          description: addons.description,
          options: addons.options,
          defaultOptions: addons.defaultOptions,
          quantityMinimum: addons.quantityMinimum,
          quantityMaximum: addons.quantityMaximum
        })
        await restaurant.save()
        return transformRestaurant(restaurant)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteAddon: async(_, { id, restaurant }, { req }) => {
      console.log('deleteAddon')
      try {
        await requireRestaurantAccess(req, restaurant, Restaurant)
        const restaurants = await Restaurant.findById(restaurant)
        await restaurants.addons.id(id).remove()
        restaurants.categories = restaurants.categories.map(category => {
          category.foods = category.foods.map(food => {
            food.variations = food.variations.map(variation => {
              variation.addons = variation.addons.filter(e => e !== id)
              return variation
            })
            return food
          })
          return category
        })

        await restaurants.save()
        return transformRestaurant(restaurants)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
