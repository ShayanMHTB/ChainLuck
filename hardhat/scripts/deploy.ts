// hardhat/scripts/deploy.ts
import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

// Network-specific USDC addresses
const REAL_USDC_ADDRESSES: Record<string, string> = {
  // Testnets
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  mumbai: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
  bscTestnet: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  arbitrumSepolia: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',

  // Mainnets
  polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  arbitrumOne: '0xA0b86a33E6417b4a000000000000000000000000',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
};

const NETWORK_CONFIGS = {
  // Testnets
  sepolia: { isMainnet: false, explorerUrl: 'https://sepolia.etherscan.io' },
  mumbai: { isMainnet: false, explorerUrl: 'https://mumbai.polygonscan.com' },
  bscTestnet: { isMainnet: false, explorerUrl: 'https://testnet.bscscan.com' },
  arbitrumSepolia: {
    isMainnet: false,
    explorerUrl: 'https://sepolia.arbiscan.io',
  },

  // Mainnets
  polygon: { isMainnet: true, explorerUrl: 'https://polygonscan.com' },
  bsc: { isMainnet: true, explorerUrl: 'https://bscscan.com' },
  arbitrumOne: { isMainnet: true, explorerUrl: 'https://arbiscan.io' },
  base: { isMainnet: true, explorerUrl: 'https://basescan.org' },
};

async function main() {
  console.log('🚀 Deploying ChainLuck Multi-Tier System...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'localhost' : network.name;

  const networkConfig =
    NETWORK_CONFIGS[networkName as keyof typeof NETWORK_CONFIGS];
  const isMainnet = networkConfig?.isMainnet ?? false;

  console.log('🔑 Deploying with account:', deployer.address);
  console.log('🌍 Network:', networkName, '(Chain ID:', network.chainId, ')');
  console.log(
    '💰 Account balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    'ETH',
  );
  console.log('🏷️  Network Type:', isMainnet ? 'MAINNET' : 'TESTNET');

  // USDC Configuration
  let usdcAddress: string;
  let usdcType: 'MockUSDC' | 'RealUSDC';
  let deploymentTxHash = '';
  let blockNumber = 0;

  console.log('\n🪙 USDC Strategy:');
  const realUSDCAddress = REAL_USDC_ADDRESSES[networkName];

  if (realUSDCAddress && isMainnet) {
    console.log(`📋 Using Real ${networkName} USDC: ${realUSDCAddress}`);
    console.log(
      '⚠️  MAINNET: Will use real USDC - ensure you have sufficient balance!',
    );

    try {
      const realUsdc = await ethers.getContractAt('IERC20', realUSDCAddress);
      const name = await realUsdc.name();
      console.log(`✅ Verified ${name} contract is accessible`);
      usdcAddress = realUSDCAddress;
      usdcType = 'RealUSDC';
    } catch (error) {
      console.log('❌ Failed to access real USDC, deployment aborted');
      console.log('💡 Check network connection and USDC address');
      process.exit(1);
    }
  } else if (realUSDCAddress && !isMainnet) {
    console.log(
      `🧪 Testnet detected, checking real ${networkName} USDC availability...`,
    );

    try {
      const realUsdc = await ethers.getContractAt('IERC20', realUSDCAddress);
      await realUsdc.name();
      console.log(`✅ Real ${networkName} USDC found and working`);
      usdcAddress = realUSDCAddress;
      usdcType = 'RealUSDC';
    } catch (error) {
      console.log(
        '⚠️  Real USDC not accessible, deploying MockUSDC for testing...',
      );
      ({ usdcAddress, usdcType } = await deployMockUSDC(deployer));
    }
  } else {
    console.log('🔧 Local/unknown network detected, deploying MockUSDC...');
    ({ usdcAddress, usdcType } = await deployMockUSDC(deployer));
  }

  // Deploy ChainLuck Multi-Tier Contract
  console.log('\n🎰 Deploying ChainLuck Multi-Tier contract...');
  const ChainLuck = await ethers.getContractFactory('ChainLuck');

  console.log('📋 Constructor parameters:');
  console.log('   USDC Address:', usdcAddress);
  console.log('   USDC Type:', usdcType);

  const chainluck = await ChainLuck.deploy(usdcAddress);
  await chainluck.waitForDeployment();
  const chainluckAddress = await chainluck.getAddress();

  // Get deployment transaction details
  const deploymentTx = chainluck.deploymentTransaction();
  if (deploymentTx) {
    deploymentTxHash = deploymentTx.hash;
    const receipt = await deploymentTx.wait();
    if (receipt) {
      blockNumber = receipt.blockNumber;
    }
  }

  console.log(`✅ ChainLuck Multi-Tier deployed to: ${chainluckAddress}`);

  // Test multi-tier contract configuration
  console.log('\n🧪 Testing multi-tier configuration...');
  try {
    const globalStats = await chainluck.getGlobalStats();
    const tierNames = ['Basic', 'Standard', 'Premium'];

    console.log(`📊 Global Stats:`);
    console.log(`   Total tickets sold: ${globalStats[0]}`);
    console.log(
      `   Contract balance: ${ethers.formatUnits(globalStats[4], 6)}`,
    );

    for (let tier = 0; tier <= 2; tier++) {
      const tierStats = await chainluck.getTierStats(tier);
      const validCounts = await chainluck.getValidTicketCounts(tier);
      const tierConfig = await chainluck.getTierConfiguration(tier);

      console.log(`\n🎯 ${tierNames[tier]} Tier (${tier}):`);
      console.log(`   Valid ticket counts: [${validCounts.join(', ')}]`);
      console.log(
        `   Guaranteed win: ${ethers.formatUnits(tierConfig[0], 2)}%`,
      );
      console.log(`   Prize pool: ${ethers.formatUnits(tierConfig[1], 2)}%`);
      console.log(
        `   Platform profit: ${ethers.formatUnits(tierConfig[2], 2)}%`,
      );
      console.log(`   Instant pool: ${ethers.formatUnits(tierStats[2], 6)}`);
      console.log(
        `   Grand prize pool: ${ethers.formatUnits(tierStats[3], 6)}`,
      );

      // Test ticket pricing
      for (const count of validCounts) {
        const price = await chainluck.getTierPackagePrice(tier, count);
        console.log(`   ${count} tickets: ${ethers.formatUnits(price, 6)}`);
      }
    }

    // Test referral and special lottery configuration
    const allLotteryInfo = await chainluck.getAllSpecialLotteryInfo();
    const lotteryNames = [
      'Daily Streak',
      'Weekly Referral',
      'Monthly Tier',
      'Quarterly Cross',
      'Annual Whale',
    ];

    console.log(`\n🏆 Special Lotteries:`);
    for (let i = 0; i < lotteryNames.length; i++) {
      console.log(
        `   ${lotteryNames[i]}: ${ethers.formatUnits(
          allLotteryInfo[0][i],
          6,
        )} prize pool`,
      );
    }

    console.log('✅ Multi-tier contract functions working correctly');
  } catch (error) {
    console.log('❌ Contract test failed:', error);
  }

  // Save deployment info with multi-tier structure
  const deploymentsDir = join(__dirname, '../deployments');
  const networkDir = join(deploymentsDir, networkName);

  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }
  if (!existsSync(networkDir)) {
    mkdirSync(networkDir, { recursive: true });
  }

  const deploymentInfo = {
    version: 'Multi-Tier v1.0.0',
    network: networkName,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber,
    transactionHash: deploymentTxHash,
    contracts: {
      chainluck: chainluckAddress,
      usdc: usdcAddress,
      usdcType,
    },
    features: {
      multiTier: true,
      tierCount: 3,
      referralSystem: true,
      dailyCheckIns: true,
      specialLotteries: 5,
    },
    gasUsed: {
      chainluck: 'TBD',
      total: 'TBD',
    },
    networkConfig: {
      isMainnet,
      explorerUrl: networkConfig?.explorerUrl || 'Unknown',
    },
  };

  // Save deployment info
  writeFileSync(
    join(networkDir, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2),
  );
  writeFileSync(
    join(deploymentsDir, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2),
  );

  console.log('\n🎉 Multi-Tier Deployment Summary:');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log(`🎰 ChainLuck Multi-Tier: ${chainluckAddress}`);
  console.log(`🪙 USDC (${usdcType}): ${usdcAddress}`);
  console.log(`⛽ Deployer: ${deployer.address}`);
  console.log(`🌍 Network: ${networkName} (${network.chainId})`);
  console.log(`📦 Block: ${blockNumber}`);
  console.log(`🔗 TX Hash: ${deploymentTxHash}`);

  console.log('\n🎯 Multi-Tier Features:');
  console.log('✅ 3-Tier System: Basic ($1), Standard ($2), Premium ($5)');
  console.log('✅ Referral System: Tier-based rewards ($0.50 - $10)');
  console.log('✅ Daily Check-ins: Streak bonuses and lottery eligibility');
  console.log('✅ Special Lotteries: 5 different lottery types');
  console.log('✅ Enhanced Security: Rate limiting and pool protection');

  console.log('\n📋 Next Steps:');
  console.log('1. Sync frontend config: npm run sync:config');
  console.log('2. Verify contract: npm run verify');
  console.log('3. Fund tier pools: npm run fund');
  console.log('4. Setup test wallets: npm run setup');
  console.log('5. Test multi-tier gameplay: npm run test:game');

  console.log('\n🔗 Contract Links:');
  if (networkConfig?.explorerUrl) {
    console.log(
      `   🔍 Explorer: ${networkConfig.explorerUrl}/address/${chainluckAddress}`,
    );
    console.log(
      `   🪙 USDC Explorer: ${networkConfig.explorerUrl}/address/${usdcAddress}`,
    );
  }

  if (usdcType === 'RealUSDC' && !isMainnet) {
    console.log('\n💡 Get Testnet USDC:');
    if (networkName === 'sepolia') {
      console.log('   🚰 Circle Faucet: https://faucet.circle.com/');
    } else if (networkName === 'mumbai') {
      console.log('   🚰 Polygon Faucet: https://faucet.polygon.technology/');
    } else if (networkName === 'bscTestnet') {
      console.log('   🚰 BSC Faucet: https://testnet.binance.org/faucet-smart');
    }
  }

  console.log('\n📁 Deployment files saved:');
  console.log(`   ✅ ${networkDir}/deployment-info.json`);
  console.log(`   ✅ ${deploymentsDir}/deployment-info.json`);

  console.log('\n✅ Multi-Tier deployment completed successfully!');
  console.log('🔄 Run "npm run sync:config" to sync frontend configuration');
}

async function deployMockUSDC(
  deployer: any,
): Promise<{ usdcAddress: string; usdcType: 'MockUSDC' }> {
  console.log('🔧 Deploying MockUSDC for testing...');

  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const mockUsdc = await MockUSDC.deploy();
  await mockUsdc.waitForDeployment();
  const usdcAddress = await mockUsdc.getAddress();

  console.log(`✅ MockUSDC deployed to: ${usdcAddress}`);

  // Mint initial USDC for testing
  const initialMint = ethers.parseUnits('500000', 6); // 500k USDC
  await mockUsdc.mint(deployer.address, initialMint);
  console.log(
    `🪙 Minted ${ethers.formatUnits(initialMint, 6)} USDC for testing`,
  );

  return { usdcAddress, usdcType: 'MockUSDC' };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Multi-tier deployment failed:', error);
    process.exit(1);
  });
