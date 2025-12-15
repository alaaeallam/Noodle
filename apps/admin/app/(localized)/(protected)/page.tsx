'use client';

// Core
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

// Context
import { SidebarContext } from '@/lib/context/global/sidebar.context';

// Interface & Types
import { ILoginResponse, ISidebarContextProps } from '@/lib/utils/interfaces';
import { onUseLocalStorage } from '@/lib/utils/methods';
import { APP_NAME } from '@/lib/utils/constants';
import { DEFAULT_ROUTES } from '@/lib/utils/constants/routes';

export default function RootPage() {
  // Context
  const { setSelectedItem } = useContext<ISidebarContextProps>(SidebarContext);

  // Hooks
  const router = useRouter();

  useEffect(() => {
    setSelectedItem({ screenName: 'Home' });

    const user = onUseLocalStorage('get', `user-${APP_NAME}`);
    if (!user) {
      router.replace('/authentication/login');
      return;
    }

    const userInfo: ILoginResponse = JSON.parse(user);

    // Normalize backend roles to frontend route keys
    const rawUserType = userInfo.userType as string;
    const normalizedUserType =
      rawUserType === 'SUPER_ADMIN' || rawUserType === 'OWNER'
        ? 'ADMIN'
        : rawUserType;

    const redirectUrl = DEFAULT_ROUTES[normalizedUserType as keyof typeof DEFAULT_ROUTES] ?? '/home';
    router.replace(redirectUrl);
  }, []);

  return null;
}