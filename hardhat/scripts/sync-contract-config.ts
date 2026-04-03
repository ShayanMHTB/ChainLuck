// hardhat/scripts/sync-contract-config.ts
import { ethers } from 'hardhat';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

interface TierConfig {
  name: string;
  ticketPrices: { [key: string]: number };
  validTicketCounts: number[];
  guaranteedWinPercentage: number;
  prizePoolPercentage: number;
  platformProfitPercentage: number;
  prizes: Array<{
    amount: number;
    odds: number;
    formattedOdds: string;
  }>;
  referralRewards: Array<{
    threshold: number;
    reward: number;
  }>;
}

interface MultiTierContractConfig {
  // Contract addresses
  addresses: {
    chainluck: string;
    usdc: string;
    usdcType: 'MockUSDC' | 'RealUSDC';
  };

  // Network info
  network: {
    name: string;
    chainId: number;
    isTestnet: boolean;
  };

  // Multi-tier configuration
  tiers: {
    [key: string]: TierConfig;
  };

  // Special features
  features: {
    referralSystem: boolean;
    dailyCheckIns: boolean;
    specialLotteries: number;
    multiTier: boolean;
  };

  // Special lotteries
  specialLotteries: Array<{
    name: string;
    type: number;
    prizePool: number;
    isActive: boolean;
  }>;

  // Deployment info
  deployment: {
    deployer: string;
    timestamp: string;
    blockNumber: number;
    transactionHash: string;
    version: string;
  };
}

async function main() {
  console.log(
    '🔄 Syncing Multi-Tier contract configuration with frontend...\n',
  );

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  // Load deployment info
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

  console.log('📋 Reading contract configuration:');
  console.log(`   ChainLuck: ${chainluckAddress}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   Network: ${network.name} (${network.chainId})`);

  // Get contract instance
  const chainluck = await ethers.getContractAt('ChainLuck', chainluckAddress);

  try {
    console.log('\n🔍 Reading multi-tier contract parameters...');

    // Convert USDC amounts from 6-decimal to human readable
    const formatUSDC = (amount: bigint): number => Number(amount) / 1_000_000;

    // Read tier configurations
    const tierNames = ['Basic', 'Standard', 'Premium'];
    const tiers: { [key: string]: TierConfig } = {};

    for (let tierIndex = 0; tierIndex < 3; tierIndex++) {
      const tierName = tierNames[tierIndex];
      console.log(`\n🎯 Reading ${tierName} Tier (${tierIndex})...`);

      // Get tier configuration
      const tierConfig = await chainluck.getTierConfiguration(tierIndex);
      const validTicketCounts = await chainluck.getValidTicketCounts(tierIndex);
      const tierPrizeInfo = await chainluck.getTierPrizeInfo(tierIndex);
      const tierReferralRewards = await chainluck.getTierReferralRewards(
        tierIndex,
      );

      // Get ticket prices for this tier
      const ticketPrices: { [key: string]: number } = {};
      for (const count of validTicketCounts) {
        const price = await chainluck.getTierPackagePrice(tierIndex, count);
        ticketPrices[count.toString()] = formatUSDC(price);
      }

      // Build tier configuration
      tiers[tierName.toLowerCase()] = {
        name: tierName,
        ticketPrices,
        validTicketCounts: validTicketCounts.map((n) => Number(n)),
        guaranteedWinPercentage: Number(tierConfig[0]) / 100, // Convert from basis points
        prizePoolPercentage: Number(tierConfig[1]) / 100,
        platformProfitPercentage: Number(tierConfig[2]) / 100,
        prizes: tierPrizeInfo[0].map((amount, index) => ({
          amount: formatUSDC(amount),
          odds: Number(tierPrizeInfo[1][index]),
          formattedOdds: `1 in ${Number(
            tierPrizeInfo[1][index],
          ).toLocaleString()}`,
        })),
        referralRewards: tierReferralRewards[0].map((threshold, index) => ({
          threshold: formatUSDC(threshold),
          reward: formatUSDC(tierReferralRewards[1][index]),
        })),
      };

      console.log(
        `   ✅ ${tierName} tier: ${validTicketCounts.length} packages, ${tierPrizeInfo[0].length} prize tiers`,
      );
    }

    // Read special lottery information
    console.log('\n🏆 Reading special lotteries...');
    const allLotteryInfo = await chainluck.getAllSpecialLotteryInfo();
    const lotteryNames = [
      'Daily Streak',
      'Weekly Referral',
      'Monthly Tier',
      'Quarterly Cross',
      'Annual Whale',
    ];

    const specialLotteries = lotteryNames.map((name, index) => ({
      name,
      type: index,
      prizePool: formatUSDC(allLotteryInfo[0][index]),
      isActive: allLotteryInfo[2][index],
    }));

    console.log(
      `   ✅ ${specialLotteries.length} special lotteries configured`,
    );

    // Build complete configuration object
    const config: MultiTierContractConfig = {
      addresses: {
        chainluck: chainluckAddress,
        usdc: usdcAddress,
        usdcType: deploymentInfo.contracts.usdcType,
      },

      network: {
        name: network.name,
        chainId: Number(network.chainId),
        isTestnet: network.name !== 'polygon' && network.name !== 'mainnet',
      },

      tiers,

      features: {
        referralSystem: true,
        dailyCheckIns: true,
        specialLotteries: specialLotteries.length,
        multiTier: true,
      },

      specialLotteries,

      deployment: {
        deployer: deploymentInfo.deployer,
        timestamp: deploymentInfo.timestamp,
        blockNumber: deploymentInfo.blockNumber || 0,
        transactionHash: deploymentInfo.transactionHash || '',
        version: deploymentInfo.version || 'Multi-Tier v1.0.0',
      },
    };

    console.log('✅ Multi-tier contract configuration read successfully');

    // Create directories
    const frontendContractsDir = join(__dirname, '../../nextjs/src/contracts');
    const frontendAbiDir = join(frontendContractsDir, 'abi');
    const frontendConfigDir = join(frontendContractsDir, 'config');
    const frontendDeploymentsDir = join(frontendContractsDir, 'deployments');

    [
      frontendContractsDir,
      frontendAbiDir,
      frontendConfigDir,
      frontendDeploymentsDir,
    ].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    // Generate TypeScript types for multi-tier
    const typesContent = generateMultiTierTypes(config);
    writeFileSync(join(frontendContractsDir, 'types.ts'), typesContent);
    console.log('📝 Generated multi-tier TypeScript types');

    // Save contract config JSON
    writeFileSync(
      join(frontendConfigDir, 'multi-tier-config.json'),
      JSON.stringify(config, null, 2),
    );
    console.log('💾 Saved multi-tier contract configuration');

    // Save network-specific deployment info
    const networkDeploymentPath = join(
      frontendDeploymentsDir,
      `${network.name}.json`,
    );
    writeFileSync(
      networkDeploymentPath,
      JSON.stringify(
        {
          chainId: Number(network.chainId),
          contracts: config.addresses,
          deployment: config.deployment,
          lastUpdated: new Date().toISOString(),
          version: 'Multi-Tier v1.0.0',
        },
        null,
        2,
      ),
    );
    console.log(`📄 Saved ${network.name} deployment info`);

    // Copy contract ABIs
    const chainluckArtifact = await ethers.getContractFactory('ChainLuck');

    writeFileSync(
      join(frontendAbiDir, 'ChainLuck.json'),
      JSON.stringify(
        {
          contractName: 'ChainLuck',
          abi: chainluckArtifact.interface.format('json'),
          bytecode: chainluckArtifact.bytecode,
          deployedBytecode: await ethers.provider.getCode(chainluckAddress),
        },
        null,
        2,
      ),
    );

    // Copy USDC ABI
    if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
      const usdcArtifact = await ethers.getContractFactory('MockUSDC');
      writeFileSync(
        join(frontendAbiDir, 'MockUSDC.json'),
        JSON.stringify(
          {
            contractName: 'MockUSDC',
            abi: usdcArtifact.interface.format('json'),
            bytecode: usdcArtifact.bytecode,
            deployedBytecode: await ethers.provider.getCode(usdcAddress),
          },
          null,
          2,
        ),
      );
    }

    console.log('📋 Copied contract ABIs');

    // Generate dynamic constants file
    const dynamicConstantsContent = generateMultiTierConstants(config);
    writeFileSync(
      join(frontendContractsDir, 'constants.ts'),
      dynamicConstantsContent,
    );
    console.log('⚙️ Generated multi-tier constants');

    // Summary
    console.log(
      '\n🎉 Multi-Tier Contract-Frontend sync completed successfully!',
    );
    console.log(
      '═══════════════════════════════════════════════════════════════',
    );
    console.log(`📊 Configuration Summary:`);
    console.log(
      `   Network: ${config.network.name} (${config.network.chainId})`,
    );
    console.log(
      `   Tiers: ${
        Object.keys(config.tiers).length
      } (Basic, Standard, Premium)`,
    );
    console.log(`   Special Lotteries: ${config.specialLotteries.length}`);
    console.log(`   Contract Version: ${config.deployment.version}`);

    // Show tier summary
    Object.entries(config.tiers).forEach(([tierKey, tier]) => {
      const packages = Object.keys(tier.ticketPrices);
      const priceRange = Object.values(tier.ticketPrices);
      console.log(
        `   ${tier.name}: $${Math.min(...priceRange)} - $${Math.max(
          ...priceRange,
        )} (${packages.length} packages)`,
      );
    });

    console.log('\n📁 Files Generated:');
    console.log(`   ✅ ${frontendContractsDir}/types.ts`);
    console.log(`   ✅ ${frontendContractsDir}/constants.ts`);
    console.log(`   ✅ ${frontendConfigDir}/multi-tier-config.json`);
    console.log(`   ✅ ${frontendDeploymentsDir}/${network.name}.json`);
    console.log(`   ✅ ${frontendAbiDir}/ChainLuck.json`);
    if (deploymentInfo.contracts.usdcType === 'MockUSDC') {
      console.log(`   ✅ ${frontendAbiDir}/MockUSDC.json`);
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Update frontend imports to use new multi-tier config');
    console.log('2. Build frontend components for tier selection');
    console.log('3. Test multi-tier functionality');
    console.log('4. Deploy to production networks');

    console.log('\n🚀 Frontend is now ready for multi-tier integration!');
  } catch (error) {
    console.error('❌ Error reading multi-tier contract configuration:', error);
    process.exit(1);
  }
}

function generateMultiTierTypes(config: MultiTierContractConfig): string {
  return `// nextjs/src/contracts/types.ts
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated from multi-tier contract deployment on ${config.network.name} at ${config.deployment.timestamp}

export interface ContractAddresses {
  chainluck: \`0x\${string}\`;
  usdc: \`0x\${string}\`;
  usdcType: 'MockUSDC' | 'RealUSDC';
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  isTestnet: boolean;
}

export interface TierConfig {
  name: string;
  ticketPrices: { [key: string]: number };
  validTicketCounts: number[];
  guaranteedWinPercentage: number;
  prizePoolPercentage: number;
  platformProfitPercentage: number;
  prizes: Array<{
    amount: number;
    odds: number;
    formattedOdds: string;
  }>;
  referralRewards: Array<{
    threshold: number;
    reward: number;
  }>;
}

export interface SpecialLottery {
  name: string;
  type: number;
  prizePool: number;
  isActive: boolean;
}

export interface MultiTierFeatures {
  referralSystem: boolean;
  dailyCheckIns: boolean;
  specialLotteries: number;
  multiTier: boolean;
}

export interface DeploymentInfo {
  deployer: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  version: string;
}

export interface MultiTierContractConfig {
  addresses: ContractAddresses;
  network: NetworkInfo;
  tiers: { [key: string]: TierConfig };
  features: MultiTierFeatures;
  specialLotteries: SpecialLottery[];
  deployment: DeploymentInfo;
}

// Utility types
export type TierName = 'basic' | 'standard' | 'premium';
export type ValidTierIndex = 0 | 1 | 2;
export type LotteryType = 0 | 1 | 2 | 3 | 4; // Daily, Weekly, Monthly, Quarterly, Annual

// User data types
export interface UserStats {
  tierSpent: [number, number, number]; // [basic, standard, premium]
  tierWon: [number, number, number];
  pendingWins: number;
  totalSpent: number;
  totalWon: number;
  preferredTier: ValidTierIndex;
}

export interface UserReferralStats {
  referrer: string;
  referralCount: number;
  referralEarnings: number;
  hasReferrer: boolean;
}

export interface UserStreakInfo {
  currentStreak: number;
  lastCheckIn: number;
  totalCheckIns: number;
  longestStreak: number;
  lotteryEligible: boolean;
  nextBonusMultiplier: number;
}

// Re-export for compatibility
export type { WinTierInfo, TicketPurchaseOptions } from '@/types/lottery';
`;
}

function generateMultiTierConstants(config: MultiTierContractConfig): string {
  return `// nextjs/src/contracts/constants.ts
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated from multi-tier contract deployment on ${config.network.name} at ${
    config.deployment.timestamp
  }

import type { MultiTierContractConfig, ValidTierIndex, TierName } from './types';

// =============================================================================
// MULTI-TIER CONTRACT CONFIGURATION (SINGLE SOURCE OF TRUTH)
// =============================================================================

export const MULTI_TIER_CONFIG: MultiTierContractConfig = ${JSON.stringify(
    config,
    null,
    2,
  )} as const;

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const CONTRACT_ADDRESSES = MULTI_TIER_CONFIG.addresses;
export const NETWORK_INFO = MULTI_TIER_CONFIG.network;
export const DEPLOYMENT_INFO = MULTI_TIER_CONFIG.deployment;

// Tier configurations
export const BASIC_TIER_CONFIG = MULTI_TIER_CONFIG.tiers.basic;
export const STANDARD_TIER_CONFIG = MULTI_TIER_CONFIG.tiers.standard;
export const PREMIUM_TIER_CONFIG = MULTI_TIER_CONFIG.tiers.premium;

// Special lotteries
export const SPECIAL_LOTTERIES = MULTI_TIER_CONFIG.specialLotteries;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get tier configuration by index
 */
export function getTierConfig(tierIndex: ValidTierIndex): typeof BASIC_TIER_CONFIG {
  const tierNames: TierName[] = ['basic', 'standard', 'premium'];
  return MULTI_TIER_CONFIG.tiers[tierNames[tierIndex]];
}

/**
 * Get tier configuration by name
 */
export function getTierConfigByName(tierName: TierName): typeof BASIC_TIER_CONFIG {
  return MULTI_TIER_CONFIG.tiers[tierName];
}

/**
 * Get ticket price for specific tier and count
 */
export function getTicketPrice(tierIndex: ValidTierIndex, ticketCount: number): number {
  const tierConfig = getTierConfig(tierIndex);
  return tierConfig.ticketPrices[ticketCount.toString()] || 0;
}

/**
 * Get valid ticket counts for tier
 */
export function getValidTicketCounts(tierIndex: ValidTierIndex): number[] {
  return getTierConfig(tierIndex).validTicketCounts;
}

/**
 * Calculate guaranteed win for purchase
 */
export function calculateGuaranteedWin(tierIndex: ValidTierIndex, ticketCount: number): number {
  const tierConfig = getTierConfig(tierIndex);
  const totalCost = getTicketPrice(tierIndex, ticketCount);
  return totalCost * (tierConfig.guaranteedWinPercentage / 100);
}

/**
 * Check if tier and ticket count combination is valid
 */
export function isValidPurchase(tierIndex: ValidTierIndex, ticketCount: number): boolean {
  const validCounts = getValidTicketCounts(tierIndex);
  return validCounts.includes(ticketCount);
}

/**
 * Get tier name by index
 */
export function getTierName(tierIndex: ValidTierIndex): string {
  const tierNames = ['Basic', 'Standard', 'Premium'];
  return tierNames[tierIndex];
}

/**
 * Get tier index by name
 */
export function getTierIndex(tierName: TierName): ValidTierIndex {
  const mapping: Record<TierName, ValidTierIndex> = {
    basic: 0,
    standard: 1,
    premium: 2,
  };
  return mapping[tierName];
}

/**
 * Format currency with proper decimals
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format odds as readable string
 */
export function formatOdds(odds: number): string {
  return \`1 in \${odds.toLocaleString()}\`;
}

/**
 * Get special lottery by type
 */
export function getSpecialLottery(lotteryType: number) {
  return SPECIAL_LOTTERIES.find(lottery => lottery.type === lotteryType);
}

/**
 * Check if network is testnet
 */
export function isTestnet(): boolean {
  return NETWORK_INFO.isTestnet;
}

// =============================================================================
// CONSTANTS FOR EASY ACCESS
// =============================================================================

export const TIER_NAMES: Record<ValidTierIndex, string> = {
  0: 'Basic',
  1: 'Standard', 
  2: 'Premium',
} as const;

export const TIER_COUNT = 3;
export const MAX_TIER_INDEX = 2;

export const LOTTERY_NAMES = [
  'Daily Streak',
  'Weekly Referral', 
  'Monthly Tier',
  'Quarterly Cross',
  'Annual Whale',
] as const;

// =============================================================================
// DEBUG INFO
// =============================================================================

if (typeof window !== 'undefined') {
  console.log('🎯 Multi-Tier Config Loaded:', {
    network: NETWORK_INFO,
    addresses: CONTRACT_ADDRESSES,
    tiers: Object.keys(MULTI_TIER_CONFIG.tiers),
    specialLotteries: SPECIAL_LOTTERIES.length,
    version: DEPLOYMENT_INFO.version,
    lastSync: new Date().toISOString(),
  });
}
`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Multi-tier sync failed:', error);
    process.exit(1);
  });
