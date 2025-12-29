// scripts/fund-test-wallets.ts
import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('💰 Funding test wallets with MockUSDC...\n');

  const [deployer] = await ethers.getSigners();

  // Load deployment and wallet info
  const fs = require('fs');
  const path = require('path');

  let deploymentInfo, walletInfo;
  try {
    deploymentInfo = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../deployments.json'), 'utf8'),
    );
    walletInfo = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../test-wallets.json'), 'utf8'),
    );
  } catch (error) {
    console.error('❌ Could not load deployment/wallet info.');
    process.exit(1);
  }

  const usdcAddress = deploymentInfo.contracts.usdc;
  const usdc = await ethers.getContractAt('MockUSDC', usdcAddress);

  console.log('📋 Funding Configuration:');
  console.log(`   MockUSDC: ${usdcAddress}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Test Wallets: ${walletInfo.wallets.length}`);

  // Check deployer USDC balance
  const deployerBalance = await usdc.balanceOf(deployer.address);
  console.log(
    `💳 Deployer USDC balance: $${ethers.formatUnits(deployerBalance, 6)}`,
  );

  // Fund each test wallet with USDC
  const usdcPerWallet = ethers.parseUnits('1000', 6); // $1,000 per wallet

  console.log('\n💸 Funding test wallets with USDC...');

  for (let i = 0; i < walletInfo.wallets.length; i++) {
    const wallet = walletInfo.wallets[i];
    try {
      // Mint USDC directly to test wallet
      const tx = await usdc.mint(wallet.address, usdcPerWallet);
      await tx.wait();
      console.log(
        `   ✅ Wallet ${i + 1} (${wallet.address.slice(
          0,
          8,
        )}...) funded with $1,000 USDC`,
      );
    } catch (error) {
      console.log(`   ❌ Failed to fund Wallet ${i + 1}: ${error}`);
    }
  }

  // Fund with smaller ETH amounts (0.01 ETH each)
  console.log('\n⛽ Funding test wallets with ETH for gas...');
  const ethAmount = ethers.parseEther('0.01'); // 0.01 ETH per wallet (much smaller)

  for (let i = 0; i < walletInfo.wallets.length; i++) {
    const wallet = walletInfo.wallets[i];
    try {
      const tx = await deployer.sendTransaction({
        to: wallet.address,
        value: ethAmount,
      });
      await tx.wait();
      console.log(`   ✅ Wallet ${i + 1} funded with 0.01 ETH`);
    } catch (error) {
      console.log(`   ❌ Failed to fund Wallet ${i + 1} with ETH: ${error}`);
    }
  }

  console.log('\n📊 Verifying wallet balances...');
  for (let i = 0; i < Math.min(3, walletInfo.wallets.length); i++) {
    const wallet = walletInfo.wallets[i];
    const ethBalance = await ethers.provider.getBalance(wallet.address);
    const usdcBalance = await usdc.balanceOf(wallet.address);

    console.log(`   Wallet ${i + 1}:`);
    console.log(`     ETH: ${ethers.formatEther(ethBalance)}`);
    console.log(`     USDC: $${ethers.formatUnits(usdcBalance, 6)}`);
  }

  console.log('\n🎉 Test wallet funding completed!');
  console.log('🎮 Ready to test gameplay: npm run test:game');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Wallet funding failed:', error);
    process.exit(1);
  });
