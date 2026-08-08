const Option = require('../../models/option')
const Restaurant = require('../../models/restaurant')
const { transformOption, transformRestaurant } = require('./merge')
const { requireRestaurantAccess } = require('../../helpers/guards')

module.exports = {
  Query: {
    options: async() => {
      console.log('options')
      try {
        const options = await Option.find({ isActive: true })
        return options.map(option => {
          return transformOption(option)
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {
    createOptions: async(_, args, { req }) => {
      console.log('createOption')
      try {
        await requireRestaurantAccess(req, args.optionInput.restaurant, Restaurant)
        const options = args.optionInput.options
        const restaurant = await Restaurant.findById(
          args.optionInput.restaurant
        )

        options.map(option => {
          restaurant.options.push(new Option(option))
        })

        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    editOption: async(_, args, { req }) => {
      console.log('editOption')
      try {
        await requireRestaurantAccess(req, args.optionInput.restaurant, Restaurant)
        const options = args.optionInput.options
        const restaurant = await Restaurant.findById(
          args.optionInput.restaurant
        )
        restaurant.options.id(options._id).set({
          title: options.title,
          description: options.description,
          price: options.price
        })
        const result = await restaurant.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    deleteOption: async(_, { id, restaurant }, { req }) => {
      console.log('deleteOption')
      try {
        await requireRestaurantAccess(req, restaurant, Restaurant)
        const restaurants = await Restaurant.findById(restaurant)
        restaurants.options.id(id).remove()
        restaurants.addons = restaurants.addons.map(addon => {
          addon.options = addon.options.filter(option => option !== id)
          return addon
        })

        const result = await restaurants.save()
        return transformRestaurant(result)
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  }
}
