// apps/admin/lib/api/graphql/mutations/authentication/index.ts
import { gql } from '@apollo/client';

export const OWNER_LOGIN = gql`
  mutation ownerLogin($email: String!, $password: String!) {
    ownerLogin(email: $email, password: $password) {
      userId
      token
      email
      userType
      # 🧩 These fields are commented temporarily because
      # the current GraphQL schema doesn't expose them.
      # Uncomment them once the backend type OwnerAuthData supports them.
      #
      # restaurants {
      #   _id
      #   orderId
      #   name
      #   image
      #   address
      # }
      # permissions
      # userTypeId
      # image
      # name
    }
  }
`;