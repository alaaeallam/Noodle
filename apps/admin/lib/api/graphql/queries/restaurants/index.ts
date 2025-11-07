import { gql } from '@apollo/client';

export const GET_RESTAURANTS_L = gql`
  query restaurants {
    restaurants {
      _id
    }
  }
`;

export const GET_RESTAURANTS_DROPDOWN = gql`
  query restaurants {
    restaurants {
      _id
      name
    }
  }
`;

export const GET_RESTAURANTS = gql`
  query restaurants {
    restaurants {
      _id
      name
      image
      orderPrefix
      slug
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      tax
      owner {
        _id
        email
        isActive
      }
      shopType
    }
  }
`;

export const GET_CLONED_RESTAURANTS = gql`
  query getClonedRestaurants {
    getClonedRestaurants {
      _id
      name
      image
      username
      orderPrefix
      slug
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      tax
      owner {
        _id
        email
        isActive
      }
      shopType
    }
  }
`;

export const GET_RESTAURANTS_BY_OWNER = gql`
  query RestaurantByOwner($id: String) {
    restaurantByOwner(id: $id) {
      _id
      email
      userType
      restaurants {
        _id
        orderId
        orderPrefix
        name
        slug
        image
        address
        isActive
        deliveryTime
        minimumOrder
        username
        password
        location {
          coordinates
        }
        deliveryBounds {
          coordinates
        }
        openingTimes {
          day
          times {
            startTime
            endTime
          }
        }
        shopType
      }
    }
  }
`;

export const GET_RESTAURANT_DELIVERY_ZONE_INFO = gql`
  query RestaurantDeliveryZoneInfo($id: ID!) {
    getRestaurantDeliveryZoneInfo(id: $id) {
      boundType
      deliveryBounds { coordinates }
      location { coordinates }
      circleBounds { radius }
      address
    }
  }
`;

export const GET_RESTAURANT_PROFILE = gql`
  query Restaurant($id: String) {
    restaurant(id: $id) {
      _id
      name
      image
      address
      username
      deliveryTime
      minimumOrder
      tax
      shopType
      cuisines
      orderPrefix
      orderId
      isActive
      isAvailable
      location {
        coordinates
      }
      deliveryBounds {
        coordinates
      }
      openingTimes {
        day
        times {
          startTime
          endTime
        }
      }
      owner {
        _id
        email
      }
    }
  }
`;

export const GET_RESTAURANTS_PAGINATED = gql`
  query restaurantsPaginated($page: Int, $limit: Int, $search: String) {
    restaurantsPaginated(page: $page, limit: $limit, search: $search) {
      data {
        _id
        name
        image
        orderPrefix
        slug
        address
        deliveryTime
        minimumOrder
        isActive
        commissionRate
        username
        tax
        owner {
          _id
          email
          isActive
        }
        shopType
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const GET_CLONED_RESTAURANTS_PAGINATED = gql`
  query getClonedRestaurantsPaginated(
    $page: Int
    $limit: Int
    $search: String
  ) {
    getClonedRestaurantsPaginated(page: $page, limit: $limit, search: $search) {
      data {
        _id
        name
        image
        username
        orderPrefix
        slug
        address
        deliveryTime
        minimumOrder
        isActive
        commissionRate
        username
        tax
        owner {
          _id
          email
          isActive
        }
        shopType
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;


export const GET_RESTAURANT_FOODS_LIST = gql`
  query Restaurant($id: String) {
    restaurant(id: $id) {
      _id
      categories {
        _id
        title
        foods {
          _id
          title
          description
          subCategory
          image
          isActive
          isOutOfStock
          variations {
            _id
            title
            price
            discounted
            addons
            isOutOfStock
          }
          createdAt
          updatedAt
        } 
        createdAt
        updatedAt
      }
    }
  }
`;