// apps/admin/app/layout.tsx
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
import Providers from './providers';
import React from 'react';
import { Baloo_Bhaijaan_2, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';

const displayFont = Baloo_Bhaijaan_2({
  subsets: ['arabic', 'latin'],
  // Only weight 700 is ever actually used (KPI values, buttons) — 600/800
  // were dead weight, confirmed via grep across every font-display call site.
  weight: ['700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  // 700 added so `font-bold` body text (19 call sites) renders with a real
  // bold file instead of the browser synthesizing a fake bold from 600.
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const RTL_LOCALES = new Set(['ar', 'he']);

export const metadata = {
  title: 'Enatega Admin Dashboard',
  icons: { icon: '/favicon.png' },
};

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
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