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
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
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

  // Get native token balance (SepoliaETH)
  const { data: nativeBalance } = useBalance({
    address,
    query: {
      enabled: !!address && typeof window !== 'undefined',
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: 3,
    },
  });

  const chainInfo = getChainInfo(chainId);

  // Debug wallet connection
  console.log('🔗 Wallet Provider Debug:', {
    isConnected,
    address,
    chainId,
    chainName: chainInfo.chain?.name,
    isSepoliaNetwork: chainId === 11155111,
    nativeBalance: nativeBalance ? parseFloat(nativeBalance.formatted) : 0,
    connectError: connectError?.message,
  });

  // Smart connect - prioritize MetaMask on Sepolia
  const handleConnect = () => {
    console.log('🔌 Attempting wallet connection...');

    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      console.log('📱 Mobile device detected');
      // Mobile: Check if we're in a wallet browser (injected wallet available)
      if (typeof window !== 'undefined' && window.ethereum) {
        // We're in a mobile wallet browser - use injected
        const injectedConnector = connectors.find((c) => c.id === 'injected');
        if (injectedConnector) {
          console.log('🔌 Using injected connector (mobile wallet browser)');
          connect({ connector: injectedConnector });
          return;
        }
      }

      // Mobile browser - use WalletConnect for wallet selection
      const wcConnector = connectors.find((c) => c.id === 'walletConnect');
      if (wcConnector) {
        console.log('🔌 Using WalletConnect (mobile browser)');
        connect({ connector: wcConnector });
      }
    } else {
      console.log('💻 Desktop device detected');
      // Desktop: Check for installed wallet extensions
      if (typeof window !== 'undefined' && window.ethereum) {
        // Check for MetaMask specifically (best for Sepolia)
        if (window.ethereum.isMetaMask) {
          const metaMaskConnector = connectors.find((c) => c.id === 'metaMask');
          if (metaMaskConnector) {
            console.log('🦊 Using MetaMask connector');
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
            console.log('🔷 Using Coinbase Wallet connector');
            connect({ connector: coinbaseConnector });
            return;
          }
        }

        // Generic injected wallet
        const injectedConnector = connectors.find((c) => c.id === 'injected');
        if (injectedConnector) {
          console.log('🔌 Using injected connector (generic)');
          connect({ connector: injectedConnector });
          return;
        }
      }

      // Desktop fallback: Use WalletConnect for QR code
      const wcConnector = connectors.find((c) => c.id === 'walletConnect');
      if (wcConnector) {
        console.log('🔌 Using WalletConnect (desktop fallback)');
        connect({ connector: wcConnector });
      }
    }
  };

  const handleSwitchChain = (targetChainId: number) => {
    console.log('🔄 Switching to chain:', targetChainId);
    switchChain({ chainId: targetChainId });
  };

  const getExplorerUrl = (hash: string): string => {
    const explorerUrl = chainInfo.blockExplorer;
    if (!explorerUrl) return '#';
    return `${explorerUrl}/tx/${hash}`;
  };

  // Enhanced balance calculation (simple for now)
  const balanceInUSD = nativeBalance
    ? parseFloat(nativeBalance.formatted) * 2000 // Rough ETH price estimate
    : undefined;

  const walletState: WalletState = {
    isConnected,
    address,
    balance: balanceInUSD,
    nativeBalance: nativeBalance
      ? parseFloat(nativeBalance.formatted)
      : undefined,
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
