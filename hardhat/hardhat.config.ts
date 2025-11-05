// // File: hardhat/hardhat.config.ts
// import { HardhatUserConfig } from 'hardhat/config';
// import '@nomicfoundation/hardhat-toolbox';
// import 'dotenv/config';

// const config: HardhatUserConfig = {
//   solidity: {
//     version: '0.8.19',
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//     },
//   },
//   networks: {
//     hardhat: {
//       chainId: 1337,
//     },
//     polygon: {
//       url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
//       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//       chainId: 137,
//     },
//     mumbai: {
//       url: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
//       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//       chainId: 80001,
//     },
//     bsc: {
//       url: 'https://bsc-dataseed1.binance.org',
//       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//       chainId: 56,
//     },
//     bscTestnet: {
//       url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
//       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//       chainId: 97,
//     },
//   },
//   etherscan: {
//     apiKey: {
//       polygon: process.env.POLYGONSCAN_API_KEY || '',
//       polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
//       bsc: process.env.BSCSCAN_API_KEY || '',
//       bscTestnet: process.env.BSCSCAN_API_KEY || '',
//     },
//   },
// };

// export default config;

// ---

// File: hardhat/hardhat.config.ts
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
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Add other networks later when you have a proper private key
  },
};

export default config;
