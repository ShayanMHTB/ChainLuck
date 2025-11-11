// File: hardhat/contracts/mocks/MockUSDT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock Tether USD", "USDT") {
        // Mint 1 billion USDT tokens (6 decimals like real USDT)
        _mint(msg.sender, 1_000_000_000 * 10**6);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // USDT uses 6 decimals
    }
    
    // Function to mint more tokens for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    // Function to get free tokens for testing
    function faucet() external {
        _mint(msg.sender, 10000 * 10**6); // 10,000 USDT
    }
}
