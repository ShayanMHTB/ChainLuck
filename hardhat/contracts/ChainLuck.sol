// contracts/ChainLuck.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ChainLuck Multi-Tier Lottery
 * @dev Sophisticated 3-tier lottery system with referrals, daily check-ins, and special lotteries
 * Single source of truth for all platform configuration and logic
 */
contract ChainLuck is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            TIER SYSTEM CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    
    IERC20 public immutable USDC;
    
    // Tier definitions
    uint8 public constant BASIC_TIER = 0;      // $1 tickets - Gateway drug
    uint8 public constant STANDARD_TIER = 1;   // $2 tickets - Main revenue
    uint8 public constant PREMIUM_TIER = 2;    // $5 tickets - Whale bait
    uint8 public constant MAX_TIER = 2;
    
    // Tier-specific ticket prices (6 decimal precision for USDC)
    mapping(uint8 => mapping(uint256 => uint256)) public tierPackagePrices;
    
    // Revenue allocation per tier (basis points)
    mapping(uint8 => uint256) public tierGuaranteedWinBP;
    mapping(uint8 => uint256) public tierPrizePoolBP;
    mapping(uint8 => uint256) public tierProfitBP;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Prize amounts per tier (in USDC 6-decimal format)
    mapping(uint8 => uint256[]) public tierPrizeAmounts;
    mapping(uint8 => uint256[]) public tierPrizeOdds;
    
    // Pool management per tier
    mapping(uint8 => uint256) public tierMinInstantPool;
    mapping(uint8 => uint256) public tierMinGrandPrizePool;
    uint256 public constant OWNER_WITHDRAWAL_THRESHOLD = 2000_000000; // $2,000
    
    // ═══════════════════════════════════════════════════════════════════════
    //                              REFERRAL SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    struct ReferralTier {
        uint256 spendThreshold;    // Minimum spend to trigger reward
        uint256 rewardAmount;      // Reward amount in USDC
    }
    
    // Tier-based referral rewards
    mapping(uint8 => ReferralTier[]) public tierReferralRewards;
    
    // Referral tracking
    mapping(address => address) public userReferrer;          // user -> referrer
    mapping(address => uint256) public userReferralCount;     // referrer -> count
    mapping(address => uint256) public userReferralEarnings;  // referrer -> total earned
    mapping(address => bool) public hasReferrer;              // track if user has referrer
    
    // Welcome bonuses for referred users
    mapping(uint8 => uint256) public tierWelcomeBonusTickets; // Free tickets on first purchase
    mapping(uint8 => uint256) public tierWelcomeBonusThreshold; // Minimum spend for bonus
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            DAILY CHECK-IN SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    struct UserStreak {
        uint256 currentStreak;     // Current consecutive days
        uint256 lastCheckIn;       // Last check-in timestamp
        uint256 totalCheckIns;     // Lifetime check-ins
        uint256 longestStreak;     // Personal record
        bool isLotteryEligible;    // Eligible for special lotteries
    }
    
    mapping(address => UserStreak) public userStreaks;
    
    // Streak bonus multipliers (basis points)
    mapping(uint256 => uint256) public streakBonusMultipliers;
    
    // Special lottery eligibility thresholds
    uint256 public constant DAILY_LOTTERY_STREAK_REQUIREMENT = 7;   // 7+ days
    uint256 public constant WEEKLY_LOTTERY_STREAK_REQUIREMENT = 14; // 14+ days
    uint256 public constant MONTHLY_LOTTERY_STREAK_REQUIREMENT = 30; // 30+ days
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            SPECIAL LOTTERIES
    // ═══════════════════════════════════════════════════════════════════════
    
    enum LotteryType {
        DAILY_STREAK,       // 7+ day streak users
        WEEKLY_REFERRAL,    // Top referrers weekly
        MONTHLY_TIER,       // Top spenders per tier monthly
        QUARTERLY_CROSS,    // All active users quarterly
        ANNUAL_WHALE        // $1000+ yearly spenders
    }
    
    struct SpecialLottery {
        uint256 prizePool;
        uint256 entryRequirement;
        uint256 maxParticipants;
        uint256 drawTime;
        bool isActive;
        uint8 targetTier;        // 255 = all tiers
        address[] participants;
        mapping(address => bool) hasEntered;
    }
    
    mapping(LotteryType => SpecialLottery) public specialLotteries;
    
    // ═══════════════════════════════════════════════════════════════════════
    //                              STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════
    
    // Global statistics
    uint256 public totalTicketsSold;
    uint256 public totalRevenue;
    
    // Per-tier statistics
    mapping(uint8 => uint256) public tierTicketsSold;
    mapping(uint8 => uint256) public tierRevenue;
    mapping(uint8 => uint256) public tierInstantPool;
    mapping(uint8 => uint256) public tierGrandPrizePool;
    
    // User tracking
    mapping(address => mapping(uint8 => uint256)) public userTierSpent;
    mapping(address => mapping(uint8 => uint256)) public userTierWon;
    mapping(address => uint256) public userPendingWins;
    mapping(address => uint8) public userPreferredTier;
    
    // Anti-spam protection
    mapping(address => mapping(uint8 => uint256)) public lastPurchaseTime;
    uint256 public constant PURCHASE_COOLDOWN = 10 seconds;
    
    // ═══════════════════════════════════════════════════════════════════════
    //                                EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    
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
        uint8 winLevel,
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
        uint256 bonusMultiplier,
        bool lotteryEligible,
        uint256 timestamp
    );
    
    event SpecialLotteryEntered(
        address indexed user,
        LotteryType indexed lotteryType,
        uint256 entryValue,
        uint256 timestamp
    );
    
    event SpecialLotteryWin(
        address indexed user,
        LotteryType indexed lotteryType,
        uint256 amount,
        uint256 timestamp
    );
    
    event WinsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event PoolsRefilled(
        uint8 indexed tier,
        uint256 instantPool,
        uint256 grandPrizePool,
        uint256 timestamp
    );
    
    event OwnerWithdrawal(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    //                              CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════
    
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        USDC = IERC20(_usdc);
        
        _initializeTierConfiguration();
        _initializeReferralSystem();
        _initializeStreakSystem();
        _initializeSpecialLotteries();
    }
    
    function _initializeTierConfiguration() private {
        // BASIC TIER ($1) - Gateway Drug Configuration
        tierPackagePrices[BASIC_TIER][1] = 1_000000;    // $1.00
        tierPackagePrices[BASIC_TIER][3] = 3_000000;    // $3.00
        tierPackagePrices[BASIC_TIER][5] = 5_000000;    // $5.00
        
        tierGuaranteedWinBP[BASIC_TIER] = 1000;  // 10%
        tierPrizePoolBP[BASIC_TIER] = 1500;      // 15%
        tierProfitBP[BASIC_TIER] = 7500;         // 75%
        
        tierMinInstantPool[BASIC_TIER] = 500_000000;     // $500
        tierMinGrandPrizePool[BASIC_TIER] = 1000_000000; // $1,000
        
        // Basic tier prizes
        tierPrizeAmounts[BASIC_TIER] = [500_000000, 200_000000, 50_000000, 25_000000, 10_000000];
        tierPrizeOdds[BASIC_TIER] = [5000, 2000, 500, 200, 100]; // 1 in X
        
        // STANDARD TIER ($2) - Main Revenue Configuration  
        tierPackagePrices[STANDARD_TIER][1] = 2_000000;   // $2.00
        tierPackagePrices[STANDARD_TIER][5] = 10_000000;  // $10.00
        tierPackagePrices[STANDARD_TIER][10] = 20_000000; // $20.00
        
        tierGuaranteedWinBP[STANDARD_TIER] = 750;   // 7.5%
        tierPrizePoolBP[STANDARD_TIER] = 1500;      // 15%
        tierProfitBP[STANDARD_TIER] = 7750;         // 77.5%
        
        tierMinInstantPool[STANDARD_TIER] = 1000_000000;    // $1,000
        tierMinGrandPrizePool[STANDARD_TIER] = 2000_000000; // $2,000
        
        // Standard tier prizes
        tierPrizeAmounts[STANDARD_TIER] = [1500_000000, 500_000000, 150_000000, 50_000000, 25_000000];
        tierPrizeOdds[STANDARD_TIER] = [10000, 3333, 1000, 333, 200]; // 1 in X
        
        // PREMIUM TIER ($5) - Whale Bait Configuration
        tierPackagePrices[PREMIUM_TIER][1] = 5_000000;     // $5.00
        tierPackagePrices[PREMIUM_TIER][5] = 25_000000;    // $25.00
        tierPackagePrices[PREMIUM_TIER][20] = 100_000000;  // $100.00
        
        tierGuaranteedWinBP[PREMIUM_TIER] = 500;    // 5%
        tierPrizePoolBP[PREMIUM_TIER] = 2000;       // 20%
        tierProfitBP[PREMIUM_TIER] = 7500;          // 75%
        
        tierMinInstantPool[PREMIUM_TIER] = 2000_000000;     // $2,000
        tierMinGrandPrizePool[PREMIUM_TIER] = 5000_000000;  // $5,000
        
        // Premium tier prizes  
        tierPrizeAmounts[PREMIUM_TIER] = [5000_000000, 2000_000000, 500_000000, 150_000000, 75_000000];
        tierPrizeOdds[PREMIUM_TIER] = [20000, 6667, 2000, 667, 400]; // 1 in X
    }
    
    function _initializeReferralSystem() private {
        // BASIC TIER Referral Rewards
        tierReferralRewards[BASIC_TIER].push(ReferralTier(5_000000, 500000));   // $0.50 for $5+ spend
        tierReferralRewards[BASIC_TIER].push(ReferralTier(15_000000, 1_000000)); // $1.00 for $15+ spend
        tierReferralRewards[BASIC_TIER].push(ReferralTier(30_000000, 2_000000)); // $2.00 for $30+ spend
        
        tierWelcomeBonusTickets[BASIC_TIER] = 2;      // 2 free tickets
        tierWelcomeBonusThreshold[BASIC_TIER] = 5_000000; // on $5+ spend
        
        // STANDARD TIER Referral Rewards
        tierReferralRewards[STANDARD_TIER].push(ReferralTier(10_000000, 1_000000)); // $1.00 for $10+ spend
        tierReferralRewards[STANDARD_TIER].push(ReferralTier(25_000000, 2_500000)); // $2.50 for $25+ spend
        tierReferralRewards[STANDARD_TIER].push(ReferralTier(50_000000, 5_000000)); // $5.00 for $50+ spend
        
        tierWelcomeBonusTickets[STANDARD_TIER] = 1;        // 1 free ticket
        tierWelcomeBonusThreshold[STANDARD_TIER] = 10_000000; // on $10+ spend
        
        // PREMIUM TIER Referral Rewards
        tierReferralRewards[PREMIUM_TIER].push(ReferralTier(25_000000, 2_500000));  // $2.50 for $25+ spend
        tierReferralRewards[PREMIUM_TIER].push(ReferralTier(50_000000, 5_000000));  // $5.00 for $50+ spend
        tierReferralRewards[PREMIUM_TIER].push(ReferralTier(100_000000, 10_000000)); // $10.00 for $100+ spend
        
        tierWelcomeBonusTickets[PREMIUM_TIER] = 1;         // 1 free ticket
        tierWelcomeBonusThreshold[PREMIUM_TIER] = 25_000000; // on $25+ spend
    }
    
    function _initializeStreakSystem() private {
        // Streak bonus multipliers (basis points)
        streakBonusMultipliers[1] = 11000;  // +10% (days 1-3)
        streakBonusMultipliers[4] = 12000;  // +20% (days 4-6)
        streakBonusMultipliers[7] = 12500;  // +25% (days 7+)
        streakBonusMultipliers[14] = 13000; // +30% (days 14+)
        streakBonusMultipliers[30] = 15000; // +50% (days 30+)
    }
    
    function _initializeSpecialLotteries() private {
        // Initialize special lotteries with default prize pools
        specialLotteries[LotteryType.DAILY_STREAK].prizePool = 45_000000;      // $45/day
        specialLotteries[LotteryType.WEEKLY_REFERRAL].prizePool = 250_000000;  // $250/week
        specialLotteries[LotteryType.MONTHLY_TIER].prizePool = 1100_000000;    // $1,100/month
        specialLotteries[LotteryType.QUARTERLY_CROSS].prizePool = 2000_000000; // $2,000/quarter
        specialLotteries[LotteryType.ANNUAL_WHALE].prizePool = 5000_000000;    // $5,000/year
        
        // Set entry requirements
        specialLotteries[LotteryType.DAILY_STREAK].entryRequirement = DAILY_LOTTERY_STREAK_REQUIREMENT;
        specialLotteries[LotteryType.WEEKLY_REFERRAL].entryRequirement = 1;     // 1+ referrals
        specialLotteries[LotteryType.MONTHLY_TIER].entryRequirement = 100_000000; // $100+ monthly spend
        specialLotteries[LotteryType.QUARTERLY_CROSS].entryRequirement = 1;     // 1+ ticket in 30 days
        specialLotteries[LotteryType.ANNUAL_WHALE].entryRequirement = 1000_000000; // $1,000+ yearly spend
        
        // Activate lotteries
        specialLotteries[LotteryType.DAILY_STREAK].isActive = true;
        specialLotteries[LotteryType.WEEKLY_REFERRAL].isActive = true;
        specialLotteries[LotteryType.MONTHLY_TIER].isActive = true;
        specialLotteries[LotteryType.QUARTERLY_CROSS].isActive = true;
        specialLotteries[LotteryType.ANNUAL_WHALE].isActive = true;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════
    
    modifier validTier(uint8 tier) {
        require(tier <= MAX_TIER, "Invalid tier");
        _;
    }
    
    modifier validTicketCount(uint8 tier, uint256 ticketCount) {
        require(tierPackagePrices[tier][ticketCount] > 0, "Invalid ticket count for tier");
        _;
    }
    
    modifier purchaseCooldown(uint8 tier) {
        require(
            block.timestamp >= lastPurchaseTime[msg.sender][tier] + PURCHASE_COOLDOWN,
            "Purchase too frequent"
        );
        lastPurchaseTime[msg.sender][tier] = block.timestamp;
        _;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            MAIN LOTTERY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function buyTickets(
        uint8 tier,
        uint256 ticketCount,
        address referrer
    ) external 
      nonReentrant 
      validTier(tier) 
      validTicketCount(tier, ticketCount)
      purchaseCooldown(tier)
    {
        uint256 totalCost = tierPackagePrices[tier][ticketCount];
        
        // Transfer payment
        USDC.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Update tracking
        totalTicketsSold += ticketCount;
        totalRevenue += totalCost;
        tierTicketsSold[tier] += ticketCount;
        tierRevenue[tier] += totalCost;
        userTierSpent[msg.sender][tier] += totalCost;
        userPreferredTier[msg.sender] = tier; // Track user's preferred tier
        
        // Process referral system
        _processReferral(msg.sender, referrer, tier, totalCost);
        
        // Calculate wins
        (uint256 guaranteedWin, uint256 bonusWin) = _calculateWins(msg.sender, tier, ticketCount, totalCost);
        
        // Update pools and user winnings
        uint256 guaranteedAllocation = (totalCost * tierGuaranteedWinBP[tier]) / BASIS_POINTS;
        uint256 prizePoolAllocation = (totalCost * tierPrizePoolBP[tier]) / BASIS_POINTS;
        
        tierInstantPool[tier] += guaranteedAllocation;
        tierGrandPrizePool[tier] += prizePoolAllocation;
        
        uint256 totalWinnings = guaranteedWin + bonusWin;
        userPendingWins[msg.sender] += totalWinnings;
        userTierWon[msg.sender][tier] += totalWinnings;
        
        emit TicketsPurchased(
            msg.sender,
            tier,
            ticketCount,
            totalCost,
            guaranteedWin,
            bonusWin,
            referrer,
            block.timestamp
        );
        
        // Check for special lottery eligibility
        _checkSpecialLotteryEligibility(msg.sender, tier, totalCost);
        
        // Auto-withdraw profits
        _autoWithdrawProfits();
    }
    
    function _calculateWins(
        address user,
        uint8 tier,
        uint256 ticketCount,
        uint256 totalCost
    ) internal returns (uint256 guaranteedWin, uint256 bonusWin) {
        // Calculate base guaranteed win
        guaranteedWin = (totalCost * tierGuaranteedWinBP[tier]) / BASIS_POINTS;
        
        // Apply streak bonus if applicable
        UserStreak storage streak = userStreaks[user];
        if (streak.currentStreak > 0) {
            uint256 multiplier = _getStreakMultiplier(streak.currentStreak);
            guaranteedWin = (guaranteedWin * multiplier) / BASIS_POINTS;
        }
        
        // Process each ticket for bonus prizes
        bonusWin = 0;
        for (uint256 i = 0; i < ticketCount; i++) {
            uint256 ticketBonus = _processTicketBonuses(user, tier, i);
            bonusWin += ticketBonus;
        }
        
        return (guaranteedWin, bonusWin);
    }
    
    function _processTicketBonuses(address user, uint8 tier, uint256 ticketIndex) internal returns (uint256) {
        // Generate pseudo-random number for this ticket
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            user,
            tier,
            ticketIndex,
            totalTicketsSold,
            gasleft()
        )));
        
        // Check each prize tier for this specific tier
        uint256[] storage prizes = tierPrizeAmounts[tier];
        uint256[] storage odds = tierPrizeOdds[tier];
        
        for (uint256 i = 0; i < prizes.length; i++) {
            uint256 prizeAmount = prizes[i];
            uint256 prizeOdds = odds[i];
            
            uint256 ticketRandom = uint256(keccak256(abi.encodePacked(randomSeed, i, tier))) % prizeOdds;
            
            if (ticketRandom == 0 && tierGrandPrizePool[tier] >= prizeAmount) {
                tierGrandPrizePool[tier] -= prizeAmount;
                
                emit TierWinProcessed(user, tier, prizeAmount, uint8(i), block.timestamp);
                
                return prizeAmount;
            }
        }
        
        return 0;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            REFERRAL SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    function _processReferral(address user, address referrer, uint8 tier, uint256 spent) internal {
        // Set referrer if this is first time and referrer is valid
        if (!hasReferrer[user] && referrer != address(0) && referrer != user) {
            userReferrer[user] = referrer;
            hasReferrer[user] = true;
            userReferralCount[referrer]++;
        }
        
        // Process referral rewards if user has referrer
        if (hasReferrer[user]) {
            address currentReferrer = userReferrer[user];
            uint256 totalUserSpent = _getUserTotalSpent(user);
            
            // Check tier-specific referral rewards
            ReferralTier[] storage rewards = tierReferralRewards[tier];
            
            for (uint256 i = 0; i < rewards.length; i++) {
                ReferralTier storage reward = rewards[i];
                
                // Check if user just crossed threshold
                if (totalUserSpent >= reward.spendThreshold && 
                    (totalUserSpent - spent) < reward.spendThreshold) {
                    
                    // Pay referrer
                    userPendingWins[currentReferrer] += reward.rewardAmount;
                    userReferralEarnings[currentReferrer] += reward.rewardAmount;
                    
                    emit ReferralRewardPaid(
                        currentReferrer,
                        user,
                        tier,
                        reward.rewardAmount,
                        totalUserSpent,
                        block.timestamp
                    );
                    
                    // Process welcome bonus for referred user
                    if (totalUserSpent >= tierWelcomeBonusThreshold[tier]) {
                        uint256 welcomeBonus = _calculateWelcomeBonus(tier);
                        userPendingWins[user] += welcomeBonus;
                    }
                    
                    break; // Only trigger one reward per purchase
                }
            }
        }
    }
    
    function _calculateWelcomeBonus(uint8 tier) internal view returns (uint256) {
        uint256 freeTickets = tierWelcomeBonusTickets[tier];
        uint256 singleTicketPrice = tierPackagePrices[tier][1];
        return freeTickets * singleTicketPrice * tierGuaranteedWinBP[tier] / BASIS_POINTS;
    }
    
    function _getUserTotalSpent(address user) internal view returns (uint256) {
        return userTierSpent[user][BASIC_TIER] + 
               userTierSpent[user][STANDARD_TIER] + 
               userTierSpent[user][PREMIUM_TIER];
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            DAILY CHECK-IN SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    function dailyCheckIn() external {
        UserStreak storage streak = userStreaks[msg.sender];
        
        require(block.timestamp >= streak.lastCheckIn + 1 days, "Already checked in today");
        
        // Update streak
        if (block.timestamp <= streak.lastCheckIn + 2 days && streak.lastCheckIn > 0) {
            streak.currentStreak++;
        } else {
            streak.currentStreak = 1; // Reset or start streak
        }
        
        streak.lastCheckIn = block.timestamp;
        streak.totalCheckIns++;
        
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
        
        // Check lottery eligibility
        bool lotteryEligible = streak.currentStreak >= DAILY_LOTTERY_STREAK_REQUIREMENT;
        streak.isLotteryEligible = lotteryEligible;
        
        // Get bonus multiplier
        uint256 bonusMultiplier = _getStreakMultiplier(streak.currentStreak);
        
        emit DailyCheckIn(
            msg.sender,
            streak.currentStreak,
            bonusMultiplier,
            lotteryEligible,
            block.timestamp
        );
        
        // Auto-enter daily streak lottery if eligible
        if (lotteryEligible) {
            _enterSpecialLottery(LotteryType.DAILY_STREAK, msg.sender, streak.currentStreak);
        }
    }
    
    function _getStreakMultiplier(uint256 streakCount) internal view returns (uint256) {
        if (streakCount >= 30) return streakBonusMultipliers[30];
        if (streakCount >= 14) return streakBonusMultipliers[14];
        if (streakCount >= 7) return streakBonusMultipliers[7];
        if (streakCount >= 4) return streakBonusMultipliers[4];
        return streakBonusMultipliers[1];
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            SPECIAL LOTTERY SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    function _checkSpecialLotteryEligibility(address user, uint8 tier, uint256 spent) internal {
        // Check monthly tier lottery eligibility
        uint256 monthlySpent = _getUserMonthlySpent(user, tier);
        if (monthlySpent >= specialLotteries[LotteryType.MONTHLY_TIER].entryRequirement) {
            _enterSpecialLottery(LotteryType.MONTHLY_TIER, user, monthlySpent);
        }
        
        // Check quarterly cross-tier lottery eligibility
        _enterSpecialLottery(LotteryType.QUARTERLY_CROSS, user, spent);
        
        // Check annual whale lottery eligibility
        uint256 yearlySpent = _getUserYearlySpent(user);
        if (yearlySpent >= specialLotteries[LotteryType.ANNUAL_WHALE].entryRequirement) {
            _enterSpecialLottery(LotteryType.ANNUAL_WHALE, user, yearlySpent);
        }
        
        // Check weekly referral lottery eligibility
        if (userReferralCount[user] > 0) {
            _enterSpecialLottery(LotteryType.WEEKLY_REFERRAL, user, userReferralCount[user]);
        }
    }
    
    function _enterSpecialLottery(LotteryType lotteryType, address user, uint256 entryValue) internal {
        SpecialLottery storage lottery = specialLotteries[lotteryType];
        
        if (lottery.isActive && !lottery.hasEntered[user]) {
            lottery.participants.push(user);
            lottery.hasEntered[user] = true;
            
            emit SpecialLotteryEntered(user, lotteryType, entryValue, block.timestamp);
        }
    }
    
    function _getUserMonthlySpent(address user, uint8 tier) internal view returns (uint256) {
        // Simplified: return tier spent (in production, would track by time periods)
        return userTierSpent[user][tier];
    }
    
    function _getUserYearlySpent(address user) internal view returns (uint256) {
        // Simplified: return total spent (in production, would track by time periods)
        return _getUserTotalSpent(user);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            USER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function claimWins() external nonReentrant {
        uint256 amount = userPendingWins[msg.sender];
        require(amount > 0, "No pending wins");
        
        userPendingWins[msg.sender] = 0;
        
        // Deduct from appropriate tier pools
        _deductFromPools(amount);
        
        USDC.safeTransfer(msg.sender, amount);
        
        emit WinsClaimed(msg.sender, amount, block.timestamp);
    }
    
    function _deductFromPools(uint256 amount) internal {
        uint256 remaining = amount;
        
        // Deduct from tier pools proportionally
        for (uint8 tier = 0; tier <= MAX_TIER && remaining > 0; tier++) {
            if (tierInstantPool[tier] > 0) {
                uint256 deduction = remaining < tierInstantPool[tier] ? remaining : tierInstantPool[tier];
                tierInstantPool[tier] -= deduction;
                remaining -= deduction;
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            OWNER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function withdrawProfits() external onlyOwner {
        uint256 contractBalance = USDC.balanceOf(address(this));
        uint256 reservedAmount = _getTotalReservedAmount();
        
        require(contractBalance > reservedAmount, "No profits to withdraw");
        
        uint256 profit = contractBalance - reservedAmount;
        require(profit >= OWNER_WITHDRAWAL_THRESHOLD, "Profit below threshold");
        
        USDC.safeTransfer(owner(), profit);
        emit OwnerWithdrawal(owner(), profit, block.timestamp);
    }
    
    function _autoWithdrawProfits() internal {
        uint256 contractBalance = USDC.balanceOf(address(this));
        uint256 reservedAmount = _getTotalReservedAmount();
        
        if (contractBalance > reservedAmount) {
            uint256 profit = contractBalance - reservedAmount;
            if (profit >= OWNER_WITHDRAWAL_THRESHOLD) {
                USDC.safeTransfer(owner(), profit);
                emit OwnerWithdrawal(owner(), profit, block.timestamp);
            }
        }
    }
    
    function _getTotalReservedAmount() internal view returns (uint256) {
        uint256 total = 0;
        for (uint8 tier = 0; tier <= MAX_TIER; tier++) {
            total += tierInstantPool[tier] + tierGrandPrizePool[tier];
        }
        return total;
    }
    
    function refillPools(uint8 tier, uint256 instantAmount, uint256 grandPrizeAmount) 
        external 
        onlyOwner 
        validTier(tier) 
    {
        require(instantAmount > 0 || grandPrizeAmount > 0, "Must refill at least one pool");
        
        uint256 totalRefill = instantAmount + grandPrizeAmount;
        USDC.safeTransferFrom(msg.sender, address(this), totalRefill);
        
        tierInstantPool[tier] += instantAmount;
        tierGrandPrizePool[tier] += grandPrizeAmount;
        
        emit PoolsRefilled(tier, tierInstantPool[tier], tierGrandPrizePool[tier], block.timestamp);
    }
    
    function processSpecialLottery(LotteryType lotteryType) external onlyOwner {
        SpecialLottery storage lottery = specialLotteries[lotteryType];
        require(lottery.isActive, "Lottery not active");
        require(lottery.participants.length > 0, "No participants");
        
        // Simple random selection (in production, would use more sophisticated method)
        uint256 winnerIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            lottery.participants.length
        ))) % lottery.participants.length;
        
        address winner = lottery.participants[winnerIndex];
        uint256 prizeAmount = lottery.prizePool;
        
        // Award prize
        userPendingWins[winner] += prizeAmount;
        
        emit SpecialLotteryWin(winner, lotteryType, prizeAmount, block.timestamp);
        
        // Reset lottery
        _resetSpecialLottery(lotteryType);
    }
    
    function _resetSpecialLottery(LotteryType lotteryType) internal {
        SpecialLottery storage lottery = specialLotteries[lotteryType];
        
        // Clear participants
        for (uint256 i = 0; i < lottery.participants.length; i++) {
            lottery.hasEntered[lottery.participants[i]] = false;
        }
        delete lottery.participants;
    }
    
    function setSpecialLotteryPrizePool(LotteryType lotteryType, uint256 newPrizePool) 
        external 
        onlyOwner 
    {
        specialLotteries[lotteryType].prizePool = newPrizePool;
    }
    
    function setSpecialLotteryStatus(LotteryType lotteryType, bool isActive) 
        external 
        onlyOwner 
    {
        specialLotteries[lotteryType].isActive = isActive;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        USDC.safeTransfer(owner(), balance);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function getTierPackagePrice(uint8 tier, uint256 ticketCount) 
        external 
        view 
        validTier(tier) 
        returns (uint256) 
    {
        return tierPackagePrices[tier][ticketCount];
    }
    
    function getValidTicketCounts(uint8 tier) 
        external 
        view 
        validTier(tier) 
        returns (uint256[] memory) 
    {
        uint256[] memory validCounts;
        
        if (tier == BASIC_TIER) {
            validCounts = new uint256[](3);
            validCounts[0] = 1;
            validCounts[1] = 3;
            validCounts[2] = 5;
        } else if (tier == STANDARD_TIER) {
            validCounts = new uint256[](3);
            validCounts[0] = 1;
            validCounts[1] = 5;
            validCounts[2] = 10;
        } else if (tier == PREMIUM_TIER) {
            validCounts = new uint256[](3);
            validCounts[0] = 1;
            validCounts[1] = 5;
            validCounts[2] = 20;
        }
        
        return validCounts;
    }
    
    function getTierConfiguration(uint8 tier) 
        external 
        view 
        validTier(tier) 
        returns (
            uint256 guaranteedWinBP,
            uint256 prizePoolBP,
            uint256 profitBP,
            uint256 minInstantPool,
            uint256 minGrandPrizePool
        ) 
    {
        return (
            tierGuaranteedWinBP[tier],
            tierPrizePoolBP[tier],
            tierProfitBP[tier],
            tierMinInstantPool[tier],
            tierMinGrandPrizePool[tier]
        );
    }
    
    function getTierStats(uint8 tier) 
        external 
        view 
        validTier(tier) 
        returns (
            uint256 ticketsSold,
            uint256 revenue,
            uint256 instantPool,
            uint256 grandPrizePool
        ) 
    {
        return (
            tierTicketsSold[tier],
            tierRevenue[tier],
            tierInstantPool[tier],
            tierGrandPrizePool[tier]
        );
    }
    
    function getGlobalStats() 
        external 
        view 
        returns (
            uint256 totalSold,
            uint256 totalRev,
            uint256 totalInstantPool,
            uint256 totalGrandPrizePool,
            uint256 contractBalance
        ) 
    {
        uint256 totalInstant = 0;
        uint256 totalGrand = 0;
        
        for (uint8 tier = 0; tier <= MAX_TIER; tier++) {
            totalInstant += tierInstantPool[tier];
            totalGrand += tierGrandPrizePool[tier];
        }
        
        return (
            totalTicketsSold,
            totalRevenue,
            totalInstant,
            totalGrand,
            USDC.balanceOf(address(this))
        );
    }
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256[3] memory tierSpent,     // [basic, standard, premium]
            uint256[3] memory tierWon,       // [basic, standard, premium]
            uint256 pendingWins,
            uint256 totalSpent,
            uint256 totalWon,
            uint8 preferredTier
        ) 
    {
        tierSpent[0] = userTierSpent[user][BASIC_TIER];
        tierSpent[1] = userTierSpent[user][STANDARD_TIER];
        tierSpent[2] = userTierSpent[user][PREMIUM_TIER];
        
        tierWon[0] = userTierWon[user][BASIC_TIER];
        tierWon[1] = userTierWon[user][STANDARD_TIER];
        tierWon[2] = userTierWon[user][PREMIUM_TIER];
        
        pendingWins = userPendingWins[user];
        totalSpent = tierSpent[0] + tierSpent[1] + tierSpent[2];
        totalWon = tierWon[0] + tierWon[1] + tierWon[2];
        preferredTier = userPreferredTier[user];
        
        return (tierSpent, tierWon, pendingWins, totalSpent, totalWon, preferredTier);
    }
    
    function getUserReferralStats(address user) 
        external 
        view 
        returns (
            address referrer,
            uint256 referralCount,
            uint256 referralEarnings,
            bool hasRef
        ) 
    {
        return (
            userReferrer[user],
            userReferralCount[user],
            userReferralEarnings[user],
            hasReferrer[user]
        );
    }
    
    function getUserStreakInfo(address user) 
        external 
        view 
        returns (
            uint256 currentStreak,
            uint256 lastCheckIn,
            uint256 totalCheckIns,
            uint256 longestStreak,
            bool lotteryEligible,
            uint256 nextBonusMultiplier
        ) 
    {
        UserStreak storage streak = userStreaks[user];
        return (
            streak.currentStreak,
            streak.lastCheckIn,
            streak.totalCheckIns,
            streak.longestStreak,
            streak.isLotteryEligible,
            _getStreakMultiplier(streak.currentStreak + 1)
        );
    }
    
    function getTierPrizeInfo(uint8 tier) 
        external 
        view 
        validTier(tier) 
        returns (
            uint256[] memory amounts,
            uint256[] memory odds
        ) 
    {
        return (tierPrizeAmounts[tier], tierPrizeOdds[tier]);
    }
    
    function getTierReferralRewards(uint8 tier) 
        external 
        view 
        validTier(tier) 
        returns (
            uint256[] memory thresholds,
            uint256[] memory rewards
        ) 
    {
        ReferralTier[] storage tierRewards = tierReferralRewards[tier];
        uint256 length = tierRewards.length;
        
        thresholds = new uint256[](length);
        rewards = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            thresholds[i] = tierRewards[i].spendThreshold;
            rewards[i] = tierRewards[i].rewardAmount;
        }
        
        return (thresholds, rewards);
    }
    
    function getSpecialLotteryInfo(LotteryType lotteryType) 
        external 
        view 
        returns (
            uint256 prizePool,
            uint256 entryRequirement,
            uint256 participantCount,
            bool isActive,
            bool userEntered
        ) 
    {
        SpecialLottery storage lottery = specialLotteries[lotteryType];
        return (
            lottery.prizePool,
            lottery.entryRequirement,
            lottery.participants.length,
            lottery.isActive,
            lottery.hasEntered[msg.sender]
        );
    }
    
    function getAllSpecialLotteryInfo() 
        external 
        view 
        returns (
            uint256[5] memory prizePools,
            uint256[5] memory participantCounts,
            bool[5] memory activeStatus,
            bool[5] memory userEnteredStatus
        ) 
    {
        for (uint256 i = 0; i < 5; i++) {
            LotteryType lotteryType = LotteryType(i);
            SpecialLottery storage lottery = specialLotteries[lotteryType];
            
            prizePools[i] = lottery.prizePool;
            participantCounts[i] = lottery.participants.length;
            activeStatus[i] = lottery.isActive;
            userEnteredStatus[i] = lottery.hasEntered[msg.sender];
        }
        
        return (prizePools, participantCounts, activeStatus, userEnteredStatus);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function generateReferralCode(address user) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, "CHAINLUCK_REFERRAL"));
    }
    
    function validateReferralCode(bytes32 code, address expectedUser) external pure returns (bool) {
        return code == keccak256(abi.encodePacked(expectedUser, "CHAINLUCK_REFERRAL"));
    }
    
    function canCheckInToday(address user) external view returns (bool) {
        return block.timestamp >= userStreaks[user].lastCheckIn + 1 days;
    }
    
    function getTimeUntilNextCheckIn(address user) external view returns (uint256) {
        uint256 nextCheckIn = userStreaks[user].lastCheckIn + 1 days;
        return block.timestamp >= nextCheckIn ? 0 : nextCheckIn - block.timestamp;
    }
    
    function estimateWinnings(uint8 tier, uint256 ticketCount) 
        external 
        view 
        validTier(tier) 
        returns (
            uint256 guaranteedWin,
            uint256 maxPossibleWin
        ) 
    {
        uint256 totalCost = tierPackagePrices[tier][ticketCount];
        guaranteedWin = (totalCost * tierGuaranteedWinBP[tier]) / BASIS_POINTS;
        
        // Calculate maximum possible win (guaranteed + biggest prize * ticket count)
        uint256[] storage prizes = tierPrizeAmounts[tier];
        uint256 biggestPrize = prizes.length > 0 ? prizes[0] : 0;
        maxPossibleWin = guaranteedWin + (biggestPrize * ticketCount);
        
        return (guaranteedWin, maxPossibleWin);
    }
    
    function getTierName(uint8 tier) external pure validTier(tier) returns (string memory) {
        if (tier == BASIC_TIER) return "Basic";
        if (tier == STANDARD_TIER) return "Standard";
        if (tier == PREMIUM_TIER) return "Premium";
        return "Unknown";
    }
    
    function getMaxTier() external pure returns (uint8) {
        return MAX_TIER;
    }
    
    function getContractVersion() external pure returns (string memory) {
        return "ChainLuck Multi-Tier v1.0.0";
    }
}
