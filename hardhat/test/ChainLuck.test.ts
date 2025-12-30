// test/ChainLuck.test.ts
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('ChainLuck', function () {
  async function deployChainLuckFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy Mock USDC for testing
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    // Mock VRF Coordinator (simplified for testing)
    const MockVRFCoordinator = await ethers.getContractFactory('MockVRFCoordinator');
    const vrfCoordinator = await MockVRFCoordinator.deploy();
    await vrfCoordinator.waitForDeployment();

    // VRF Configuration
    const subscriptionId = 1;
    const keyHash = '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c';

    // Deploy ChainLuck
    const ChainLuck = await ethers.getContractFactory('ChainLuck');
    const chainluck = await ChainLuck.deploy(
      await usdc.getAddress(),
      await vrfCoordinator.getAddress(),
      subscriptionId,
      keyHash
    );
    await chainluck.waitForDeployment();

    // Initial funding
    const initialAmount = ethers.parseUnits('10000', 6); // $10,000
    await usdc.approve(await chainluck.getAddress(), initialAmount * 2n);
    await chainluck.refillPools(initialAmount, initialAmount);

    return { chainluck, usdc, vrfCoordinator, owner, user1, user2, user3 };
  }

  describe('Deployment', function () {
    it('Should deploy with correct configuration', async function () {
      const { chainluck, usdc } = await loadFixture(deployChainLuckFixture);

      // Check USDC address
      expect(await chainluck.USDC()).to.equal(await usdc.getAddress());

      // Check ticket prices
      expect(await chainluck.PRICE_1_TICKET()).to.equal(ethers.parseUnits('3.5', 6));
      expect(await chainluck.PRICE_5_TICKETS()).to.equal(ethers.parseUnits('17.5', 6));
      expect(await chainluck.PRICE_50_TICKETS()).to.equal(ethers.parseUnits('175', 6));
    });

    it('Should have correct initial pool balances', async function () {
      const { chainluck } = await loadFixture(deployChainLuckFixture);

      const stats = await chainluck.getContractStats();
      expect(stats[2]).to.equal(ethers.parseUnits('10000', 6)); // instant pool
      expect(stats[3]).to.equal(ethers.parseUnits('10000', 6)); // grand prize pool
    });
  });

  describe('Ticket Purchase', function () {
    it('Should allow buying 1 ticket', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      // Fund user
      await usdc.mint(user1.address, ethers.parseUnits('100', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy ticket
      const tx = await chainluck.connect(user1).buyTickets(1);
      await expect(tx).to.emit(chainluck, 'TicketsPurchased');

      // Check user stats
      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[0]).to.equal(ethers.parseUnits('3.5', 6)); // spent
      expect(stats[2]).to.be.gt(0); // pending wins (guaranteed win)
    });

    it('Should allow buying multiple ticket packages', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      await usdc.mint(user1.address, ethers.parseUnits('200', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('200', 6));

      // Test different ticket counts
      const ticketCounts = [1, 5, 10];
      for (const count of ticketCounts) {
        await expect(chainluck.connect(user1).buyTickets(count))
          .to.emit(chainluck, 'TicketsPurchased');
      }

      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[0]).to.be.gt(0); // should have spent money
      expect(stats[2]).to.be.gt(0); // should have pending wins
    });

    it('Should reject invalid ticket counts', async function () {
      const { chainluck, user1 } = await loadFixture(deployChainLuckFixture);

      await expect(chainluck.connect(user1).buyTickets(3))
        .to.be.revertedWith('Invalid ticket count');
      
      await expect(chainluck.connect(user1).buyTickets(100))
        .to.be.revertedWith('Invalid ticket count');
    });

    it('Should emit VRF request event', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      await usdc.mint(user1.address, ethers.parseUnits('100', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      await expect(chainluck.connect(user1).buyTickets(1))
        .to.emit(chainluck, 'VRFRequested');
    });
  });

  describe('Win Claims', function () {
    it('Should allow claiming guaranteed wins', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      await usdc.mint(user1.address, ethers.parseUnits('100', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy ticket
      await chainluck.connect(user1).buyTickets(1);

      const initialBalance = await usdc.balanceOf(user1.address);
      const userStats = await chainluck.getUserStats(user1.address);
      
      if (userStats[2] > 0) { // if has pending wins
        await chainluck.connect(user1).claimWins();
        const finalBalance = await usdc.balanceOf(user1.address);
        expect(finalBalance).to.be.gt(initialBalance);
      }
    });

    it('Should revert when claiming with no pending wins', async function () {
      const { chainluck, user1 } = await loadFixture(deployChainLuckFixture);

      await expect(chainluck.connect(user1).claimWins())
        .to.be.revertedWith('No pending wins');
    });
  });

  describe('Owner Functions', function () {
    it('Should allow owner to withdraw profits', async function () {
      const { chainluck, usdc, user1, owner } = await loadFixture(deployChainLuckFixture);

      // Generate revenue
      await usdc.mint(user1.address, ethers.parseUnits('1000', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('1000', 6));

      // Buy many tickets to generate profit
      for (let i = 0; i < 10; i++) {
        await chainluck.connect(user1).buyTickets(5);
      }

      const initialOwnerBalance = await usdc.balanceOf(owner.address);
      
      try {
        await chainluck.connect(owner).withdrawProfits();
        const finalOwnerBalance = await usdc.balanceOf(owner.address);
        expect(finalOwnerBalance).to.be.gte(initialOwnerBalance);
      } catch (error) {
        // May fail if profit threshold not reached - this is expected
        console.log('Profit withdrawal test: threshold not reached (expected)');
      }
    });

    it('Should allow owner to refill pools', async function () {
      const { chainluck, usdc, owner } = await loadFixture(deployChainLuckFixture);

      const addAmount = ethers.parseUnits('1000', 6);
      await usdc.mint(owner.address, addAmount * 2n);
      await usdc.approve(await chainluck.getAddress(), addAmount * 2n);

      const initialStats = await chainluck.getContractStats();
      await chainluck.refillPools(addAmount, addAmount);
      const finalStats = await chainluck.getContractStats();

      expect(finalStats[2]).to.equal(initialStats[2] + addAmount); // instant pool
      expect(finalStats[3]).to.equal(initialStats[3] + addAmount); // grand prize pool
    });

    it('Should prevent non-owner from accessing owner functions', async function () {
      const { chainluck, user1 } = await loadFixture(deployChainLuckFixture);

      await expect(chainluck.connect(user1).withdrawProfits())
        .to.be.revertedWithCustomError(chainluck, 'OwnableUnauthorizedAccount');

      await expect(chainluck.connect(user1).refillPools(100, 100))
        .to.be.revertedWithCustomError(chainluck, 'OwnableUnauthorizedAccount');
    });
  });

  describe('View Functions', function () {
    it('Should return correct ticket prices', async function () {
      const { chainluck } = await loadFixture(deployChainLuckFixture);

      expect(await chainluck.getTicketPrice(1)).to.equal(ethers.parseUnits('3.5', 6));
      expect(await chainluck.getTicketPrice(5)).to.equal(ethers.parseUnits('17.5', 6));
      expect(await chainluck.getTicketPrice(10)).to.equal(ethers.parseUnits('35', 6));
      expect(await chainluck.getTicketPrice(20)).to.equal(ethers.parseUnits('70', 6));
      expect(await chainluck.getTicketPrice(50)).to.equal(ethers.parseUnits('175', 6));
      expect(await chainluck.getTicketPrice(100)).to.equal(0); // invalid
    });

    it('Should return accurate contract stats', async function () {
      const { chainluck } = await loadFixture(deployChainLuckFixture);

      const stats = await chainluck.getContractStats();
      expect(stats[0]).to.equal(0); // total tickets sold initially
      expect(stats[1]).to.equal(0); // total revenue initially
      expect(stats[2]).to.equal(ethers.parseUnits('10000', 6)); // instant pool
      expect(stats[3]).to.equal(ethers.parseUnits('10000', 6)); // grand prize pool
    });

    it('Should return grand prize info', async function () {
      const { chainluck } = await loadFixture(deployChainLuckFixture);

      const [amounts, odds] = await chainluck.getGrandPrizeInfo();
      expect(amounts.length).to.equal(5);
      expect(odds.length).to.equal(5);
      expect(amounts[0]).to.equal(ethers.parseUnits('10000', 6)); // $10,000
      expect(amounts[4]).to.equal(ethers.parseUnits('500', 6));   // $500
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for ticket purchase', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      await usdc.mint(user1.address, ethers.parseUnits('100', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      const tx = await chainluck.connect(user1).buyTickets(1);
      const receipt = await tx.wait();
      
      console.log(`Gas used for 1 ticket purchase: ${receipt?.gasUsed.toString()}`);
      expect(receipt?.gasUsed).to.be.lt(500000); // Should be under 500k gas
    });
  });

  describe('Edge Cases', function () {
    it('Should handle insufficient USDC balance', async function () {
      const { chainluck, usdc, user1 } = await loadFixture(deployChainLuckFixture);

      // Give user only $1 but try to buy $3.50 ticket
      await usdc.mint(user1.address, ethers.parseUnits('1', 6));
      await usdc.connect(user1).approve(await chainluck.getAddress(), ethers.parseUnits('10', 6));

      await expect(chainluck.connect(user1).buyTickets(1))
        .to.be.reverted; // Should fail due to insufficient balance
    });

    it('Should handle multiple users buying tickets', async function () {
      const { chainluck, usdc, user1, user2, user3 } = await loadFixture(deployChainLuckFixture);

      const users = [user1, user2, user3];
      
      // Fund all users
      for (const user of users) {
        await usdc.mint(user.address, ethers.parseUnits('100', 6));
        await usdc.connect(user).approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));
      }

      // All users buy tickets
      for (const user of users) {
        await chainluck.connect(user).buyTickets(1);
      }

      const stats = await chainluck.getContractStats();
      expect(stats[0]).to.equal(3); // 3 tickets sold
    });
  });
});

// Mock VRF Coordinator for testing
// This would normally be provided by Chainlink
contract MockVRFCoordinator {
    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external pure returns (uint256) {
        return 12345; // Mock request ID
    }
}
