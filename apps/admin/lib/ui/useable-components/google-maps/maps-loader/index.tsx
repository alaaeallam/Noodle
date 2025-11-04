// apps/admin/lib/ui/useable-components/google-maps/maps-loader/index.tsx
'use client';

import { useContext } from 'react';
import { GoogleMapsContext } from '@/lib/context/global/google-maps.context';
import CustomLoader from '../../custom-progress-indicator';

export const GoogleMapsLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isLoaded } = useContext(GoogleMapsContext);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <CustomLoader />
      </div>
    );
  }
  return <>{children}</>;
};