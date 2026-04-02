// hardhat/scripts/fund-pools.ts
import { ethers } from 'hardhat';
import { join } from 'path';
import { existsSync } from 'fs';
import 'dotenv/config';

async function main() {
  console.log('💰 Funding ChainLuck Multi-Tier pools on network...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

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

  const chainluckAddress = deploymentInfo.contracts.chainluck;
  const usdcAddress = deploymentInfo.contracts.usdc;

  // Get contracts
  const chainluck = await ethers.getContractAt('ChainLuck', chainluckAddress);
  const usdc = await ethers.getContractAt('IERC20', usdcAddress);

  console.log('📋 Contract Information:');
  console.log(`   ChainLuck: ${chainluckAddress}`);
  console.log(`   USDC: ${usdcAddress} (${deploymentInfo.contracts.usdcType})`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Network: ${network.name} (${network.chainId})`);

  // Check deployer USDC balance
  const deployerBalance = await usdc.balanceOf(deployer.address);
  console.log(
    `💳 Deployer USDC balance: $${ethers.formatUnits(deployerBalance, 6)}`,
  );

  // Multi-tier funding configuration
  const tierFunding = [
    {
      tier: 0,
      name: 'Basic',
      instantAmount: ethers.parseUnits(
        process.env.INITIAL_BASIC_INSTANT_POOL || '2000',
        6,
      ),
      grandPrizeAmount: ethers.parseUnits(
        process.env.INITIAL_BASIC_GRAND_PRIZE_POOL || '5000',
        6,
      ),
    },
    {
      tier: 1,
      name: 'Standard',
      instantAmount: ethers.parseUnits(
        process.env.INITIAL_STANDARD_INSTANT_POOL || '5000',
        6,
      ),
      grandPrizeAmount: ethers.parseUnits(
        process.env.INITIAL_STANDARD_GRAND_PRIZE_POOL || '10000',
        6,
      ),
    },
    {
      tier: 2,
      name: 'Premium',
      instantAmount: ethers.parseUnits(
        process.env.INITIAL_PREMIUM_INSTANT_POOL || '10000',
        6,
      ),
      grandPrizeAmount: ethers.parseUnits(
        process.env.INITIAL_PREMIUM_GRAND_PRIZE_POOL || '25000',
        6,
      ),
    },
  ];

  // Calculate total funding needed
  const totalFunding = tierFunding.reduce((total, tier) => {
    return total + tier.instantAmount + tier.grandPrizeAmount;
  }, 0n);

  console.log('\n💰 Multi-Tier Funding Configuration:');
  tierFunding.forEach((tier) => {
    console.log(`   ${tier.name} Tier (${tier.tier}):`);
    console.log(
      `     Instant Pool: $${ethers.formatUnits(tier.instantAmount, 6)}`,
    );
    console.log(
      `     Grand Prize Pool: $${ethers.formatUnits(tier.grandPrizeAmount, 6)}`,
    );
  });
  console.log(`   Total Required: $${ethers.formatUnits(totalFunding, 6)}`);

  // Check if deployer has enough USDC
  if (deployerBalance < totalFunding) {
    console.log('\n⚠️  Insufficient USDC balance for full funding!');

    if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
      console.log('🔧 Attempting to mint USDC for funding...');
      try {
        const mockUsdc = await ethers.getContractAt('MockUSDC', usdcAddress);
        const mintTx = await mockUsdc.mint(deployer.address, totalFunding);
        await mintTx.wait();
        console.log(`✅ Minted $${ethers.formatUnits(totalFunding, 6)} USDC`);

        const newBalance = await usdc.balanceOf(deployer.address);
        console.log(
          `💳 New USDC balance: $${ethers.formatUnits(newBalance, 6)}`,
        );
      } catch (error) {
        console.log('❌ Failed to mint USDC:', error);
        process.exit(1);
      }
    } else {
      console.log('❌ Need real USDC for funding. Get from faucet or bridge.');
      process.exit(1);
    }
  }

  // Fund each tier
  console.log('\n🔓 Approving USDC spending...');
  const approveTx = await usdc.approve(chainluckAddress, totalFunding);
  await approveTx.wait();
  console.log('✅ USDC spending approved');

  console.log('\n💸 Funding tier pools...');

  for (const tierConfig of tierFunding) {
    try {
      console.log(
        `\n🎯 Funding ${tierConfig.name} Tier (${tierConfig.tier})...`,
      );

      const fundTx = await chainluck.refillPools(
        tierConfig.tier,
        tierConfig.instantAmount,
        tierConfig.grandPrizeAmount,
      );
      const receipt = await fundTx.wait();

      console.log(`✅ ${tierConfig.name} tier funded successfully!`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      // Verify funding
      const tierStats = await chainluck.getTierStats(tierConfig.tier);
      console.log(`   Instant Pool: $${ethers.formatUnits(tierStats[2], 6)}`);
      console.log(
        `   Grand Prize Pool: $${ethers.formatUnits(tierStats[3], 6)}`,
      );
    } catch (error) {
      console.log(`❌ Failed to fund ${tierConfig.name} tier:`, error.message);
    }
  }

  // Show final statistics
  console.log('\n📊 Final Pool Status:');
  const globalStats = await chainluck.getGlobalStats();
  console.log(
    `   Total Instant Pools: $${ethers.formatUnits(globalStats[2], 6)}`,
  );
  console.log(
    `   Total Grand Prize Pools: $${ethers.formatUnits(globalStats[3], 6)}`,
  );
  console.log(`   Contract Balance: $${ethers.formatUnits(globalStats[4], 6)}`);

  console.log('\n🎉 Multi-tier pool funding completed successfully!');
  console.log(
    '🔄 Run "npm run sync:config" to sync frontend with updated pools',
  );
  console.log('🎮 Ready for multi-tier gameplay testing!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Pool funding failed:', error);
    process.exit(1);
  });
