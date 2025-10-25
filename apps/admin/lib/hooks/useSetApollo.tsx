import { useConfiguration } from '@/lib/hooks/useConfiguration';
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  Operation,
  split,
} from '@apollo/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { onError } from '@apollo/client/link/error';
import { APP_NAME } from '../utils/constants';

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  // use your config hook only (don’t mix with process.env directly here)
  const { SERVER_URL, WS_SERVER_URL } = useConfiguration();

  const cache = new InMemoryCache();

  // HTTP endpoint MUST include /graphql when combined like this
  const httpLink = createHttpLink({
    uri: `${SERVER_URL}graphql`,
  });

  // WebSocket endpoint MUST include /graphql too
  const wsLink = new WebSocketLink(
    new SubscriptionClient(`${WS_SERVER_URL}graphql`, {
      reconnect: true,
      timeout: 30000,
      lazy: true,
    })
  );

  // Centralized error logging
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) console.error('Network Error:', networkError);
    if (graphQLErrors) graphQLErrors.forEach(err => console.error('GraphQL Error:', err.message));
  });

  // Attach Authorization header
  const request = async (operation: Operation): Promise<void> => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`user-${APP_NAME}`) : null;
    const token = raw ? JSON.parse(raw).token : '';
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
  };

  // Turn the async request() into a link
  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable(observer => {
        let sub:
          | {
              unsubscribe: () => void;
            }
          | undefined;

        Promise.resolve()
          .then(() => request(operation))
          .then(() => {
            sub = forward(operation).subscribe({
              next: v => observer.next(v),
              error: e => observer.error(e),
              complete: () => observer.complete(),
            });
          })
          .catch(e => observer.error(e));

        return () => {
          if (sub) sub.unsubscribe();
        };
      })
  );

  // Proper split: subscriptions → wsLink, everything else → httpLink
  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  // Final chain: errors → auth → (ws|http)
  const link = ApolloLink.from([errorLink, requestLink, splitLink]);

  const client = new ApolloClient({
    link,
    cache,
    devtools: {
      enabled: typeof window !== 'undefined' && process.env.NODE_ENV !== 'production',
    },
  });

  return client;
};