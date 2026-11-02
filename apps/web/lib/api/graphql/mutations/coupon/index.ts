import { gql } from "@apollo/client";

export const VERIFY_COUPON = gql`
  mutation Coupon($coupon: String! $restaurantId: ID!) {
    coupon(coupon: $coupon restaurantId: $restaurantId) {
      _id
      title
      discount
      enabled
    }
  }
`;
