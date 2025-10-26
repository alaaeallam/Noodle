// apps/admin/lib/apolloClient.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { GRAPHQL_URL } from './config';
import { getToken, clearToken } from './auth/token';

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  // credentials: 'same-origin', // not needed for bearer flow
});

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ operation, graphQLErrors, networkError, response }) => {
  // 🔎 Log everything useful first (helps with 400 validation errors)
  if (graphQLErrors && graphQLErrors.length) {
    // Server returned GraphQL errors (often still HTTP 200)
    // eslint-disable-next-line no-console
    console.error(
      `[GraphQL errors] op=${operation?.operationName || '<anonymous>'}`,
      graphQLErrors
    );
  }

  if (networkError) {
    const n = networkError as any;
    // apollo-server uses 400 for validation errors; result?.errors will have details
    // eslint-disable-next-line no-console
    console.error(
      `[Network error] op=${operation?.operationName || '<anonymous>'} status=${n?.statusCode}`,
      n?.result || n
    );
  }

  // 🚧 auth handling stays as-is (clear token + redirect)
  const isAuthError =
    graphQLErrors?.some(
      (e) => e.message === 'Unauthenticated' || e.message === 'Forbidden'
    ) || (networkError as any)?.statusCode === 401;

  if (isAuthError) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.replace('/authentication/login');
    }
  }
});

// Compose: error -> auth -> http
const link: ApolloLink = from([errorLink, authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});