import { gql } from "@apollo/client";

export const PLACE_ORDER_POS = gql`
  mutation PlaceOrderPOS($orderInput: POSOrderInput!) {
    placeOrderPOS(orderInput: $orderInput) {
      _id
      orderId
      orderStatus
      orderAmount
    }
  }
`;
