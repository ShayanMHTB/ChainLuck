# ⛓️ ChainLuck Blockchain Documentation

## Smart Contract Overview

### Contract: ChainLuck.sol

- **Purpose**: Decentralized lottery system with instant payouts
- **Language**: Solidity 0.8.20
- **Network**: Sepolia Testnet (Production: Polygon/BSC)
- **Current Deployment**: `[Contract address from deployment-info.json]`

## Contract Economics

### Ticket Pricing Model

| Component         | Amount | Percentage | Purpose               |
| ----------------- | ------ | ---------- | --------------------- |
| Ticket Price      | $5.00  | 100%       | Total cost per ticket |
| Guaranteed Return | $0.10  | 2%         | Psychological comfort |
| Prize Pool        | $0.80  | 16%        | Win distributions     |
| Referral Reserve  | $0.20  | 4%         | Referral rewards      |
| Gas/VRF Costs     | $0.15  | 3%         | Operational costs     |
| Platform Profit   | $3.75  | 75%        | Revenue               |

### Win Probability Matrix

```solidity
// Pseudo-random for small wins (block.hash based)
if (amount <= 25 USD) {
    uint256 random = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        msg.sender,
        ticketId
    )));
}

// Chainlink VRF for large wins ($50+)
if (amount > 50 USD) {
    requestId = requestRandomness();
    pendingWins[requestId] = WinData(user, amount);
}
```

### Win Tiers

| Tier       | Amount Range | Probability | VRF Required |
| ---------- | ------------ | ----------- | ------------ |
| Guaranteed | $0.10        | 100%        | No           |
| Small      | $1-5         | 15%         | No           |
| Medium     | $10-25       | 3%          | No           |
| Big        | $50-100      | 0.5%        | Yes          |
| Grand      | $500-1000    | 0.1%        | Yes          |

## Chainlink VRF Integration

### Configuration

```solidity
// Sepolia Testnet
VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
Key Hash: 0x474e34a0...
Subscription ID: [Your subscription ID]
Callback Gas Limit: 100,000
Request Confirmations: 3
```

### VRF Optimization Strategy

- **Batch Processing**: Queue multiple win requests
- **Threshold System**: Only use VRF for wins > $50
- **Cost Management**: Max $10 per VRF batch
- **Fallback**: Pseudo-random for smaller wins

## Contract Functions

### Core User Functions

#### buyTicket(address referrer)

```solidity
function buyTicket(address referrer) external payable {
    require(msg.value == ticketPrice, "Incorrect payment");
    // Process ticket purchase
    // Calculate instant win or queue for VRF
    // Track referral if valid
}
```

#### claimWinnings()

```solidity
function claimWinnings() external {
    uint256 amount = userWinnings[msg.sender];
    require(amount > 0, "No winnings");
    // Transfer winnings to user
}
```

### Admin Functions

#### withdrawProfits()

```solidity
function withdrawProfits() external onlyOwner {
    // Calculate safe withdrawal amount
    // Transfer to owner wallet
}
```

#### fundPool(uint256 poolId)

```solidity
function fundPool(uint256 poolId) external payable onlyOwner {
    // Add funds to specific prize pool
}
```

## Gas Optimization

### Current Gas Costs (Sepolia)

| Operation   | Gas Used | Cost (at 30 gwei) |
| ----------- | -------- | ----------------- |
| Buy Ticket  | ~80,000  | ~0.0024 ETH       |
| Claim Win   | ~50,000  | ~0.0015 ETH       |
| Process VRF | ~200,000 | ~0.006 ETH        |

### Optimization Techniques

- Storage packing for user data
- Batch operations for multiple tickets
- Efficient event emission
- Minimal external calls

## Security Measures

### Implemented Protections

```solidity
// Reentrancy Guard
modifier nonReentrant() {
    require(!locked, "Reentrant call");
    locked = true;
    _;
    locked = false;
}

// Access Control
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

// Overflow Protection
// Using Solidity 0.8+ automatic checks
```

### Security Considerations

- **Randomness**: Chainlink VRF for unpredictable outcomes
- **Front-running**: Commit-reveal pattern for large wins
- **Pool Management**: Separate pools prevent total drainage
- **Withdrawal Limits**: Time-based and amount-based restrictions

## Testing Strategy

### Unit Tests

```javascript
describe('ChainLuck Contract', () => {
  it('Should purchase ticket correctly');
  it('Should calculate wins accurately');
  it('Should process referrals');
  it('Should handle VRF callbacks');
});
```

### Integration Tests

- Mainnet fork testing
- VRF mock testing
- Gas consumption analysis
- Stress testing with multiple users

## Deployment Process

### 1. Compile Contract

```bash
cd hardhat
npm run compile
```

### 2. Deploy to Network

```bash
npm run deploy -- --network sepolia
```

### 3. Verify on Etherscan

```bash
npm run verify -- --network sepolia
```

### 4. Fund VRF Subscription

```bash
# Add LINK tokens to VRF subscription
# Minimum: 10 LINK for testing
```

### 5. Initialize Pools

```bash
npm run fund -- --network sepolia
```

## Multi-chain Strategy

### Target Networks

| Network  | Priority | Reason                 |
| -------- | -------- | ---------------------- |
| Polygon  | High     | Low gas, high adoption |
| BSC      | High     | Large user base        |
| Arbitrum | Medium   | Growing DeFi ecosystem |
| Base     | Low      | Future consideration   |

### Cross-chain Considerations

- Unified contract addresses (CREATE2)
- Bridge integration for liquidity
- Chain-specific optimizations
- Consistent VRF providers

## Contract Upgradability

### Current: Non-upgradable

- Immutable for trust
- Simple architecture
- Lower complexity

### Future: Proxy Pattern (Optional)

```solidity
// Using OpenZeppelin Upgradeable
contract ChainLuckV2 is Initializable, UUPSUpgradeable {
    // Implementation
}
```

## Event Architecture

### Emitted Events

```solidity
event TicketPurchased(address user, uint256 ticketId, uint256 timestamp);
event WinProcessed(address user, uint256 amount, uint256 ticketId);
event ReferralPaid(address referrer, address referred, uint256 amount);
event PoolFunded(uint256 poolId, uint256 amount);
```

### Event Indexing

- Using Supabase for off-chain indexing
- Real-time updates to frontend
- Historical data analysis
- User activity tracking

## Development Tools

### Required Tools

- **Node.js**: v18+
- **Hardhat**: Development framework
- **Metamask**: Wallet for testing
- **Etherscan**: Contract verification
- **Chainlink**: VRF subscription management

### Useful Resources

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink VRF Docs](https://docs.chain.link/vrf/v2/introduction)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
