import { gql } from "@apollo/client";

export const RELATED_ITEMS = gql`
  query RelatedItems($itemId: String!, $restaurantId: String!) {
    relatedItems(itemId: $itemId, restaurantId: $restaurantId)
  }
`;

export const FOOD = gql`
  fragment FoodItem on Food {
    _id
    title
    image
    description
    subCategory
    isOutOfStock
    variations {
      _id
      title
      price
      discounted
      addons
    }
  }
`;

export const RESTAURANTS_FRAGMENT = gql`
  fragment RestaurantPreviewFields on Restaurant {
    _id
    name
    image
    logo
    slug
    shopType
    deliveryTime
    location {
      coordinates
    }
    reviewData {
      ratings
      total
    }
    cuisines
    openingTimes {
      day
      times {
        startTime
        endTime
      }
    }
    isAvailable
    isActive
  }
`;

export const NEAR_BY_RESTAURANTS_PREVIEW = gql`
  ${RESTAURANTS_FRAGMENT}
  query Restaurants($latitude: Float, $longitude: Float, $shopType: String) {
    nearByRestaurantsPreview(
      latitude: $latitude
      longitude: $longitude
      shopType: $shopType
    ) {
      restaurants {
        ...RestaurantPreviewFields
      }
    }
  }
`;

export const GET_RESTAURANT_BY_ID_SLUG = gql`
  query RestaurantByIdAndSlug($id: String, $slug: String) {
    restaurant(id: $id, slug: $slug) {
      _id
      orderId
      orderPrefix
      isActive
      name
      image
      slug
      username
      phone
      shopType
      address
      location {
        coordinates
      }
      deliveryTime
      minimumOrder
      tax
      stripeDetailsSubmitted
      reviewData {
        total
        ratings
        reviews {
          _id
          order {
            user {
              _id
              name
              email
            }
          }
          rating
          description
          createdAt
        }
      }
      categories {
        _id
        title
        foods {
          _id
          title
          image
          description
          isOutOfStock
          subCategory
          variations {
            _id
            title
            price
            discounted
            addons
            isOutOfStock
          }
        }
      }
      options {
        _id
        title
        description
        price
      }
      addons {
        _id
        options
        title
        description
        quantityMinimum
        quantityMaximum
      }
      zone {
        _id
        title
        tax
      }
      rating
      isAvailable
      openingTimes {
        day
        times {
          startTime
          endTime
        }
      }
    }
  }
`;

export const GET_REVIEWS_BY_RESTAURANT = gql`
  query GetReviewsByRestaurant($restaurant: String!) {
    reviewsByRestaurant(restaurant: $restaurant) {
      reviews {
        _id
        rating
        description
        isActive
        createdAt
        updatedAt
        order {
          _id
          user {
            _id
            name
            email
          }
        }
        restaurant {
          _id
          name
        }
      }
      ratings
      total
    }
  }
`;

export const GET_POPULAR_SUB_CATEGORIES_LIST = gql`
  query PopularItems($restaurantId: String!) {
    popularItems(restaurantId: $restaurantId) {
      id
      count
    }
  }
`;

export const GET_SUB_CATEGORIES = gql`
  query subCategories {
    subCategories {
      _id
      title
      parentCategoryId
    }
  }
`;

// Every BTB branch (not just ones delivering to the current address), for the
// branch switcher - matches the mobile app's ALL_STORES.
export const ALL_BRANCHES = gql`
  query AllBranches {
    restaurantList {
      _id
      name
      slug
      address
      shopType
      isActive
      location {
        coordinates
      }
    }
  }
`;
