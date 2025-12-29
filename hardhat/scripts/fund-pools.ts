// scripts/fund-pools.ts
import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('💰 Funding ChainLuck pools on Sepolia...\n');

  const [deployer] = await ethers.getSigners();

  // Load deployment info
  const fs = require('fs');
  const path = require('path');

  let deploymentInfo;
  try {
    const deploymentPath = path.join(__dirname, '../deployments.json');
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
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
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   Deployer: ${deployer.address}`);

  // Check deployer USDC balance
  const deployerBalance = await usdc.balanceOf(deployer.address);
  console.log(
    `💳 Deployer USDC balance: $${ethers.formatUnits(deployerBalance, 6)}`,
  );

  // Funding amounts from environment or defaults
  const instantPoolAmount = ethers.parseUnits(
    process.env.INITIAL_INSTANT_POOL || '10000', // $10,000
    6,
  );
  const grandPrizePoolAmount = ethers.parseUnits(
    process.env.INITIAL_GRAND_PRIZE_POOL || '20000', // $20,000
    6,
  );
  const totalFunding = instantPoolAmount + grandPrizePoolAmount;

  console.log('\n💰 Funding Configuration:');
  console.log(`   Instant Pool: $${ethers.formatUnits(instantPoolAmount, 6)}`);
  console.log(
    `   Grand Prize Pool: $${ethers.formatUnits(grandPrizePoolAmount, 6)}`,
  );
  console.log(`   Total Required: $${ethers.formatUnits(totalFunding, 6)}`);

  // Check if deployer has enough USDC
  if (deployerBalance < totalFunding) {
    console.log('\n⚠️  Insufficient USDC balance for funding!');
    console.log('💡 Options:');
    console.log('   1. Get testnet USDC from Circle faucet');
    console.log('   2. Use a different funding amount');
    console.log('   3. Deploy MockUSDC for testing');

    // Ask if user wants to proceed with available balance
    const availableAmount = deployerBalance;
    if (availableAmount > 0) {
      console.log(
        `\n📊 Available for funding: $${ethers.formatUnits(
          availableAmount,
          6,
        )}`,
      );
      console.log('🔄 Proceeding with available balance...');

      // Split available balance proportionally
      const instantProportion =
        (instantPoolAmount * availableAmount) / totalFunding;
      const grandPrizeProportion = availableAmount - instantProportion;

      console.log(
        `   Adjusted Instant Pool: $${ethers.formatUnits(
          instantProportion,
          6,
        )}`,
      );
      console.log(
        `   Adjusted Grand Prize Pool: $${ethers.formatUnits(
          grandPrizeProportion,
          6,
        )}`,
      );

      // Update funding amounts
      const finalInstant = instantProportion;
      const finalGrandPrize = grandPrizeProportion;
      const finalTotal = finalInstant + finalGrandPrize;

      await fundPools(
        chainluck,
        usdc,
        deployer,
        finalInstant,
        finalGrandPrize,
        finalTotal,
      );
    } else {
      console.log('❌ No USDC available for funding. Exiting...');
      process.exit(1);
    }
  } else {
    // Proceed with full funding
    await fundPools(
      chainluck,
      usdc,
      deployer,
      instantPoolAmount,
      grandPrizePoolAmount,
      totalFunding,
    );
  }
}

async function fundPools(
  chainluck: any,
  usdc: any,
  deployer: any,
  instantAmount: bigint,
  grandPrizeAmount: bigint,
  totalAmount: bigint,
) {
  console.log('\n🔓 Approving USDC spending...');

  // Approve ChainLuck to spend USDC
  const approveTx = await usdc.approve(
    await chainluck.getAddress(),
    totalAmount,
  );
  await approveTx.wait();
  console.log('✅ USDC spending approved');

  console.log('\n💸 Funding pools...');

  // Fund the pools
  const fundTx = await chainluck.refillPools(instantAmount, grandPrizeAmount);
  const receipt = await fundTx.wait();

  console.log('✅ Pools funded successfully!');
  console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

  // Verify funding
  console.log('\n📊 Verifying pool balances...');
  const stats = await chainluck.getContractStats();

  console.log(`   Instant Pool: $${ethers.formatUnits(stats[2], 6)}`);
  console.log(`   Grand Prize Pool: $${ethers.formatUnits(stats[3], 6)}`);
  console.log(`   Contract Balance: $${ethers.formatUnits(stats[4], 6)}`);
  console.log(`   Total Tickets Sold: ${stats[0]}`);

  console.log('\n🎉 Pool funding completed successfully!');
  console.log('🎮 Ready for gameplay testing!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Pool funding failed:', error);
    process.exit(1);
  });
