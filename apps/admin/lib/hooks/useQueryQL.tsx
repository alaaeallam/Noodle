//apps/admin/lib/hooks/useQueryQL.tsx
import {
  ApolloError,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  useQuery,
} from '@apollo/client';
import { WatchQueryFetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { retryQuery } from '../utils/methods';

export const useQueryGQL = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode,
  variables: TVariables,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    pollInterval?: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    retry?: number;
    retryDelayMs?: number;
    onCompleted?: (data: TData) => void;
    onError?: (error: ApolloError) => void;
  } = {}
) => {
  const {
    enabled = true,
    debounceMs = 500,
    pollInterval,
    fetchPolicy,
    retry = 3,
    retryDelayMs = 1000,
    onCompleted,
    onError,
  } = options;

  // ✅ Apollo-safe wrapper for callbacks (delays side-effects)
  const safeOnCompleted = (data: TData) => {
    if (!onCompleted) return;
    queueMicrotask(() => {
      try {
        onCompleted(data);
      } catch (err) {
        console.error('[useQueryGQL:onCompleted]', err);
      }
    });
  };

  const safeOnError = (error: ApolloError) => {
    if (!onError) return;
    queueMicrotask(() => {
      try {
        onError(error);
      } catch (err) {
        console.error('[useQueryGQL:onError]', err);
      }
    });
  };

  const { data, error, loading, refetch } = useQuery<TData, TVariables>(query, {
    variables,
    skip: !enabled,
    fetchPolicy,
    pollInterval,
    onCompleted: safeOnCompleted,
    onError: safeOnError,
  });

  const [isRefetching, setIsRefetching] = useState(false);

  const debouncedRefetch = useCallback(
    debounce(async (vars?: Partial<TVariables>) => {
      setIsRefetching(true);
      try {
        const result = await retryQuery(
          () => refetch(vars as TVariables | undefined),
          retry,
          retryDelayMs
        );
        return result;
      } finally {
        setIsRefetching(false);
      }
    }, debounceMs),
    [refetch, debounceMs, retry, retryDelayMs]
  );

  const handleRefetch = async () => {
    if (enabled) {
      await debouncedRefetch();
    }
  };

  return {
    data,
    error,
    loading: loading || isRefetching,
    refetch: handleRefetch,
    isError: !!error,
    isSuccess: !!data,
  };
};