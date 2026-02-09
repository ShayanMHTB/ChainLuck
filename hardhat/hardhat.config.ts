// hardhat/hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
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
      // Keep for local testing if needed
    },

    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 'auto',
      gasPrice: 'auto',
      gasMultiplier: 1.2, // 20% buffer for gas estimation
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
    },
  },

  sourcify: {
    enabled: true,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
};

export default config;
