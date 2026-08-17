import { gql } from "@apollo/client";

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($orderId: ID!, $messageInput: ChatMessageInput!) {
    sendChatMessage(message: $messageInput, orderId: $orderId) {
      success
      message
      data {
        id
        message
        user {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const MARK_ORDER_CHAT_READ_BY_RIDER = gql`
  mutation MarkOrderChatReadByRider($orderId: ID!) {
    markOrderChatReadByRider(orderId: $orderId)
  }
`;
