import { BaseContract } from "ethers";
import { ethers, network, getNamedAccounts, deployments } from "hardhat";

import { networkName } from "../../helpers.hardhat.config";
import { Lottery } from "../../typechain-types";
import { assert, expect } from "chai";

networkName.includes(network.name)
  ? describe.skip
  : describe("Lottery", async () => {
      let deployer: string;
      let Lottery: Lottery;
      let interval: bigint;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        Lottery = await ethers.getContract("Lottery", deployer);
        interval = await Lottery.getInterval();
      });

      describe("Constructor", async () => {
        it("initializes the lottery state correctly", async () => {
          const raffleState = await Lottery.getRaffleState();
          assert.equal("0", raffleState.toString());
        });
        it("checks if the interval is set correctly", async () => {
          const getInterval = await Lottery.getInterval();
          assert(getInterval.toString(), "30");
        });
      });
      ////////////////////////PASSED//////////////////////////////

      describe("enterLottery", async () => {
        it("reverts when you don't pay enough", async () => {
          await expect(Lottery.enterLottery()).to.be.reverted;
        });

        it("ensures msg.sender address is at index zero of the array", async () => {
          const enterLottery = await Lottery.enterLottery({
            value: ethers.parseEther("0.0001"),
          });
          await enterLottery.wait(3);

          const indexZeroAddress = await Lottery.getAddressOfIndex(0);
          assert.equal(deployer, indexZeroAddress);
        });
        it("ensures the msg.value is the same as the amount entered", async () => {
          const amountMapped = await Lottery.addressFund(deployer);
          console.log(amountMapped.toString());
          const amountInWei = await ethers.parseEther("0.0003");
          assert.equal(amountInWei, amountMapped);
        });
      });
      describe("FulfillRandomWords", async () => {
        it("it works with live chainlink keeper and VRF", async () => {
          await new Promise<void>(async (resolve, reject) => {
            Lottery.on<any>("winnerPicked", () => {
              try {
                const g = Lottery.getRecentWinner();
                console.log(g);
              } catch (error) {
                reject(error);
              }
            });
         });
        });
      });
    });
