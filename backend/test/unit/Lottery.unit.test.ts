import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Lottery, VRFCoordinatorV2Mock } from "../../typechain-types";
import { assert, expect } from "chai";
import { networkName } from "../../helpers.hardhat.config";

import {
  TypedContractEvent,
  TypedListener,
} from "../../typechain-types/common";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import {
  Addressable,
  AddressLike,
  BaseContract,
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from "ethers";
import { mock } from "node:test";
import { consumers } from "node:stream";
import { doesNotMatch } from "node:assert";

!networkName.includes(network.name)
  ? describe.skip
  : describe("Lottery", async () => {
      const { deploy, log } = deployments;
      let deployer: string;
      let interval: bigint;
      let returnValu: bigint;
      let consumerAddress: Addressable;
      let Lottery: Lottery;
      let accounts: any;
      let mockAggregator: VRFCoordinatorV2Mock;
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["mockLottery"]);
        Lottery = await ethers.getContract("Lottery", deployer);
        mockAggregator = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );

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
      describe("enterLottery", async () => {
        it("reverts when you don't pay enough", async () => {
          await expect(Lottery.enterLottery()).to.be.reverted;
        });

        it("ensures msg.sender address is at index zero of the array", async () => {
          const enterLottery = await Lottery.enterLottery({
            value: ethers.parseEther("0.05"),
          });

          const indexZeroAddress = await Lottery.getAddressOfIndex(0);
          assert.equal(deployer, indexZeroAddress);
        });
        it("ensures the msg.value is the same as the amount entered", async () => {
          const enterLottery2 = await Lottery.enterLottery({
            value: ethers.parseEther("0.05"),
          });
          const amountMapped = await Lottery.addressFund(deployer);
          const amountInWei = await ethers.parseEther("0.05");
          assert.equal(amountInWei, amountMapped);
        });
        it("does not allow entering when the Lottery is closed", async () => {
          const enterLottery2 = await Lottery.enterLottery({
            value: ethers.parseEther("0.05"),
          });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const x = await mockAggregator.createSubscription.staticCall();
          //  const receipt: ContractTransactionReceipt = (await x.wait(1))!;

          const returnValu = x;

          // console.log(returnValu);
          await expect(mockAggregator.createSubscription()).to.emit(
            mockAggregator,
            "SubscriptionCreated"
          );

          await mockAggregator.fundSubscription(
            returnValu,
            ethers.parseEther("0.01")
          );

          await mockAggregator.addConsumer(returnValu, Lottery.target);

          const g1 = await mockAggregator.consumerIsAdded(
            returnValu,
            Lottery.target
          );

          const [, , , consumers] = await mockAggregator.getSubscription(
            returnValu
          );

          await Lottery.performUpkeep("0x00");

          await expect(
            Lottery.enterLottery({ value: ethers.parseEther("0.05") })
          ).to.be.revertedWithCustomError(Lottery, " Lottery__raffleClosed()");
        });
      });
      describe("check upkeep", async () => {
        it("returns false if people haven't sent any ETH", async () => {
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await Lottery.checkUpkeep.staticCall("0x00");
          assert(!upkeepNeeded);
        });
        it("fails if interval has not reached", async () => {
          const enterLottery2 = await Lottery.enterLottery({
            value: ethers.parseEther("0.05"),
          });

          const { upkeepNeeded } = await Lottery.checkUpkeep.staticCall("0x00");
          assert(!upkeepNeeded);
        });
      });
      describe("perform upkeep", async () => {
        it("can only run if checkUpKeep is true", async () => {
          await expect(
            Lottery.performUpkeep("0x00")
          ).to.be.revertedWithCustomError(
            Lottery,
            "Lottery__upkeepNotNeeded()"
          );
        });
        it("emits an event", async () => {
          const enterLottery2 = await Lottery.enterLottery({
            value: ethers.parseEther("0.05"),
          });
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const returnValu =
            await mockAggregator.createSubscription.staticCall();

          console.log(returnValu);

          const x = await mockAggregator.createSubscription();

          await mockAggregator.fundSubscription(
            returnValu,
            ethers.parseEther("0.01")
          );
          const { consumers } = await mockAggregator.getSubscription(
            returnValu
          );
          console.log(consumers);

          await mockAggregator.addConsumer(returnValu, Lottery.target);

          await expect(Lottery.performUpkeep("0x00"))
            .to.emit(mockAggregator, "RandomWordsRequested")
            .withArgs(
              anyValue,
              1,
              100,
              anyValue,
              anyValue,
              anyValue,
              anyValue,
              anyValue
            );
        });
      });

      describe("FulfillRandomWords", async () => {
        beforeEach(async () => {
          consumerAddress != Lottery.target;
          returnValu = await mockAggregator.createSubscription.staticCall();

          console.log(returnValu);

          const x = await mockAggregator.createSubscription();

          await mockAggregator.fundSubscription(
            returnValu,
            ethers.parseEther("0.01")
          );

          await mockAggregator.addConsumer(returnValu, Lottery.target);
          await network.provider.send("evm_increaseTime", [
            Number(interval) + 1,
          ]);
          await network.provider.send("evm_mine", []);
          // const enterLottery2 = await Lottery.enterLottery({
          //   value: ethers.parseEther("0.05"),
          // });
        });
        it("picks a winner, reset the lottery and sends the money", async () => {
          const additionalEntrants = 3;
          const accountIndex = 1;
          for (
            let i = accountIndex;
            i < accountIndex + additionalEntrants;
            i++
          ) {
            const accountConnectedLottery = await Lottery.connect(accounts[i]);
            await accountConnectedLottery.enterLottery({
              value: ethers.parseEther("0.01"),
            });
          }
          const lastTimeStamp = await Lottery.getLastTimestamp();
          await new Promise<void>(async (resolve, reject) => {
            Lottery.on<TypedContractEvent<any, any, any>>(
              "RandomWordsFulfilled",
              async (arg1,arg2) => {
                console.log("Winner picked");
                try {
                  resolve();
                } catch (error) {
                  reject(error);
                }
              }
            );
            const x = await Lottery.performUpkeep("0x00");

            await mockAggregator.fulfillRandomWords(returnValu, Lottery.target);
          });
          // const x = await Lottery.performUpkeep("0x00");

          //   await expect(
          //     mockAggregator.fulfillRandomWords(returnValu, Lottery.target)
          //   )
          //     .to.emit(mockAggregator, "RandomWordsFulfilled")
          //     .withArgs(1, 1, anyValue, false);
        });
      });
    });
