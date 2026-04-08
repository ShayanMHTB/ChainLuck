// hardhat/hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';
import 'hardhat-abi-exporter';
import 'solidity-coverage';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable for better optimization
    },
  },

  networks: {
    hardhat: {
      chainId: 1337,
      // Useful for testing multi-tier functionality locally
      accounts: {
        count: 20, // More accounts for testing
        accountsBalance: '10000000000000000000000', // 10k ETH each
      },
    },

    // TESTNETS
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
      timeout: 60000,
    },

    mumbai: {
      url:
        process.env.MUMBAI_RPC_URL ||
        'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
      timeout: 60000,
    },

    bscTestnet: {
      url:
        process.env.BSC_TESTNET_RPC_URL ||
        'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 97,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
      timeout: 60000,
    },

    arbitrumSepolia: {
      url:
        process.env.ARBITRUM_SEPOLIA_RPC_URL ||
        'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2,
      timeout: 60000,
    },

    // MAINNETS
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.1,
      timeout: 120000,
    },

    bsc: {
      url: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 56,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.1,
      timeout: 120000,
    },

    arbitrumOne: {
      url: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.1,
      timeout: 120000,
    },

    base: {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.1,
      timeout: 120000,
    },
  },

  etherscan: {
    apiKey: {
      // Testnets
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
      bscTestnet: process.env.BSCSCAN_API_KEY || '',
      arbitrumSepolia: process.env.ARBITRUMSCAN_API_KEY || '',

      // Mainnets
      polygon: process.env.POLYGONSCAN_API_KEY || '',
      bsc: process.env.BSCSCAN_API_KEY || '',
      arbitrumOne: process.env.ARBITRUMSCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'arbitrumSepolia',
        chainId: 421614,
        urls: {
          apiURL: 'https://api-sepolia.arbiscan.io/api',
          browserURL: 'https://sepolia.arbiscan.io',
        },
      },
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
    ],
  },

  sourcify: {
    enabled: true,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: 'MATIC', // Default to MATIC for Polygon
    gasPriceApi:
      'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['ChainLuck'],
  },

  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false,
  },

  mocha: {
    timeout: 300000, // 5 minutes for complex tests
  },

  // For coverage testing
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
};

export default config;
