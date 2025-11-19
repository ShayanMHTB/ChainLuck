// File: hardhat/test/ChainLuckLottery.test.ts
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('ChainLuckLottery', function () {
  async function deployChainLuckFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy mock tokens
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const usdt = await MockUSDT.deploy();

    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();

    const MockDAI = await ethers.getContractFactory('MockDAI');
    const dai = await MockDAI.deploy();

    // Deploy ChainLuck Lottery
    const ChainLuckLottery = await ethers.getContractFactory(
      'ChainLuckLottery',
    );
    // const chainluck = await ChainLuckLottery.deploy(
    //   1, // VRF subscription ID
    //   await usdt.getAddress(),
    //   await usdc.getAddress(),
    //   await dai.getAddress(),
    // );
    const chainluck = await ChainLuckLottery.deploy(await usdc.getAddress());

    // Setup initial funding
    const initialAmount = ethers.parseUnits('1000', 6); // 1000 USDT/USDC
    const initialDAI = ethers.parseUnits('1000', 18); // 1000 DAI

    await usdt.approve(await chainluck.getAddress(), initialAmount);
    await usdc.approve(await chainluck.getAddress(), initialAmount);
    await dai.approve(await chainluck.getAddress(), initialDAI);

    await chainluck.addToPrizePool(
      await usdt.getAddress(),
      ethers.parseUnits('500', 6),
    );
    await chainluck.addToReferralPool(
      await usdt.getAddress(),
      ethers.parseUnits('250', 6),
    );

    return { chainluck, usdt, usdc, dai, owner, user1, user2, user3 };
  }

  describe('Deployment', function () {
    it('Should deploy with correct token addresses', async function () {
      const { chainluck, usdt, usdc, dai } = await loadFixture(
        deployChainLuckFixture,
      );

      const tokens = await chainluck.getSupportedTokens();
      expect(tokens[0]).to.equal(await usdt.getAddress());
      expect(tokens[1]).to.equal(await usdc.getAddress());
      expect(tokens[2]).to.equal(await dai.getAddress());
    });

    it('Should have correct initial constants', async function () {
      const { chainluck } = await loadFixture(deployChainLuckFixture);

      expect(await chainluck.TICKET_PRICE()).to.equal(
        ethers.parseUnits('5', 6),
      );
      expect(await chainluck.GUARANTEED_WIN()).to.equal(
        ethers.parseUnits('0.1', 6),
      );
      expect(await chainluck.REFERRAL_REWARD()).to.equal(
        ethers.parseUnits('4', 6),
      );
    });
  });

  describe('Token Operations', function () {
    it('Should allow users to get tokens from faucet', async function () {
      const { usdt, user1 } = await loadFixture(deployChainLuckFixture);

      await usdt.connect(user1).faucet();
      const balance = await usdt.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseUnits('10000', 6));
    });

    it('Should allow minting tokens to specific address', async function () {
      const { usdt, user1 } = await loadFixture(deployChainLuckFixture);

      await usdt.mint(user1.address, ethers.parseUnits('5000', 6));
      const balance = await usdt.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseUnits('5000', 6));
    });
  });

  describe('Ticket Purchase', function () {
    it('Should allow buying a ticket with USDT', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      // Setup user with tokens
      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy ticket
      const tx = await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await expect(tx).to.emit(chainluck, 'TicketPurchased');

      // Check user stats
      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[0]).to.equal(ethers.parseUnits('5', 6)); // userSpent
      expect(stats[1]).to.equal(ethers.parseUnits('0.1', 6)); // pendingUSDT (guaranteed win)
    });

    it('Should reject purchase with unsupported token', async function () {
      const { chainluck, user1 } = await loadFixture(deployChainLuckFixture);

      await expect(
        chainluck.connect(user1).buyTicket(ethers.ZeroAddress, user1.address),
      ).to.be.revertedWith('Unsupported token');
    });

    it('Should handle multiple ticket purchases', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      // Setup user
      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy 3 tickets
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[0]).to.equal(ethers.parseUnits('15', 6)); // 3 tickets * 5 USD
      expect(stats[1]).to.be.gte(ethers.parseUnits('0.3', 6)); // At least 3 guaranteed wins
    });
  });

  describe('Referral System', function () {
    it('Should enable referral ability after spending threshold', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy 2 tickets to reach $10 threshold
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[5]).to.be.true; // canMakeReferrals
    });

    it('Should handle referral rewards correctly', async function () {
      const { chainluck, usdt, user1, user2 } = await loadFixture(
        deployChainLuckFixture,
      );

      // Setup both users
      await usdt.connect(user1).faucet();
      await usdt.connect(user2).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));
      await usdt
        .connect(user2)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // User1 becomes eligible for referrals
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      // User2 buys with User1 as referrer
      await chainluck
        .connect(user2)
        .buyTicket(user1.address, await usdt.getAddress());

      // Check referral relationship
      const user1Stats = await chainluck.getUserStats(user1.address);
      expect(user1Stats[6]).to.equal(1); // referralCount

      const referrals = await chainluck.getUserReferrals(user1.address);
      expect(referrals[0]).to.equal(user2.address);
    });
  });

  describe('Win Claims', function () {
    it('Should allow claiming wins', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy ticket (guaranteed win of 0.1 USDT)
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      const initialBalance = await usdt.balanceOf(user1.address);

      // Claim wins
      await chainluck.connect(user1).claimWins(await usdt.getAddress());

      const finalBalance = await usdt.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it('Should allow claiming all wins across tokens', async function () {
      const { chainluck, usdt, usdc, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      // Setup user with both tokens
      await usdt.connect(user1).faucet();
      await usdc.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));
      await usdc
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Setup prize pools for USDC
      await usdc.approve(
        await chainluck.getAddress(),
        ethers.parseUnits('1000', 6),
      );
      await chainluck.addToPrizePool(
        await usdc.getAddress(),
        ethers.parseUnits('500', 6),
      );

      // Buy tickets with both tokens
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdc.getAddress());

      const initialUSDTBalance = await usdt.balanceOf(user1.address);
      const initialUSDCBalance = await usdc.balanceOf(user1.address);

      // Claim all wins
      await chainluck.connect(user1).claimAllWins();

      const finalUSDTBalance = await usdt.balanceOf(user1.address);
      const finalUSDCBalance = await usdc.balanceOf(user1.address);

      expect(finalUSDTBalance).to.be.gt(initialUSDTBalance);
      expect(finalUSDCBalance).to.be.gt(initialUSDCBalance);
    });

    it('Should revert when trying to claim with no pending wins', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      await expect(
        chainluck.connect(user1).claimWins(await usdt.getAddress()),
      ).to.be.revertedWith('No pending wins for this token');
    });
  });

  describe('Owner Functions', function () {
    it('Should allow owner to withdraw profits', async function () {
      const { chainluck, usdt, user1, owner } = await loadFixture(
        deployChainLuckFixture,
      );

      // Generate some revenue
      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy multiple tickets to generate profit
      for (let i = 0; i < 5; i++) {
        await chainluck
          .connect(user1)
          .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      }

      const initialOwnerBalance = await usdt.balanceOf(owner.address);

      // Owner withdraws profits
      await chainluck.connect(owner).withdrawProfits(await usdt.getAddress());

      const finalOwnerBalance = await usdt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it('Should allow owner to add to prize pool', async function () {
      const { chainluck, usdt, owner } = await loadFixture(
        deployChainLuckFixture,
      );

      const addAmount = ethers.parseUnits('100', 6);
      await usdt.approve(await chainluck.getAddress(), addAmount);

      const initialStats = await chainluck.getContractStats();
      await chainluck.addToPrizePool(await usdt.getAddress(), addAmount);
      const finalStats = await chainluck.getContractStats();

      expect(finalStats[1]).to.equal(initialStats[1] + addAmount);
    });

    it('Should prevent non-owner from withdrawing profits', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      await expect(
        chainluck.connect(user1).withdrawProfits(await usdt.getAddress()),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Contract Stats', function () {
    it('Should return accurate contract statistics', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      const initialStats = await chainluck.getContractStats();
      expect(initialStats[0]).to.equal(0); // totalTicketsSold
      expect(initialStats[1]).to.equal(ethers.parseUnits('500', 6)); // USDT prize pool

      // Buy a ticket
      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      const finalStats = await chainluck.getContractStats();
      expect(finalStats[0]).to.equal(1); // totalTicketsSold
    });

    it('Should return accurate user statistics', async function () {
      const { chainluck, usdt, user1 } = await loadFixture(
        deployChainLuckFixture,
      );

      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Buy 2 tickets to unlock referral ability
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      const stats = await chainluck.getUserStats(user1.address);
      expect(stats[0]).to.equal(ethers.parseUnits('10', 6)); // spent
      expect(stats[1]).to.be.gte(ethers.parseUnits('0.2', 6)); // pendingUSDT
      expect(stats[5]).to.be.true; // canMakeReferrals
    });
  });

  describe('Edge Cases', function () {
    it('Should handle zero referral pool gracefully', async function () {
      const { chainluck, usdt, user1, user2 } = await loadFixture(
        deployChainLuckFixture,
      );

      // Drain referral pool by withdrawing profits
      await usdt.connect(user1).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('1000', 6));

      // Setup users for referral
      await usdt.connect(user2).faucet();
      await usdt
        .connect(user2)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // User1 becomes eligible for referrals
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      // Manually drain referral pool
      await chainluck.withdrawProfits(await usdt.getAddress());

      // User2 buys with referral - should not revert even with empty referral pool
      await expect(
        chainluck
          .connect(user2)
          .buyTicket(user1.address, await usdt.getAddress()),
      ).to.not.be.reverted;
    });

    it('Should prevent referral loops', async function () {
      const { chainluck, usdt, user1, user2 } = await loadFixture(
        deployChainLuckFixture,
      );

      await usdt.connect(user1).faucet();
      await usdt.connect(user2).faucet();
      await usdt
        .connect(user1)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));
      await usdt
        .connect(user2)
        .approve(await chainluck.getAddress(), ethers.parseUnits('100', 6));

      // Both users become eligible for referrals
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user1)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user2)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());
      await chainluck
        .connect(user2)
        .buyTicket(ethers.ZeroAddress, await usdt.getAddress());

      // User2 refers User1
      await chainluck
        .connect(user1)
        .buyTicket(user2.address, await usdt.getAddress());

      // User1 should not be able to refer User2 back (already has a referrer)
      await chainluck
        .connect(user2)
        .buyTicket(user1.address, await usdt.getAddress());

      const user1Referrals = await chainluck.getUserReferrals(user1.address);
      const user2Referrals = await chainluck.getUserReferrals(user2.address);

      expect(user1Referrals.length).to.equal(0);
      expect(user2Referrals.length).to.equal(1);
      expect(user2Referrals[0]).to.equal(user1.address);
    });
  });
});
