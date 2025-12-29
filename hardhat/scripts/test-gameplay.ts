// scripts/test-gameplay.ts
import { ethers } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('🎮 Testing ChainLuck gameplay on Sepolia...\n');

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
    console.error('❌ Could not load deployment/wallet info. Run setup first.');
    process.exit(1);
  }

  const chainluckAddress = deploymentInfo.contracts.chainluck;
  const usdcAddress = deploymentInfo.contracts.usdc;

  // Get contracts
  const chainluck = await ethers.getContractAt('ChainLuck', chainluckAddress);
  const usdc = await ethers.getContractAt('IERC20', usdcAddress);

  console.log('📋 Test Configuration:');
  console.log(`   ChainLuck: ${chainluckAddress}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   Test Wallets: ${walletInfo.wallets.length}`);

  // Test with first wallet
  const testWallet = new ethers.Wallet(
    walletInfo.wallets[0].privateKey,
    ethers.provider,
  );

  console.log(`\n🧪 Testing with wallet: ${testWallet.address}`);

  // Check balances
  const ethBalance = await ethers.provider.getBalance(testWallet.address);
  const usdcBalance = await usdc.balanceOf(testWallet.address);

  console.log(`💰 ETH Balance: ${ethers.formatEther(ethBalance)}`);
  console.log(`💳 USDC Balance: $${ethers.formatUnits(usdcBalance, 6)}`);

  if (usdcBalance === 0n) {
    console.log('\n❌ No USDC balance for testing!');
    console.log('💡 Get testnet USDC from: https://faucet.circle.com/');
    console.log(`📋 Test wallet address: ${testWallet.address}`);
    return;
  }

  // Connect contracts to test wallet
  const chainluckAsUser = chainluck.connect(testWallet);
  const usdcAsUser = usdc.connect(testWallet);

  // Test 1: Check initial contract stats
  console.log('\n📊 Initial Contract Stats:');
  const initialStats = await chainluck.getContractStats();
  console.log(`   Total tickets sold: ${initialStats[0]}`);
  console.log(`   Instant pool: $${ethers.formatUnits(initialStats[2], 6)}`);
  console.log(
    `   Grand prize pool: $${ethers.formatUnits(initialStats[3], 6)}`,
  );

  // Test 2: Get ticket pricing
  console.log('\n💲 Ticket Pricing:');
  const ticketCounts = [1, 5, 10, 20, 50];
  for (const count of ticketCounts) {
    const price = await chainluck.getTicketPrice(count);
    console.log(
      `   ${count} ticket${count > 1 ? 's' : ''}: $${ethers.formatUnits(
        price,
        6,
      )}`,
    );
  }

  // Test 3: Attempt ticket purchase
  console.log('\n🎫 Testing ticket purchase (1 ticket)...');

  const ticketPrice = await chainluck.getTicketPrice(1);
  console.log(`   Ticket price: $${ethers.formatUnits(ticketPrice, 6)}`);

  if (usdcBalance < ticketPrice) {
    console.log('❌ Insufficient USDC for ticket purchase');
    return;
  }

  try {
    // Approve USDC spending
    console.log('🔓 Approving USDC spending...');
    const approveTx = await usdcAsUser.approve(chainluckAddress, ticketPrice);
    await approveTx.wait();
    console.log('✅ USDC spending approved');

    // Buy ticket
    console.log('🛒 Purchasing ticket...');
    const buyTx = await chainluckAsUser.buyTickets(1);
    const receipt = await buyTx.wait();

    console.log('✅ Ticket purchased successfully!');
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    // Parse events
    const events = receipt.logs
      .map((log: any) => {
        try {
          return chainluck.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    for (const event of events) {
      if (event?.name === 'TicketsPurchased') {
        console.log(`🎟️  Tickets purchased: ${event.args.ticketCount}`);
        console.log(`💰 Cost: $${ethers.formatUnits(event.args.totalCost, 6)}`);
        console.log(
          `🎁 Guaranteed win: $${ethers.formatUnits(
            event.args.guaranteedWin,
            6,
          )}`,
        );
      } else if (event?.name === 'VRFRequested') {
        console.log(`🎲 VRF requested: ${event.args.requestId}`);
      } else if (event?.name === 'GrandPrizeWon') {
        console.log(
          `🎊 GRAND PRIZE WON: $${ethers.formatUnits(event.args.amount, 6)}!`,
        );
      }
    }

    // Check user stats
    console.log('\n📈 User Stats After Purchase:');
    const userStats = await chainluck.getUserStats(testWallet.address);
    console.log(`   Total spent: ${ethers.formatUnits(userStats[0], 6)}`);
    console.log(`   Total won: ${ethers.formatUnits(userStats[1], 6)}`);
    console.log(`   Pending wins: ${ethers.formatUnits(userStats[2], 6)}`);
    console.log(`   Net result: ${ethers.formatUnits(userStats[3], 6)}`);

    // Test 4: Claim wins if any
    if (userStats[2] > 0) {
      console.log('\n💸 Claiming wins...');
      const claimTx = await chainluckAsUser.claimWins();
      await claimTx.wait();
      console.log('✅ Wins claimed successfully!');

      // Check final balance
      const finalUSDCBalance = await usdc.balanceOf(testWallet.address);
      console.log(
        `💳 Final USDC balance: $${ethers.formatUnits(finalUSDCBalance, 6)}`,
      );
    }

    // Test 5: Check updated contract stats
    console.log('\n📊 Updated Contract Stats:');
    const finalStats = await chainluck.getContractStats();
    console.log(`   Total tickets sold: ${finalStats[0]}`);
    console.log(`   Total revenue: $${ethers.formatUnits(finalStats[1], 6)}`);
    console.log(`   Instant pool: $${ethers.formatUnits(finalStats[2], 6)}`);
    console.log(
      `   Grand prize pool: $${ethers.formatUnits(finalStats[3], 6)}`,
    );
  } catch (error) {
    console.error('❌ Gameplay test failed:', error);

    // Provide helpful debugging info
    console.log('\n🔍 Debug Information:');
    console.log(`   Wallet: ${testWallet.address}`);
    console.log(`   USDC Balance: $${ethers.formatUnits(usdcBalance, 6)}`);
    console.log(`   Ticket Price: $${ethers.formatUnits(ticketPrice, 6)}`);
    console.log(`   Contract: ${chainluckAddress}`);
  }

  console.log('\n🎉 Gameplay testing completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
