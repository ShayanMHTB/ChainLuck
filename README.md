# 🎰 ChainLuck - Decentralized Instant Lottery Platform

<div align="center">
  <img src="ChainLuck - Logo.png" alt="ChainLuck Logo" width="200"/>
  
  [![Smart Contract](https://img.shields.io/badge/Sepolia-Deployed-success)](https://sepolia.etherscan.io/)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Web3](https://img.shields.io/badge/Web3-Enabled-purple)](https://ethereum.org/)
</div>

## 🚀 Overview

ChainLuck is a revolutionary blockchain-based lottery platform that offers instant results, transparent odds, and immediate payouts. Built on Ethereum (Sepolia testnet, moving to Polygon/BSC), it provides a fair and exciting lottery experience with guaranteed minimum returns.

### ✨ Key Features

- **Instant Results**: Know if you've won immediately after purchase
- **Guaranteed Returns**: Every ticket wins at least $0.10
- **Transparent Odds**: All probabilities are on-chain and verifiable
- **Referral Rewards**: Earn $4 for each friend who plays
- **Multiple Win Tiers**: From $1 to $1000 prizes
- **Provably Fair**: Chainlink VRF for true randomness
- **Multi-language**: English and Farsi support

## 🎮 How It Works

1. **Connect Wallet**: Use MetaMask, Rainbow, or any Web3 wallet
2. **Buy Tickets**: Each ticket costs $5 (paid in crypto)
3. **Instant Win**: See your results immediately
4. **Claim Prizes**: Winnings sent directly to your wallet

### 💰 Prize Structure

| Tier        | Prize Amount | Probability |
| ----------- | ------------ | ----------- |
| Guaranteed  | $0.10        | 100%        |
| Small Win   | $1-5         | 15%         |
| Medium Win  | $10-25       | 3%          |
| Big Win     | $50-100      | 0.5%        |
| Grand Prize | $500-1000    | 0.1%        |

## 🛠️ Technology Stack

### Blockchain

- **Smart Contracts**: Solidity 0.8.20
- **Network**: Sepolia (Testnet) → Polygon/BSC (Production)
- **Randomness**: Chainlink VRF v2
- **Development**: Hardhat Framework

### Frontend

- **Framework**: Next.js 15.3.4 (App Router)
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Web3**: Wagmi v2 + RainbowKit
- **Language**: TypeScript

### Backend (Planned)

- **Database**: Supabase PostgreSQL
- **Edge Functions**: Supabase Functions
- **Real-time**: WebSocket subscriptions

## 🚦 Quick Start

### Prerequisites

```bash
Node.js v18+
npm v9+
Git
MetaMask wallet
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/chainluck.git
cd chainluck
```

2. **Install dependencies**

```bash
# Smart contracts
cd hardhat
npm install

# Frontend
cd ../nextjs
npm install
```

3. **Configure environment**

```bash
# In hardhat/
cp .env.example .env
# Add your private key and RPC URL

# In nextjs/
cp .env.example .env
# Add contract address and RPC URL
```

4. **Deploy contracts (Testnet)**

```bash
cd hardhat
npm run deploy
npm run verify
npm run fund
```

5. **Run frontend**

```bash
cd nextjs
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
chainluck/
├── hardhat/           # Smart contracts
│   ├── contracts/     # Solidity files
│   ├── scripts/       # Deployment scripts
│   └── test/          # Contract tests
├── nextjs/            # Frontend application
│   ├── src/
│   │   ├── app/       # Next.js app router
│   │   ├── components/# React components
│   │   ├── contracts/ # ABIs and config
│   │   └── lib/       # Utilities
│   └── public/        # Static assets
└── docs/              # Documentation
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd hardhat
npm run test
npm run test:gas  # With gas reporting
```

### Frontend Tests

```bash
cd nextjs
npm run test      # Unit tests (TBD)
npm run test:e2e  # E2E tests (TBD)
```

### Test on Sepolia

```bash
cd hardhat
npm run test:game  # Interactive gameplay test
```

## 🚀 Deployment

### Smart Contracts

```bash
cd hardhat
npm run deploy:all  # Complete deployment
```

### Frontend

**GitHub Pages (Free)**

```bash
cd nextjs
npm run build
# Configure GitHub Pages in repo settings
```

**Vercel (Recommended)**

```bash
vercel --prod
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 Current Status

### ✅ Completed

- Smart contract core functionality
- Wallet integration (MetaMask, Rainbow)
- Basic lottery mechanics
- Instant win calculation
- Frontend UI components
- Multi-language support

### 🚧 In Progress

- Supabase integration
- Referral system
- VRF optimization
- Prize pool management

### 📅 Planned

- Production deployment
- Mobile app
- NFT rewards
- Advanced analytics
- More lottery types

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Blockchain Documentation](docs/BLOCKCHAIN.md)
- [Frontend Documentation](docs/FRONTEND.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Game Mechanics](docs/Game-Mechanics-Design.md)

## ⚠️ Security

- Smart contracts are not audited yet (testnet only)
- Never share your private keys
- Always verify contract addresses
- Use at your own risk on mainnet

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support & Community

- **Discord**: [Join our server](#)
- **Telegram**: [@chainluck](#)
- **Twitter**: [@chainluck](#)
- **Email**: support@chainluck.io

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract libraries
- [Chainlink](https://chain.link/) for VRF randomness
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [RainbowKit](https://www.rainbowkit.com/) for wallet connections

## ⚡ Quick Links

- [Live Demo (Testnet)](#)
- [Contract on Etherscan](#)
- [Chainlink VRF Subscription](#)
- [Supabase Dashboard](#)

---

<div align="center">
  <strong>Built with ❤️ for the decentralized future</strong>
  <br>
  <sub>Win big, win fair, win instantly!</sub>
</div>
