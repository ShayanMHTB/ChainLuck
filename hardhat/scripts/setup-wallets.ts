// hardhat/scripts/setup-wallets.ts
import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

interface TestWallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

async function main() {
  console.log('👥 Setting up test wallets for network...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log('🔑 Setup initiated by:', deployer.address);
  console.log('🌐 Network:', network.name);

  // Load deployment info from new organized structure
  let deploymentInfo;
  try {
    const deploymentPath = join(
      __dirname,
      '../deployments/deployment-info.json',
    );
    if (!existsSync(deploymentPath)) {
      console.error('❌ No deployment info found. Run deployment first.');
      process.exit(1);
    }
    deploymentInfo = require(deploymentPath);
  } catch (error) {
    console.error('❌ Could not load deployment info. Run deployment first.');
    process.exit(1);
  }

  const usdcAddress = deploymentInfo.contracts.usdc;
  const usdc = await ethers.getContractAt('IERC20', usdcAddress);

  // Generate test wallets
  console.log('🎭 Generating test wallets...');
  const testWallets = generateTestWallets(5);

  console.log('\n👤 Test Wallets Generated:');
  testWallets.forEach((wallet, i) => {
    console.log(`   Wallet ${i + 1}: ${wallet.address}`);
    console.log(`   Private Key: ${wallet.privateKey}`);
    console.log('   ─────────────────────────────────────────────────────');
  });

  // Fund wallets with ETH for gas
  console.log('\n⛽ Funding wallets with ETH for gas...');
  const ethAmount = ethers.parseEther('0.1'); // 0.1 ETH per wallet

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    try {
      const tx = await deployer.sendTransaction({
        to: wallet.address,
        value: ethAmount,
      });
      await tx.wait();
      console.log(`   ✅ Wallet ${i + 1} funded with 0.1 ETH`);
    } catch (error) {
      console.log(`   ❌ Failed to fund Wallet ${i + 1}: ${error}`);
    }
  }

  // Check if we can fund with USDC
  const deployerUSDCBalance = await usdc.balanceOf(deployer.address);
  const usdcPerWallet = ethers.parseUnits('1000', 6); // $1,000 per wallet
  const totalUSDCNeeded = usdcPerWallet * BigInt(testWallets.length);

  console.log('\n💳 USDC Funding Status:');
  console.log(
    `   Deployer USDC: $${ethers.formatUnits(deployerUSDCBalance, 6)}`,
  );
  console.log(`   Required: $${ethers.formatUnits(totalUSDCNeeded, 6)}`);

  if (deployerUSDCBalance >= totalUSDCNeeded) {
    console.log('💰 Funding wallets with USDC...');

    for (let i = 0; i < testWallets.length; i++) {
      const wallet = testWallets[i];
      try {
        const tx = await usdc.transfer(wallet.address, usdcPerWallet);
        await tx.wait();
        console.log(`   ✅ Wallet ${i + 1} funded with $1,000 USDC`);
      } catch (error) {
        console.log(`   ❌ Failed to fund Wallet ${i + 1} with USDC: ${error}`);
      }
    }
  } else {
    console.log('⚠️  Insufficient USDC for wallet funding');
    console.log(
      "💡 Test wallets have ETH for gas, but you'll need to provide USDC manually",
    );

    if (network.name === 'sepolia') {
      console.log(
        '🌐 Get Sepolia testnet USDC from: https://faucet.circle.com/',
      );
    }
  }

  // Save wallet information in organized structure
  const deploymentsDir = join(__dirname, '../deployments');

  const walletData = {
    generatedAt: new Date().toISOString(),
    network: network.name,
    chainId: network.chainId.toString(),
    fundedByDeployer: deployer.address,
    ethPerWallet: '0.1',
    usdcPerWallet: deployerUSDCBalance >= totalUSDCNeeded ? '1000' : '0',
    wallets: testWallets.map((wallet, index) => ({
      id: index + 1,
      name: `TestWallet${index + 1}`,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic,
    })),
    instructions: {
      importToMetaMask:
        'Use the private keys above to import wallets into MetaMask',
      addNetwork: `Make sure MetaMask is connected to ${network.name} testnet`,
      getUSDC:
        deploymentInfo.contracts.usdcType === 'MockUSDC'
          ? 'Use the faucet function in the MockUSDC contract'
          : 'Get testnet USDC from Circle faucet if USDC funding failed',
    },
  };

  const outputPath = join(deploymentsDir, 'test-wallets.json');
  writeFileSync(outputPath, JSON.stringify(walletData, null, 2));

  console.log('\n📁 Wallet information saved to:', outputPath);

  console.log('\n🎉 Test wallet setup completed!');
  console.log('\n📋 Quick Start Guide:');
  console.log('1. Import any wallet private key into MetaMask');
  console.log(`2. Switch MetaMask to ${network.name} testnet`);

  if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
    console.log('3. Use MockUSDC faucet to get test USDC');
  } else {
    console.log('3. If no USDC, get some from: https://faucet.circle.com/');
  }

  console.log('4. Run: npm run test:game');

  console.log('\n🔗 Useful Links:');
  if (network.name === 'sepolia') {
    console.log('   Sepolia Faucet (ETH): https://sepoliafaucet.com/');
    console.log('   Circle USDC Faucet: https://faucet.circle.com/');
    console.log('   Sepolia Explorer: https://sepolia.etherscan.io/');
  } else if (network.name === 'mumbai') {
    console.log('   Mumbai Faucet: https://faucet.polygon.technology/');
    console.log('   Mumbai Explorer: https://mumbai.polygonscan.com/');
  }
}

function generateTestWallets(count: number): TestWallet[] {
  const wallets: TestWallet[] = [];

  for (let i = 0; i < count; i++) {
    const wallet = ethers.Wallet.createRandom();
    wallets.push({
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    });
  }

  return wallets;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Wallet setup failed:', error);
    process.exit(1);
  });
