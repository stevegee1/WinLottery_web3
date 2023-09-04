import { ContractRunner } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Lottery } from "../typechain-types";
import {assert} from "chai"
describe("Lottery", async () => {
  let lotteryDeployed: Lottery;
  const value = ethers.parseEther("3");
  let deployer:string
  beforeEach(async () => {
    await deployments.fixture(["lottery"]);
   deployer  = (await getNamedAccounts()).deployer;
     
    lotteryDeployed = await ethers.getContract("Lottery", deployer);
  });
  it("gives us the contract", async () => {
    const txn = await lotteryDeployed.enterLottery({ value: value });
    await txn.wait(1);

    const txn2 = await lotteryDeployed.enterLottery({ value: value });
    await txn2.wait(1)
    const txn3 = await lotteryDeployed.enterLottery({ value: value });
    await txn2.wait(1);
    
    
    const arrayLength = await lotteryDeployed.arrayLength();
    const mapValue= await lotteryDeployed.returnMapping(deployer);
    console.log(mapValue.toString())
   
    assert.equal("1",arrayLength.toString() )

   
  });
});
