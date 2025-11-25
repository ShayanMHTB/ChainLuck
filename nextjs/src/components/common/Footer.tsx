// nextjs/src/components/common/Footer.tsx

import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';
import { APP_CONFIG } from '@/data/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">🎲</span>
                </div>
                <span className="text-lg font-bold">{APP_CONFIG.APP_NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {APP_CONFIG.APP_DESCRIPTION}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Lottery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#faq"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link
                    href="/about#transparency"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Transparency
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social & Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href={`https://twitter.com/${APP_CONFIG.TWITTER_HANDLE.replace(
                    '@',
                    '',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="https://github.com/chainluck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a
                  href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>Fully On-Chain</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Chainlink VRF</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-xs text-muted-foreground">
              © {currentYear} {APP_CONFIG.APP_NAME}. All rights reserved.
            </div>

            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <span className="text-red-500">♥</span>
                <span>for Web3</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
