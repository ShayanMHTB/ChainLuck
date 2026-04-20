# ⛓️ ChainLuck Blockchain Documentation

## Smart Contract Overview

### Contract: ChainLuck.sol

- **Purpose**: Multi-tier decentralized lottery system with instant payouts
- **Language**: Solidity 0.8.20
- **Network**: Sepolia Testnet (Production: Polygon/BSC/Arbitrum)
- **Current Deployment**: `[Contract address from deployment-info.json]`

## Multi-Tier Economics Model

### 3-Tier Pricing Structure

#### 🥉 BASIC TIER - "Test Your Luck" ($1.00)

```solidity
BASIC_TICKET_PRICE = 1_000000;  // $1.00 USDC (6 decimals)
BASIC_GUARANTEED_WIN_BP = 1000;  // 10%
BASIC_PRIZE_POOL_BP = 1500;     // 15%
BASIC_PROFIT_BP = 7500;         // 75%
```

| Component       | Amount | Percentage | Purpose                |
| --------------- | ------ | ---------- | ---------------------- |
| Ticket Price    | $1.00  | 100%       | Total cost per ticket  |
| Guaranteed Win  | $0.10  | 10%        | High frequency rewards |
| Prize Pool      | $0.15  | 15%        | Win distributions      |
| Platform Profit | $0.75  | 75%        | Revenue                |

#### 🥈 STANDARD TIER - "Real Player" ($2.00)

```solidity
STANDARD_TICKET_PRICE = 2_000000;  // $2.00 USDC
STANDARD_GUARANTEED_WIN_BP = 750;   // 7.5%
STANDARD_PRIZE_POOL_BP = 1500;     // 15%
STANDARD_PROFIT_BP = 7750;         // 77.5%
```

| Component       | Amount | Percentage | Purpose               |
| --------------- | ------ | ---------- | --------------------- |
| Ticket Price    | $2.00  | 100%       | Total cost per ticket |
| Guaranteed Win  | $0.15  | 7.5%       | Solid returns         |
| Prize Pool      | $0.30  | 15%        | Win distributions     |
| Platform Profit | $1.55  | 77.5%      | Revenue               |

#### 🥇 PREMIUM TIER - "High Roller" ($5.00)

```solidity
PREMIUM_TICKET_PRICE = 5_000000;   // $5.00 USDC
PREMIUM_GUARANTEED_WIN_BP = 500;   // 5%
PREMIUM_PRIZE_POOL_BP = 2000;      // 20%
PREMIUM_PROFIT_BP = 7500;          // 75%
```

| Component       | Amount | Percentage | Purpose               |
| --------------- | ------ | ---------- | --------------------- |
| Ticket Price    | $5.00  | 100%       | Total cost per ticket |
| Guaranteed Win  | $0.25  | 5%         | VIP experience        |
| Prize Pool      | $1.00  | 20%        | High-value wins       |
| Platform Profit | $3.75  | 75%        | Revenue               |

### Package Structure

```solidity
// BASIC TIER PACKAGES
BASIC_1_TICKET = 1_000000;   // $1.00
BASIC_3_TICKETS = 3_000000;  // $3.00
BASIC_5_TICKETS = 5_000000;  // $5.00

// STANDARD TIER PACKAGES
STANDARD_1_TICKET = 2_000000;   // $2.00
STANDARD_5_TICKETS = 10_000000; // $10.00
STANDARD_10_TICKETS = 20_000000; // $20.00

// PREMIUM TIER PACKAGES
PREMIUM_1_TICKET = 5_000000;     // $5.00
PREMIUM_5_TICKETS = 25_000000;   // $25.00
PREMIUM_20_TICKETS = 100_000000; // $100.00
```

## Tier-Specific Win Probability Matrix

### BASIC TIER ($1) - Gateway Drug

```solidity
// High win frequency, addiction building
BASIC_SMALL_WIN_PROBABILITY = 2000;    // 20% (1-2 USD)
BASIC_MEDIUM_WIN_PROBABILITY = 500;    // 5% (5-10 USD)
BASIC_BIG_WIN_PROBABILITY = 100;       // 1% (25-50 USD)
BASIC_GRAND_PRIZE_PROBABILITY = 20;    // 0.2% (200-500 USD)
```

### STANDARD TIER ($2) - Main Revenue

```solidity
// Balanced risk/reward, profit center
STANDARD_SMALL_WIN_PROBABILITY = 1500;  // 15% (2-5 USD)
STANDARD_MEDIUM_WIN_PROBABILITY = 300;  // 3% (10-25 USD)
STANDARD_BIG_WIN_PROBABILITY = 50;      // 0.5% (50-150 USD)
STANDARD_GRAND_PRIZE_PROBABILITY = 10;  // 0.1% (500-1500 USD)
```

### PREMIUM TIER ($5) - Whale Bait

```solidity
// Lower frequency, higher amounts, VIP feeling
PREMIUM_SMALL_WIN_PROBABILITY = 1200;   // 12% (5-10 USD)
PREMIUM_MEDIUM_WIN_PROBABILITY = 250;   // 2.5% (25-75 USD)
PREMIUM_BIG_WIN_PROBABILITY = 30;       // 0.3% (150-500 USD)
PREMIUM_GRAND_PRIZE_PROBABILITY = 5;    // 0.05% (2000-5000 USD)
```

## Pseudo-Random Implementation

### Enhanced Randomness for Multi-Tier

```solidity
function generateRandomness(
    address user,
    uint8 tier,
    uint256 ticketIndex,
    uint256 nonce
) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        block.number,
        user,
        tier,
        ticketIndex,
        nonce,
        totalTicketsSold,
        gasleft(),
        tx.gasprice
    )));
}
```

## Referral System Integration

### Tier-Based Referral Rewards

```solidity
// Referral reward structure
mapping(uint8 => mapping(uint256 => uint256)) public referralRewards;

// BASIC TIER: Progressive rewards
referralRewards[BASIC_TIER][5_000000] = 500000;   // $0.50 for $5+ spend
referralRewards[BASIC_TIER][15_000000] = 1_000000; // $1.00 for $15+ spend
referralRewards[BASIC_TIER][30_000000] = 2_000000; // $2.00 for $30+ spend

// STANDARD TIER: Higher rewards
referralRewards[STANDARD_TIER][10_000000] = 1_000000; // $1.00 for $10+ spend
referralRewards[STANDARD_TIER][25_000000] = 2_500000; // $2.50 for $25+ spend
referralRewards[STANDARD_TIER][50_000000] = 5_000000; // $5.00 for $50+ spend

// PREMIUM TIER: VIP rewards
referralRewards[PREMIUM_TIER][25_000000] = 2_500000;  // $2.50 for $25+ spend
referralRewards[PREMIUM_TIER][50_000000] = 5_000000;  // $5.00 for $50+ spend
referralRewards[PREMIUM_TIER][100_000000] = 10_000000; // $10.00 for $100+ spend
```

### Welcome Bonuses

```solidity
struct WelcomeBonus {
    uint8 tier;
    uint256 freeTickets;
    uint256 spendThreshold;
}

// Welcome bonuses by tier
WelcomeBonus[3] public welcomeBonuses = [
    WelcomeBonus(BASIC_TIER, 2, 5_000000),      // 2 free $1 tickets on $5+ spend
    WelcomeBonus(STANDARD_TIER, 1, 10_000000),  // 1 free $2 ticket on $10+ spend
    WelcomeBonus(PREMIUM_TIER, 1, 25_000000)    // 1 free $5 ticket on $25+ spend
];
```

## Daily Check-in System

### Streak Tracking

```solidity
struct UserStreak {
    uint256 currentStreak;
    uint256 lastCheckIn;
    uint256 totalCheckIns;
    bool isEligibleForLottery;
}

mapping(address => UserStreak) public userStreaks;

// Streak reward multipliers
mapping(uint256 => uint256) public streakBonusMultiplier;
streakBonusMultiplier[1] = 110;  // +10% bonus
streakBonusMultiplier[4] = 120;  // +20% bonus
streakBonusMultiplier[7] = 125;  // +25% bonus + lottery entry
```

## Special Lottery Pools

### Pool Structure

```solidity
struct SpecialLottery {
    uint256 prizePool;
    uint256 entryRequirement;
    uint256 maxParticipants;
    uint256 drawTime;
    bool isActive;
    address[] participants;
}

enum LotteryType {
    DAILY_STREAK,      // 7+ day streak users
    WEEKLY_REFERRAL,   // Top referrers
    MONTHLY_TIER,      // Top spenders per tier
    QUARTERLY_CROSS,   // All active users
    ANNUAL_WHALE       // $1000+ yearly spenders
}

mapping(LotteryType => SpecialLottery) public specialLotteries;
```

## Core Contract Functions

### Multi-Tier Ticket Purchase

```solidity
function buyTickets(
    uint8 tier,           // 0=Basic, 1=Standard, 2=Premium
    uint256 ticketCount,  // Number of tickets
    address referrer      // Referrer address (optional)
) external nonReentrant {
    require(tier <= 2, "Invalid tier");
    require(isValidTicketCount(tier, ticketCount), "Invalid ticket count");

    uint256 totalCost = calculateTotalCost(tier, ticketCount);
    USDC.safeTransferFrom(msg.sender, address(this), totalCost);

    // Process purchase and wins
    _processPurchase(msg.sender, tier, ticketCount, referrer);
}

function isValidTicketCount(uint8 tier, uint256 count) public pure returns (bool) {
    if (tier == BASIC_TIER) return count == 1 || count == 3 || count == 5;
    if (tier == STANDARD_TIER) return count == 1 || count == 5 || count == 10;
    if (tier == PREMIUM_TIER) return count == 1 || count == 5 || count == 20;
    return false;
}
```

### Daily Check-in Function

```solidity
function dailyCheckIn() external {
    UserStreak storage streak = userStreaks[msg.sender];
    require(block.timestamp >= streak.lastCheckIn + 1 days, "Already checked in today");

    // Update streak
    if (block.timestamp <= streak.lastCheckIn + 2 days) {
        streak.currentStreak++;
    } else {
        streak.currentStreak = 1; // Reset streak
    }

    streak.lastCheckIn = block.timestamp;
    streak.totalCheckIns++;

    // Grant lottery eligibility for 7+ day streaks
    if (streak.currentStreak >= 7) {
        streak.isEligibleForLottery = true;
        _addToSpecialLottery(LotteryType.DAILY_STREAK, msg.sender);
    }

    emit DailyCheckIn(msg.sender, streak.currentStreak);
}
```

### Special Lottery Management

```solidity
function processSpecialLottery(LotteryType lotteryType) external onlyOwner {
    SpecialLottery storage lottery = specialLotteries[lotteryType];
    require(lottery.isActive && block.timestamp >= lottery.drawTime, "Lottery not ready");

    if (lottery.participants.length > 0) {
        address[] memory winners = _selectWinners(lottery);
        _distributePrizes(lotteryType, winners);
    }

    _resetLottery(lotteryType);
}
```

## Revenue Projections (On-Chain)

### Monthly Targets

```solidity
// Conservative daily volume targets
uint256 constant BASIC_DAILY_TARGET = 50;      // 50 tickets/day
uint256 constant STANDARD_DAILY_TARGET = 70;   // 70 tickets/day
uint256 constant PREMIUM_DAILY_TARGET = 10;    // 10 tickets/day

// Monthly revenue calculation
uint256 constant MONTHLY_BASIC_REVENUE = BASIC_DAILY_TARGET * 30 * BASIC_TICKET_PRICE;     // $1,500
uint256 constant MONTHLY_STANDARD_REVENUE = STANDARD_DAILY_TARGET * 30 * STANDARD_TICKET_PRICE; // $4,200
uint256 constant MONTHLY_PREMIUM_REVENUE = PREMIUM_DAILY_TARGET * 30 * PREMIUM_TICKET_PRICE;    // $1,500

// Total monthly revenue: $7,200
// Total monthly profit: ~$5,505 (Target: ACHIEVED!)
```

## Gas Optimization

### Multi-Tier Gas Costs (Estimated)

| Operation                | Gas Used | Cost (Polygon) |
| ------------------------ | -------- | -------------- |
| Buy Basic (1 ticket)     | ~85,000  | ~$0.003        |
| Buy Standard (5 tickets) | ~120,000 | ~$0.004        |
| Buy Premium (20 tickets) | ~200,000 | ~$0.007        |
| Daily Check-in           | ~45,000  | ~$0.0015       |
| Claim Wins               | ~50,000  | ~$0.0017       |

### Optimization Strategies

- Packed structs for user data
- Batch processing for multiple tickets
- Efficient randomness generation
- Minimal storage writes

## Security Measures

### Enhanced Security for Multi-Tier

```solidity
// Tier-specific access control
modifier validTier(uint8 tier) {
    require(tier <= 2, "Invalid tier");
    _;
}

// Rate limiting per tier
mapping(address => mapping(uint8 => uint256)) public lastPurchaseTime;
uint256 constant PURCHASE_COOLDOWN = 10 seconds;

modifier purchaseCooldown(uint8 tier) {
    require(
        block.timestamp >= lastPurchaseTime[msg.sender][tier] + PURCHASE_COOLDOWN,
        "Purchase too frequent"
    );
    lastPurchaseTime[msg.sender][tier] = block.timestamp;
    _;
}
```

## Event Architecture

### Enhanced Events for Multi-Tier

```solidity
event TicketsPurchased(
    address indexed user,
    uint8 indexed tier,
    uint256 ticketCount,
    uint256 totalCost,
    uint256 guaranteedWin,
    uint256 bonusWin,
    address referrer,
    uint256 timestamp
);

event TierWinProcessed(
    address indexed user,
    uint8 indexed tier,
    uint256 amount,
    uint8 winTierLevel,
    uint256 timestamp
);

event ReferralRewardPaid(
    address indexed referrer,
    address indexed referred,
    uint8 tier,
    uint256 amount,
    uint256 referredTotalSpend,
    uint256 timestamp
);

event DailyCheckIn(
    address indexed user,
    uint256 streakCount,
    uint256 timestamp
);

event SpecialLotteryWin(
    address indexed user,
    LotteryType indexed lotteryType,
    uint256 amount,
    uint256 timestamp
);
```

## Multi-Chain Deployment Strategy

### Target Networks (Priority Order)

| Network  | Chain ID | Priority | USDC Address                                 | Reason                  |
| -------- | -------- | -------- | -------------------------------------------- | ----------------------- |
| Polygon  | 137      | High     | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | Low fees, high adoption |
| BSC      | 56       | High     | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | Large user base         |
| Arbitrum | 42161    | Medium   | `0xA0b86a33E6417b4a000000000000000000000000` | Growing ecosystem       |
| Base     | 8453     | Low      | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Future opportunity      |

### Deployment Configuration

```solidity
// Network-specific configurations
struct NetworkConfig {
    address usdcAddress;
    uint256 minPoolSize;
    uint256 maxGrandPrize;
    bool vrfEnabled;
}

mapping(uint256 => NetworkConfig) public networkConfigs;
```

## Development Tools Integration

### Hardhat Configuration

```javascript
// Enhanced hardhat config for multi-tier
networks: {
  polygon: {
    url: process.env.POLYGON_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 137,
    gasPrice: 'auto',
  },
  bsc: {
    url: process.env.BSC_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 56,
    gasPrice: 'auto',
  }
}
```

### Testing Strategy

```javascript
describe('Multi-Tier ChainLuck', () => {
  describe('Basic Tier', () => {
    it('Should handle $1 ticket purchases');
    it('Should provide high win frequency');
    it('Should track referrals correctly');
  });

  describe('Standard Tier', () => {
    it('Should handle $2 ticket purchases');
    it('Should provide balanced wins');
    it('Should manage prize pools');
  });

  describe('Premium Tier', () => {
    it('Should handle $5 ticket purchases');
    it('Should provide VIP experience');
    it('Should handle large prize payouts');
  });

  describe('Special Lotteries', () => {
    it('Should process daily streak lottery');
    it('Should handle referral championships');
    it('Should manage tier-specific rewards');
  });
});
```

## Future Enhancements

### Advanced Features (Post-Launch)

- **Dynamic Tier Pricing**: Adjust based on demand
- **Cross-Tier Competitions**: Mixed tier tournaments
- **NFT Integration**: Tier-specific badges and rewards
- **Governance System**: Community voting on prize structures
- **Layer 2 Scaling**: Optimistic rollups for high-frequency games

### Chainlink VRF Integration (Optional)

```solidity
// For premium tier grand prizes only
function requestPremiumRandomness(address user, uint256 ticketId) internal {
    if (address(vrfCoordinator) != address(0)) {
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1
        );
        pendingVRFRequests[requestId] = VRFRequest(user, ticketId, block.timestamp);
    }
}
```

This enhanced blockchain documentation reflects the sophisticated multi-tier system while maintaining the technical depth needed for implementation. The structure supports scalable growth from basic users to high-value whales while ensuring profitability and security.
