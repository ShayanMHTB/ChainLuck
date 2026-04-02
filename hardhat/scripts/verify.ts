// hardhat/scripts/verify.ts
import { run } from 'hardhat';
import { join } from 'path';
import { existsSync } from 'fs';
import 'dotenv/config';

async function main() {
  console.log('🔍 Verifying ChainLuck Multi-Tier contract on Etherscan...\n');

  // Load deployment info from new structure
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
    console.error('❌ Could not load deployment info:', error);
    process.exit(1);
  }

  const chainluckAddress = deploymentInfo.contracts.chainluck;
  const usdcAddress = deploymentInfo.contracts.usdc;

  console.log('📋 Verification Details:');
  console.log(`   Contract: ${chainluckAddress}`);
  console.log(`   USDC: ${usdcAddress} (${deploymentInfo.contracts.usdcType})`);
  console.log(`   Network: ${deploymentInfo.network}`);
  console.log(`   Chain ID: ${deploymentInfo.chainId}`);
  console.log(`   Version: ${deploymentInfo.version || 'Multi-Tier v1.0.0'}`);

  try {
    console.log('\n🔍 Verifying ChainLuck Multi-Tier contract...');

    await run('verify:verify', {
      address: chainluckAddress,
      constructorArguments: [
        usdcAddress, // USDC address is the only constructor parameter
      ],
    });

    console.log('✅ ChainLuck contract verified successfully!');

    // Also verify MockUSDC if it was deployed
    if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
      console.log('\n🪙 Verifying MockUSDC contract...');
      try {
        await run('verify:verify', {
          address: usdcAddress,
          constructorArguments: [], // MockUSDC has no constructor parameters
        });
        console.log('✅ MockUSDC contract verified successfully!');
      } catch (error) {
        if (error.message.toLowerCase().includes('already verified')) {
          console.log('✅ MockUSDC contract is already verified!');
        } else {
          console.log(
            '⚠️  MockUSDC verification failed (non-critical):',
            error.message,
          );
        }
      }
    }

    console.log('\n🔗 Contract Links:');
    const explorerUrl =
      deploymentInfo.networkConfig?.explorerUrl ||
      'https://sepolia.etherscan.io';
    console.log(`   🎰 ChainLuck: ${explorerUrl}/address/${chainluckAddress}`);
    console.log(`   🪙 USDC: ${explorerUrl}/address/${usdcAddress}`);
  } catch (error) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log('✅ Contract is already verified!');

      const explorerUrl =
        deploymentInfo.networkConfig?.explorerUrl ||
        'https://sepolia.etherscan.io';
      console.log(
        `🔗 View on Explorer: ${explorerUrl}/address/${chainluckAddress}`,
      );
    } else {
      console.error('❌ Verification failed:', error.message);
      console.log('\n💡 Manual verification command:');
      console.log(
        `npx hardhat verify --network ${deploymentInfo.network} ${chainluckAddress} "${usdcAddress}"`,
      );

      if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
        console.log(
          `npx hardhat verify --network ${deploymentInfo.network} ${usdcAddress}`,
        );
      }
    }
  }

  console.log('\n🎉 Verification process completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });
