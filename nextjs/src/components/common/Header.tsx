// nextjs/src/components/common/Header.tsx

'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Moon,
  Sun,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { APP_CONFIG } from '@/data/constants';
import { useWallet } from '@/components/providers/WalletProvider';
import { LanguageSelector } from '@/components/common/LanguageSelector';

export function Header() {
  const { setTheme } = useTheme();
  const t = useTranslations();
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    disconnect,
    switchChain,
    getExplorerUrl,
    chainInfo,
    error,
    connect, // This now opens WalletConnect modal
  } = useWallet();

  const [copied, setCopied] = useState(false);

  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInExplorer = () => {
    if (address && chainInfo.blockExplorer) {
      window.open(`${chainInfo.blockExplorer}/address/${address}`, '_blank');
    }
  };

  const handleNetworkSwitch = () => {
    // Switch between testnet and mainnet
    const targetChain = chainInfo.chain?.testnet ? 137 : 80001; // Polygon or Mumbai
    switchChain(targetChain);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">🎲</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                {APP_CONFIG.APP_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('nav.about')}
              </Link>
              <Link
                href="/stats"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t('nav.stats')}
              </Link>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            {isConnected && chainInfo.chain && (
              <div className="hidden sm:flex items-center space-x-2">
                <Badge
                  variant={chainInfo.chain.testnet ? 'outline' : 'secondary'}
                  className="text-xs"
                >
                  {chainInfo.chain.name}
                </Badge>
              </div>
            )}

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                LIVE
              </span>
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Connection */}
            <div className="flex items-center">
              {isConnected && address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">
                        {formatWalletAddress(address)}
                      </span>
                      <span className="sm:hidden">Wallet</span>
                      <Badge
                        variant="secondary"
                        className="ml-2 hidden sm:inline"
                      >
                        {t('auth.connected')}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {/* Wallet Info */}
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Wallet Address
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={copyAddress}
                          >
                            {copied ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={openInExplorer}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground font-mono">
                        {formatWalletAddress(address)}
                      </div>

                      {/* Balance */}
                      {balance !== undefined && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {t('lottery.yourBalance')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatBalance(balance)}
                          </div>
                        </div>
                      )}

                      {/* Network Info */}
                      {chainInfo.chain && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Network</div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                chainInfo.chain.testnet
                                  ? 'outline'
                                  : 'secondary'
                              }
                            >
                              {chainInfo.chain.name}
                            </Badge>
                            {chainInfo.chain.testnet && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNetworkSwitch}
                                className="text-xs"
                              >
                                Switch to Mainnet
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={disconnect}
                      className="text-red-600 focus:text-red-600"
                    >
                      {t('auth.disconnect')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="relative">
                  <Button
                    onClick={connect} // This opens WalletConnect modal
                    disabled={isConnecting}
                    size="sm"
                    className="h-9"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">
                      {isConnecting
                        ? t('auth.connecting')
                        : t('auth.connectWallet')}
                    </span>
                    <span className="sm:hidden">
                      {isConnecting
                        ? t('auth.connecting')
                        : t('auth.connectWallet')}
                    </span>
                  </Button>

                  {/* Connection Error */}
                  {error && (
                    <div className="absolute top-full right-0 mt-2 z-50">
                      <Alert variant="destructive" className="w-72">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                    <span className="sr-only">Open menu</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="w-full">
                      {t('nav.home')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="w-full">
                      {t('nav.about')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/stats" className="w-full">
                      {t('nav.stats')}
                    </Link>
                  </DropdownMenuItem>
                  {isConnected && chainInfo.chain && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        Network: {chainInfo.chain.name}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
