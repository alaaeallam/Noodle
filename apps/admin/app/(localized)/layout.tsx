'use client';

import type { ReactNode } from 'react';

// Core
import { ApolloProvider } from '@apollo/client';

// Prime React
import { PrimeReactProvider } from 'primereact/api';

// Providers
import { LayoutProvider } from '@/lib/context/global/layout.context';
import { SidebarProvider } from '@/lib/context/global/sidebar.context';
import { UserProvider } from '@/lib/context/global/user-context';

// Context
import { ConfigurationProvider } from '@/lib/context/global/configuration.context';
import { ToastProvider } from '@/lib/context/global/toast.context';

// Configuration
import { FontawesomeConfig } from '@/lib/config';

// Styles

import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import './global.css';

// Apollo
import { useSetupApollo } from '@/lib/hooks/useSetApollo';

export default function LocalizedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Apollo
  const client = useSetupApollo();

  // PrimeReact config
  const value = { ripple: true } as const;

  // NOTE: This is a nested layout (under /app/(localized)).
  // Do NOT render <html> or <body> here — root layout already does that.
  return (
    <PrimeReactProvider value={value}>
      <ApolloProvider client={client}>
        <ConfigurationProvider>
          <LayoutProvider>
            <UserProvider>
              <SidebarProvider>
                {/* Keep FontAwesome config once at layout mount */}
                <FontawesomeConfig />
                <ToastProvider>{children}</ToastProvider>
              </SidebarProvider>
            </UserProvider>
          </LayoutProvider>
        </ConfigurationProvider>
      </ApolloProvider>
    </PrimeReactProvider>
  );
}
