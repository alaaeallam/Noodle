import { gql } from '@apollo/client';

export const PROFILE = gql`
  query profile {
    profile {
      _id
      email
      userType
      # add more fields later if the server exposes them
      # image
      # name
      # restaurants { _id name }
    }
  }
`;