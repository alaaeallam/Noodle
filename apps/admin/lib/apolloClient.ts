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
  // cookies not needed for bearer flow; keep default unless you use them
  // credentials: 'same-origin',
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

const errorLink = onError(({ graphQLErrors, networkError }) => {
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