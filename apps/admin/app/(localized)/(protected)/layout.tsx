'use client';

import React from 'react';
import { GoogleMapsProvider } from '@/lib/context/global/google-maps.context';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import GlobalLayout from '@/lib/ui/layouts/protected/global';
import type { Libraries } from '@react-google-maps/api';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { GOOGLE_MAPS_KEY, LIBRARIES } = useConfiguration();

  // Fallback to .env if config is empty
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const apiKey = (GOOGLE_MAPS_KEY && String(GOOGLE_MAPS_KEY)) || envKey;

  // Ensure `Libraries` (string literal union[]) for the provider
  const libs: Libraries =
    Array.isArray(LIBRARIES) && LIBRARIES.length > 0
      ? (LIBRARIES as Libraries)
      : (['places'] as Libraries);

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[Maps] No API key found in config or env; rendering without maps.');
    }
    return <GlobalLayout>{children}</GlobalLayout>;
  }

  return (
    <GoogleMapsProvider apiKey={apiKey} libraries={libs}>
      <GlobalLayout>{children}</GlobalLayout>
    </GoogleMapsProvider>
  );
}