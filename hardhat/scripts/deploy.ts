// scripts/deploy.ts
import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('🚀 Deploying ChainLuck to Sepolia...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log('🔑 Deploying with account:', deployer.address);
  console.log('🌐 Network:', network.name, '(Chain ID:', network.chainId, ')');
  console.log(
    '💰 Account balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    'ETH',
  );

  // USDC Configuration
  let usdcAddress: string;
  const SEPOLIA_USDC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Real Sepolia USDC

  console.log('\n🪙 USDC Strategy:');
  console.log(
    'Option 1: Use Real Sepolia USDC (harder to get, more realistic)',
  );
  console.log('Option 2: Deploy MockUSDC (easier testing)');

  // Let's try real USDC first, fallback to MockUSDC if needed
  console.log('\n🔍 Checking Real Sepolia USDC...');
  try {
    const realUsdc = await ethers.getContractAt('IERC20', SEPOLIA_USDC);
    await realUsdc.name(); // Test if contract exists and works
    console.log('✅ Real Sepolia USDC found and working');
    usdcAddress = SEPOLIA_USDC;
  } catch (error) {
    console.log('⚠️  Real USDC not accessible, deploying MockUSDC...');

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();

    console.log(`✅ MockUSDC deployed to: ${usdcAddress}`);

    // Mint USDC to deployer for testing
    await mockUsdc.mint(deployer.address, ethers.parseUnits('100000', 6)); // 100k USDC
    console.log('🪙 Minted 100,000 USDC to deployer for testing');
  }

  // Deploy ChainLuck (only needs USDC address)
  console.log('\n🎰 Deploying ChainLuck contract...');
  const ChainLuck = await ethers.getContractFactory('ChainLuck');

  console.log('📋 Constructor parameters:');
  console.log('   USDC Address:', usdcAddress);

  const chainluck = await ChainLuck.deploy(usdcAddress);
  await chainluck.waitForDeployment();
  const chainluckAddress = await chainluck.getAddress();

  console.log(`✅ ChainLuck deployed to: ${chainluckAddress}`);

  // Test basic contract functions
  console.log('\n🧪 Testing contract deployment...');
  try {
    const stats = await chainluck.getContractStats();
    const ticketPrice = await chainluck.getTicketPrice(1);
    const grandPrizeInfo = await chainluck.getGrandPrizeInfo();

    console.log(`   📊 Total tickets sold: ${stats[0]}`);
    console.log(`   💲 1-ticket price: $${ethers.formatUnits(ticketPrice, 6)}`);
    console.log(
      `   🏆 Grand prizes available: ${grandPrizeInfo[0].length} tiers`,
    );
    console.log(`   💰 Instant pool: $${ethers.formatUnits(stats[2], 6)}`);
    console.log(`   🎁 Grand prize pool: $${ethers.formatUnits(stats[3], 6)}`);
    console.log('   ✅ Contract functions working correctly');
  } catch (error) {
    console.log('   ❌ Contract test failed:', error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      chainluck: chainluckAddress,
      usdc: usdcAddress,
      usdcType: usdcAddress === SEPOLIA_USDC ? 'RealUSDC' : 'MockUSDC',
    },
    deploymentCost: {
      ethUsed: 'TBD', // Can calculate from transaction receipt
    },
  };

  console.log('\n📁 Saving deployment info...');
  const fs = require('fs');
  const path = require('path');

  fs.writeFileSync(
    path.join(__dirname, '../deployments.json'),
    JSON.stringify(deploymentInfo, null, 2),
  );

  console.log('\n🎉 Deployment Summary:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🎰 ChainLuck Address: ${chainluckAddress}`);
  console.log(`🪙 USDC Address: ${usdcAddress}`);
  console.log(`📝 USDC Type: ${deploymentInfo.contracts.usdcType}`);
  console.log(`⛽ Deployer Address: ${deployer.address}`);
  console.log(`🌐 Network: ${network.name} (${network.chainId})`);

  console.log('\n🔗 Next Steps:');
  console.log('1. Verify contract: npm run verify');
  console.log('2. Fund pools: npm run fund');
  console.log('3. Setup test wallets: npm run setup');
  console.log('4. Test gameplay: npm run test-game');

  console.log('\n📝 Environment Variables to Update:');
  console.log(`CHAINLUCK_ADDRESS=${chainluckAddress}`);
  console.log(`USDC_ADDRESS=${usdcAddress}`);

  console.log('\n🔗 Contract Links:');
  console.log(
    `   Sepolia Explorer: https://sepolia.etherscan.io/address/${chainluckAddress}`,
  );
  if (deploymentInfo.contracts.usdcType === 'RealUSDC') {
    console.log(
      `   USDC Explorer: https://sepolia.etherscan.io/address/${usdcAddress}`,
    );
    console.log('\n💡 To get testnet USDC:');
    console.log('   - Use Circle faucet: https://faucet.circle.com/');
    console.log('   - Or use a cross-chain bridge from other testnets');
  }

  console.log('\n✅ Deployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
