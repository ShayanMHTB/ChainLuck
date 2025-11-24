// nextjs/src/app/layout.tsx

import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/sonner';
import { APP_CONFIG } from '@/data/constants';

import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
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
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
