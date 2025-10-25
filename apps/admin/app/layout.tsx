// apps/admin/app/layout.tsx
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
import Providers from './providers';
import React from 'react';

export const metadata = {
  title: 'Enatega Admin Dashboard',
  icons: { icon: '/favicon.png' },
};

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "tjqxrz689j");`}
        </Script>
      </head>
      <body>
        {/* ✅ pass locale */}
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}