// nextjs/src/app/[lang]/layout.tsx

import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/sonner';
import { APP_CONFIG } from '@/data/constants';
import { routing } from '@/i18n/routing';

import '../globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['500', '700'],
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.APP_NAME,
    template: `%s | ${APP_CONFIG.APP_NAME}`,
  },
  description: APP_CONFIG.APP_DESCRIPTION,
  keywords: [
    'lottery',
    'web3',
    'blockchain',
    'crypto',
    'chainlink',
    'polygon',
    'defi',
    'gambling',
    'randomness',
  ],
  authors: [{ name: 'ChainLuck Team' }],
  creator: 'ChainLuck Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_CONFIG.SITE_URL,
    title: APP_CONFIG.APP_NAME,
    description: APP_CONFIG.APP_DESCRIPTION,
    siteName: APP_CONFIG.APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.APP_NAME,
    description: APP_CONFIG.APP_DESCRIPTION,
    creator: APP_CONFIG.TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens when ready
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // In Next.js 15, params must be awaited
  const { lang } = await params;

  // Validate that the incoming `lang` parameter is valid
  if (!routing.locales.includes(lang as any)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages({ locale: lang });

  return (
    <html
      lang={lang}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body
        className={`
          ${jetbrainsMono.variable}
          ${orbitron.variable}
          antialiased
          min-h-screen
          flex
          flex-col
        `}
      >
        <NextIntlClientProvider messages={messages} locale={lang}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <UserProvider>
                <Header />

                <main className="flex-1">{children}</main>

                <Footer />

                {/* Toast notifications */}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                  }}
                />
              </UserProvider>
            </WalletProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
