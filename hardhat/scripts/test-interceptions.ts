// File: hardhat/scripts/test-interactions.ts
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

interface ContractAddresses {
  chainluck: string;
  usdt: string;
  usdc: string;
  dai: string;
}

async function main(): Promise<void> {
  console.log('🧪 Running test interactions...');

  const addresses: ContractAddresses = {
    chainluck: process.env.CHAINLUCK_ADDRESS || '',
    usdt: process.env.USDT_ADDRESS || '',
    usdc: process.env.USDC_ADDRESS || '',
    dai: process.env.DAI_ADDRESS || '',
  };

  // Validate addresses
  if (
    !addresses.chainluck ||
    !addresses.usdt ||
    !addresses.usdc ||
    !addresses.dai
  ) {
    console.error(
      '❌ Contract addresses not found. Please set environment variables or deploy contracts first.',
    );
    return;
  }

  // Get contracts
  const chainluck = await ethers.getContractAt(
    'ChainLuckLottery',
    addresses.chainluck,
  );
  const usdt = await ethers.getContractAt('MockUSDT', addresses.usdt);
  const usdc = await ethers.getContractAt('MockUSDC', addresses.usdc);
  const dai = await ethers.getContractAt('MockDAI', addresses.dai);

  const [owner, user1, user2, user3] = await ethers.getSigners();

  console.log('\n👥 Test Users:');
  console.log(`   Owner: ${owner.address}`);
  console.log(`   User1: ${user1.address}`);
  console.log(`   User2: ${user2.address}`);
  console.log(`   User3: ${user3.address}`);

  // Setup: Give users tokens and approve spending
  await setupTestUsers(
    [user1, user2, user3],
    { usdt, usdc, dai },
    addresses.chainluck,
  );

  // Test 1: User1 buys tickets (no referrer)
  console.log('\n🎫 Test 1: User1 buying tickets...');
  await buyTicketsTest(user1, chainluck, usdt, 'USDT');
  await buyTicketsTest(user1, chainluck, usdc, 'USDC');

  // Test 2: User2 buys tickets with User1 as referrer
  console.log('\n🤝 Test 2: User2 buying tickets with referral...');
  await buyTicketsWithReferralTest(
    user2,
    user1.address,
    chainluck,
    usdt,
    'USDT',
  );

  // Test 3: Check stats and claim wins
  console.log('\n📊 Test 3: Checking stats and claiming wins...');
  await checkStatsAndClaimWins(user1, chainluck, 'User1');
  await checkStatsAndClaimWins(user2, chainluck, 'User2');

  // Test 4: Owner withdraws profits
  console.log('\n💰 Test 4: Owner withdrawing profits...');
  await ownerWithdrawTest(owner, chainluck, addresses);

  console.log('\n🎉 All tests completed successfully!');
}

async function setupTestUsers(
  users: any[],
  tokens: { usdt: Contract; usdc: Contract; dai: Contract },
  chainluckAddress: string,
): Promise<void> {
  console.log('\n🔧 Setting up test users with tokens...');

  const ticketPrice = ethers.parseUnits('5', 6); // 5 USD
  const approveAmount = ethers.parseUnits('1000', 6); // 1000 USD worth
  const daiApproveAmount = ethers.parseUnits('1000', 18); // 1000 DAI

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`   👤 Setting up User${i + 1} (${user.address})`);

    try {
      // Give tokens using faucet
      await tokens.usdt.connect(user).faucet();
      await tokens.usdc.connect(user).faucet();
      await tokens.dai.connect(user).faucet();

      // Approve ChainLuck to spend tokens
      await tokens.usdt.connect(user).approve(chainluckAddress, approveAmount);
      await tokens.usdc.connect(user).approve(chainluckAddress, approveAmount);
      await tokens.dai
        .connect(user)
        .approve(chainluckAddress, daiApproveAmount);

      console.log(`   ✅ User${i + 1} setup complete`);
    } catch (error) {
      console.log(`   ❌ Failed to setup User${i + 1}: ${error}`);
    }
  }
}

async function buyTicketsTest(
  user: any,
  chainluck: Contract,
  token: Contract,
  tokenName: string,
): Promise<void> {
  try {
    const tokenAddress = await token.getAddress();
    const tx = await chainluck
      .connect(user)
      .buyTicket(ethers.ZeroAddress, tokenAddress);
    await tx.wait();
    console.log(
      `   ✅ ${user.address.slice(0, 8)}... bought ticket with ${tokenName}`,
    );
  } catch (error) {
    console.log(`   ❌ Failed to buy ticket with ${tokenName}: ${error}`);
  }
}

async function buyTicketsWithReferralTest(
  user: any,
  referrer: string,
  chainluck: Contract,
  token: Contract,
  tokenName: string,
): Promise<void> {
  try {
    const tokenAddress = await token.getAddress();

    // Buy first ticket with referrer
    let tx = await chainluck.connect(user).buyTicket(referrer, tokenAddress);
    await tx.wait();
    console.log(
      `   ✅ ${user.address.slice(0, 8)}... bought first ticket with referrer`,
    );

    // Buy second ticket to trigger referral reward
    tx = await chainluck
      .connect(user)
      .buyTicket(ethers.ZeroAddress, tokenAddress);
    await tx.wait();
    console.log(
      `   ✅ ${user.address.slice(
        0,
        8,
      )}... bought second ticket (referral reward triggered)`,
    );
  } catch (error) {
    console.log(`   ❌ Failed referral test: ${error}`);
  }
}

async function checkStatsAndClaimWins(
  user: any,
  chainluck: Contract,
  userName: string,
): Promise<void> {
  try {
    const stats = await chainluck.getUserStats(user.address);

    console.log(`   📈 ${userName} Stats:`);
    console.log(`      Spent: ${ethers.formatUnits(stats[0], 6)} USD`);
    console.log(`      Pending USDT: ${ethers.formatUnits(stats[1], 6)}`);
    console.log(`      Pending USDC: ${ethers.formatUnits(stats[2], 6)}`);
    console.log(`      Pending DAI: ${ethers.formatUnits(stats[3], 18)}`);
    console.log(`      Total Won: ${ethers.formatUnits(stats[4], 6)} USD`);
    console.log(`      Can Refer: ${stats[5]}`);
    console.log(`      Referral Count: ${stats[6]}`);

    // Claim wins if any
    if (stats[1] > 0 || stats[2] > 0 || stats[3] > 0) {
      const tx = await chainluck.connect(user).claimAllWins();
      await tx.wait();
      console.log(`   💰 ${userName} claimed all wins`);
    }
  } catch (error) {
    console.log(`   ❌ Failed to check stats for ${userName}: ${error}`);
  }
}

async function ownerWithdrawTest(
  owner: any,
  chainluck: Contract,
  addresses: ContractAddresses,
): Promise<void> {
  try {
    const contractStats = await chainluck.getContractStats();
    console.log(`   📊 Contract has ${contractStats[0]} tickets sold`);

    // Try to withdraw profits from each token
    const tokens = [
      { address: addresses.usdt, name: 'USDT' },
      { address: addresses.usdc, name: 'USDC' },
      { address: addresses.dai, name: 'DAI' },
    ];

    for (const token of tokens) {
      try {
        const tx = await chainluck
          .connect(owner)
          .withdrawProfits(token.address);
        await tx.wait();
        console.log(`   ✅ Owner withdrew ${token.name} profits`);
      } catch (error) {
        console.log(
          `   ⚠️  No ${token.name} profits to withdraw (expected for new contract)`,
        );
      }
    }
  } catch (error) {
    console.log(`   ❌ Owner withdrawal test failed: ${error}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
