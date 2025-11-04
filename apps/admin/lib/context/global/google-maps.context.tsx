'use client';

import React, { createContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import type { IGoogleMapsContext, IGoogleMapsProviderProps } from '../../utils/interfaces';

export const GoogleMapsContext = createContext<IGoogleMapsContext>({ isLoaded: false });

export const GoogleMapsProvider: React.FC<IGoogleMapsProviderProps> = ({ apiKey, libraries, children }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries && libraries.length ? (libraries as any) : (['places'] as any),
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};