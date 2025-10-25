'use client';

import * as React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ApolloProvider as ApolloProviderImpl } from '@apollo/client';
import { apolloClient } from '../lib/apolloClient';

type ProvidersProps = {
  locale: string;                // ✅ add this
  messages: Record<string, any>;
  children: React.ReactNode;
};

// TS note: see your comment about casting
const ApolloProvider =
  ApolloProviderImpl as unknown as React.ComponentType<{
    client: any;
    children?: React.ReactNode;
  }>;

export default function Providers({ locale, messages, children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {/* ✅ provide locale explicitly */}
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </ApolloProvider>
  );
}