'use client';

import {
  DocumentNode,
  OperationVariables,
  useLazyQuery,
} from '@apollo/client';

import { WatchQueryFetchPolicy } from '@apollo/client/core/watchQueryOptions';
import { debounce as lodashDebounce } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';

import { retryQuery } from '../utils/methods/global';
/**
 * useLazyQueryQL
 * - No longer passes `variables` to useLazyQuery options (Apollo 3.14 requirement)
 * - No longer passes `onCompleted` to useLazyQuery (uses derived state via useEffect)
 * - Keeps debounce + retry + optional auto-execute with initial variables
 */
export function useLazyQueryQL<
  TData = any,
  TVars extends OperationVariables = OperationVariables,
>(
  query: DocumentNode,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    retry?: number;
    retryDelayMs?: number;
    /**
     * Derived-state callback. Will be called from a useEffect
     * when `data` changes (Apollo’s recommended pattern).
     */
    onCompleted?: (data: TData) => void;
  } = {},
  /**
   * Back-compat: if you used to pass `variables` into the hook,
   * we keep this param as an *initial* auto-run. You can still
   * call `fetch(vars)` later as usual.
   */
  initialVariables?: TVars
) {
  const {
    enabled = true,
    debounceMs = 500,
    fetchPolicy,
    retry = 3,
    retryDelayMs = 1000,
    onCompleted,
  } = options;

  // DO NOT pass `variables` or `onCompleted` here (silences Apollo warnings)
  const [execute, result] = useLazyQuery<TData, TVars>(query, {
    fetchPolicy,
  });

  // Wrap execute with retry support
const executeWithRetry = useCallback(
  async (vars?: TVars) => {
    type ExecResult = Awaited<ReturnType<typeof execute>>;
    return retryQuery<ExecResult>(
      () => execute({ variables: vars }) as Promise<ExecResult>,
      retry,
      retryDelayMs
    );
  },
  [execute, retry, retryDelayMs]
);

  // Optional debounce
  const debouncedExecute = useMemo(() => {
    if (!debounceMs) return executeWithRetry;
    const d = lodashDebounce((v?: TVars) => executeWithRetry(v), debounceMs);
    return (v?: TVars) => d(v);
  }, [executeWithRetry, debounceMs]);

  // Public fetch function (respects `enabled`)
  const fetch = useCallback(
    async (vars?: TVars) => {
      if (!enabled) return;
      await debouncedExecute(vars);
    },
    [enabled, debouncedExecute]
  );

  // Derived-state pattern for onCompleted
  useEffect(() => {
    if (result.data && onCompleted) onCompleted(result.data as TData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data, onCompleted]);

  // Back-compat: auto-run once if initialVariables provided
  useEffect(() => {
    if (enabled && initialVariables) {
      // run without debounce on first mount for snappier UX
      executeWithRetry(initialVariables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // run once on mount (or when `enabled` flips true)

  return {
    data: result.data as TData | undefined,
    error: result.error,
    loading: result.loading,
    fetch,               // call like: fetch({ ...vars })
    isError: Boolean(result.error),
    isSuccess: Boolean(result.data),
  };
}

export default useLazyQueryQL;