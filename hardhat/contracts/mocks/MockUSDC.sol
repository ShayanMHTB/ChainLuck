// File: hardhat/contracts/mocks/MockUSDC.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {
        // Mint 1 billion USDC tokens (6 decimals like real USDC)
        _mint(msg.sender, 1_000_000_000 * 10**6);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6; // USDC uses 6 decimals
    }
    
    // Function to mint more tokens for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    // Function to get free tokens for testing
    function faucet() external {
        _mint(msg.sender, 10000 * 10**6); // 10,000 USDC
    }
}
