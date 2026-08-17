import { gql } from "@apollo/client";

export const GET_STORE_MENU = gql`
  query StoreMenu($restaurantId: String) {
    restaurant(id: $restaurantId) {
      _id
      name
      tax
      categories {
        _id
        title
        foods {
          _id
          title
          description
          image
          isOutOfStock
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
      addons {
        _id
        title
        description
        quantityMinimum
        quantityMaximum
        options
        defaultOptions
      }
      options {
        _id
        title
        description
        price
      }
    }
  }
`;
