import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { networkName } from "../helpers.hardhat.config";
import { network ,ethers} from "hardhat";

const deployMock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  if (networkName.includes(network.name.toString())) {
    const deployedMock = deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: ["25000", 1e9],
      waitConfirmations: 1,
    });
    const vrfCoordinatorV2Address=(await deployedMock).address

    // // const deployedMockAddress = (await deployedMock).address;
    // const contract: VRFCoordinatorV2Mock = await ethers.getContract(
    //   "VRFCoordinatorMock"
    // );
    // const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock =
    //   await contract.waitForDeployment();
    // const vrfCoordinatorV2Address: string =
    //   await vrfCoordinatorV2Mock.getAddress();

    // // creating a subscription
    // const subscriptionTx = await vrfCoordinatorV2Mock.createSubscription();
    // const subscriptionTxReceipt = await subscriptionTx.wait(1);
    // const subscriptionReceiptEventLogs =Number( subscriptionTxReceipt!.logs[0].topics[1])

    // const subscriptionId = subscriptionReceiptEventLogs
    // log(`Got local VRFCoordinatorMockV2 SubscriptionId ${subscriptionId}`);

    // // we also need to fund our subscription
    // await vrfCoordinatorV2Mock.fundSubscription(
    //   subscriptionId,
    //   ethers.parseEther("0.01")
    // );
    // log(
    //  // `Funded local VRFCoordinatorV2 Subscription with ${MOCK_VRF_SUBSCRIPTION_FUND_AMOUNT} amount`
    // );

    ///////////////////////deploying Lottery Contract///////////////////
    const deployedLotteryAddress = deploy("Lottery", {
      from: deployer,
      args: [
        vrfCoordinatorV2Address,
        50,
        1,
        "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        1000,
        3,
        2,
        30,
      ],
      log: true,
      waitConfirmations: 1,
    });
    const lotteryAddress = (await deployedLotteryAddress).address;
    //const contract3: VRFCoordinatorV2Mock = await ethers.getContract(
    //  "VRFCoordinatorV2Mock"
   // );
  //  await contract3.addConsumer(subscriptionId, lotteryAddress);
  }
};
module.exports = deployMock;
deployMock.tags = ["all", "mockLottery"];
