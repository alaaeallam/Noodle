'use client';
import type { ReactNode } from 'react';
//apps/admin/app/(localized)/(protected)/(other-users)/admin/store/layout.tsx
// HOC
import RESTAURANT_GUARD from '@/lib/hoc/RESTAURANT_GUARD';
// Layout
import { RestaurantLayoutProvider } from '@/lib/context/restaurant/layout-restaurant.context';
import RestaurantLayout from '@/lib/ui/layouts/protected/restaurant';
import { ProfileProvider } from '@/lib/context/restaurant/profile.context';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const ProtectedLayout = RESTAURANT_GUARD(
    ({ children }: { children: ReactNode }) => {
      return <RestaurantLayout>{children}</RestaurantLayout>;
    }
  );

  return (
    <ProtectedLayout>
      <RestaurantLayoutProvider>
        <ProfileProvider>{children}</ProfileProvider>
      </RestaurantLayoutProvider>
    </ProtectedLayout>
  );
}
