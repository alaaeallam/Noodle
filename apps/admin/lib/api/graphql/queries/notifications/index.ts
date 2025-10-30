// apps/admin/lib/api/graphql/queries/notifications/index.ts
import { gql } from '@apollo/client';

// 🟢 Your backend (current schema) does NOT have `notifications` or `webNotifications`
// so we expose only a dummy query here to avoid 400s from any component that imports it.

// If some components still import GET_NOTIFICATIONS / GET_WEB_NOTIFICATIONS,
// give them a tiny always-empty query instead of the real one.

export const GET_NOTIFICATIONS = gql`
  query GetNotificationsDummy {
    # server has no notifications field – return nothing
    __typename
  }
`;

export const GET_WEB_NOTIFICATIONS = gql`
  query GetWebNotificationsDummy {
    # server has no webNotifications field – return nothing
    __typename
  }
`;