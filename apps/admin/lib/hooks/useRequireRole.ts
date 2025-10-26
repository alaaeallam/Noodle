'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { PROFILE } from '../api/graphql/queries/me';

type Role = 'ADMIN' | 'VENDOR' | 'USER' | 'RIDER';

export function useRequireRole(allowed: Role[]) {
  const router = useRouter();
  const { data, loading, error } = useQuery(PROFILE, { fetchPolicy: 'cache-first' });

  useEffect(() => {
    if (loading) return;
    if (error) {
      // unauthenticated → login
      router.replace('/authentication/login');
      return;
    }
    const role: Role | undefined = data?.profile?.userType;
    if (!role || !allowed.includes(role)) {
      // authenticated but wrong role → send to a safe home
      router.replace('/'); // or '/dashboard'
    }
  }, [loading, error, data, router, allowed]);

  return { loading, role: data?.profile?.userType as Role | undefined };
}