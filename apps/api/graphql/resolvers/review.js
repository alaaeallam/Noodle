const Review = require('../../models/review')
const Order = require('../../models/order')
const { transformReview, transformOrder, populateReviewsDetail } = require('./merge')
const Restaurant = require('../../models/restaurant')
const { requireRestaurantAccess } = require('../../helpers/guards')
module.exports = {
  Query: {
    // Admin/vendor-facing: a single restaurant's own Ratings page
    reviews: async(_, args, { req }) => {
      console.log('reviews')
      try {
        await requireRestaurantAccess(req, args.restaurant, Restaurant)
        const reviews = await Review.find({ restaurant: args.restaurant, isActive: true })
        return reviews.map(review => {
          return transformReview(review)
        })
      } catch (err) {
        throw err
      }
    },
    // Public, customer-facing: a restaurant's review list + average rating,
    // shown pre-login while browsing a restaurant's menu (apps/app).
    reviewsByRestaurant: async(_, args, context) => {
      console.log('reviewsByRestaurant')
      try {
        return await populateReviewsDetail(args.restaurant)
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    reviewOrder: async(_, args, { req, res }) => {
      console.log('reviewOrder')
      if (!req.isAuth) {
        throw new Error('Unauthenticated')
      }
      try {
        const order = await Order.findById(args.reviewInput.order)
        const restaurant = await Restaurant.findById(order.restaurant)
        const review = new Review({
          order: args.reviewInput.order,
          rating: args.reviewInput.rating,
          restaurant: restaurant.id,
          description: args.reviewInput.description
        })
        const result = await review.save()
        await Order.findOneAndUpdate(
          { _id: args.reviewInput.order },
          { review: result.id }
        ).setOptions({ useFindAndModify: false })
        const updatedOrder = await Order.findById(args.reviewInput.order)

        return transformOrder(updatedOrder)
      } catch (err) {
        throw err
      }
    }
  }
}
