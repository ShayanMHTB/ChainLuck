// nextjs/src/components/providers/WalletProvider.tsx

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
  useChainId,
} from 'wagmi';
import { wagmiConfig, getChainInfo } from '@/lib/wagmi';
import { WalletState } from '@/types/lottery';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

interface WalletContextType extends WalletState {
  connect: () => void;
  disconnect: () => void;
  switchChain: (chainId: number) => void;
  getExplorerUrl: (hash: string) => string;
  chainInfo: ReturnType<typeof getChainInfo>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Inner component that uses Wagmi hooks
function WalletContextProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  console.log('🔍 Wallet Provider Debug:', {
    isConnected,
    address,
    chainId,
    chainHex: `0x${chainId.toString(16)}`,
  });

  // Get native token balance
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      enabled: !!address && typeof window !== 'undefined',
      refetchInterval: 30000,
    },
  });

  const chainInfo = getChainInfo(chainId);

  console.log('🌐 Chain Info Debug:', {
    chainInfo,
    detectedChain: chainInfo.chain?.name,
    isTestnet: chainInfo.chain?.testnet,
  });

  // Smart connect - automatically pick the best connector
  const handleConnect = () => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Check if we're in a wallet browser (injected wallet available)
      if (typeof window !== 'undefined' && window.ethereum) {
        // We're in a mobile wallet browser - use injected
        const injectedConnector = connectors.find((c) => c.id === 'injected');
        if (injectedConnector) {
          connect({ connector: injectedConnector });
          return;
        }
      }

      // Mobile browser - use WalletConnect for wallet selection
      const wcConnector = connectors.find((c) => c.id === 'walletConnect');
      if (wcConnector) {
        connect({ connector: wcConnector });
      }
    } else {
      // Desktop: Check for installed wallet extensions
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check for MetaMask specifically
        if (window.ethereum.isMetaMask) {
          const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
          if (metaMaskConnector) {
            connect({ connector: metaMaskConnector });
            return;
          }
        }

        // Check for Coinbase Wallet
        if (window.ethereum.isCoinbaseWallet) {
          const coinbaseConnector = connectors.find(
            (c) => c.id === 'coinbaseWallet',
          );
          if (coinbaseConnector) {
            connect({ connector: coinbaseConnector });
            return;
          }
        }

        // Generic injected wallet
        const injectedConnector = connectors.find((c) => c.id === 'injected');
        if (injectedConnector) {
          connect({ connector: injectedConnector });
          return;
        }
      }

      // Desktop fallback: Use WalletConnect for QR code
      const wcConnector = connectors.find((c) => c.id === 'walletConnect');
      if (wcConnector) {
        connect({ connector: wcConnector });
      }
    }
  };

  const handleSwitchChain = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
  };

  const getExplorerUrl = (hash: string): string => {
    const explorerUrl = chainInfo.blockExplorer;
    return `${explorerUrl}/tx/${hash}`;
  };

  // Simple balance calculation (you can improve this with real price feeds)
  const balanceInUSD = nativeBalance
    ? parseFloat(nativeBalance.formatted) * 2000 // Rough estimate
    : undefined;

  const walletState: WalletState = {
    isConnected,
    address,
    balance: balanceInUSD,
    isConnecting,
    error: connectError?.message,
  };

  const contextValue: WalletContextType = {
    ...walletState,
    connect: handleConnect,
    disconnect,
    switchChain: handleSwitchChain,
    getExplorerUrl,
    chainInfo,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Main provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Custom hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
