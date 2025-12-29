// contracts/ChainLuck.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ChainLuck
 * @dev Simplified lottery contract without external VRF dependencies
 * Uses pseudo-random for all prize calculations (can add VRF later)
 */
contract ChainLuck is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    
    IERC20 public immutable USDC;
    
    // Ticket prices (6 decimal precision for USDC)
    uint256 public constant PRICE_1_TICKET = 3_500000;    // $3.50
    uint256 public constant PRICE_5_TICKETS = 17_500000;  // $17.50
    uint256 public constant PRICE_10_TICKETS = 35_000000; // $35.00
    uint256 public constant PRICE_20_TICKETS = 70_000000; // $70.00
    uint256 public constant PRICE_50_TICKETS = 175_000000; // $175.00
    
    // Revenue allocation (basis points)
    uint256 public constant GUARANTEED_WIN_BP = 750;    // 7.5%
    uint256 public constant GRAND_PRIZE_POOL_BP = 1500; // 15%
    uint256 public constant PLATFORM_PROFIT_BP = 7750;  // 77.5%
    uint256 public constant BASIS_POINTS = 10000;       // 100%
    
    // Grand prizes (in USDC 6-decimal format)
    uint256[5] public GRAND_PRIZE_AMOUNTS = [
        10000_000000, // $10,000
        5000_000000,  // $5,000
        2000_000000,  // $2,000
        1000_000000,  // $1,000
        500_000000    // $500
    ];
    
    // Grand prize odds (1 in X)
    uint256[5] public GRAND_PRIZE_ODDS = [
        10_000_000, // 1 in 10M for $10,000
        5_000_000,  // 1 in 5M for $5,000
        2_000_000,  // 1 in 2M for $2,000
        1_000_000,  // 1 in 1M for $1,000
        500_000     // 1 in 500K for $500
    ];
    
    // Pool management
    uint256 public constant MIN_INSTANT_POOL = 1000_000000;  // $1,000
    uint256 public constant MIN_GRAND_PRIZE_POOL = 5000_000000; // $5,000
    uint256 public constant OWNER_WITHDRAWAL_THRESHOLD = 2000_000000; // $2,000
    
    // ═══════════════════════════════════════════════════════════════════════
    //                              STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════
    
    uint256 public totalTicketsSold;
    uint256 public totalRevenue;
    uint256 public instantPayoutPool;
    uint256 public grandPrizePool;
    
    mapping(address => uint256) public userTotalSpent;
    mapping(address => uint256) public userTotalWon;
    mapping(address => uint256) public pendingWins;
    
    // ═══════════════════════════════════════════════════════════════════════
    //                                EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    
    event TicketsPurchased(
        address indexed user,
        uint256 ticketCount,
        uint256 totalCost,
        uint256 guaranteedWin,
        uint256 grandPrizeWin,
        uint256 timestamp
    );
    
    event GrandPrizeWon(
        address indexed user,
        uint256 amount,
        uint256 prizeIndex,
        uint256 timestamp
    );
    
    event WinsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event PoolsRefilled(
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
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            MAIN LOTTERY FUNCTION
    // ═══════════════════════════════════════════════════════════════════════
    
    function buyTickets(uint256 ticketCount) external nonReentrant {
        require(
            ticketCount == 1 || ticketCount == 5 || ticketCount == 10 || 
            ticketCount == 20 || ticketCount == 50,
            "Invalid ticket count"
        );
        
        uint256 totalCost = getTicketPrice(ticketCount);
        require(totalCost > 0, "Invalid ticket configuration");
        
        // Transfer payment
        USDC.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Update tracking
        totalTicketsSold += ticketCount;
        totalRevenue += totalCost;
        userTotalSpent[msg.sender] += totalCost;
        
        // Calculate allocations
        uint256 guaranteedWin = (totalCost * GUARANTEED_WIN_BP) / BASIS_POINTS;
        uint256 grandPrizeAllocation = (totalCost * GRAND_PRIZE_POOL_BP) / BASIS_POINTS;
        
        // Update pools
        instantPayoutPool += guaranteedWin;
        grandPrizePool += grandPrizeAllocation;
        
        // Process wins
        uint256 totalWinnings = guaranteedWin;
        uint256 grandPrizeWinnings = 0;
        
        // Check for grand prizes on each ticket
        for (uint256 i = 0; i < ticketCount; i++) {
            uint256 grandPrizeWin = processTicketLottery(msg.sender, i);
            grandPrizeWinnings += grandPrizeWin;
        }
        
        totalWinnings += grandPrizeWinnings;
        
        // Credit winnings
        pendingWins[msg.sender] += totalWinnings;
        userTotalWon[msg.sender] += totalWinnings;
        
        emit TicketsPurchased(
            msg.sender,
            ticketCount,
            totalCost,
            guaranteedWin,
            grandPrizeWinnings,
            block.timestamp
        );
        
        // Auto-withdraw profits
        autoWithdrawProfits();
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            LOTTERY LOGIC
    // ═══════════════════════════════════════════════════════════════════════
    
    function processTicketLottery(address user, uint256 ticketIndex) internal returns (uint256) {
        // Generate pseudo-random number
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            user,
            ticketIndex,
            totalTicketsSold,
            gasleft()
        )));
        
        // Check each grand prize tier
        for (uint256 i = 0; i < GRAND_PRIZE_AMOUNTS.length; i++) {
            uint256 prizeAmount = GRAND_PRIZE_AMOUNTS[i];
            uint256 odds = GRAND_PRIZE_ODDS[i];
            
            uint256 ticketRandom = uint256(keccak256(abi.encodePacked(randomSeed, i))) % odds;
            
            if (ticketRandom == 0 && grandPrizePool >= prizeAmount) {
                grandPrizePool -= prizeAmount;
                emit GrandPrizeWon(user, prizeAmount, i, block.timestamp);
                return prizeAmount;
            }
        }
        
        return 0;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            USER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function claimWins() external nonReentrant {
        uint256 amount = pendingWins[msg.sender];
        require(amount > 0, "No pending wins");
        
        pendingWins[msg.sender] = 0;
        
        require(instantPayoutPool >= amount, "Insufficient payout pool");
        instantPayoutPool -= amount;
        
        USDC.safeTransfer(msg.sender, amount);
        
        emit WinsClaimed(msg.sender, amount, block.timestamp);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            OWNER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function withdrawProfits() external onlyOwner {
        uint256 contractBalance = USDC.balanceOf(address(this));
        uint256 reservedAmount = instantPayoutPool + grandPrizePool;
        
        require(contractBalance > reservedAmount, "No profits to withdraw");
        
        uint256 profit = contractBalance - reservedAmount;
        require(profit >= OWNER_WITHDRAWAL_THRESHOLD, "Profit below threshold");
        
        USDC.safeTransfer(owner(), profit);
        emit OwnerWithdrawal(owner(), profit, block.timestamp);
    }
    
    function autoWithdrawProfits() internal {
        uint256 contractBalance = USDC.balanceOf(address(this));
        uint256 reservedAmount = instantPayoutPool + grandPrizePool;
        
        if (contractBalance > reservedAmount) {
            uint256 profit = contractBalance - reservedAmount;
            if (profit >= OWNER_WITHDRAWAL_THRESHOLD) {
                USDC.safeTransfer(owner(), profit);
                emit OwnerWithdrawal(owner(), profit, block.timestamp);
            }
        }
    }
    
    function refillPools(uint256 instantAmount, uint256 grandPrizeAmount) external onlyOwner {
        require(instantAmount > 0 || grandPrizeAmount > 0, "Must refill at least one pool");
        
        uint256 totalRefill = instantAmount + grandPrizeAmount;
        USDC.safeTransferFrom(msg.sender, address(this), totalRefill);
        
        instantPayoutPool += instantAmount;
        grandPrizePool += grandPrizeAmount;
        
        emit PoolsRefilled(instantPayoutPool, grandPrizePool, block.timestamp);
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        USDC.safeTransfer(owner(), balance);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //                            VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function getTicketPrice(uint256 ticketCount) public pure returns (uint256) {
        if (ticketCount == 1) return PRICE_1_TICKET;
        if (ticketCount == 5) return PRICE_5_TICKETS;
        if (ticketCount == 10) return PRICE_10_TICKETS;
        if (ticketCount == 20) return PRICE_20_TICKETS;
        if (ticketCount == 50) return PRICE_50_TICKETS;
        return 0;
    }
    
    function getContractStats() external view returns (
        uint256 totalSold,
        uint256 totalRev,
        uint256 instantPool,
        uint256 grandPool,
        uint256 contractBalance
    ) {
        return (
            totalTicketsSold,
            totalRevenue,
            instantPayoutPool,
            grandPrizePool,
            USDC.balanceOf(address(this))
        );
    }
    
    function getUserStats(address user) external view returns (
        uint256 totalSpent,
        uint256 totalWon,
        uint256 pending,
        uint256 netResult
    ) {
        uint256 spent = userTotalSpent[user];
        uint256 won = userTotalWon[user];
        uint256 pendingAmount = pendingWins[user];
        
        return (
            spent,
            won,
            pendingAmount,
            won >= spent ? won - spent : spent - won
        );
    }
    
    function getGrandPrizeInfo() external view returns (
        uint256[5] memory amounts,
        uint256[5] memory odds
    ) {
        return (GRAND_PRIZE_AMOUNTS, GRAND_PRIZE_ODDS);
    }
}
