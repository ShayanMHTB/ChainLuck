// File: hardhat/scripts/deploy-simplified.ts
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

interface DeploymentConfig {
  network: string;
  useRealTokens: boolean;
  initialFunding: {
    instantPool: string;
    grandPrizePool: string;
  };
}

async function main(): Promise<void> {
  console.log('🚀 Deploying ChainLuck Simplified Lottery...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log('🔑 Deploying with account:', deployer.address);
  console.log('🌐 Network:', network.name);
  console.log(
    '💰 Account balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
  );

  // Configuration based on network
  const config: DeploymentConfig = getNetworkConfig(network.name);

  // Deploy tokens and lottery
  const deployment = await deployContracts(config);

  // Setup initial funding
  await setupInitialFunding(deployment, config, deployer);

  // Verify deployment
  await verifyDeployment(deployment);

  // Display results
  displayDeploymentResults(deployment, config);

  console.log('\n🎉 Deployment completed successfully!');
}

function getNetworkConfig(networkName: string): DeploymentConfig {
  const configs: Record<string, DeploymentConfig> = {
    localhost: {
      network: 'localhost',
      useRealTokens: false,
      initialFunding: {
        instantPool: '5000', // $5,000
        grandPrizePool: '15000', // $15,000
      },
    },
    mumbai: {
      network: 'mumbai',
      useRealTokens: false,
      initialFunding: {
        instantPool: '1000', // $1,000
        grandPrizePool: '5000', // $5,000
      },
    },
    polygon: {
      network: 'polygon',
      useRealTokens: true,
      initialFunding: {
        instantPool: '2000', // $2,000
        grandPrizePool: '10000', // $10,000
      },
    },
  };

  return configs[networkName] || configs['localhost'];
}

async function deployContracts(config: DeploymentConfig) {
  console.log('📄 Deploying contracts...\n');

  let usdcAddress: string;
  let usdc: Contract;

  if (config.useRealTokens) {
    // Use real USDC on mainnet
    const realUSDCAddresses: Record<string, string> = {
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      mumbai: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
    };

    usdcAddress = realUSDCAddresses[config.network];
    if (!usdcAddress) {
      throw new Error(`No real USDC address configured for ${config.network}`);
    }

    usdc = await ethers.getContractAt('IERC20', usdcAddress);
    console.log(`✅ Using real USDC at: ${usdcAddress}`);
  } else {
    // Deploy mock USDC for testing
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log(`✅ Mock USDC deployed to: ${usdcAddress}`);
  }

  // Deploy ChainLuck Lottery
  console.log('\n🎰 Deploying ChainLuck Lottery...');
  const ChainLuckLottery = await ethers.getContractFactory('ChainLuckLottery');
  const lottery = await ChainLuckLottery.deploy(usdcAddress);
  await lottery.waitForDeployment();

  const lotteryAddress = await lottery.getAddress();
  console.log(`✅ ChainLuck Lottery deployed to: ${lotteryAddress}`);

  return {
    usdc,
    lottery,
    usdcAddress,
    lotteryAddress,
  };
}

async function setupInitialFunding(
  deployment: any,
  config: DeploymentConfig,
  deployer: any,
) {
  console.log('\n💰 Setting up initial funding...');

  const { usdc, lottery } = deployment;

  // Calculate amounts
  const instantPoolAmount = ethers.parseUnits(
    config.initialFunding.instantPool,
    6,
  );
  const grandPrizePoolAmount = ethers.parseUnits(
    config.initialFunding.grandPrizePool,
    6,
  );
  const totalFunding = instantPoolAmount + grandPrizePoolAmount;

  if (!config.useRealTokens) {
    // For mock tokens, mint to deployer first
    console.log('🪙 Minting mock USDC for initial funding...');
    await usdc.mint(deployer.address, totalFunding);
  }

  // Check deployer balance
  const deployerBalance = await usdc.balanceOf(deployer.address);
  console.log(
    `💳 Deployer USDC balance: $${ethers.formatUnits(deployerBalance, 6)}`,
  );

  if (deployerBalance < totalFunding) {
    throw new Error(
      `Insufficient USDC balance. Need $${ethers.formatUnits(
        totalFunding,
        6,
      )}, have $${ethers.formatUnits(deployerBalance, 6)}`,
    );
  }

  // Approve and fund pools
  console.log('🔓 Approving USDC for lottery contract...');
  await usdc.approve(await lottery.getAddress(), totalFunding);

  console.log('🏆 Funding lottery pools...');
  await lottery.refillPools(instantPoolAmount, grandPrizePoolAmount);

  console.log(`✅ Instant pool funded: $${config.initialFunding.instantPool}`);
  console.log(
    `✅ Grand prize pool funded: $${config.initialFunding.grandPrizePool}`,
  );
}

async function verifyDeployment(deployment: any) {
  console.log('\n🔍 Verifying deployment...');

  const { lottery } = deployment;

  // Test contract stats
  const stats = await lottery.getContractStats();
  console.log(`📊 Total tickets sold: ${stats[0]}`);
  console.log(`💵 Total revenue: $${ethers.formatUnits(stats[1], 6)}`);
  console.log(`💰 Instant pool: $${ethers.formatUnits(stats[2], 6)}`);
  console.log(`🏆 Grand prize pool: $${ethers.formatUnits(stats[3], 6)}`);
  console.log(`🏦 Contract balance: $${ethers.formatUnits(stats[4], 6)}`);

  // Test ticket pricing
  const ticketPrices = [1, 5, 10, 20, 50];
  console.log('\n💲 Ticket pricing verification:');
  for (const count of ticketPrices) {
    const price = await lottery.getTicketPrice(count);
    console.log(
      `   ${count} ticket${count > 1 ? 's' : ''}: $${ethers.formatUnits(
        price,
        6,
      )}`,
    );
  }

  // Test grand prize info
  const [amounts, odds] = await lottery.getGrandPrizeInfo();
  console.log('\n🎯 Grand prize configuration:');
  for (let i = 0; i < amounts.length; i++) {
    console.log(
      `   $${ethers.formatUnits(amounts[i], 6)}: 1 in ${odds[
        i
      ].toLocaleString()}`,
    );
  }

  console.log('\n✅ Deployment verification completed');
}

function displayDeploymentResults(deployment: any, config: DeploymentConfig) {
  console.log('\n📋 DEPLOYMENT SUMMARY');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log(`🌐 Network: ${config.network}`);
  console.log(`🪙 USDC Address: ${deployment.usdcAddress}`);
  console.log(`🎰 Lottery Address: ${deployment.lotteryAddress}`);
  console.log(
    `💰 Initial Funding: $${
      parseInt(config.initialFunding.instantPool) +
      parseInt(config.initialFunding.grandPrizePool)
    }`,
  );

  console.log('\n🔗 Verification Commands:');
  if (config.network !== 'localhost') {
    console.log(
      `npx hardhat verify --network ${config.network} ${deployment.lotteryAddress} ${deployment.usdcAddress}`,
    );
  }

  console.log('\n🎮 Quick Test Commands:');
  console.log(
    `npx hardhat run scripts/test-interceptions.ts --network ${config.network}`,
  );
  console.log(
    `npx hardhat run scripts/simulation.ts --network ${config.network}`,
  );

  console.log('\n⚙️ Environment Variables (add to .env):');
  console.log(`CHAINLUCK_ADDRESS=${deployment.lotteryAddress}`);
  console.log(`USDC_ADDRESS=${deployment.usdcAddress}`);

  console.log('\n🎯 Ready for Frontend Integration!');
  console.log('Update your frontend constants with these addresses:');
  console.log(`  LOTTERY_CONTRACT: "${deployment.lotteryAddress}"`);
  console.log(`  USDC_CONTRACT: "${deployment.usdcAddress}"`);
}

// Quick deployment test
async function quickDeploymentTest(deployment: any) {
  console.log('\n🧪 Running quick deployment test...');

  const { lottery, usdc } = deployment;
  const [deployer, testUser] = await ethers.getSigners();

  try {
    // Give test user some USDC
    if (usdc.mint) {
      await usdc.mint(testUser.address, ethers.parseUnits('100', 6));
    }

    // Approve lottery contract
    await usdc
      .connect(testUser)
      .approve(await lottery.getAddress(), ethers.parseUnits('100', 6));

    // Buy 1 ticket
    const tx = await lottery.connect(testUser).buyTickets(1);
    await tx.wait();

    // Check user stats
    const stats = await lottery.getUserStats(testUser.address);
    console.log(
      `✅ Test purchase successful - User spent: $${ethers.formatUnits(
        stats[0],
        6,
      )}`,
    );

    // Claim wins
    if (stats[2] > 0) {
      await lottery.connect(testUser).claimWins();
      console.log(`✅ Win claim successful`);
    }

    console.log('✅ Quick deployment test passed');
  } catch (error) {
    console.log(`❌ Quick deployment test failed: ${error}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
