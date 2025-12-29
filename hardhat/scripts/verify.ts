// scripts/verify.ts
import { run } from 'hardhat';
import 'dotenv/config';

async function main() {
  console.log('🔍 Verifying ChainLuck contract on Etherscan...\n');

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

  console.log('📋 Verification Details:');
  console.log(`   Contract: ${chainluckAddress}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   Network: ${deploymentInfo.network}`);
  console.log(`   Chain ID: ${deploymentInfo.chainId}`);

  try {
    await run('verify:verify', {
      address: chainluckAddress,
      constructorArguments: [
        usdcAddress, // Only USDC address needed now
      ],
    });

    console.log('✅ Contract verified successfully!');
    console.log(
      `🔗 View on Etherscan: https://sepolia.etherscan.io/address/${chainluckAddress}`,
    );
  } catch (error) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log('✅ Contract is already verified!');
      console.log(
        `🔗 View on Etherscan: https://sepolia.etherscan.io/address/${chainluckAddress}`,
      );
    } else {
      console.error('❌ Verification failed:', error.message);
      console.log('\n💡 Manual verification command:');
      console.log(
        `npx hardhat verify --network sepolia ${chainluckAddress} "${usdcAddress}"`,
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
