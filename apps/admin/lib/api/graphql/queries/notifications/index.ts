import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      _id
      title
      body
      createdAt
    }
  }
`;

// 🟢 Backend has no `webNotifications` field yet, so this stays a dummy query
// to avoid 400s from any component that imports it.
export const GET_WEB_NOTIFICATIONS = gql`
  query GetWebNotificationsDummy {
    # server has no webNotifications field – return nothing
    __typename
  }
`;