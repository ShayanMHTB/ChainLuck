// File: hardhat/test/MockTokens.test.ts
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Mock Tokens', function () {
  async function deployMockTokensFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    const usdt = await MockUSDT.deploy();

    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();

    const MockDAI = await ethers.getContractFactory('MockDAI');
    const dai = await MockDAI.deploy();

    return { usdt, usdc, dai, owner, user1, user2 };
  }

  describe('MockUSDT', function () {
    it('Should have correct decimals', async function () {
      const { usdt } = await loadFixture(deployMockTokensFixture);
      expect(await usdt.decimals()).to.equal(6);
    });

    it('Should have correct name and symbol', async function () {
      const { usdt } = await loadFixture(deployMockTokensFixture);
      expect(await usdt.name()).to.equal('Mock Tether USD');
      expect(await usdt.symbol()).to.equal('USDT');
    });

    it('Should mint initial supply to deployer', async function () {
      const { usdt, owner } = await loadFixture(deployMockTokensFixture);
      const balance = await usdt.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseUnits('1000000000', 6));
    });

    it('Should allow faucet usage', async function () {
      const { usdt, user1 } = await loadFixture(deployMockTokensFixture);

      await usdt.connect(user1).faucet();
      const balance = await usdt.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseUnits('10000', 6));
    });

    it('Should allow minting to specific address', async function () {
      const { usdt, user1 } = await loadFixture(deployMockTokensFixture);

      const mintAmount = ethers.parseUnits('5000', 6);
      await usdt.mint(user1.address, mintAmount);
      const balance = await usdt.balanceOf(user1.address);
      expect(balance).to.equal(mintAmount);
    });
  });

  describe('MockUSDC', function () {
    it('Should have correct decimals', async function () {
      const { usdc } = await loadFixture(deployMockTokensFixture);
      expect(await usdc.decimals()).to.equal(6);
    });

    it('Should have correct name and symbol', async function () {
      const { usdc } = await loadFixture(deployMockTokensFixture);
      expect(await usdc.name()).to.equal('Mock USD Coin');
      expect(await usdc.symbol()).to.equal('USDC');
    });

    it('Should work with transfers', async function () {
      const { usdc, owner, user1 } = await loadFixture(deployMockTokensFixture);

      const transferAmount = ethers.parseUnits('1000', 6);
      await usdc.transfer(user1.address, transferAmount);

      const balance = await usdc.balanceOf(user1.address);
      expect(balance).to.equal(transferAmount);
    });
  });

  describe('MockDAI', function () {
    it('Should have correct decimals', async function () {
      const { dai } = await loadFixture(deployMockTokensFixture);
      expect(await dai.decimals()).to.equal(18);
    });

    it('Should have correct name and symbol', async function () {
      const { dai } = await loadFixture(deployMockTokensFixture);
      expect(await dai.name()).to.equal('Mock Dai Stablecoin');
      expect(await dai.symbol()).to.equal('DAI');
    });

    it('Should handle large amounts correctly', async function () {
      const { dai, user1 } = await loadFixture(deployMockTokensFixture);

      await dai.connect(user1).faucet();
      const balance = await dai.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseUnits('10000', 18));
    });

    it('Should support approve and transferFrom', async function () {
      const { dai, owner, user1, user2 } = await loadFixture(
        deployMockTokensFixture,
      );

      const approveAmount = ethers.parseUnits('5000', 18);
      const transferAmount = ethers.parseUnits('2000', 18);

      // Owner approves user1 to spend
      await dai.approve(user1.address, approveAmount);

      // User1 transfers from owner to user2
      await dai
        .connect(user1)
        .transferFrom(owner.address, user2.address, transferAmount);

      const user2Balance = await dai.balanceOf(user2.address);
      expect(user2Balance).to.equal(transferAmount);

      const allowance = await dai.allowance(owner.address, user1.address);
      expect(allowance).to.equal(approveAmount - transferAmount);
    });
  });

  describe('Cross-token compatibility', function () {
    it('Should handle different decimal precision correctly', async function () {
      const { usdt, usdc, dai } = await loadFixture(deployMockTokensFixture);

      // Same USD value should have different token amounts due to decimals
      const usdValue = '1000'; // 1000 USD

      const usdtAmount = ethers.parseUnits(usdValue, 6); // 6 decimals
      const usdcAmount = ethers.parseUnits(usdValue, 6); // 6 decimals
      const daiAmount = ethers.parseUnits(usdValue, 18); // 18 decimals

      expect(usdtAmount).to.equal(usdcAmount);
      expect(daiAmount).to.not.equal(usdtAmount);
      expect(daiAmount).to.equal(usdtAmount * BigInt(10 ** 12)); // 18-6 = 12 decimal difference
    });

    it('Should all support standard ERC20 functions', async function () {
      const { usdt, usdc, dai, user1 } = await loadFixture(
        deployMockTokensFixture,
      );

      const tokens = [usdt, usdc, dai];

      for (const token of tokens) {
        // Test faucet
        await token.connect(user1).faucet();

        // Test balance query
        const balance = await token.balanceOf(user1.address);
        expect(balance).to.be.gt(0);

        // Test symbol and name
        expect(await token.symbol()).to.be.a('string');
        expect(await token.name()).to.be.a('string');

        // Test decimals
        const decimals = await token.decimals();
        expect(decimals).to.be.oneOf([6, 18]);
      }
    });
  });
});
