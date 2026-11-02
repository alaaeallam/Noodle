// Apollo
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  Operation,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error"; // Import onError utility
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";

// GQL
import { createClient } from "graphql-ws";

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const WS_SERVER_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL;

  const cache = new InMemoryCache();

  const httpLink = createHttpLink({
    uri: `${SERVER_URL}graphql`,
    // useGETForQueries: true, 
  });

  // Subscriptions only make sense in the browser - creating the client
  // during SSR throws, since there's no live connection to make there.
  // retryAttempts: Infinity matches the old client's reconnect:true.
  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: `${WS_SERVER_URL}graphql`,
            retryAttempts: Infinity,
            shouldRetry: () => true,
          })
        )
      : null;

  // Error Handling Link using ApolloLink's onError (for network errors)
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      console.error("Network Error:", networkError);
    }

    if (graphQLErrors) {
      (graphQLErrors || [])?.forEach((error) => {
        console.error("GraphQL Error:", error?.message);
        if (error.extensions?.code === "UNAUTHENTICATED") {
          if (typeof window !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }
        }
      });
    }
  });

  const request = async (operation: Operation): Promise<void> => {
    const token = localStorage.getItem("token");
    // Only Authorization: the API ignores the stock userId/isAuth/
    // X-Client-Type headers, and its CORS allowlist (Content-Type,
    // Authorization) rejects the preflight if they're sent.
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // Request Link
  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: { unsubscribe: () => void } | undefined;
        Promise.resolve(operation)
          .then((oper) => request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));

        return () => {
          if (handle) handle.unsubscribe();
        };
      })
  );

  // Terminating Link for split between HTTP and WebSocket
  const terminatingLink = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, requestLink, terminatingLink]),
    cache,
    connectToDevTools: true,
  });

  return client;
};
