// apps/admin/lib/api/graphql/queries/me.ts
import { gql } from '@apollo/client';

// Alias the backend field to keep the old "profile" shape in the UI
export const PROFILE = gql`
  query profile {
    profile: vendorProfile {
      _id
      email
      firstName
      lastName
      phoneNumber
      image
      userType
    }
  }
`;

// Optional: also export the vendor-named version for future callers
export const VENDOR_PROFILE = PROFILE;