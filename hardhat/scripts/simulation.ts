// File: hardhat/scripts/comprehensive-simulation.ts
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

interface SimulationResults {
  totalTickets: number;
  totalRevenue: number;
  totalGuaranteedWins: number;
  grandPrizeWins: number;
  totalGrandPrizePayouts: number;
  platformProfit: number;
  profitMargin: number;
  grandPrizeWinners: Array<{
    user: string;
    amount: number;
    prizeIndex: number;
  }>;
}

interface TicketOption {
  count: number;
  price: number;
}

const TICKET_OPTIONS: TicketOption[] = [
  { count: 1, price: 3.5 },
  { count: 5, price: 17.5 },
  { count: 10, price: 35.0 },
  { count: 20, price: 70.0 },
  { count: 50, price: 175.0 },
];

async function main(): Promise<void> {
  console.log('🎰 Starting ChainLuck Comprehensive Simulation...\n');

  // Deploy contracts
  const contracts = await deployContracts();

  // Setup test users
  const testUsers = await setupTestUsers(contracts.usdc, contracts.lottery);

  // Run simulations
  await runBasicFunctionalityTest(contracts, testUsers);
  await runProfitabilitySimulation(contracts, testUsers, 1000); // 1000 tickets
  await runEdgeCaseTests(contracts, testUsers);

  console.log('🎉 All simulations completed successfully!');
}

async function deployContracts() {
  console.log('📦 Deploying contracts...');

  // Deploy Mock USDC
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();

  // Deploy ChainLuck Lottery
  const ChainLuckLottery = await ethers.getContractFactory('ChainLuckLottery');
  const lottery = await ChainLuckLottery.deploy(await usdc.getAddress());
  await lottery.waitForDeployment();

  console.log(`✅ USDC deployed to: ${await usdc.getAddress()}`);
  console.log(`✅ Lottery deployed to: ${await lottery.getAddress()}`);

  // Initial funding
  const initialFunding = ethers.parseUnits('50000', 6); // $50,000
  await usdc.approve(await lottery.getAddress(), initialFunding);
  await lottery.refillPools(
    ethers.parseUnits('10000', 6), // $10,000 instant pool
    ethers.parseUnits('20000', 6), // $20,000 grand prize pool
  );

  console.log('✅ Pools funded with $30,000 total\n');

  return { usdc, lottery };
}

async function setupTestUsers(usdc: Contract, lottery: Contract) {
  console.log('👥 Setting up test users...');

  const [owner, ...users] = await ethers.getSigners();
  const testUsers = users.slice(0, 20); // Use 20 test users

  // Fund each user with USDC
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    const fundAmount = ethers.parseUnits('5000', 6); // $5,000 each

    await usdc.mint(user.address, fundAmount);
    await usdc.connect(user).approve(await lottery.getAddress(), fundAmount);

    if (i < 5) {
      console.log(
        `✅ User ${i + 1} (${user.address.slice(0, 8)}...) funded with $5,000`,
      );
    }
  }

  console.log(`✅ ${testUsers.length} users funded and approved\n`);
  return testUsers;
}

async function runBasicFunctionalityTest(contracts: any, users: any[]) {
  console.log('🧪 Testing Basic Functionality...');

  const { lottery, usdc } = contracts;
  const user = users[0];

  // Test each ticket option
  for (const option of TICKET_OPTIONS) {
    console.log(
      `\n🎫 Testing ${option.count} ticket${
        option.count > 1 ? 's' : ''
      } purchase ($${option.price})`,
    );

    const initialBalance = await usdc.balanceOf(user.address);
    const initialStats = await lottery.getUserStats(user.address);

    // Buy tickets
    const tx = await lottery.connect(user).buyTickets(option.count);
    const receipt = await tx.wait();

    // Check results
    const finalBalance = await usdc.balanceOf(user.address);
    const finalStats = await lottery.getUserStats(user.address);

    const costUSDC = ethers.parseUnits(option.price.toString(), 6);
    const guaranteedWin = (costUSDC * 750n) / 10000n; // 7.5%

    console.log(`   💰 Cost: $${option.price}`);
    console.log(
      `   🎁 Guaranteed Win: $${ethers.formatUnits(guaranteedWin, 6)}`,
    );
    console.log(
      `   💳 USDC Spent: $${ethers.formatUnits(
        initialBalance - finalBalance,
        6,
      )}`,
    );
    console.log(`   🏆 Total Won: $${ethers.formatUnits(finalStats[1], 6)}`);

    // Claim wins
    if (finalStats[2] > 0) {
      await lottery.connect(user).claimWins();
      console.log(`   ✅ Wins claimed successfully`);
    }

    // Check for grand prize events
    const grandPrizeEvents = receipt.logs.filter((log: any) => {
      try {
        const parsed = lottery.interface.parseLog(log);
        return parsed.name === 'GrandPrizeWon';
      } catch {
        return false;
      }
    });

    if (grandPrizeEvents.length > 0) {
      grandPrizeEvents.forEach((event: any) => {
        const parsed = lottery.interface.parseLog(event);
        console.log(
          `   🎊 GRAND PRIZE WON: ${ethers.formatUnits(parsed.args.amount, 6)}`,
        );
      });
    }
  }

  console.log('\n✅ Basic functionality test completed\n');
}

async function runProfitabilitySimulation(
  contracts: any,
  users: any[],
  totalTickets: number,
) {
  console.log(
    `💹 Running Profitability Simulation (${totalTickets} tickets)...`,
  );

  const { lottery, usdc } = contracts;
  const results: SimulationResults = {
    totalTickets: 0,
    totalRevenue: 0,
    totalGuaranteedWins: 0,
    grandPrizeWins: 0,
    totalGrandPrizePayouts: 0,
    platformProfit: 0,
    profitMargin: 0,
    grandPrizeWinners: [],
  };

  const initialContractBalance = await usdc.balanceOf(
    await lottery.getAddress(),
  );
  const initialOwnerBalance = await usdc.balanceOf(await lottery.owner());

  // Simulate ticket purchases
  let ticketsSold = 0;
  const userIndex = 0;

  while (ticketsSold < totalTickets) {
    const user = users[userIndex % users.length];
    const ticketOption =
      TICKET_OPTIONS[Math.floor(Math.random() * TICKET_OPTIONS.length)];

    // Don't exceed target
    if (ticketsSold + ticketOption.count > totalTickets) {
      const remainingTickets = totalTickets - ticketsSold;
      const smallerOption = TICKET_OPTIONS.find(
        (opt) => opt.count <= remainingTickets,
      );
      if (!smallerOption) break;
      ticketOption.count = smallerOption.count;
      ticketOption.price = smallerOption.price;
    }

    try {
      const tx = await lottery.connect(user).buyTickets(ticketOption.count);
      const receipt = await tx.wait();

      ticketsSold += ticketOption.count;
      results.totalTickets += ticketOption.count;
      results.totalRevenue += ticketOption.price;

      // Calculate guaranteed wins
      const guaranteedWin = ticketOption.price * 0.075;
      results.totalGuaranteedWins += guaranteedWin;

      // Check for grand prizes
      const grandPrizeEvents = receipt.logs.filter((log: any) => {
        try {
          const parsed = lottery.interface.parseLog(log);
          return parsed.name === 'GrandPrizeWon';
        } catch {
          return false;
        }
      });

      grandPrizeEvents.forEach((event: any) => {
        const parsed = lottery.interface.parseLog(event);
        const amount = parseFloat(ethers.formatUnits(parsed.args.amount, 6));
        results.grandPrizeWins++;
        results.totalGrandPrizePayouts += amount;
        results.grandPrizeWinners.push({
          user: parsed.args.user,
          amount: amount,
          prizeIndex: parseInt(parsed.args.prizeIndex.toString()),
        });
      });

      // Progress indicator
      if (ticketsSold % 100 === 0) {
        process.stdout.write(
          `\r   📊 Progress: ${ticketsSold}/${totalTickets} tickets (${Math.round(
            (ticketsSold / totalTickets) * 100,
          )}%)`,
        );
      }
    } catch (error) {
      console.log(`\n⚠️  Error with user ${user.address}: ${error}`);
      break;
    }
  }

  console.log(`\n\n📈 SIMULATION RESULTS:`);
  console.log(`══════════════════════════════════════════════════════════════`);

  // Final contract stats
  const finalStats = await lottery.getContractStats();
  const finalContractBalance = await usdc.balanceOf(await lottery.getAddress());
  const finalOwnerBalance = await usdc.balanceOf(await lottery.owner());

  // Calculate actual profit
  const ownerProfitWithdrawn = finalOwnerBalance - initialOwnerBalance;
  const remainingProfit = finalContractBalance - finalStats[2] - finalStats[3]; // Balance - pools
  const totalActualProfit =
    parseFloat(ethers.formatUnits(ownerProfitWithdrawn, 6)) +
    parseFloat(
      ethers.formatUnits(remainingProfit > 0 ? remainingProfit : 0n, 6),
    );

  results.platformProfit = totalActualProfit;
  results.profitMargin = (results.platformProfit / results.totalRevenue) * 100;

  console.log(`🎫 Total Tickets Sold: ${results.totalTickets}`);
  console.log(`💰 Total Revenue: ${results.totalRevenue.toFixed(2)}`);
  console.log(
    `🎁 Guaranteed Wins Paid: ${results.totalGuaranteedWins.toFixed(2)}`,
  );
  console.log(`🏆 Grand Prizes Won: ${results.grandPrizeWins}`);
  console.log(
    `💎 Grand Prize Payouts: ${results.totalGrandPrizePayouts.toFixed(2)}`,
  );
  console.log(`💼 Platform Profit: ${results.platformProfit.toFixed(2)}`);
  console.log(`📊 Profit Margin: ${results.profitMargin.toFixed(1)}%`);

  // Pool status
  console.log(`\n🏦 POOL STATUS:`);
  console.log(
    `   Instant Payout Pool: ${ethers.formatUnits(finalStats[2], 6)}`,
  );
  console.log(`   Grand Prize Pool: ${ethers.formatUnits(finalStats[3], 6)}`);
  console.log(`   Contract Balance: ${ethers.formatUnits(finalStats[4], 6)}`);

  // Grand prize breakdown
  if (results.grandPrizeWinners.length > 0) {
    console.log(`\n🎊 GRAND PRIZE WINNERS:`);
    results.grandPrizeWinners.forEach((winner, i) => {
      const prizeNames = ['$10,000', '$5,000', '$2,000', '$1,000', '$500'];
      console.log(
        `   ${i + 1}. ${winner.user.slice(0, 8)}... won ${
          prizeNames[winner.prizeIndex]
        }`,
      );
    });
  }

  // Expected vs Actual analysis
  const expectedGrandPrizePayout = calculateExpectedGrandPrizePayout(
    results.totalTickets,
  );
  const grandPrizeVariance =
    results.totalGrandPrizePayouts - expectedGrandPrizePayout;

  console.log(`\n🎯 VARIANCE ANALYSIS:`);
  console.log(
    `   Expected Grand Prize Payout: ${expectedGrandPrizePayout.toFixed(4)}`,
  );
  console.log(
    `   Actual Grand Prize Payout: ${results.totalGrandPrizePayouts.toFixed(
      2,
    )}`,
  );
  console.log(
    `   Variance: ${
      grandPrizeVariance >= 0 ? '+' : ''
    }${grandPrizeVariance.toFixed(2)}`,
  );

  console.log(`\n✅ Profitability simulation completed\n`);
  return results;
}

function calculateExpectedGrandPrizePayout(tickets: number): number {
  const prizes = [
    { amount: 10000, odds: 10_000_000 },
    { amount: 5000, odds: 5_000_000 },
    { amount: 2000, odds: 2_000_000 },
    { amount: 1000, odds: 1_000_000 },
    { amount: 500, odds: 500_000 },
  ];

  return prizes.reduce((total, prize) => {
    return total + (tickets * prize.amount) / prize.odds;
  }, 0);
}

async function runEdgeCaseTests(contracts: any, users: any[]) {
  console.log('🔍 Running Edge Case Tests...');

  const { lottery, usdc } = contracts;

  // Test 1: Maximum ticket purchase
  console.log('\n🎫 Test 1: Maximum ticket purchase (50 tickets)');
  try {
    await lottery.connect(users[0]).buyTickets(50);
    console.log('   ✅ 50-ticket purchase successful');
  } catch (error) {
    console.log(`   ❌ 50-ticket purchase failed: ${error}`);
  }

  // Test 2: Invalid ticket count
  console.log('\n🚫 Test 2: Invalid ticket count (7 tickets)');
  try {
    await lottery.connect(users[1]).buyTickets(7);
    console.log('   ❌ Invalid ticket count should have failed');
  } catch (error) {
    console.log('   ✅ Invalid ticket count correctly rejected');
  }

  // Test 3: Insufficient balance
  console.log('\n💳 Test 3: Insufficient balance');
  const poorUser = users[18]; // Use users[18] instead of users[19]

  try {
    // Use all their balance first
    await lottery.connect(poorUser).buyTickets(50); // $175
    await lottery.connect(poorUser).buyTickets(50); // $175
    await lottery.connect(poorUser).buyTickets(50); // $175
    await lottery.connect(poorUser).buyTickets(50); // $175
    await lottery.connect(poorUser).buyTickets(50); // $175
    await lottery.connect(poorUser).buyTickets(50); // $175
    // Now they should have spent $1,050 out of $5,000

    // Try to buy more until we run out (should have ~$3,950 left)
    let purchaseCount = 0;
    for (let i = 0; i < 30; i++) {
      try {
        await lottery.connect(poorUser).buyTickets(50); // $175 each
        purchaseCount++;
      } catch (error) {
        console.log(
          `   ✅ Correctly rejected insufficient balance after ${
            purchaseCount + 6
          } purchases`,
        );
        break;
      }
    }

    if (purchaseCount >= 30) {
      console.log('   ❌ Should have run out of funds');
    }
  } catch (error) {
    console.log('   ✅ Correctly rejected insufficient balance');
  }

  // Test 4: Claim wins with no pending wins
  console.log('\n🎁 Test 4: Claim wins with no pending amount');
  const freshUser = users[18];
  try {
    await lottery.connect(freshUser).claimWins();
    console.log('   ❌ Should have failed - no pending wins');
  } catch (error) {
    console.log('   ✅ Correctly rejected - no pending wins');
  }

  // Test 5: Owner functions
  console.log('\n👑 Test 5: Owner functions');
  const [owner] = await ethers.getSigners();

  try {
    await lottery.connect(owner).withdrawProfits();
    console.log('   ✅ Owner profit withdrawal successful');
  } catch (error) {
    console.log(`   ⚠️  Owner withdrawal: ${error}`);
  }

  // Test 6: Non-owner trying owner functions
  console.log('\n🚫 Test 6: Non-owner access control');
  try {
    await lottery.connect(users[0]).withdrawProfits();
    console.log('   ❌ Non-owner should not access owner functions');
  } catch (error) {
    console.log('   ✅ Access control working correctly');
  }

  console.log('\n✅ Edge case tests completed\n');
}

// Helper function to run multiple simulations
async function runMultipleSimulations() {
  console.log('🔄 Running Multiple Simulations for Statistical Analysis...\n');

  const simulationSizes = [100, 500, 1000, 5000];
  const results: Array<{
    size: number;
    profitMargin: number;
    grandPrizes: number;
  }> = [];

  for (const size of simulationSizes) {
    console.log(`\n📊 Simulation: ${size} tickets`);

    // Fresh deployment for each simulation
    const contracts = await deployContracts();
    const users = await setupTestUsers(contracts.usdc, contracts.lottery);
    const result = await runProfitabilitySimulation(contracts, users, size);

    results.push({
      size: size,
      profitMargin: result.profitMargin,
      grandPrizes: result.grandPrizeWins,
    });
  }

  console.log('\n📈 STATISTICAL SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  results.forEach((r) => {
    console.log(
      `${r.size.toString().padStart(4)} tickets: ${r.profitMargin.toFixed(
        1,
      )}% profit, ${r.grandPrizes} grand prizes`,
    );
  });

  const avgProfitMargin =
    results.reduce((sum, r) => sum + r.profitMargin, 0) / results.length;
  console.log(`\nAverage Profit Margin: ${avgProfitMargin.toFixed(1)}%`);
}

// Main execution
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
