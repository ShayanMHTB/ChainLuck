// File: hardhat/scripts/setup-test-wallets.ts
import { ethers } from 'hardhat';

interface TestWallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

async function main(): Promise<void> {
  console.log('🧪 Setting up test wallets with tokens...');

  // Get deployed contract addresses from environment or previous deployment
  const USDT_ADDRESS = process.env.USDT_ADDRESS;
  const USDC_ADDRESS = process.env.USDC_ADDRESS;
  const DAI_ADDRESS = process.env.DAI_ADDRESS;

  if (!USDT_ADDRESS || !USDC_ADDRESS || !DAI_ADDRESS) {
    console.error(
      '❌ Token addresses not found. Please deploy contracts first or set environment variables.',
    );
    return;
  }

  // Create test wallets
  const testWallets: TestWallet[] = createTestWallets();

  // Get token contracts
  const usdt = await ethers.getContractAt('MockUSDT', USDT_ADDRESS);
  const usdc = await ethers.getContractAt('MockUSDC', USDC_ADDRESS);
  const dai = await ethers.getContractAt('MockDAI', DAI_ADDRESS);

  console.log('\n💰 Funding test wallets...');

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    console.log(`\n👤 Test Wallet ${i + 1}:`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Private Key: ${wallet.privateKey}`);

    try {
      // Fund with tokens using faucet
      await usdt.mint(wallet.address, ethers.parseUnits('50000', 6)); // 50k USDT
      await usdc.mint(wallet.address, ethers.parseUnits('50000', 6)); // 50k USDC
      await dai.mint(wallet.address, ethers.parseUnits('50000', 18)); // 50k DAI

      // Fund with native currency (ETH/MATIC) for gas
      const [deployer] = await ethers.getSigners();
      await deployer.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther('10'), // 10 ETH/MATIC
      });

      console.log('   ✅ Funded with 50k of each token + 10 native currency');
    } catch (error) {
      console.log(`   ❌ Failed to fund wallet: ${error}`);
    }
  }

  // Save wallet information to file
  await saveWalletInfo(testWallets);

  console.log('\n🎉 Test wallet setup completed!');
}

function createTestWallets(): TestWallet[] {
  const wallets: TestWallet[] = [];

  // Generate 10 test wallets
  for (let i = 0; i < 10; i++) {
    const wallet = ethers.Wallet.createRandom();
    wallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    });
  }

  return wallets;
}

async function saveWalletInfo(wallets: TestWallet[]): Promise<void> {
  const fs = require('fs');
  const path = require('path');

  const walletData = {
    generatedAt: new Date().toISOString(),
    network: (await ethers.provider.getNetwork()).name,
    wallets: wallets.map((wallet, index) => ({
      id: index + 1,
      name: `TestWallet${index + 1}`,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
      initialFunding: {
        USDT: '50,000',
        USDC: '50,000',
        DAI: '50,000',
        native: '10',
      },
    })),
  };

  const outputPath = path.join(__dirname, '../test-wallets.json');
  fs.writeFileSync(outputPath, JSON.stringify(walletData, null, 2));

  console.log(`\n📁 Wallet information saved to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
