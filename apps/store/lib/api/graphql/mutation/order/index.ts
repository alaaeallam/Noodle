import { gql } from "@apollo/client";

// Selection matches GET_ORDERS exactly - both write into the same
// normalized Order/Restaurant/Item cache entries, and Apollo's cache logs
// "Missing field" warnings when one operation's selection is a subset of
// another's for the same object.
const ORDER_FIELDS = `
  _id
  orderId
  restaurant {
    _id
    name
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
    details
    label
  }
  items {
    _id
    title
    description
    image
    quantity
    specialInstructions
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
      description
      title
      quantityMinimum
      quantityMaximum
    }
    isActive
    createdAt
    updatedAt
  }
  user {
    _id
    name
    phone
    email
  }
  paymentMethod
  paidAmount
  orderAmount
  orderStatus
  tipping
  taxationAmount
  status
  paymentStatus
  reason
  isActive
  createdAt
  orderDate
  pickedAt
  deliveryCharges
  isPickedUp
  isReadyToPickUp
  preparationTime
  acceptedAt
  isRinged
  instructions
  rider {
    _id
    name
    username
    available
  }
`;

export const ACCEPT_ORDER = gql`
  mutation AcceptOrder($_id: String!, $time: String) {
    acceptOrder(_id: $_id, time: $time) {
      ${ORDER_FIELDS}
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($_id: String!, $reason: String!) {
    cancelOrder(_id: $_id, reason: $reason) {
      ${ORDER_FIELDS}
    }
  }
`;

export const MUTATE_ORDER_RING = gql`
  mutation muteRing($orderId: String) {
    muteRing(orderId: $orderId)
  }
`;

export const PICK_UP_ORDER = gql`
  mutation OrderPickedUp($_id: String!) {
    orderPickedUp(_id: $_id) {
      ${ORDER_FIELDS}
    }
  }
`;

export const MARK_ORDER_READY_FOR_PICKUP = gql`
  mutation MarkOrderReadyForPickup($_id: String!) {
    markOrderReadyForPickup(_id: $_id) {
      ${ORDER_FIELDS}
    }
  }
`;
