// nextjs/src/lib/viemClient.ts
// Direct Viem client for Sepolia testnet

import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import {
  CHAINLUCK_LOTTERY_ABI,
  MOCK_USDC_ABI,
  getContractAddresses,
  parseUSDCAmount,
} from './contracts';

// Sepolia chain configuration
const sepoliaChain = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: ['https://ethereum-sepolia-rpc.publicnode.com'],
    },
    public: {
      http: ['https://ethereum-sepolia-rpc.publicnode.com'],
    },
  },
} as const;

// Create public client for reading (Sepolia)
export const publicClient = createPublicClient({
  chain: sepoliaChain,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
});

// Function to create wallet client with MetaMask for Sepolia
export async function createWalletClientFromMetaMask() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const { custom } = await import('viem');

  return createWalletClient({
    chain: sepoliaChain,
    transport: custom(window.ethereum),
  });
}

// Direct transaction functions for Sepolia testnet
export class DirectTransactionClient {
  private walletClient: any = null;
  private contracts = getContractAddresses(11155111); // Sepolia chain ID

  async init() {
    this.walletClient = await createWalletClientFromMetaMask();
    const accounts = await this.walletClient.getAddresses();
    return accounts[0];
  }

  async approveUSDC(spenderAddress: string, amount: number) {
    if (!this.walletClient) await this.init();

    const amountWei = parseUSDCAmount(amount);

    console.log('🔓 Direct USDC Approval (Sepolia):', {
      contract: this.contracts.usdc,
      spender: spenderAddress,
      amount,
      amountWei: amountWei.toString(),
      chainId: 11155111,
    });

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountWei],
        // Let Sepolia estimate gas automatically
      });

      console.log('✅ Approval transaction sent:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Approval confirmed:', receipt);

      return { success: true, hash, receipt };
    } catch (error: any) {
      console.error('❌ Direct approval failed:', error);

      // Parse Sepolia-specific errors
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient SepoliaETH for gas fees';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      }

      return { success: false, error: errorMessage };
    }
  }

  async buyTickets(ticketCount: number) {
    if (!this.walletClient) await this.init();

    console.log('🎫 Direct Ticket Purchase (Sepolia):', {
      contract: this.contracts.chainluckLottery,
      ticketCount,
      chainId: 11155111,
    });

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'buyTickets',
        args: [BigInt(ticketCount)],
        // Let Sepolia estimate gas automatically
      });

      console.log('✅ Purchase transaction sent:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Purchase confirmed:', receipt);

      return { success: true, hash, receipt };
    } catch (error: any) {
      console.error('❌ Direct purchase failed:', error);

      // Parse Sepolia-specific errors
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient SepoliaETH for gas fees';
      } else if (errorMessage.includes('insufficient allowance')) {
        errorMessage = 'USDC allowance insufficient - please approve first';
      } else if (errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient USDC balance';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      }

      return { success: false, error: errorMessage };
    }
  }

  async getUSDCFaucet() {
    if (!this.walletClient) await this.init();

    console.log('🚰 Direct USDC Faucet (Sepolia):', {
      contract: this.contracts.usdc,
      chainId: 11155111,
    });

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        args: [],
        // Let Sepolia estimate gas automatically
      });

      console.log('✅ Faucet transaction sent:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Faucet confirmed:', receipt);

      return { success: true, hash, receipt };
    } catch (error: any) {
      console.error('❌ Direct faucet failed:', error);

      // Parse Sepolia-specific errors
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient SepoliaETH for gas fees';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      }

      return { success: false, error: errorMessage };
    }
  }

  async claimWins() {
    if (!this.walletClient) await this.init();

    console.log('💰 Direct Claim Wins (Sepolia):', {
      contract: this.contracts.chainluckLottery,
      chainId: 11155111,
    });

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'claimWins',
        args: [],
        // Let Sepolia estimate gas automatically
      });

      console.log('✅ Claim transaction sent:', hash);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Claim confirmed:', receipt);

      return { success: true, hash, receipt };
    } catch (error: any) {
      console.error('❌ Direct claim failed:', error);

      // Parse Sepolia-specific errors
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient SepoliaETH for gas fees';
      } else if (errorMessage.includes('No pending wins')) {
        errorMessage = 'No pending wins to claim';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Utility function to check current network
  async getCurrentChainId() {
    if (!this.walletClient) await this.init();

    try {
      const chainId = await this.walletClient.getChainId();
      console.log('🔗 Current Chain ID:', chainId);
      return chainId;
    } catch (error) {
      console.error('❌ Error getting chain ID:', error);
      return null;
    }
  }

  // Utility function to switch to Sepolia
  async switchToSepolia() {
    if (!this.walletClient) await this.init();

    try {
      await this.walletClient.switchChain({ id: 11155111 });
      console.log('✅ Switched to Sepolia');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to switch to Sepolia:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance for Sepolia
export const directTxClient = new DirectTransactionClient();

// Utility functions for Sepolia debugging
export async function checkSepoliaConnection() {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    console.log('✅ Sepolia connection successful, block:', blockNumber);
    return { success: true, blockNumber };
  } catch (error) {
    console.error('❌ Sepolia connection failed:', error);
    return { success: false, error };
  }
}

export async function getSepoliaBalance(address: string) {
  try {
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    const balanceEth = parseFloat(balance.toString()) / 1e18;
    console.log('💰 Sepolia ETH balance:', balanceEth);
    return { success: true, balance: balanceEth };
  } catch (error) {
    console.error('❌ Error getting Sepolia balance:', error);
    return { success: false, error };
  }
}

// Debug function to test contract reading
export async function testSepoliaContractRead() {
  const contracts = getContractAddresses(11155111);

  try {
    // Test reading contract stats
    const stats = await publicClient.readContract({
      address: contracts.chainluckLottery,
      abi: CHAINLUCK_LOTTERY_ABI,
      functionName: 'getContractStats',
    });

    console.log('✅ Sepolia contract read test successful:', stats);
    return { success: true, stats };
  } catch (error) {
    console.error('❌ Sepolia contract read test failed:', error);
    return { success: false, error };
  }
}
