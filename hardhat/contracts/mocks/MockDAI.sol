// File: hardhat/contracts/mocks/MockDAI.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20 {
    constructor() ERC20("Mock Dai Stablecoin", "DAI") {
        // Mint 1 billion DAI tokens (18 decimals like real DAI)
        _mint(msg.sender, 1_000_000_000 * 10**18);
    }
    
    function decimals() public pure override returns (uint8) {
        return 18; // DAI uses 18 decimals
    }
    
    // Function to mint more tokens for testing
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    // Function to get free tokens for testing
    function faucet() external {
        _mint(msg.sender, 10000 * 10**18); // 10,000 DAI
    }
}
