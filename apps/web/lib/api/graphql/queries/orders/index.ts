import { gql } from "@apollo/client";

export const ORDERS = gql`
  query Orders($offset: Int) {
    orders(offset: $offset) {
      _id
      orderId
      restaurant {
        _id
        name
        slug
        image
        address
        location {
          coordinates
        }
      }
      deliveryAddress {
        location {
          coordinates
        }
        deliveryAddress
        id
      }
      items {
        _id
        title
        food
        description
        quantity
        image
        variation {
          _id
          title
          price
          discounted
        }
        addons {
          _id
          options {
            _id
            title
            description
            price
          }
          title
          description
          quantityMinimum
          quantityMaximum
        }
      }
      user {
        _id
        name
        phone
      }
      rider {
        _id
        name
        phone
      }
      review {
        _id
        rating
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      paymentStatus
      tipping
      taxationAmount
      createdAt
      completionTime
      preparationTime
      orderDate
      expectedTime
      isPickedUp
      deliveryCharges
      acceptedAt
      pickedAt
      deliveredAt
      cancelledAt
      assignedAt
      instructions
    }
  }
`;
